/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pershing_positions', {
    id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    security_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    cusip: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    asset_classification: {
      type: DataTypes.STRING,
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
    price_as_of_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    change_price_amount: {
      type: "DOUBLE",
      allowNull: true
    },
    change_price: {
      type: "DOUBLE",
      allowNull: true
    },
    market_value: {
      type: "DOUBLE",
      allowNull: true
    },
    market_value_change: {
      type: "DOUBLE",
      allowNull: true
    },
    last_activity_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    accrued_interest: {
      type: "DOUBLE",
      allowNull: true
    },
    disposition_method: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dividend_reinvestment: {
      type: DataTypes.STRING,
      allowNull: true
    },
    market: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'pershing_positions'
  });
};
