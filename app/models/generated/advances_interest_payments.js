/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('advances_interest_payments', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    info_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    loan_payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    interest_determination_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    series_interest_payment_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    nominal_balance: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    interest_repayment: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    interest_receivable: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    interest_accrued: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    principal_repayment: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'advances_interest_payments'
  });
};
