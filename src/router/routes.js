// import Vue from 'vue'
// import createStore from '@/store/index'
// const store = typeof createStore === 'function'
//     ?  createStore({Vue})
//     : createStore

const constantRoutes = [
  {
    path: '/userRegistration',
    component: () => import('components/userRegistration.vue'),
    name: 'userRegistration'
  },
  {
    path: '/approveChargeCode',
    component: () => import('pages/approveChargecode.vue'),
    name: 'approveChargeCode'
  },
  {
    path: '/auth/callback',
    component: () => import('pages/auth.vue'),
    name: 'authcallback'
  },

  { path: '/', name: 'authcallback', redirect: '/auth/callback' },
  {
    path: '/login',
    component: () => import('components/auth/login.vue'),
    name: 'auth',
    beforeEnter: (to, from, next) => {
      if (!localStorage.getItem('vtl2.0')) next() // authorization
      else if (localStorage.getItem('role') === 'Super Admin') next('/superAdminDashboard')
      else if (localStorage.getItem('role') === 'Admin') next('/home')
      else next('/home')
    }
  }

];

let asyncRoutes = [
  {
    path: '/dashboard',
    component: () => import('layouts/Layout.vue'),
    children: [
      {
        path: '/home',
        component: () => import('pages/home.vue'),
        name: 'home',
        meta: {
          title: 'home',
          moduleName: 'common.home',
          roles: ['Super Admin', 'Admin', 'User', 'Imeasure']
        }
      },
      {
        path: '/iInsight',
        component: () => import('pages/iInsight.vue'),
        name: 'iInsight',
        meta: {
          title: 'iInsight',
          moduleName: 'iInsight.iInsight',
          roles: ['Super Admin', 'Admin', 'User', 'Imeasure']
        }
      },
      {
        path: '/homepage',
        component: () => import('pages/Ibase/homepage.vue'),
        name: 'homepage',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.designModule',
          roles: ['Super Admin', 'Admin', 'User', 'Imeasure']
        }
      },
      {
        path: '/ibaseConfig',
        component: () => import('pages/Ibase/ibaseConfig.vue'),
        name: 'ibaseConfig',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.ibaseConfig',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/ibase-home',
        component: () => import('pages/Ibase/Config.vue'),
        name: 'ibase-home',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.designModule',
          child1: 'bread-crum.ibaseConfig',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/ibuilder',
        component: () => import('components/ibase/ibuilder.vue'),
        name: 'ibuilder',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.designModule',
          child1: 'bread-crum.ibaseConfig',
          child2: 'bread-crum.iMeasure',
          roles: ['Super Admin', 'Admin', 'Imeasure']
        }
      },
      {
        path: '/ibaseAdd',
        component: () => import('pages/Ibase/ibaseAdd.vue'),
        name: 'ibaseAdd',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.designModule',
          roles: ['Super Admin', 'Admin', 'Imeasure']
        }
      },
      {
        path: '/ibaseSchema',
        component: () => import('pages/Ibase/ibaseschema.vue'),
        name: 'ibaseSchema',
        meta: {
          title: 'Schema',
          moduleName: 'bread-crum.designModule',
          child1: 'bread-crum.ibaseConfig',
          child2: 'bread-crum.manualConfigure',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/ibaseAddExcelData',
        component: () => import('pages/Ibase/pageExcelUI.vue'),
        name: 'ibaseExceldata',
        meta: {
          title: 'Company Type',
          // moduleName: '',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/compareModule',
        component: () => import('pages/Ibase/compareModule.vue'),
        name: 'compareModule',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.designModule',
          child1: 'common.iBase',
          child2: 'bread-crum.compare',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/designModule',
        component: () => import('pages/Ibase/designModule.vue'),
        name: 'designModule',
        meta: {
          title: 'Company Type',
          moduleName: 'bread-crum.designModule',
          child1: 'common.iBase',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/chargeCode',
        component: () => import('pages/pageCreateChargeCode.vue'),
        name: 'chargeCode',
        meta: {
          title: 'Company Type',
          moduleName: 'common.chrgCode',
          child1: 'bread-crum.addChrgCode',
          roles: ['Super Admin']
        }
      },
      {
        path: '/superAdminDashboard',
        component: () => import('pages/SuperAdminDashboard.vue'),
        name: 'superAdminDashboard',
        meta: {
          title: 'Super Admin Dashboard',
          moduleName: 'common.chrgCode',
          roles: ['Super Admin']
        }
      },
      {
        path: '/product-uploader',
        component: () => import('pages/ProductImageUploader.vue'),
        name: 'product-uploader',
        meta: {
          title: 'Product File uploader',
          moduleName: 'bread-crum.designModule',
          child1: 'bread-crum.ibaseConfig',
          child2: 'bread-crum.addImgs',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/icap',
        component: () => import('pages/pageIcapDashboard.vue'),
        name: 'icapDashboard',
        meta: {
          title: 'Icap Dashboard',
          moduleName: 'common.iWorkshop',
          child1: 'bread-crum.manageWorkshop',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/createWorkshop',
        component: () => import('pages/Icap/createWorkshop.vue'),
        name: 'createWorkshop',
        meta: {
          title: 'Create Workshop',
          moduleName: 'common.iWorkshop',
          child1: 'bread-crum.manageWorkshop',
          child2: 'bread-crum.createWorkshop',
          roles: ['Super Admin', 'Admin']
        }
      },

      {
        path: '/workshop',
        component: () => import('pages/Icap/workshop.vue'),
        name: 'workshop',
        meta: {
          title: 'Workshop',
          moduleName: 'common.iWorkshop',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },

      {
        path: '/downLoadIdeas',
        component: () => import('pages/Icap/downloadIdeas.vue'),
        name: 'downloadIdeas',
        meta: {
          title: 'downloadIdeas',
          moduleName: 'common.iWorkshop',
          child1: 'bread-crum.manageIdeaWorkspace',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },

      {
        path: '/itrackDashboard',
        component: () => import('pages/itrack/itrackDashboard.vue'),
        name: 'itrackDashboard',
        meta: {
          title: 'itrackDashboard',
          moduleName: 'common.iTrack',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/addIdeas',
        component: () => import('pages/itrack/iTrackAddIdeas.vue'),
        name: 'addIdeas',
        meta: {
          title: 'addIdeas',
          // moduleName: '',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/ideaWorkspace',
        component: () => import('pages/itrack/ideaWorkspace.vue'),
        name: 'ideaWorkspace',
        meta: {
          title: 'ideaWorkspace',
          moduleName: 'common.iTrack',
          child1: 'bread-crum.ideaWorkspace',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
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
      },
      {
        path: '/itrackAnalytics',
        component: () => import('pages/itrack/itrackAnalytics.vue'),
        name: 'itrackAnalytics',
        meta: {
          title: 'itrackAnalytics',
          moduleName: 'common.iTrack',
          child1: 'bread-crum.iReviewDashbord',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/iLeagueDashboard',
        component: () => import('pages/iLeague/pageILeagueDashboard.vue'),
        name: 'iLeagueDashboard',
        meta: {
          title: 'iLeagueDashboard',
          moduleName: 'common.iLeague',
          roles: ['Super Admin', 'Admin','User']
        }
      },
      {
        path: '/mSaveDashboard',
        component: () => import('pages/mSave/pagemSaveDashboard.vue'),
        name: 'mSaveDashboard',
        meta: {
          title: 'mSaveDashboard',
          moduleName: 'common.mSave',
          roles: ['Super Admin', 'Admin','User']
        }
      },
      {
        path: '/msaveEngine',
        component: () => import('pages/mSave/msaveEngine.vue'),
        name: 'msaveEngine',
        meta: {
          title: 'msaveEngine',
          moduleName: 'common.mSave',
          roles: ['Super Admin', 'Admin','User']
        }
      },
      {
        path: '/iLeague/:id?',
        component: () => import('pages/iLeague/createProfile.vue'),
        name: 'iLeagueCreateOrUpdate',
        meta: {
          title: 'iLeagueCreateOrUpdate',
          moduleName: 'common.iLeague',
          child1: 'bread-crum.ileagueForm',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/iLeague/:id?',
        component: () => import('pages/iLeague/readOnlyProfile.vue'),
        name: 'iLeagueOpenNew',
        meta: {
          title: 'iLeagueOpenNew',
          moduleName: 'common.iLeague',
          child1: 'bread-crum.ileagueProfile',
          roles: ['Super Admin', 'Admin']
        }
      },
      {
        path: '/history',
        component: () => import('components/history/History.vue'),
        name: 'history',
        meta: {
          title: 'history',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/ivalueDashboard',
        component: () => import('pages/iValue/PageDashboard.vue'),
        name: 'ivalueDashboard',
        meta: {
          title: 'ivalueDashboard',
          moduleName: 'common.iValue',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/PartDetail',
        component: () => import('pages/iValue/PageProject.vue'),
        name: 'PartDetail',
        meta: {
          title: 'PartDetail',
          moduleName: 'common.iValue',
          child1: 'bread-crum.partDetail',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/ProjectDetail',
        component: () => import('pages/iValue/ProjectDetail.vue'),
        name: 'ProjectDetail',
        meta: {
          title: 'ProjectDetail',
          moduleName: 'common.iValue',
          child1: 'bread-crum.projectDetail',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/primaryV',
        component: () => import('pages/iValue/pagePrimaryV.vue'),
        name: 'primary-variable',
        props: true,
        meta: {
          title: 'primary-variable',
          moduleName: 'common.iValue',
          roles: ['Super Admin', 'Admin', 'User']
        }
      },
      {
        path: '/controlV',
        component: () => import('pages/iValue/pageControlV.vue'),
        name: 'control-variable',
        props: true,
        meta: {
          title: 'control-variable',
          roles: ['Super Admin', 'Admin', 'User'],
          enable: 'iValue'
        }
      },     
      {
        path: '/master-industry',
        component: () => import('pages/masters/industry/Table.vue'),
        name: 'masterIndustry',
        meta: {
          title: 'Master Industry',
          moduleName: 'bread-crum.master',
          child1: 'bread-crum.industry',
          roles: ['Super Admin']
        }
      },
      {
        path: '/master-application',
        component: () => import('pages/masters/application/Table.vue'),
        name: 'masterApplication',
        meta: {
          title: 'Master Application',
          moduleName: 'bread-crum.master',
          child1: 'bread-crum.application',
          roles: ['Super Admin']
        }
      },
      {
        path: '/master-customer',
        component: () => import('pages/masters/customer/Table.vue'),
        name: 'masterCustomer',
        meta: {
          title: 'Master Customer',
          moduleName: 'bread-crum.master',
          child1: 'bread-crum.customer',
          roles: ['Super Admin']
        }
      },
      {
        path: '/master-user',
        component: () => import('pages/masters/user/Table.vue'),
        name: 'masterUser',
        meta: {
          title: 'Master User',
          moduleName: 'bread-crum.master',
          child1: 'bread-crum.user',
          roles: ['Super Admin']
        }
      }
    ],
    beforeEnter: (to, from, next) => {
      if (localStorage.getItem('vtl2.0')) next() // authorization
      else next('/')
    }
  },
];

// //? Always leave this as last one
// if (process.env.MODE !== 'ssr') {
//   constantRoutes.push({
//     path: '*',
//     component: () => import('@/components/common/redirect/Index.vue'),
//     beforeEnter: (to, from, next) => {
//       const { name, path, query } = from
//       // localStorage.setItem('LS_ROUTE_KEY', JSON.stringify({ name, path, query }));
//     }
//   })
// }

export {
  constantRoutes,
  asyncRoutes
}
