import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '@/components/layout/BaseLayout'
import EmptyLayout from '@/components/layout/EmptyRouter'
import Dashboard from '@/views/Dashboard'
import Login from '@/views/Login'
import Vuehome from '@/views/Vuehome.vue'
import Gump from '@/views/Gump.vue'

import Allsystems from '@/views/allsystems/AllSystems'
import HostUpdate from '@/views/allsystems/HostUpdate'

import AIXbase from '@/views/hostpage/AIXbase'

const routes = [{
  path: '',
  component: EmptyLayout,
  redirect: 'dashboard',
  children: [{
      path: '/login',
      component: Login,
      name: 'login',
      meta: {
          title: 'login'
      }
  }]
}, {
  path: '',
  component: BaseLayout,
  redirect: 'dashboard',
  children: [{
      path: 'dashboard',
      component: Dashboard,
      name: 'dashboard',
      meta: {
          title: 'home'
      }
  }]
},
  {
    path: '/gump',
    component: BaseLayout,
    children: [{
        path: '/gump',
        component: Gump,
        name: 'gump',
        meta: {
            title: 'gump'
        }
    }]
  },
  {
    path: '/vuehome',
    component: BaseLayout,
    children: [{
        path: '/vuehome',
        component: Vuehome,
        name: 'vuehome',
        meta: {
            title: 'vuehome'
        }
    }]
  },
  {
    path: '/allsystems',
    component: BaseLayout,
    children: [{
        path: '/allsystems',
        component: Allsystems,
        name: 'allsystems',
        meta: {
            title: 'All Systems'
        }
    },
    {
        path: '/allsystems',
        component: EmptyLayout,
        meta: {
            title: 'All Systems'
        }, children: [
            {
                path: 'update',
                name: 'update',
                component: HostUpdate,
                meta: {
                    title: 'Update Host',
                }
            },
        ]
    }]
  },
  {
    path: '/aixsystems',
    component: BaseLayout,
    children: [{
        path: '/aixsystems',
        component: Allsystems,
        name: 'aixsystems',
        meta: {
            title: 'AIX Systems'
        }
    },
    {
        path: '/aixsystems',
        component: EmptyLayout,
        meta: {
            title: 'AIX Systems'
        }, children: [
            {
                path: 'AIXtest1',
                name: 'AIXtest1',
                component: AIXbase,
                meta: {
                    title: 'AIXtest1',
                }
            },
        ]
    }]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
