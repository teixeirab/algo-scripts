var utils = function(Configs) {
  this.logError = function (err) {
    if (Configs.sequelizeErrorLog) {
      // console.log(err)
      if(err.errors) {
        console.error(`sequelize error: ${err.errors[0].message}  field: ${err.errors[0].path}  table: ${nameInfo.table}`)
      }else {
        console.error(err)
      }
    }
  }

  return this
};
module.exports = utils;
