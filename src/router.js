import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from './components/home'
import emotion from './components/emotion'
import receipt from './components/receipt'


export default new VueRouter({
  routes: [
      { path:'/', name:'emotion', redirect: '/emotion' },
      { path: '/home', name: 'home', component: home },
      { path: '/receipt', name: 'receipt', component: receipt },
      { path: '/emotion', name: 'emotion', component: emotion }
    ]
})
