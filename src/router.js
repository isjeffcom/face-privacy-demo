import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

import home from './components/home'
import emotion from './components/emotion'
import receipt from './components/receipt'
import imgs from './components/imgs'
import map from './components/map'


export default new VueRouter({
  routes: [
      { path:'/', name:'index', redirect: '/map' },
      { path: '/home', name: 'home', component: home },
      { path: '/receipt', name: 'receipt', component: receipt },
      { path: '/emotion', name: 'emotion', component: emotion },
      { path: '/imgs', name: 'imgs', component: imgs },
      { path: '/map', name: 'map', component: map }
    ]
})
