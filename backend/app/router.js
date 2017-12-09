'use strict';
module.exports = app => {
    const loginAuth = app.middlewares.loginAuth();

    app.redirect('/', '/index');
    app.get('/index', 'index.index');

};