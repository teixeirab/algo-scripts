'use strict'

var utils = function(Configs) {
  this.logError = function (err, nameInfo) {
    if (Configs.sequelizeErrorLog) {
      // console.log(err)
      if(err.errors && err.errors.length) {
        console.error(`sequelize error: ${err.errors[0].message}  field: ${err.errors[0].path}  table: ${nameInfo.table}`.yellow)
      }else {
        console.error(err)
      }
    }
  }

  return this
};
module.exports = utils;
