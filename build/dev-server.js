var config = require("../config/config")
var path =require("path")
var webpack = require("webpack")
var express =require('express')
var webpackConfig = require("./webpack.dev.conf")


var server =express();
// var compiler =webpack(webpackConfig)