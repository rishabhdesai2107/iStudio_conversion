import Vue from 'vue'
import Vuex from 'vuex'

import VTL from './store-VTL'
import getters from './getters'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    VTL
  },
  getters
})
