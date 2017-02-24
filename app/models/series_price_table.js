/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('series_price_table', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    last_loan_payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    settlement_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nav: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    price: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    special_dates: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'series_price_table'
  });
};
