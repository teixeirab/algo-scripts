/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('series_product_information', {
    series_number: {
      type: DataTypes.INTEGER(50),
      allowNull: false,
      primaryKey: true
    },
    bloomberg_name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product_type: {
      type: DataTypes.ENUM('Fund','Wrapper','Loan','Hybrid'),
      allowNull: false
    },
    issue_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    maturity_date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    region: {
      type: DataTypes.ENUM('South Cone','Andean & Caribbean','North America','Europe','Asia & ME','Africa'),
      allowNull: false
    },
    nav_frequency: {
      type: DataTypes.ENUM('Weekly','Monthly'),
      allowNull: false
    },
    currency: {
      type: DataTypes.ENUM('USD','EUR'),
      allowNull: false
    },
    custodian: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_number: {
      type: DataTypes.STRING,
      allowNull: true
    },
    portfolio_manager: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    initial_principal_amount: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    investment_strategy: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    valuation_frequency: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('A','D'),
      allowNull: false,
      defaultValue: "A"
    }
  }, {
    tableName: 'series_product_information'
  });
};
