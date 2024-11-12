import _ from 'loadsh'

const updateOnlineUserList = (state, payload) => {
  state.onlineUserList = _.uniqBy(payload, '_id')
}

export {
  updateOnlineUserList
}