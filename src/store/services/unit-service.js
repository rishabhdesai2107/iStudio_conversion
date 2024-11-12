// src/store/services/users.js
import feathersClient, { makeServicePlugin, BaseModel } from 'app/src/feathers-client'

class Unit extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Unit'
  // Define default properties here
  static instanceDefaults() {
    return {}
  }
}


const servicePath = 'unit'//backend services 
const servicePlugin = makeServicePlugin({
  Model: Unit,//className on top
  service: feathersClient.service(servicePath),
  servicePath,
  state: {
    created: null,
    patched: null,
    removed: null
  },
  getters: {
    created: state => state.created,
    patched: state => state.patched,
    removed: state => state.removed
  },
  mutations: {
    updateCreatedState(state, payload) {
      state.created = payload;
    },
    updatePatchedState(state, payload) {
      state.patched = payload;
    },
    updateRemovedState(state, payload) {
      state.removed = payload;
    }
  }
})

// Setup the client-side Feathers hooks.//we can manage authorization//validaion 
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },
  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
})

export default servicePlugin