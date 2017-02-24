/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('advances_repayments', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    info_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    repayment_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    repayment_date: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'advances_repayments'
  });
};
