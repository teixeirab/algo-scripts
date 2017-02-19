/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('advances_holidays', {
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    holiday: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'advances_holidays'
  });
};
