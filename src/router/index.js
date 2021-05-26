import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '@/components/layout/BaseLayout'
import EmptyLayout from '@/components/layout/EmptyRouter'
import Dashboard from '@/views/Dashboard'
import Login from '@/views/Login'
import Vuehome from '@/views/Vuehome.vue'
import Gump from '@/views/Gump.vue'

import Allsystems from '@/views/modeller/Allsystems'

import Modeller from '@/views/modeller/Modeller'
import ModelUpdate from '@/views/modeller/ModelUpdate'
import ModelColumn from '@/views/modeller/column/ModelColumn'
import ModelColumnUpdate from '@/views/modeller/column/ModelColumnUpdate'


const routes = [{
  path: '',
  component: EmptyLayout,
  redirect: 'dashboard',
  children: [{
      path: '/login',
      component: Login,
      name: 'login',
      meta: {
          title: '登录'
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
          title: '首页'
      }
  }]
}, {
  path: '/',
  component: BaseLayout,
  children: [{
      path: 'modeller',
      component: Modeller,
      meta: {
          title: '数据集管理'
      }
  }, 
    {
      path: 'modeller',
      component: EmptyLayout,
      meta: {
          title: '数据集管理'
      }, children: [
          {
              path: 'add',
              name: 'add',
              component: ModelUpdate,
              meta: {
                  title: '新增数据集',
              }
          }, {
              path: 'column',
              name: 'column',
              component: ModelColumn,
              meta: {
                  title: '字段管理'
              }
          }, {
              path: 'column',
              component: EmptyLayout,
              meta: {
                  title: '字段管理'
              },
              children: [
                  {
                      path: 'add',
                      name: 'modeller-column-add',
                      component: ModelColumnUpdate,
                      meta: {
                          title: '新增字段'
                      }
                  }
              ]
          }
      ]
  }]
},{
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
            title: 'allsystems'
        }
    }]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
