'use strict';

const fs = require('fs');
const path = require('path');

module.exports = appInfo => {
    const config = {};
    // should change to your own
    config.keys = appInfo.name + 'xSnail';
    config.redis = {
        clients: {
            session: {
                host: 'localhost',
                port: 6379,
                db: 1,
                password: '',
            },
            cache: {
                host: 'localhost',
                port: 6379,
                db: 1,
                password: '',
            }
        }
    };
    config.sessionRedis = {
        name: 'session',
    };
    config.session = {
        maxAge: 0,
        key: 'EGG_SESS',
        httpOnly: true,
        encrypt: true,
    };
    config.sequelize = {
        dialect: 'mysql',
        database: 'xsnail-test',
        host: 'localhost',
        port: '3306',
        username: 'root',
        password: 'root',
    };
    config.view = {
        defaultViewEngine: 'vue',
        defaultExtension: '.html',
        mapping: {
            '.vue': 'vue',
            '.html': 'vue',
        },
        cache: true,
    };
    config.security = {
        csrf: {
            enable: false,
            ignoreJSON: true,
        },
    };
    //system config
    config.table = {
        pageSize: 10
    };
    //init
    config.init = {
        account: "admin",
        password: "admin",
    };

    config.proxyworker = {
        port: 10086,
    };


    config.multipart = {
        autoFields: true,
        defaultCharset: 'utf8',
        fileSize: '10mb',
        files: 15,
        fieldSize: '2000kb',
        fields: 80,
        fileExtensions: [],
        whitelist: null,
    };
    return config;
};