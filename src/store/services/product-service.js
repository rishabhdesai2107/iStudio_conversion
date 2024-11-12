// src/store/services/users.js
import feathersClient, { makeServicePlugin, BaseModel } from 'app/src/feathers-client'

class Product extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Product'
  // Define default properties here
  static instanceDefaults() {
    return {}
  }
}


const servicePath = 'product'//backend services 
const servicePlugin = makeServicePlugin({
  Model: Product,//className on top
  service: feathersClient.service(servicePath),
  servicePath,
  enableEvents: true,
  state: {   
    created: false,
    patched: false,
    removed: false
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