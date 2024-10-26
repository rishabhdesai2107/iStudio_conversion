const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/dummyPage.vue') },
      {
                path: '/manage-istudio-workspace',
                component: () => import('pages/iStudio/manageIStudioWorkspace.vue'),
                name: 'iStudio',
                meta: {
                  title: 'ideaWorkspace',
                  moduleName: 'common.iTrack',
                  child1: 'bread-crum.manageIStudioWorkspace',
                  roles: ['Super Admin', 'Admin', 'User']
                }
              }]
  }



  // let asyncRoutes = [
  //   {
  //     path: '/dashboard',
  //     component: () => import('layouts/Layout.vue'),
  //     children: [
  //       {
  //         path: '/manage-istudio-workspace',
  //         component: () => import('pages/iStudio/manageIStudioWorkspace.vue'),
  //         name: 'iStudio',
  //         meta: {
  //           title: 'ideaWorkspace',
  //           moduleName: 'common.iTrack',
  //           child1: 'bread-crum.manageIStudioWorkspace',
  //           roles: ['Super Admin', 'Admin', 'User']
  //         }
  //       }]
  //   }
  // ]


]

export default routes
