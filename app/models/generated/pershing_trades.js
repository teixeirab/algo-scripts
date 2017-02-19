/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pershing_trades', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    account: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    account_nickname: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    trade_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    security_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cusip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    net_amount: {
      type: "DOUBLE",
      allowNull: true
    },
    settlement_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    quantity: {
      type: "DOUBLE",
      allowNull: true
    },
    price: {
      type: "DOUBLE",
      allowNull: true
    },
    principal: {
      type: "DOUBLE",
      allowNull: true
    },
    commission_fees: {
      type: "DOUBLE",
      allowNull: true
    },
    account_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'pershing_trades'
  });
};
