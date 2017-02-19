/* jshint indent: 2 */

module.exports = function(FlexFundsDB, Sequelize) {
  return FlexFundsDB.define('ib_cash_report', {
    id: {
      type: Sequelize.STRING,
      // autoIncrement: true,
      // allowNull: false
    },
    period: {
      type: Sequelize.DATE,
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true
    },
    label: {
      type: Sequelize.TEXT,
      allowNull: false,
      primaryKey: true
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true
    },
    base_summary: {
      type: Sequelize.STRING,
      allowNull: true,
      primaryKey: true
    },
    type: {
      type: Sequelize.STRING,
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
      type: Sequelize.INTEGER(11),
      allowNull: true
    },
    dt_added: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'ib_cash_report'
  });
};
