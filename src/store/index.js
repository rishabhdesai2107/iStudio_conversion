import Vue from 'vue'
import Vuex from 'vuex'

import VTL from './store-VTL'
import user from './store.user'
import auth from './store.auth'
import getters from './getters'
import workshops from './workshops'
import industries from './industries'
import onlineUsers from './online-users'
import { project } from './project-store'
import permission from './store.permission'
import { processStore } from './store-process'
import { products } from './store_productexcel'
import { FeathersVuex } from 'app/src/feathers-client'
import { mfgstore1 } from './store-manufacturingProfile'

Vue.use(Vuex)
Vue.use(FeathersVuex)

export default function ({ ssrContext }) {
  /*
  * If not building with SSR mode, you can
  * directly export the Store instantiation
  * 
  */
  const requireModule = require.context(
    // The path where the service modules live
    './services',
    // Whether to look in subfolders
    false,
    // Only include .js files (prevents duplicate imports`)
    /.js$/
  )

  const servicePlugins = requireModule
    .keys()
    .map(modulePath => requireModule(modulePath).default)

  const Store = new Vuex.Store({
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
    getters,
    plugins: [...servicePlugins, auth]
  })

  return Store
}
