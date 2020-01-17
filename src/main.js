import Vue from 'vue'
import App from './App.vue'

import router from './router.js'

import axios from 'axios'
import VueAxios from 'vue-axios'
 
Vue.use(VueAxios, axios)


Vue.config.productionTip = false

new Vue({
  render: h => h(App),
  router
}).$mount('#app')
