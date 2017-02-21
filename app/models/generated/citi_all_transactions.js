/* jshint indent: 2 */

module.exports = function(FlexFundsDB, Sequelize) {
  return FlexFundsDB.define('citi_all_transactions', {
    client_reference: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    account_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    trade_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    settlement_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    transaction_type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    sec_id_type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    sec_id: {
      type: Sequelize.STRING,
      allowNull: true
    },
    isin: {
      type: Sequelize.STRING,
      allowNull: true
    },
    issue_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    quantity: {
      type: Sequelize.STRING,
      allowNull: true
    },
    settled_quantity: {
      type: Sequelize.DECIMAL,
      allowNull: true
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: true
    },
    setltement_amount: {
      type: Sequelize.DECIMAL,
      allowNull: true
    },
    asd: {
      type: Sequelize.STRING,
      allowNull: true
    },
    counterparty: {
      type: Sequelize.STRING,
      allowNull: true
    },
    settlement_location: {
      type: Sequelize.STRING,
      allowNull: true
    },
    position_held: {
      type: Sequelize.STRING,
      allowNull: true
    },
    counterparty_id: {
      type: Sequelize.STRING,
      allowNull: false
    },
    legal_confirm: {
      type: Sequelize.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    wire_confirm: {
      type: Sequelize.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    wire_amount: {
      type: "DOUBLE",
      allowNull: false
    },
    dt_added: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, {
    tableName: 'citi_all_transactions'
  });
};
