/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ib_cash_report', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    base_summary: {
      type: DataTypes.STRING,
      allowNull: true
    },
    label: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    total: {
      type: "DOUBLE",
      allowNull: true
    },
    securities: {
      type: "DOUBLE",
      allowNull: true
    },
    futures: {
      type: "DOUBLE",
      allowNull: true
    },
    ibukl: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'ib_cash_report'
  });
};
