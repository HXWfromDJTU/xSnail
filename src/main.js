import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router/router'
import {routerMode} from './config/env'
import './config/rem'



Vue.use(VueRouter)
const router = new VueRouter({
	routes,
	mode: routerMode
})

new Vue({
	router
}).$mount('#app')

