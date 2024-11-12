import Vue from 'vue'
import Router from 'vue-router'

import { constantRoutes, asyncRoutes } from './routes'
// import routes from './routes'

Vue.use(Router)

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation
 */

const createRouter = () => new Router({
  scrollBehavior: () => ({ x: 0, y: 0 }),
  routes: constantRoutes,
  // Leave these as is and change from quasar.conf.js instead!
  // quasar.conf.js -> build -> vueRouterMode
  // quasar.conf.js -> build -> publicPath
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE
})

const router = createRouter()

router.beforeEach((to, from, next) => {
  try {
    const { name, path, query } = from
    localStorage.setItem('LS_ROUTE_KEY', JSON.stringify({ name, path, query }));
    next()
  } catch (error) {
    next()
  }
})

router.afterEach((to, from) => {
  try {
    const { name, path, query } = to
    localStorage.setItem('CR_ROUTE_KEY', JSON.stringify({ name, path, query }));
  } catch (error) {}
})

/**
 * resetRouter
 */
function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher //? reset router
}

export { asyncRoutes, resetRouter, constantRoutes }
export default router
