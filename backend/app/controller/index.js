'use strict';
const security = require('../../config/security');

module.exports = app => {
    class IndexController extends app.Controller { 
            /**
             * 首页测试
             */
            *index() {
                const { ctx, config } = this;
                const req = ctx.request;  
                    ctx.body = {masg:"hello xSnail"};
            } 
        
     
    }
    return IndexController;
};