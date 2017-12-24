import App from '../App'
//---todo  --了解require.ensure 的使用----
// require.ensure(dependencies: String[], callback: function(require), chunkName: String)
// 参数一： 所需要用到的模块进行声明，string数组形式
// 参数二： 执行的回调函数
// 参数三： chunkName 不同的模块进行 require.ensure()，使用相同的chunkName可以确保被打包到同一个bundle下
const home = r => require.ensure([], () => r(require('../page/home/home')), 'home')
const search = r => require.ensure([], () => r(require('../page/search/search')), 'search')
 const order = r => require.ensure([], () => r(require('../page/order/order')), 'order')
const profile = r => require.ensure([], () => r(require('../page/profile/profile')), 'profile')
export default [{
    path: '/',
    component: App, //顶层路由，对应index.html
    children: [ //二级路由。对应App.vue
        //地址为空时跳转home页面
        {
            path: '',
            redirect: '/home'
        },
        //首页城市列表页
        {
            path: '/home',
            component: home
        },
        {
            path: '/search',
            component: search
        },
        {
            path: '/order',
            component: order
        },
        {
            path: '/profile',
            component: profile
        },
    ]
}]