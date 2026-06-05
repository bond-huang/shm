import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '@/components/layout/BaseLayout'
import EmptyLayout from '@/components/layout/EmptyRouter'
import Dashboard from '@/views/Dashboard'
import Login from '@/views/Login'
import Vuehome from '@/views/Vuehome.vue'
import Gump from '@/views/Gump.vue'
import UserSettings from '@/views/UserSettings.vue'
import CategoryList from '@/views/CategoryList.vue'
import CategoryDetail from '@/views/CategoryDetail.vue'

import Allsystems from '@/views/allsystems/AllSystems'
import HostUpdate from '@/views/allsystems/HostUpdate'

import AIXbase from '@/views/hostpage/AIXbase'
import Linuxbase from '@/views/hostpage/Linuxbase'
import HostDetail from '@/views/hostpage/HostDetail'

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
  {
    path: '/linuxsystems',
    component: BaseLayout,
    children: [{
        path: '/linuxsystems',
        component: Allsystems,
        name: 'linuxsystems',
        meta: {
            title: 'Linux Systems'
        }
    },
    {
        path: '/linuxsystems',
        component: EmptyLayout,
        meta: {
            title: 'Linux Systems'
        }, children: [
            {
                path: 'Linuxtest1',
                name: 'Linuxtest1',
                component: Linuxbase,
                meta: {
                    title: 'Linuxtest1',
                }
            },
        ]
    }]
  },
  {
    path: '/system-class',
    component: BaseLayout,
    children: [{
        path: '/system-class',
        component: CategoryList,
        name: 'system-class',
        meta: {
            title: 'System Class'
        }
    }]
  },
  {
    path: '/system-class/:name',
    component: BaseLayout,
    children: [{
        path: '/system-class/:name',
        component: CategoryDetail,
        name: 'category-detail',
        meta: {
            title: 'Category Detail'
        }
    }]
  },
  {
    path: '/host/:id',
    component: BaseLayout,
    children: [{
        path: '/host/:id',
        component: HostDetail,
        name: 'host-detail',
        meta: {
            title: 'Host Detail'
        }
    }]
  },
  {
    path: '/user-settings',
    component: BaseLayout,
    children: [{
        path: '/user-settings',
        component: UserSettings,
        name: 'user-settings',
        meta: {
            title: 'User Settings'
        }
    }]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
