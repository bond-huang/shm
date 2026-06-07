import { createRouter, createWebHashHistory } from 'vue-router'
import BaseLayout from '@/components/layout/BaseLayout'
import EmptyLayout from '@/components/layout/EmptyRouter'
import Dashboard from '@/views/Dashboard'
import Login from '@/views/Login'
import Vuehome from '@/views/Vuehome.vue'
import Gump from '@/views/Gump.vue'
import UserSettings from '@/views/UserSettings.vue'
import ScriptLibrary from '@/views/ScriptLibrary.vue'
import ScriptClass from '@/views/ScriptClass.vue'
import AllTool from '@/views/AllTool.vue'
import ToolClass from '@/views/ToolClass.vue'
import AIAssistant from '@/views/AIAssistant.vue'
import AnalysisTool from '@/views/tool/AnalysisTool.vue'
import PerformanceAnalysis from '@/views/tool/PerformanceAnalysis.vue'
import AnalysisPlaceholder from '@/views/tool/AnalysisPlaceholder.vue'
import PlaceholderTool from '@/views/tool/PlaceholderTool.vue'
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
  {
    path: '/ai-assistant',
    component: BaseLayout,
    children: [{
        path: '/ai-assistant',
        component: AIAssistant,
        name: 'ai-assistant',
        meta: {
            title: 'AI Assistant'
        }
    }]
  },
  {
    path: '/analytical-tools',
    component: BaseLayout,
    children: [{
        path: '/analytical-tools',
        component: AllTool,
        name: 'analytical-tools',
        meta: { title: 'Analytical Tools' }
    }]
  },
  {
    path: '/tool-analysis',
    component: BaseLayout,
    children: [{ path: '/tool-analysis', component: AnalysisTool, name: 'tool-analysis', meta: { title: 'Analysis Tool' } }]
  },
  {
    path: '/analysis-performance',
    component: BaseLayout,
    children: [{ path: '/analysis-performance', component: PerformanceAnalysis, name: 'analysis-performance', meta: { title: 'Performance Analysis' } }]
  },
  {
    path: '/analysis-log',
    component: BaseLayout,
    children: [{ path: '/analysis-log', component: AnalysisPlaceholder, name: 'analysis-log', meta: { title: 'Log Analysis' } }]
  },
  {
    path: '/analysis-network',
    component: BaseLayout,
    children: [{ path: '/analysis-network', component: AnalysisPlaceholder, name: 'analysis-network', meta: { title: 'Network Analysis' } }]
  },
  {
    path: '/analysis-data',
    component: BaseLayout,
    children: [{ path: '/analysis-data', component: AnalysisPlaceholder, name: 'analysis-data', meta: { title: 'Data Analysis' } }]
  },
  {
    path: '/analysis-config',
    component: BaseLayout,
    children: [{ path: '/analysis-config', component: AnalysisPlaceholder, name: 'analysis-config', meta: { title: 'Config Analysis' } }]
  },
  {
    path: '/analysis-rootcause',
    component: BaseLayout,
    children: [{ path: '/analysis-rootcause', component: AnalysisPlaceholder, name: 'analysis-rootcause', meta: { title: 'Root Cause Analysis' } }]
  },
  {
    path: '/analysis-capacity',
    component: BaseLayout,
    children: [{ path: '/analysis-capacity', component: AnalysisPlaceholder, name: 'analysis-capacity', meta: { title: 'Capacity Analysis' } }]
  },
  {
    path: '/tool-monitor',
    component: BaseLayout,
    children: [{ path: '/tool-monitor', component: PlaceholderTool, name: 'tool-monitor', meta: { title: 'Monitor Tool' } }]
  },
  {
    path: '/tool-inspect',
    component: BaseLayout,
    children: [{ path: '/tool-inspect', component: PlaceholderTool, name: 'tool-inspect', meta: { title: 'Inspect Tool' } }]
  },
  {
    path: '/tool-backup',
    component: BaseLayout,
    children: [{ path: '/tool-backup', component: PlaceholderTool, name: 'tool-backup', meta: { title: 'Backup & Restore' } }]
  },
  {
    path: '/tool-deploy',
    component: BaseLayout,
    children: [{ path: '/tool-deploy', component: PlaceholderTool, name: 'tool-deploy', meta: { title: 'Deploy Tool' } }]
  },
  {
    path: '/tool-operation',
    component: BaseLayout,
    children: [{ path: '/tool-operation', component: PlaceholderTool, name: 'tool-operation', meta: { title: 'Operation Tool' } }]
  },
  {
    path: '/tool-optimize',
    component: BaseLayout,
    children: [{ path: '/tool-optimize', component: PlaceholderTool, name: 'tool-optimize', meta: { title: 'Optimize Tool' } }]
  },
  {
    path: '/tool-network',
    component: BaseLayout,
    children: [{ path: '/tool-network', component: PlaceholderTool, name: 'tool-network', meta: { title: 'Network Tool' } }]
  },
  {
    path: '/tool-security',
    component: BaseLayout,
    children: [{ path: '/tool-security', component: PlaceholderTool, name: 'tool-security', meta: { title: 'Security Tool' } }]
  },
  {
    path: '/tool-debug',
    component: BaseLayout,
    children: [{ path: '/tool-debug', component: PlaceholderTool, name: 'tool-debug', meta: { title: 'Debug Tool' } }]
  },
  {
    path: '/tool-class',
    component: BaseLayout,
    children: [{
        path: '/tool-class',
        component: ToolClass,
        name: 'tool-class',
        meta: {
            title: 'Tool Class'
        }
    }]
  },
  {
    path: '/script-library',
    component: BaseLayout,
    children: [{
        path: '/script-library',
        component: ScriptLibrary,
        name: 'script-library',
        meta: {
            title: 'Script Library'
        }
    }]
  },
  {
    path: '/script-class',
    component: BaseLayout,
    children: [{
        path: '/script-class',
        component: ScriptClass,
        name: 'script-class',
        meta: {
            title: 'Script Class'
        }
    }]
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
