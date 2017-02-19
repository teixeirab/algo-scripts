/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('theorem_balance_sheet', {
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
    total_assets: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    total_liabilities: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    total_equity: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    number_of_units_held: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    nav_per_unit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    operating_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    management_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    accounts_receivable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    interest_receivable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    investments_long: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    debt_instruments: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    cash: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    accrued_premium: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    other_assets: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    annual_series_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    arranger_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    audit_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    inventory_costs_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    price_dissemination_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    transfer_agent_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    trustee_agent_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    external_expense_offset_accrued: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    extraordinary_expenses_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    manager_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    administrator_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    performance_fee_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    portfolio_manager_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    arranger_fee_credit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    expenses_offset_credit: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    legal_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    listing_agent_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    setup_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    transaction_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    accounting_fees_payable: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'theorem_balance_sheet'
  });
};
