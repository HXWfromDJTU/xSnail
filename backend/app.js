'use strict';
 const Strategy = require('passport-local').Strategy;
 const crypto=require('crypto');
 const co = require('co');
module.exports = app => {
    const name = 'cache';
    const redis = name ? app.redis.get(name) : app.redis;
    
    app.cacheStore = {
        * get(key) {
        const res = yield redis.get(key);
        if (!res) return null;
        return JSON.parse(res);
        },

        * set(key, value) {
        //maxAge = maxAge || ONE_DAY;
        value = JSON.stringify(value);
        //yield redis.set(key, value, 'PX', maxAge);
        yield redis.set(key, value);
        },

        * destroy(key) {
        yield redis.del(key);
        },
    };
   app.passport.verify(function* (ctx, user) {
        let sha1=crypto.createHash("sha1");
        sha1.update(user.pass,'utf8');
        user.pass=sha1.digest('hex');
        user = yield ctx.service.user.verify(user.name, user.pass);
        return user;
    });

   class CustomController extends app.Controller {
        get currentUser() {
            return this.ctx.session.passport.user.account;
        };
        * log(module,remark){
            let log={
                'account': this.ctx.session.passport.user.account,
                'module' :module,
                'ip' : this.ctx.request.header['remote-user-ip']||this.ctx.ip,
                'remark' : remark
            }
            yield this.ctx.service.auditLog.create(log);
        }
        
    }
    app.Controller = CustomController;
    
};