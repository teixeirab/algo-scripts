/* jshint indent: 2 */

module.exports = function(FlexFundsDB, Sequelize) {
  return FlexFundsDB.define('pershing_positions', {
    period: {
      type: Sequelize.DATE,
      allowNull: false,
      unique: 'unique_index'
    },
    security_id: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'unique_index'
    },
    account_number: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: 'unique_index'
    },
    cusip: {
      type: Sequelize.STRING,
      allowNull: true
    },
    account_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    asset_classification: {
      type: Sequelize.STRING,
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
      type: Sequelize.DATE,
      allowNull: true
    },
    timezone: {
      type: Sequelize.STRING,
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
      type: Sequelize.DATE,
      allowNull: true
    },
    accrued_interest: {
      type: "DOUBLE",
      allowNull: true
    },
    disposition_method: {
      type: Sequelize.STRING,
      allowNull: true
    },
    dividend_reinvestment: {
      type: Sequelize.STRING,
      allowNull: true
    },
    market: {
      type: Sequelize.STRING,
      allowNull: true
    },
    dt_added: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'pershing_positions'
  });
};
