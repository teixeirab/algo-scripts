module.exports = function(FlexFundsDB, Sequelize) {
  return FlexFundsDB.define('citi_positions_valuations', {
    account_id: {
      type: Sequelize.INTEGER(11),
      allowNull: true
    },
    account_name: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    as_of_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    issue_name: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    maturity_date: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    sec_id_type: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    sec_id: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    settled_quantity: {
      type: "DOUBLE",
      allowNull: true
    },
    market_value: {
      type: "DOUBLE",
      allowNull: true
    },
    currency: {
      type: Sequelize.STRING(3),
      allowNull: true
    },
    interest_rate: {
      type: "DOUBLE",
      allowNull: true
    },
    isin: {
      type: "DOUBLE",
      allowNull: true
    }
  }, {
    tableName: 'citi_positions_valuations'
  });
};
