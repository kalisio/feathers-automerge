# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.4.0](https://github.com/kalisio/feathers-automerge/compare/v0.3.8...v0.4.0) (2026-06-26)


### Bug Fixes

* catch error when create fails in syncExistingData ([#71](https://github.com/kalisio/feathers-automerge/issues/71)) ([b008511](https://github.com/kalisio/feathers-automerge/commit/b008511ea4ea92037655ead1b31a6a97a42e2285))
* catch exception thrown when service can't be found. ([#59](https://github.com/kalisio/feathers-automerge/issues/59)) ([085c7b5](https://github.com/kalisio/feathers-automerge/commit/085c7b55a248bb45d8276e16a17de55a2e2cbd5a))
* handle case where event's payload is undefined ([#61](https://github.com/kalisio/feathers-automerge/issues/61)) ([472b558](https://github.com/kalisio/feathers-automerge/commit/472b55887720cd9b46fea3e779e5e9337544afb8))
* record changeId _before_ pushing it in automerge. ([#63](https://github.com/kalisio/feathers-automerge/issues/63)) ([5710437](https://github.com/kalisio/feathers-automerge/commit/571043706ddc156916e106ddc99162a2e592be65))
* record changeId before updating automerge document [#62](https://github.com/kalisio/feathers-automerge/issues/62) ([#68](https://github.com/kalisio/feathers-automerge/issues/68)) ([c403847](https://github.com/kalisio/feathers-automerge/commit/c4038477ceac443f0ef45bb896514c442f00f8b7))


### Features

* Add ability to listen to dynamically created services. ([#70](https://github.com/kalisio/feathers-automerge/issues/70)) ([1f7f0c9](https://github.com/kalisio/feathers-automerge/commit/1f7f0c9fa06174b8ca92b0cf53487224bb0085f2))
* Allow to specify services that could be synchronized ([#64](https://github.com/kalisio/feathers-automerge/issues/64)) ([03d14ef](https://github.com/kalisio/feathers-automerge/commit/03d14efeec8cad045f18a9c5f0a60316ea66603a))
* exit early from handleEvent under specific conditions ([#65](https://github.com/kalisio/feathers-automerge/issues/65)) ([#69](https://github.com/kalisio/feathers-automerge/issues/69)) ([e10968c](https://github.com/kalisio/feathers-automerge/commit/e10968c49e7b75b452a010e275ebbc6859c47ac6))
* Implement live query mechanism ([#40](https://github.com/kalisio/feathers-automerge/issues/40)) ([ee062c6](https://github.com/kalisio/feathers-automerge/commit/ee062c63d090d4ad50de65f262d849f6f375f3ed))


### Reverts

* Revert "chore: added npm rc file to ease publishing" ([d7ea049](https://github.com/kalisio/feathers-automerge/commit/d7ea049f7931fbebbd15c62ae93bf16686920ea4))





## [0.3.8](https://github.com/kalisio/offline-sync/compare/v0.3.7...v0.3.8) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.7](https://github.com/kalisio/offline-sync/compare/v0.3.6...v0.3.7) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.6](https://github.com/kalisio/offline-sync/compare/v0.3.5...v0.3.6) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.5](https://github.com/kalisio/offline-sync/compare/v0.3.4...v0.3.5) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.4](https://github.com/kalisio/offline-sync/compare/v0.3.3...v0.3.4) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.3](https://github.com/kalisio/offline-sync/compare/v0.3.2...v0.3.3) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.2](https://github.com/kalisio/offline-sync/compare/v0.3.1...v0.3.2) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





## [0.3.1](https://github.com/kalisio/offline-sync/compare/v0.3.0...v0.3.1) (2026-01-13)

**Note:** Version bump only for package feathers-automerge





# [0.3.0](https://github.com/kalisio/feathers-automerge/compare/v0.2.0...v0.3.0) (2026-01-13)


### Bug Fixes

* avoid syncing items without IDs (ie not persisted in DB) ([cd9fbd0](https://github.com/kalisio/feathers-automerge/commit/cd9fbd07bc4c83d440afb10bedc0883e3f9eece6))
* Fix Automerge service pagination ([#54](https://github.com/kalisio/feathers-automerge/issues/54)) ([13161f5](https://github.com/kalisio/feathers-automerge/commit/13161f508dc48a454a462b593f52986058a098ed))


### Features

* Add option to initialise documents to sync ([#56](https://github.com/kalisio/feathers-automerge/issues/56)) ([bcedeb1](https://github.com/kalisio/feathers-automerge/commit/bcedeb14fb19bc62631f88f9419985c254e9738a))
* Allow to initiate client-side automerge service before authentication (closes [#50](https://github.com/kalisio/feathers-automerge/issues/50)) ([86e7861](https://github.com/kalisio/feathers-automerge/commit/86e786185d2ca143605b026d71a5b5cc1261583f))





# 0.2.0 (2025-10-21)


### Bug Fixes

* dropped initial sync causing too much issues for now ([0143404](https://github.com/kalisio/feathers-automerge/commit/0143404207958edf626cf6d8c0f1e2e72a64bc24))
* Ensure documents are initialized properly and improve messaging ([#5](https://github.com/kalisio/feathers-automerge/issues/5)) ([0a943a5](https://github.com/kalisio/feathers-automerge/commit/0a943a5d94e1449d8301e459beda0beb8889471d))
* Fix example apps ([c95bf56](https://github.com/kalisio/feathers-automerge/commit/c95bf568fa6dd24c2da1f41649d00dcce4cabb0a))
* Fix offline patch and create synchronization ([#27](https://github.com/kalisio/feathers-automerge/issues/27)) ([4873a15](https://github.com/kalisio/feathers-automerge/commit/4873a153bd6698329723d3ab3f1756274be1bc0e))
* Improve authentication handling ([#37](https://github.com/kalisio/feathers-automerge/issues/37)) ([408b7f3](https://github.com/kalisio/feathers-automerge/commit/408b7f301bf780bde2aa1ce1145a084992444b0e))
* Initial document synchronization and update documentation ([#6](https://github.com/kalisio/feathers-automerge/issues/6)) ([b16ccb0](https://github.com/kalisio/feathers-automerge/commit/b16ccb09d4a76e8601f471586306211961c442d5))
* Separate sync server and client types ([403a28b](https://github.com/kalisio/feathers-automerge/commit/403a28b7c9fb6f82baec98b96e341f9b80dcc899))
* Update canAccess check to take full params instead of just user ([#46](https://github.com/kalisio/feathers-automerge/issues/46)) ([b65af89](https://github.com/kalisio/feathers-automerge/commit/b65af898a082d82d6b691ab007c530d8a028d632))
* Update dependencies ([#26](https://github.com/kalisio/feathers-automerge/issues/26)) ([f241771](https://github.com/kalisio/feathers-automerge/commit/f241771cc99e3afba99523ef4083c85ca7111b39))
* Update dependencies and test against Node 20 ([#48](https://github.com/kalisio/feathers-automerge/issues/48)) ([f86b4b1](https://github.com/kalisio/feathers-automerge/commit/f86b4b1de5c60c0418a14dbc0e4fb5f80f223aa5))


### Features

* Add support for offline sync based on queries ([#15](https://github.com/kalisio/feathers-automerge/issues/15)) ([2317ea8](https://github.com/kalisio/feathers-automerge/commit/2317ea8ab8e2aab76b1bb1dba8e468bc00547009))
* Allow to remove Automerge documents ([#29](https://github.com/kalisio/feathers-automerge/issues/29)) ([c5cf9ec](https://github.com/kalisio/feathers-automerge/commit/c5cf9ec0cdf5b02d657a5e4f3359bcce765046f6))
* Authentication support ([#30](https://github.com/kalisio/feathers-automerge/issues/30)) ([1fd32f3](https://github.com/kalisio/feathers-automerge/commit/1fd32f35664de2317559c7666dfd2c3f961fa3fa))
* Automerge service should manage pagination options like an adapter service does (closes [#25](https://github.com/kalisio/feathers-automerge/issues/25)) ([ab3a3ec](https://github.com/kalisio/feathers-automerge/commit/ab3a3ec9b1c0bf035c0be03e523c6e6d1faf0af7))
* Implement client side wrapper service ([#49](https://github.com/kalisio/feathers-automerge/issues/49)) ([3a861e1](https://github.com/kalisio/feathers-automerge/commit/3a861e15485a75cad245b7006fc5f0ef9383dcfb))
* Improve initialisation and server to server sync ([#47](https://github.com/kalisio/feathers-automerge/issues/47)) ([24f6720](https://github.com/kalisio/feathers-automerge/commit/24f67209e4b59bf3a4f0456a73315a9b49f13812))
* Initial sync server and todo frontend prototype ([548a030](https://github.com/kalisio/feathers-automerge/commit/548a03071c2ac10bd26016f0610d6128c178b4c1))
* Integrate into Feathers servers and show server to server communication ([#4](https://github.com/kalisio/feathers-automerge/issues/4)) ([fc7725e](https://github.com/kalisio/feathers-automerge/commit/fc7725ee1137ede864f4a830b175843b71ae0bda))
* Make automerge service fully adapter compatible ([#39](https://github.com/kalisio/feathers-automerge/issues/39)) ([9f0917f](https://github.com/kalisio/feathers-automerge/commit/9f0917ff5ad51941e3960d425c13e8eaec1b04fd))
* Metadata in automerge document should contain more information (closes [#24](https://github.com/kalisio/feathers-automerge/issues/24)) ([80c10f7](https://github.com/kalisio/feathers-automerge/commit/80c10f7a9ec0f0159d36e9f7e31695b8486dc5ef))
* Missing IDs should be generated on automerge document initialization (closes [#23](https://github.com/kalisio/feathers-automerge/issues/23)) ([40c08ce](https://github.com/kalisio/feathers-automerge/commit/40c08cefc36c585511251f240fe86b9541739a7a))
* Refactoring and channel functionality ([#12](https://github.com/kalisio/feathers-automerge/issues/12)) ([2861638](https://github.com/kalisio/feathers-automerge/commit/2861638ae1d6265a8847fe47c5d9c688a614492d))
* Server to server synchronization ([#31](https://github.com/kalisio/feathers-automerge/issues/31)) ([ba02d99](https://github.com/kalisio/feathers-automerge/commit/ba02d995da9d73f04027de24dcd56bdc61e22d75))





## 0.1.1 (2025-06-02)


### Features

* Initial sync server and todo frontend prototype ([548a030](https://github.com/kalisio/feathers-automerge/commit/548a03071c2ac10bd26016f0610d6128c178b4c1))
