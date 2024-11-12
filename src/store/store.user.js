const state = {
  roles: [],
  permissions: [],
  loader: false
}

const mutations = {
  SET_ROLES: (state, roles) => {
    state.roles = roles
  },
  SET_PERMISSIONS: (state, permissions) => {
    state.permissions = permissions;
  }
}

const actions = {}

export default {
  namespaced: true,
  state,
  mutations,
  actions
}
