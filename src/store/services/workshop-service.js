// src/store/services/users.js
// import _ from "lodash";
import { date } from "quasar";
import feathersClient, { makeServicePlugin, BaseModel } from 'app/src/feathers-client'

class Workshop extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }
  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Workshop'
  // Define default properties here
  static instanceDefaults() {
    return {}
  }
}

const servicePath = 'workshop' // backend services 
const servicePlugin = makeServicePlugin({
  Model: Workshop, // className on top
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

/**
 * updateWkStatus [Update workshop status]
 * @param {Object} context 
 */
const updateWkStatus = (context) => {
  let curDate = date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss.SSSZ");
  let wkStatus = 0;
  let wkStatus1;

  if(context.data.endDate && context.data.startDate) {
    wkStatus = date.getDateDiff(context.data.endDate, curDate, "days");
    wkStatus1 = date.getDateDiff(curDate, context.data.startDate, "days");

    if (wkStatus < 0 && context.data.forceComplete !== true) {
      context.data['status'] = "Completed";
    } else if ((wkStatus < 0 || wkStatus1 >= 0) && context.data.forceComplete !== true) {
      context.data['status'] = "Inprogress";
    } else {
      if(context.data.forceComplete !== true) context.data['status'] = "Scheduled";
    }
  }

  return context
}

const updateStatus = (x, context) => {
  if(x) {
    let wkStatus = 0;
    let wkStatus1;
    let data = null;
    let curDate = date.formatDate(Date.now(), "YYYY-MM-DDTHH:mm:ss.SSSZ");
    wkStatus = date.getDateDiff(x.endDate, curDate, "days");
    wkStatus1 = date.getDateDiff(curDate, x.startDate, "days");
  
    if (wkStatus < 0 && x.forceComplete !== true) {
      if(x.status !== "Completed") data = { ...x, status: "Completed" };
    } else if (
      (wkStatus < 0 || wkStatus1 >= 0) &&
      x.forceComplete !== true
    ) {
      if(x.status !== "Inprogress") data = { ...x, status: "Inprogress" };
    } else if (x.forceComplete !== true) {
      if(x.status !== "Scheduled") data = { ...x, status: "Scheduled" };
    }
  
    if(data) {
      context.app.service('workshop')
        .patch(x._id, data)
      data = null
    }
  }
}

/**
 * @method updateWkStatusOnFind
 * @param {Object} context 
 */
const updateWkStatusOnFind = () => {
  return async context => {
    const { data } = context.result

    _.forEach(_.cloneDeep(data), (x) => updateStatus(x, context));

    return context
  }
}

// Setup the client-side Feathers hooks.//we can manage authorization//validaion 
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [updateWkStatus],
    update: [updateWkStatus],
    patch: [updateWkStatus],
    remove: []
  },
  after: {
    all: [],
    find: [updateWkStatusOnFind()],
    get: [
      context => {
        const { data } = context
        updateStatus(data, context)
        return context
      }
    ],
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