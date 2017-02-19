/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ib_nav', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    base_currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cash: {
      type: "DOUBLE",
      allowNull: true
    },
    cash_collateral: {
      type: "DOUBLE",
      allowNull: true
    },
    stocks: {
      type: "DOUBLE",
      allowNull: true
    },
    securities_borrowed: {
      type: "DOUBLE",
      allowNull: true
    },
    securities_lent: {
      type: "DOUBLE",
      allowNull: true
    },
    options: {
      type: "DOUBLE",
      allowNull: true
    },
    bonds: {
      type: "DOUBLE",
      allowNull: true
    },
    commodities: {
      type: "DOUBLE",
      allowNull: true
    },
    funds: {
      type: "DOUBLE",
      allowNull: true
    },
    notes: {
      type: "DOUBLE",
      allowNull: true
    },
    accruals: {
      type: "DOUBLE",
      allowNull: true
    },
    dividend_accruals: {
      type: "DOUBLE",
      allowNull: true
    },
    soft_dollars: {
      type: "DOUBLE",
      allowNull: true
    },
    totals: {
      type: "DOUBLE",
      allowNull: true
    },
    twr: {
      type: "DOUBLE",
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'ib_nav'
  });
};
