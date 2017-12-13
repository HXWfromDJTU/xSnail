import Vue from 'vue'
import VueRouter from 'vue-router'
import routes from './router/router'
// import store from './store/'
import {routerMode} from './config/env'
import './config/rem'
// 引入有赞移动UI框架 Vant
import Vant from 'vant'
import 'vant/lib/vant-css/index.css';
Vue.use(Vant)
Vue.use(VueRouter)
const router = new VueRouter({
	routes,
	mode: routerMode
})

new Vue({
	router
}).$mount('#app')

