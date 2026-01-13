# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.3.1](https://github.com/kalisio/offline-sync/compare/v0.3.0...v0.3.1) (2026-01-13)

**Note:** Version bump only for package @kalisio/feathers-automerge-server





# [0.3.0](https://github.com/kalisio/feathers-automerge/compare/v0.2.0...v0.3.0) (2026-01-13)


### Bug Fixes

* avoid syncing items without IDs (ie not persisted in DB) ([cd9fbd0](https://github.com/kalisio/feathers-automerge/commit/cd9fbd07bc4c83d440afb10bedc0883e3f9eece6))
* Fix Automerge service pagination ([#54](https://github.com/kalisio/feathers-automerge/issues/54)) ([13161f5](https://github.com/kalisio/feathers-automerge/commit/13161f508dc48a454a462b593f52986058a098ed))


### Features

* Add option to initialise documents to sync ([#56](https://github.com/kalisio/feathers-automerge/issues/56)) ([bcedeb1](https://github.com/kalisio/feathers-automerge/commit/bcedeb14fb19bc62631f88f9419985c254e9738a))





# 0.2.0 (2025-10-21)


### Bug Fixes

* dropped initial sync causing too much issues for now ([0143404](https://github.com/kalisio/feathers-automerge/commit/0143404207958edf626cf6d8c0f1e2e72a64bc24))
* Ensure documents are initialized properly and improve messaging ([#5](https://github.com/kalisio/feathers-automerge/issues/5)) ([0a943a5](https://github.com/kalisio/feathers-automerge/commit/0a943a5d94e1449d8301e459beda0beb8889471d))
* Improve authentication handling ([#37](https://github.com/kalisio/feathers-automerge/issues/37)) ([408b7f3](https://github.com/kalisio/feathers-automerge/commit/408b7f301bf780bde2aa1ce1145a084992444b0e))
* Separate sync server and client types ([403a28b](https://github.com/kalisio/feathers-automerge/commit/403a28b7c9fb6f82baec98b96e341f9b80dcc899))
* Update canAccess check to take full params instead of just user ([#46](https://github.com/kalisio/feathers-automerge/issues/46)) ([b65af89](https://github.com/kalisio/feathers-automerge/commit/b65af898a082d82d6b691ab007c530d8a028d632))
* Update dependencies ([#26](https://github.com/kalisio/feathers-automerge/issues/26)) ([f241771](https://github.com/kalisio/feathers-automerge/commit/f241771cc99e3afba99523ef4083c85ca7111b39))
* Update dependencies and test against Node 20 ([#48](https://github.com/kalisio/feathers-automerge/issues/48)) ([f86b4b1](https://github.com/kalisio/feathers-automerge/commit/f86b4b1de5c60c0418a14dbc0e4fb5f80f223aa5))


### Features

* Add support for offline sync based on queries ([#15](https://github.com/kalisio/feathers-automerge/issues/15)) ([2317ea8](https://github.com/kalisio/feathers-automerge/commit/2317ea8ab8e2aab76b1bb1dba8e468bc00547009))
* Allow to remove Automerge documents ([#29](https://github.com/kalisio/feathers-automerge/issues/29)) ([c5cf9ec](https://github.com/kalisio/feathers-automerge/commit/c5cf9ec0cdf5b02d657a5e4f3359bcce765046f6))
* Authentication support ([#30](https://github.com/kalisio/feathers-automerge/issues/30)) ([1fd32f3](https://github.com/kalisio/feathers-automerge/commit/1fd32f35664de2317559c7666dfd2c3f961fa3fa))
* Improve initialisation and server to server sync ([#47](https://github.com/kalisio/feathers-automerge/issues/47)) ([24f6720](https://github.com/kalisio/feathers-automerge/commit/24f67209e4b59bf3a4f0456a73315a9b49f13812))
* Integrate into Feathers servers and show server to server communication ([#4](https://github.com/kalisio/feathers-automerge/issues/4)) ([fc7725e](https://github.com/kalisio/feathers-automerge/commit/fc7725ee1137ede864f4a830b175843b71ae0bda))
* Make automerge service fully adapter compatible ([#39](https://github.com/kalisio/feathers-automerge/issues/39)) ([9f0917f](https://github.com/kalisio/feathers-automerge/commit/9f0917ff5ad51941e3960d425c13e8eaec1b04fd))
* Metadata in automerge document should contain more information (closes [#24](https://github.com/kalisio/feathers-automerge/issues/24)) ([80c10f7](https://github.com/kalisio/feathers-automerge/commit/80c10f7a9ec0f0159d36e9f7e31695b8486dc5ef))
* Missing IDs should be generated on automerge document initialization (closes [#23](https://github.com/kalisio/feathers-automerge/issues/23)) ([40c08ce](https://github.com/kalisio/feathers-automerge/commit/40c08cefc36c585511251f240fe86b9541739a7a))
* Refactoring and channel functionality ([#12](https://github.com/kalisio/feathers-automerge/issues/12)) ([2861638](https://github.com/kalisio/feathers-automerge/commit/2861638ae1d6265a8847fe47c5d9c688a614492d))
* Server to server synchronization ([#31](https://github.com/kalisio/feathers-automerge/issues/31)) ([ba02d99](https://github.com/kalisio/feathers-automerge/commit/ba02d995da9d73f04027de24dcd56bdc61e22d75))





## 0.1.1 (2025-06-02)

**Note:** Version bump only for package @kalisio/feathers-automerge-server
