import { AnyDocumentId, AutomergeUrl, DocHandle, Repo } from '@automerge/automerge-repo'
import { PaginationParams } from '@feathersjs/feathers'

export interface Query {
  [key: string]: any
}

export type SyncServiceInfo = {
  url: AutomergeUrl
  query: Query
}

export type SyncServiceCreate = {
  query: Query
  services?: string[]
}

export type SyncServiceDocument = Record<string, Record<string, unknown>> & {
  __meta: Record<string, { idField: string, paginate: PaginationParams }>
}

export type AugmentedDocHandle = {
  handle: DocHandle<unknown>
  wasKnown: boolean
}

// MongoDB ObjectId-like generator
export function generateObjectId(): string {
  const timestamp = Math.floor(Date.now() / 1000)
    .toString(16)
    .padStart(8, '0')
  const machineId = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, '0')
  const processId = Math.floor(Math.random() * 65536)
    .toString(16)
    .padStart(4, '0')
  const counter = Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, '0')

  return timestamp + machineId + processId + counter
}

// UUID generator (wrapper around crypto.randomUUID)
export function generateUUID(): string {
  return crypto.randomUUID()
}

// Helper to find an automerge document _and_ tell wether it was previously known in the local storage
// This is based on automerge original Repo::find<T> to also track 'requesting' state change indicating
// that automerge had to ask over the network to get the document => means it was not locally known
export async function findDocument(repo: Repo, id: AnyDocumentId): Promise<AugmentedDocHandle> {
  const progress = repo.findWithProgress<unknown>(id)
  let wasKnown = true
  if ("subscribe" in progress) {
    const handle = await new Promise<AugmentedDocHandle>((resolve, reject) => {
      const unsubscribe = progress.subscribe(state => {
        console.log(`state is ${state.handle.state}`)
        if (state.handle.state === 'ready') {
          unsubscribe()
          resolve({ handle: state.handle, wasKnown })
        } else if (state.handle.state === 'requesting') {
          wasKnown = false
        } else if (state.state === 'unavailable') {
          unsubscribe()
          reject(new Error(`Document ${id} is unavailable`))
        } else if (state.state === 'failed') {
          unsubscribe()
          reject(state.error)
        }
      })
    })
    return handle
  }

  if (progress.handle.state === 'ready') {
    return { handle: progress.handle, wasKnown }
  }
  // If the handle isn't ready, wait for it and then return it
  await progress.handle.whenReady(['ready', 'unavailable'])
  if (progress.handle.state === "unavailable") {
    throw new Error(`Document ${id} is unavailable`)
  }
  return { handle: progress.handle, wasKnown }
}
