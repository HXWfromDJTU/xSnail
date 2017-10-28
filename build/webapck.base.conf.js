var path = require("path");
var config = require("../config");
var utils = require("./utils");
var projectRoot = path.resolve(__dirname,"../");

var env = process.NODE_ENV

var cssSourceMapDev = (env === 'development' && config.dev.cssSourceMapDevs)
var cssSourceMapProd = (env === 'production' && config.build.cssSourceMapProds)
var useCssSource = cssSourceMapDev || cssSourceMapProd;

module.exports = {
   entry:{
       app:'../main.js'
   },
   output:{
       path:config.build.assetsRoot,
       publicPath: process.env.NODE_ENV === 'production' ? config.build.assetsPublicPath : config.dev.assetsPublicPath,
       filename: '[name].js'
   },
   resolve:{
       extensions:['','.js','.vue','.json'],
       fallback:[path.jion(__dirname,'../node_modules')],
       alias:{
           'vue$':"vue/dist/vue.common.js",
           'src':path.resolve(__dirname,'../src'),
           'assets':path.resolve(__dirname,'../src/assets'),
           'components':path.resolve(__dirname,'../src/components')
       }
   },
   resolveLoader:{
       fallback:[path.join(__dirname,'../node_modules')]
   },
   
}