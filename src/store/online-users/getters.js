const getOnlineUserList = (state) => {
  return state.onlineUserList
}

const getOnlineUserCount = (state) => {
  return state.onlineUserList.length
}

export {
  getOnlineUserList,
  getOnlineUserCount
}
