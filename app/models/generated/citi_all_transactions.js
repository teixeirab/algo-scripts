/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('citi_all_transactions', {
    client_reference: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    trade_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    settlement_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    transaction_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sec_id_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sec_id: {
      type: DataTypes.STRING,
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
      type: DataTypes.STRING,
      allowNull: true
    },
    settled_quantity: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    setltement_amount: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    asd: {
      type: DataTypes.STRING,
      allowNull: true
    },
    counterparty: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settlement_location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    position_held: {
      type: DataTypes.STRING,
      allowNull: true
    },
    counterparty_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    legal_confirm: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0"
    },
    wire_confirm: {
      type: DataTypes.INTEGER(1),
      allowNull: false,
      defaultValue: "0"
    },
    wire_amount: {
      type: "DOUBLE",
      allowNull: false
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'citi_all_transactions'
  });
};
