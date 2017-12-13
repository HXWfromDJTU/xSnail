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
                    ctx.body = {msg:"hello xSnail"};
            } 
              /**
             * 获取热销列表
             */
            *getHotSaleList() {
                const { ctx, config } = this;
                const req = ctx.request;  
                    ctx.body =[{
                        title:"子轩同款GAP卫衣",
                        imageUrl:"imageUrl1.png",
                        price:35,
                        desc:"今秋最新款子轩同款GAP卫衣，描述描述描述",
                        num:"2398"
                    },{
                        title:"阿德内尔皮肤衣",
                        imageUrl:"imageUrl1.png",
                        price:678,
                        desc:"阿德内尔皮肤衣，描述描述描述",
                        num:"2398"
                    }];
            } 
            *getHotSwiper() {
                const { ctx, config } = this;
                const req = ctx.request;  
                    ctx.body =[{
                        title:"子轩同款GAP卫衣",
                        imageUrl:"swiperImage1.png",
                    },{
                        title:"阿德内尔皮肤衣",
                        imageUrl:"swiperImage2.png",
                    }];
            } 
        
     
    }
    return IndexController;
};