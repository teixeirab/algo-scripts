/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('advances_info', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.ENUM('Initial','Transaction','Transaction-1'),
      allowNull: false
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    interest_accrual_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    first_interest_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    maturity_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nominal_amount: {
      type: DataTypes.DECIMAL,
      allowNull: false
    },
    interest_rate: {
      type: DataTypes.FLOAT,
      allowNull: false
    },
    coupon_frequency: {
      type: DataTypes.ENUM('D','M','Q','S','Y'),
      allowNull: false
    },
    coupon_type: {
      type: DataTypes.ENUM('simple','compound','floating'),
      allowNull: false
    },
    day_count_convention: {
      type: DataTypes.ENUM('360','365','actual'),
      allowNull: false
    },
    interest_payment_type: {
      type: DataTypes.ENUM('C','R'),
      allowNull: true
    },
    repayment_type: {
      type: DataTypes.ENUM('B','N','A'),
      allowNull: true
    },
    price_table: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "0"
    }
  }, {
    tableName: 'advances_info'
  });
};
