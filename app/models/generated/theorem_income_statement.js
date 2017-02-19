/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('theorem_income_statement', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('Weekly','Monthly'),
      allowNull: false
    },
    loan_interest_income: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    loan_interest_income_received: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    dividend: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    portfolio_income: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    stcg: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    unrealized_gain: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    manager_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    audit_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    price_dissemination_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    trustee_corporate_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    transfer_agent_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    arranger_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    external_expense_offset: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    extraordinary_expense: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    administrator_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    inventory_cost: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    listing_agent_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    transaction_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    legal_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    annual_series_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    operating_fees_credit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    setup_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    expenses_credit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    external_expenses_credit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    portfolio_manager_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    bank_fees: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    performance_fee: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    premium_discount_paid: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    accounting_fees: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'theorem_income_statement'
  });
};
