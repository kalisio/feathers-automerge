import { AnyDocumentId, DocHandle, Repo } from '@automerge/automerge-repo'
import type { HookContext, Params, Application } from '@feathersjs/feathers'
import { Forbidden, NotFound } from '@feathersjs/errors'
import feathers from '@feathersjs/feathers'
import { AdapterServiceOptions } from '@feathersjs/adapter-commons'
import createDebug from 'debug'
import _ from 'lodash'
import {
  SyncServiceCreate,
  SyncServiceInfo,
  SyncServiceDocument,
  Query,
  generateObjectId,
  generateUUID,
  CHANGE_ID,
  findDocument
} from '@kalisio/feathers-automerge'

const debug = createDebug('feathers-automerge-server/sync-service')

export interface SyncServiceParams extends Params<Query> {
  user?: any
}

export type RootDocument = {
  documents: SyncServiceInfo[]
}

export interface SyncServiceOptions {
  canAccess: (query: Query, params: Params) => Promise<boolean>
  initializeDocument(
    servicePath: string,
    query: Query,
    documents: SyncServiceInfo[]
  ): Promise<unknown[] | null>
  getDocumentsForData(
    servicePath: string,
    data: unknown,
    documents: SyncServiceInfo[]
  ): Promise<SyncServiceInfo[]>
}

export class AutomergeSyncService {
  app?: Application
  docHandles: Record<string, DocHandle<unknown>> = {}
  processedChanges = new Set<string>()
  // Track removals initiated by handleEvent to prevent syncing back to service
  // Format: "url:servicePath:id"
  pendingRemovals = new Set<string>()
  servicePath?: string

  constructor(
    public repo: Repo,
    public rootDocument: DocHandle<RootDocument>,
    public options: SyncServiceOptions
  ) {}

  async checkAccess(query: Query, params: SyncServiceParams, throwError = true) {
    if (params.provider) {
      const allowed = await this.options.canAccess(query, params)

      if (!allowed && throwError) {
        throw new Forbidden('Access not allowed for this user')
      }

      return allowed
    }

    return true
  }

  async find(params: SyncServiceParams = {}) {
    const doc = this.rootDocument.doc()

    if (!doc) {
      throw new Error('Root document not available')
    }

    const results = await Promise.all(
      doc.documents.map(async (document) => ({
        document,
        allowed: await this.checkAccess(document.query, params, false)
      }))
    )

    return results.filter((result) => result.allowed).map((result) => result.document)
  }

  async get(url: string, params: SyncServiceParams = {}) {
    const syncInfo = (await this.find(params)).find((document) => document.url === url)

    if (!syncInfo || !this.docHandles[url] || !(await this.checkAccess(syncInfo.query, params, false))) {
      throw new NotFound(`Document ${url} not found`)
    }

    const handle = this.docHandles[url]

    return handle.doc()
  }

  async create(payload: SyncServiceCreate, params: SyncServiceParams = {}) {
    if (!this.app) {
      throw new Error('Application not available')
    }

    const docs = this.rootDocument.doc().documents
    const { query, services: requestedServices } = payload
    const existingDocument = docs.find((document) => _.isEqual(document.query, query))

    await this.checkAccess(query, params)

    if (existingDocument) {
      debug(`Returning existing document ${existingDocument.url}`)
      return existingDocument
    }

    const allServices = Object.keys(this.app.services).filter((path) => path !== this.servicePath)
    const services = requestedServices
      ? requestedServices.filter((path) => allServices.includes(path))
      : allServices
    const data: SyncServiceDocument = {
      __meta: {}
    }
    const changeId = generateUUID()

    await Promise.all(
      services.map(async (servicePath) => {
        if (servicePath === '__meta') {
          throw new Error(`Service path '__meta' is reserved`)
        }
        const service = this.app?.service(servicePath)
        const serviceOptions = feathers.getServiceOptions(service) as AdapterServiceOptions
        const serviceData = await this.options.initializeDocument(servicePath, query, docs)

        if (serviceData !== null) {
          const convertedData: unknown[] = JSON.parse(JSON.stringify(serviceData))
          const idField = service?.id || 'id'
          const paginate = serviceOptions?.paginate ||
            (service as any).options?.paginate || { default: 10, max: 10 }

          data.__meta[servicePath] = { idField, paginate }
          data[servicePath] = convertedData.reduce<Record<string, unknown>>(
            (res, current) => {
              const id = (current as any)[idField] ?? generateObjectId()
              return {
                ...res,
                [id]: {
                  ...(current as Record<string, unknown>),
                  [CHANGE_ID]: changeId
                }
              }
            },
            {} as Record<string, unknown>
          )
        }
      })
    )

    const doc = this.repo.create(data)
    const url = doc.url
    const info = {
      url,
      query
    }
    debug('Created new Automerge document', info)

    this.docHandles[url] = doc

    await new Promise<SyncServiceInfo>(async (resolve) => {
      this.rootDocument!.change((doc) => {
        doc.documents.push(info)
        resolve(info)
      })
    })

    await this.handleDocument(info)

    return info
  }

  async remove(url: string, params: SyncServiceParams = {}) {
    if (!this.rootDocument) {
      throw new Error('Root document not available')
    }

    const docs = this.rootDocument.doc().documents
    const index = docs.findIndex((d) => d.url === url)

    if (index === -1) {
      throw new NotFound(`Document with URL ${url} not found`)
    }

    const info = docs[index]

    await this.checkAccess(info.query, params)

    await new Promise<void>((resolve) => {
      this.rootDocument!.change((doc) => {
        doc.documents.splice(index, 1)
        resolve()
      })
    })

    this.repo.delete(url as AnyDocumentId)
    delete this.docHandles[url]

    return info
  }

  async handleEvent(servicePath: string, eventName: string, data: any, context: HookContext) {
    if (!this.app) {
      throw new Error('Feathers application not available. Did you call app.listen() or app.setup()?')
    }

    if (!this.rootDocument) {
      throw new Error('Root document not available')
    }

    const isRemove = eventName === 'removed'
    const isAddOrUpdate = ['updated', 'patched', 'created'].includes(eventName)
    // Skip events that are not going to contribute to the automerge document(s)
    if (!isRemove && !isAddOrUpdate) {
       return
    }

    const { getDocumentsForData } = this.options
    const documents = this.rootDocument.doc().documents
    const service = this.app.service(servicePath)
    const serviceOptions = feathers.getServiceOptions(service) as AdapterServiceOptions
    const syncDocuments = await getDocumentsForData(servicePath, data, documents)
    // Skip when there's no target automerge documents to update
    if (syncDocuments.length === 0) {
       return
    }
    const idField = service.id || 'id'
    const currentChangeId = context.params.automerge?.changeId || generateUUID()
    const id = data[idField]

    debug(`${currentChangeId}/service: Handling ${eventName} on ${servicePath} ...`)

    // Build a set of URLs that should contain this data
    const matchingUrls = new Set(syncDocuments.map(({ url }) => url))

    // Record chandId _before_ updating automerge
    this.processedChanges.add(currentChangeId)

    // Update or remove data in all documents
    const updatePromises = documents.map(({ url }) => {
      const handle = this.docHandles[url]
      if (!handle) return Promise.resolve()

      const shouldContain = matchingUrls.has(url)

      return new Promise<void>((resolve) => {
        handle.change((doc: any) => {
          const changeId: string = _.get(doc, [servicePath, id, CHANGE_ID])

          if (shouldContain && !doc[servicePath]) {
            const paginate = serviceOptions?.paginate ||
              (service as any).options?.paginate || { default: 10, max: 10 }
            doc.__meta[servicePath] = { idField: idField, paginate }
            doc[servicePath] = {}
          }

          if (doc[servicePath] && currentChangeId !== changeId) {
            const exists = doc[servicePath][id] !== undefined

            if (isRemove || !shouldContain) {
              // Remove if: 1) explicit removal, or 2) doesn't match query
              if (exists) {
                debug(`${currentChangeId}/service: Removing ${id} from ${servicePath} in document ${url}`)
                // Track this removal to prevent syncing back to service
                this.pendingRemovals.add(`${url}:${servicePath}:${id}`)
                delete doc[servicePath][id]
              }
            } else if (shouldContain && isAddOrUpdate) {
              // Add or update if matches query
              debug(`${currentChangeId}/service: ${exists ? 'Updating' : 'Adding'} ${id} for ${servicePath} in document ${url}`)
              doc[servicePath][id] = {
                ...data,
                [CHANGE_ID]: currentChangeId
              }
            }
          }

          resolve()
        })
      })
    })

    await Promise.all(updatePromises)

    debug(`${currentChangeId}/service: Done handling ${eventName} on ${servicePath}`)
  }

  async syncExistingData(handle: DocHandle<unknown>) {
    if (!this.app) {
      debug('Feathers application not available for syncing existing data')
      return
    }

    const doc = handle.doc() as any
    if (!doc) {
      debug('Document not available for syncing existing data')
      return
    }

    debug(`Syncing existing data from document ${handle.url}`)

    const meta = doc.__meta || {}

    // Process each service's data in the document
    for (const servicePath of Object.keys(doc)) {
      // app.service() throws when service not found, hence the try catch block
      try {
        if (servicePath === '__meta' || !this.app.service(servicePath)) {
          continue
        }
      } catch (error: any) {
        continue
      }

      const serviceData = doc[servicePath]
      if (!serviceData || typeof serviceData !== 'object') {
        continue
      }

      const serviceMeta = meta[servicePath]
      const idField = serviceMeta?.idField || 'id'

      // Process each record in the service
      for (const record of Object.values(serviceData)) {
        const { [CHANGE_ID]: changeId, ...data } = record as any
        const params = { automerge: { changeId, initialSync: true } } as Params
        const service = this.app.service(servicePath)

        // Get the actual ID from the record using the service's idField
        const recordId = data[idField]
        if (!recordId) continue

        // Check if record already exists locally
        try {
          await service.get(recordId)
        } catch (error: any) {
          // NOTE: comment test since it fails even when error is really NotFound
          // if (error instanceof NotFound) {
          if (error?.code === 404) {
            // Record doesn't exist, create it
            debug(`Creating new record ${servicePath}:${recordId} during initial sync`)
            try {
              await service.create(data, params)
            } catch (error: any) {
              // Create failed for some reason
              // Don't stop syncing anyway, the problem should be dealt with at a later time.
              console.error(error)
            }
          } else {
            throw error
          }
        }

        // Mark this change as processed to avoid loops
        this.processedChanges.add(changeId)
      }
    }
  }

  async handleDocument({ url }: SyncServiceInfo) {
    const augmentedHandle = await findDocument(this.repo, url)
    const handle = augmentedHandle.handle

    this.docHandles[url] = handle

    // Sync existing data from the document to local services
    await this.syncExistingData(handle)
    if (!augmentedHandle.wasKnown) {
      // Automerge document got fetched from some other peer
      // populate it with our local data
      await this.populateAutomerge(handle)
    }

    handle.on('change', async ({ patches, patchInfo }) => {
      const { before, after } = patchInfo as any
      const serviceChanges: Record<string, Set<string>> = {}

      debug(`automerge: Handling change on document ${url} ...`)

      patches.forEach((patch) => {
        const [path, id] = patch.path
        // Skip patches touching the __meta root object
        if (path === '__meta') {
           return
        }
        // id may be undefined when path (the service path):
        //  - has just been added as a newly listened service
        //  - just got entirely removed
        if (id) {
          serviceChanges[path] = serviceChanges[path] || new Set()
          serviceChanges[path].add(id.toString())
        }
      })

      await Promise.all(
        Object.keys(serviceChanges).map(async (path) => {
          const ids = Array.from(serviceChanges[path])

          if (!this.app) {
            debug('Feathers application not available')
            return
          }

          for (const id of ids) {
            try {
              const documentItem = after[path][id] || before[path][id]
              const { [CHANGE_ID]: changeId, ...data } = documentItem
              const params = { automerge: { changeId, patches, patchInfo } } as Params

              if (!before[path]?.[id]) {
                if (!this.processedChanges.has(changeId)) {
                  // Created
                  debug(`${changeId}/automerge: Creating ${id} on ${path} ...`)
                  await this.app.service(path).create(data, params)
                  debug(`${changeId}/automerge: Done creating ${id} on ${path}`)
                }
              } else if (!after[path]?.[id]) {
                // Removed
                const removalKey = `${url}:${path}:${id}`
                if (this.pendingRemovals.has(removalKey)) {
                  // This removal was initiated by handleEvent, don't sync back to service
                  debug(`${changeId}/automerge: Skipping service ${path} remove ${id} (initiated by handleEvent)`)
                  this.pendingRemovals.delete(removalKey)
                } else {
                  // This removal was initiated by document change, sync to service
                  debug(`${changeId}/automerge: Removing ${id} on ${path} ...`)
                  await this.app.service(path).remove(id, params)
                  debug(`${changeId}/automerge: Done removing ${id} on ${path}`)
                }
              } else if (before[path]?.[id]) {
                if (!this.processedChanges.has(changeId)) {
                  // Patched
                  let doCreate = false
                  try {
                    await this.app.service(path).get(id)
                  } catch (error: any) {
                    doCreate = true
                  }

                  if (doCreate ) {
                    // An object got patched in automerge but we don't know it in the service
                    debug(`${changeId}/automerge: Patching (create!) ${id} on ${path} ...`)
                    await this.app.service(path).create(data, params)
                    debug(`${changeId}/automerge: Done patching (create!) ${id} on ${path}`)
                  } else {
                    debug(`${changeId}/automerge: Patching ${id} on ${path} ...`)
                    await this.app.service(path).patch(id, data, params)
                    debug(`${changeId}/automerge: Done patching ${id} on ${path}`)
                  }
                }
              }

              this.processedChanges.add(changeId)
            } catch (error: unknown) {
              console.error(error)
            }
          }
        })
      )

      debug(`automerge: Done handling change on document ${url}`)
    })
  }

  listenService(servicePath: string) {
    if (!this.app) return
    const service = this.app.service(servicePath)
    const options = feathers.getServiceOptions(service)

    debug(`Listening to service ${servicePath} events ${options.serviceEvents}`)

    options.serviceEvents?.forEach((eventName) =>
      service.on(eventName, async (payload, context) => {
        const data = payload !== undefined ? JSON.parse(JSON.stringify(payload)) : undefined
        await this.handleEvent(servicePath, eventName, data, context)
      })
    )
  }

  async unlistenService(servicePath: string) {
    if (!this.app) return

    const allChanges = [] as Promise<void>[]
    const docs = this.rootDocument.doc().documents

    for (const { url } of docs) {
      const handle = await this.repo.find(url)
      const automergeDoc = handle.doc() as any
      const meta = automergeDoc.__meta
      if (!meta[servicePath]) continue

      const p = new Promise<void>((resolve) => {
        handle.change((doc: any) => {
          delete doc[servicePath]
          delete doc.__meta[servicePath]

          resolve()
        })
      })

      allChanges.push(p)
    }

    await Promise.all(allChanges)
  }

  async setup(app: Application, myPath: string) {
    this.app = app
    this.servicePath = myPath

    const infos = await this.find()

    await Promise.all(infos.map((info) => this.handleDocument(info)))

    Object.keys(app.services).forEach((servicePath) => {
      if (servicePath !== myPath) this.listenService(servicePath)
    })
  }

  async populateAutomerge(handle: DocHandle<unknown>) {
    if (!this.app) {
      debug('Feathers application not available for syncing existing data')
      return
    }

    const allChanges = [] as Promise<void>[]
    const doc = handle.doc() as any
    const meta = doc.__meta

    const docs = this.rootDocument.doc().documents
    const infos = docs.find((infos) => infos.url === handle.url)
    if (!infos) return
    const { query, url } = infos

    debug(`Populating automerge document ${url} ...`)

    for (const servicePath of Object.keys(meta)) {
      let service
      // Do not crash if service can't be found
      try {
        service = this.app.service(servicePath)
      } catch (error: any) {}
      if (!service) continue
      const idField = meta[servicePath].idField
      const serviceData = await this.options.initializeDocument(servicePath, query, docs) as Array<any>
      if (!serviceData?.length) continue

      const p = new Promise<void>((resolve) => {
        handle.change((doc: any) => {
          for (const object of serviceData) {
            // Generate a change id
            const changeId = generateUUID()
            // And remember it as already processed to avoid loops
            this.processedChanges.add(changeId)

            const converted = JSON.parse(JSON.stringify(object))
            const id = object[idField]
            if (!doc[servicePath][id])
              doc[servicePath][id] = { ...converted, [CHANGE_ID]: changeId }
          }

          resolve()
        })
      })

      allChanges.push(p)
    }

    await Promise.all(allChanges)
  }

  async coherencyCheck() {
    const result = {} as any
    const docs = this.rootDocument.doc().documents

    // Loop on automerge documents
    for (const { query, url } of docs) {
       debug(`Checking coherency for query ${query.name} ...`)
       const handle = await this.repo.find(url)
       const automergeDoc = handle.doc() as any
       const meta = automergeDoc.__meta

       result[url] = {} as any

       // Loop on document's services
       for (const servicePath of Object.keys(meta)) {
         debug(`Service ${servicePath} ...`)
         const idField = meta[servicePath].idField

         // Expected data for current service in the automerge document
         const expectedData = await this.options.initializeDocument(servicePath, query, docs) as Array<any>

         // Create sets with object ids missing from service, and from automerge document
         const svcIds = new Set(expectedData.map((object) => object[idField].toString()))
         const atmIds = new Set(Object.keys(automergeDoc[servicePath]))
         const notInAtmIds = new Set([...svcIds].filter((val) => !atmIds.has(val)))
         const notInSvcIds = new Set([...atmIds].filter((val) => !svcIds.has(val)))
         // const commonIds = new Set([...docIds].filter((val) => svcIds.has(val)))
         result[url][servicePath] = {} as any
         // result[servicePath].common = Array.from(commonIds)
         result[url][servicePath].notInAtm = Array.from(notInAtmIds)
         result[url][servicePath].notInSvc = Array.from(notInSvcIds)
         // result[url][servicePath].data = Array.from(notInSvcIds)

         const data = new Map()
         result[url][servicePath].notInAtm.forEach((id: string) => {
           const object = expectedData.find((object) => object[idField].toString() === id)
           data.set(id, object)
         })
         result[url][servicePath].notInSvc.forEach((id: string) => {
           const object = expectedData.find((object) => object[idField].toString() === id)
           data.set(id, object)
         })
         result[url][servicePath].data = data

         // result[servicePath].diffIds = [] as string[]
         // for (const id of commonIds) {
         //   const docObj = automergeDoc[servicePath][id] as any
         //   const svcObj = serviceData.find((obj) => obj[idField].toString() === id)
         //   const fooObj = _.omit(docObj, [ idField, CHANGE_ID ])
         //   const barObj = _.omit(svcObj, [ idField, CHANGE_ID ])
         //   if (!_.isEqual(fooObj, barObj)) {
         //     result[servicePath].diffIds.push(id)
         //   }
         // }
       }
    }

    return result
  }

  async manuallySyncToAutomerge(url: AnyDocumentId, infos: any, removeUnknown: boolean, addMissing: boolean) {
    if (!this.app) return

    const allChanges = [] as Promise<void>[]
    const handle = await this.repo.find(url)
    const automergeDoc = handle.doc() as any
    const meta = automergeDoc.__meta

    for (const servicePath of Object.keys(infos)) {
      const service = this.app.service(servicePath)
      const p = new Promise<void>((resolve) => {
        handle.change((doc: any) => {
          // const idField = meta[servicePath].idField
          if (removeUnknown) {
            for (const id of infos[servicePath].notInSvc) {
               this.pendingRemovals.add(`${url}:${servicePath}:${id}`)
               delete doc[servicePath][id]
            }
          }
          if (addMissing) {
            for (const id of infos[servicePath].notInAtm) {
               // Generate a change id
               const changeId = generateUUID()
               // And remember it as already processed to avoid loops
               this.processedChanges.add(changeId)

               const svcData = infos[servicePath].data.get(id)
               const atmData = JSON.parse(JSON.stringify(svcData))
               doc[servicePath][id] = { ...atmData, [CHANGE_ID]: changeId }
            }
          }

          resolve()
        })
      })

      allChanges.push(p)
    }

    await Promise.all(allChanges)
  }

  async syncFromServices() {
    const resp = {} as any
    const docs = this.rootDocument.doc().documents
    const all = [] as Promise<void>[]

    // Loop on automerge documents
    for (const { query, url } of docs) {
       debug(`Sync for query ${query.name} ...`)
       const handle = await this.repo.find(url)
       const automergeDoc = handle.doc() as any
       const meta = automergeDoc.__meta

       // Loop on document's services
       for (const servicePath of Object.keys(meta)) {
         debug(`Service ${servicePath} ...`)
         const idField = meta[servicePath].idField

         // Expected data for current service in the automerge document
         const expectedData = await this.options.initializeDocument(servicePath, query, docs) as Array<any>

         // Create sets with object ids missing from service, and from automerge document
         const svcIds = new Set(expectedData.map((object) => object[idField].toString()))
         const atmIds = new Set(Object.keys(automergeDoc[servicePath]))
         const notInAtmIds = new Set([...svcIds].filter((val) => !atmIds.has(val)))
         const notInSvcIds = new Set([...atmIds].filter((val) => !svcIds.has(val)))
         // const sharedIds = new Set([...atmIds].filter((val) => svcIds.has(val)))

         const p = new Promise<void>((resolve) => {
           handle.change((doc: any) => {
             // Remove all those not in service
             for (const id of notInSvcIds) {
               this.pendingRemovals.add(`${url}:${servicePath}:${id}`)
               delete doc[servicePath][id]
             }

             // Add all those not in automerge document
             for (const id of notInAtmIds) {
               // Generate a change id
               const changeId = generateUUID()
               // And remember it as already processed to avoid loops
               this.processedChanges.add(changeId)

               const svcData = expectedData.find((object) => object[idField].toString() === id)
               const atmData = JSON.parse(JSON.stringify(svcData))
               doc[servicePath][id] = { ...atmData, [CHANGE_ID]: changeId }
             }
             resolve()
          })
        })
        all.push(p)
      }
    }

    await Promise.all(all)
    return resp
  }
}
