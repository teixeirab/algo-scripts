/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('citi_unsettled_transactions', {
    client_reference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: false
    },
    settlement_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    txn_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    custodian_reference: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sec_id_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sec_id: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    isin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    issue_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    settled_quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settlement_amount: {
      type: "DOUBLE",
      allowNull: true
    },
    trade_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    counterparty_ec: {
      type: DataTypes.STRING,
      allowNull: true
    },
    counterparty_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    legal_confirm: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'citi_unsettled_transactions'
  });
};
