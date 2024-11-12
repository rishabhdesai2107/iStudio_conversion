const state = {
  products: []
}

const mutations = {
  setproduct(state, payload) {
    state.products = payload
  },






}

const actions = {

  updateproductdata(context, payload) {
    // debugger

    context.commit('setproduct', payload)
  },

}

const getters = {
  getProductdata: state => {
     
    return state.products
  }
}

export const products = {
  namespaced: true,
  state,
  mutations,
  actions,
  getters

}
