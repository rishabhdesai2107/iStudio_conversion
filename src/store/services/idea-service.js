// src/store/services/users.js
// import _ from "lodash";
import async from 'async'
import feathersClient, { makeServicePlugin, BaseModel } from '@/feathers-client'

class Idea extends BaseModel {
  constructor(data, options) {
    super(data, options)
  }

  // Required for $FeathersVuex plugin to work after production transpile.
  static modelName = 'Idea'
  // Define default properties here
  static instanceDefaults() {
    return {}
  }
}
const servicePath = 'idea' // backend services
const servicePlugin = makeServicePlugin({
  Model: Idea, // className on top
  service: feathersClient.service(servicePath),
  servicePath,
  enableEvents: true,
  state: {
    listUpdated: true,
    totalCounfForIcf: 0,
    created: null,
    patched: null,
    removed: null
  },
  getters: {
    ideaIcfCount: state => state.totalCounfForIcf,
    listState: state => state.listUpdated,
    created: state => state.created,
    patched: state => state.patched,
    removed: state => state.removed
  },
  mutations: {
    updateTotalCounfForIcf(state, payload) {
      state.totalCounfForIcf = payload;
    },
    updateListStatus(state, payload) {
      state.listUpdated = payload;
    },
    updateCreatedState(state, payload) {
      state.created = payload;
    },
    updatePatchedState(state, payload) {
      state.patched = payload;
    },
    updateRemovedState(state, payload) {
      state.removed = payload;
    }
  },
  actions: {
    updateTotalCounfForIcf(context, payload) {
      context.commit('updateTotalCounfForIcf', payload)
    }
  }
})

const getSingleIdeaImageFromS3 = (service, idea, cb, force = false) => {
  const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio', 'video']
  async.forEachOf(media, (field, _mediaIndex, mediaCb) => {
    if (idea && field in idea) {
      const tempImg = _.cloneDeep(idea[field])
      
      var image = force
        ? _.filter(_.cloneDeep(idea[field]), (img) => (img.path !== "placeholder.jpg"))
        : _.filter(_.cloneDeep(idea[field]), (img) => (img.path !== "placeholder.jpg") && !img.signedUrl)
      image = _.map(_.cloneDeep(image), (img) => {
        img = _.omit(img, ['base64'])
        img['path'] = decodeURIComponent(img.newNameWithPath)
        return img
      })
  
      if (image && image.length) {
        fetch(`${process.env.API_BASE_URL}/get-signed-url-from-s3`, {
          method: "POST",
          mode: "cors",
          headers: {
            "content-type": "application/json",
            "x-tenant": localStorage.getItem("tenant"),
            "x-feathers-jwt": `Bearer ${localStorage.getItem("vtl2.0")}`,
            authorization: `Bearer ${localStorage.getItem("authorization")}`,
          },
          body: JSON.stringify({ data: { image } }),
        }).then((r) => r.json())
          .then(({ data }) => {
            if (!_.isEmpty(data)) {
              idea[field] = _.merge(tempImg, data)
            }
            mediaCb()
          })
      } else {
        mediaCb()
      }
    } else {
      mediaCb()
    }
  }, () => {
    service.FeathersVuexModel.store.commit('idea/updateItem', idea)
    cb()
  })
}

/**
 * @method getManyIdeaImageFromS3
 * @param {Array} listOfIdea 
 * @param {Function} cb 
 */
const getManyIdeaImageFromS3 = (service, listOfIdea, cb) => {
  async.forEachOf(listOfIdea, (idea, _ideaIndex, ideaCb) => {
    getSingleIdeaImageFromS3(service, idea, ideaCb)
  }, cb)
}

/**
 * @method removeBase64Image
 * @returns { Context }
 */
const removeBase64Image = () => {
  return async context => {
    const media = ['currentPicture', 'afterPicture', 'refPicture', 'audio']

    _.forEach(media, (field) => {
      if (context.data && context.data[field]) {
        context.data[field] = _.map(
          context.data[field],
          (img) => _.omit(img, ['base64', 'signedUrl'])
        );
      }
    })

    return context
  }
}

// NOTE Setup the client-side Feathers hooks. we can manage authorization, validation 
feathersClient.service(servicePath).hooks({
  before: {
    all: [],
    find: [],
    get: [],
    create: [removeBase64Image()],
    update: [removeBase64Image()],
    patch: [removeBase64Image()],
    remove: [removeBase64Image()]
  },
  after: {
    all: [],
    find: [
      async context => {
        const { service, result } = context
        getManyIdeaImageFromS3(service, result.data, () => {
          console.log('Many idea image cached');
        })
      }
    ],
    get: [
      async context => {
        const { service, data } = context
        getSingleIdeaImageFromS3(service, data, () => {
          console.log('Single idea image cached');
        })
      }
    ],
    create: [
      async context => {
        const { service, data } = context
        getSingleIdeaImageFromS3(service, data, () => {
          console.log('create hook');
        }, true)
      }
    ],
    update: [],
    patch: [
      async context => {
        const { service, data } = context
        getSingleIdeaImageFromS3(service, data, () => {
          console.log('patch hook');
        }, true)
      }
    ],
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