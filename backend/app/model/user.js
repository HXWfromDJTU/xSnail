module.exports = app => {
  const { STRING, BIGINT, INTEGER, DATE, DOUBLE} = app.Sequelize
  let user = app.model.define('analyseImageA', {
    id: { type: BIGINT, autoIncrement: true, primaryKey: true},
    name: { type: STRING(50)}, 
  }, {
    freezeTableName: true, // 默认false修改表名为复数，true不修改表名，与数据库表名同步      
    tableName: 'user',
    timestamps: true
  })
  user.sync()
  return user
}
