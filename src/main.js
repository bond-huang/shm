import './plugins/axios'
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import installElementPlus from './plugins/element'

import '@/permission.js'
import '@/mock/mock.js'

const app = createApp(App)
installElementPlus(app)
app.use(store).use(router).mount('#app')