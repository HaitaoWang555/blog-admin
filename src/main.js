import Vue from 'vue'

import 'normalize.css/normalize.css' // A modern alternative to CSS resets

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/zh-CN' // lang i18n

import '@/styles/index.scss' // global css

import App from './App'
import store from './store'
import router from './router'
import { tips } from '@/utils/tips'

import '@/icons' // icon
import '@/permission' // permission control

// register global utility filters.
import * as filters from './filters' // global filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})

Vue.use(ElementUI, { locale, size: 'small', zIndex: 3000 })

Vue.prototype.$tips = tips

Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
