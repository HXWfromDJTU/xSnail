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
                        title:"蜗牛圣诞礼包",
                        imageUrl:"https://timgsa.baidu.com/timg?image&quality=80&size=b10000_10000&sec=1514126871&di=6271155d5f3ca9817c4e55d44767eb3c&src=http://mmbiz.qpic.cn/mmbiz/tO2xDrAuqKZnQic4U3SX6WwPxx4MDfCDhNgMjTot7NmPIn5PnIP9v29fOwDibMZZohIebpNnuHIO6tfcW05qiaufw/0",
                        price:678,
                        desc:"亲手制作圣诞礼包，送给心里的那个人",
                        num:"2398"
                    },{
                        title:"蜗牛花艺课程",
                        imageUrl:"http://cdn1.sikastone.com/wp-content/uploads/2017/20171010.jpg",
                        price:35,
                        desc:"Daniel坚持说这只不过是业余兴趣而已，“我只为我喜欢的地方和喜欢的人做设计。”",
                        num:"2398"
                    },{
                        title:"蜗牛鲜花材料",
                        imageUrl:"https://img.yzcdn.cn/upload_files/2017/12/04/FoidlpV2dRAlr7bxQbuQpthJ7I-p.jpg!280x280.jpg",
                        price:678,
                        desc:"十年经典，品质保证，专注进口植物，切花供应",
                        num:"2398"
                    }];
            } 
            *getHotSwiper() {
                const { ctx, config } = this;
                const req = ctx.request;  
                    ctx.body =[{
                        title:"子轩同款GAP卫衣",
                        imageUrl:"http://cdn1.sikastone.com/wp-content/uploads/2016/07/banner03-1.jpg",
                    },{
                        title:"阿德内尔皮肤衣",
                        imageUrl:"http://cdn1.sikastone.com/wp-content/uploads/2016/07/banner03-3.jpg",
                    }];
            } 
        
     
    }
    return IndexController;
};