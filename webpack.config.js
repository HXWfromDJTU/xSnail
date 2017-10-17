//若是直接使用webpack命令的，webpack会直接读取这里的参数
//
var webpack = require('webpack');
var path = require('path');
var htmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
    //entry打包入口是从哪里开始
    entry:{
       main: './src/script/main.js',//这里对象的key,表示的是打包结果的chunk name
       pageA:'./src/script/pageA.js',
        pageB:'./src/script/pageB.js',
        pageC:'./src/script/pageC.js'
    },
    //output最常用的就是path和filename属性
    output:{
       path:path.resolve(__dirname,'./dist'), //webpack2的语法规范，要求使用require的方式，在webpack1中，可以使用path:'./dist/js'即可
       filename:'js/[name]-[hash].js'
   },
   plugins:[
      new htmlWebpackPlugin({
          filename:'index-A&b.html',
          template:'index.html',
          inject:"body",
          title:'[name]',
          chunks:["pageA,pageB"]
      }),
       new htmlWebpackPlugin({
           filename:'index-Cs.html',
           template:'index.html',
           inject:"body",
           title:'[name]',
           chunks:["pageC"],
           loader:["style-loader","css-loader"]
       })
   ]
}