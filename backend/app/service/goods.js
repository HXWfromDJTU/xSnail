'use strict';

module.exports = app => {
    class goods extends app.Service {
        constructor(ctx) {
            super(ctx);
            this.model = app.model;
            this.sequelize = app.Sequelize;
        }

        //通过条件查找比对数据
        *
            findCompareFaces(query,order ) {
            return app.model.models.compareFace.findAll({
                where: query,
                order: [order]
            }).then(function (result) {
                return result;
            }).catch(function (err) {
                throw err
            });
        }
    }
return goods;
}