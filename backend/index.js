'use strict'
require('egg').startCluster({
  customEgg: '',
  baseDir: process.cwd(),
  port: 9527,
  workers: null,
  plugins: null,
  https: false
})