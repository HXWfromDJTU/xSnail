'use strict';
module.exports = app => {
    // 引入中间件
    const loginAuth = app.middlewares.loginAuth();

    app.redirect('/', '/index');
    app.get('/index', 'index.index');

};