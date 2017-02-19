/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('performance_weekly', {
    id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: true
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    current_nav: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    month_performance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    cummulative_performance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    ytd_performance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    standard_deviation: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    best_month_performance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    worst_month_performance: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    drawdown_count: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    expense_ratio: {
      type: DataTypes.FLOAT,
      allowNull: true
    },
    high_water_mark: {
      type: DataTypes.FLOAT,
      allowNull: true
    }
  }, {
    tableName: 'performance_weekly'
  });
};
