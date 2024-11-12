import Vue from 'vue'
import Vuex from 'vuex'

import VTL from './store-VTL'
import user from './store.user'
import getters from './getters'
import workshops from './workshops'
import industries from './industries'
import onlineUsers from './online-users'
import { project } from './project-store'
import permission from './store.permission'
import { processStore } from './store-process'
import { products } from './store_productexcel'
import { mfgstore1 } from './store-manufacturingProfile'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    permission,
    user,
    VTL,
    products,
    mfgstore1,
    project,
    processStore,
    industries,
    workshops,
    onlineUsers
  },
  getters
})

export default store