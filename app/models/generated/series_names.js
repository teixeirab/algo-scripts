/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('series_names', {
    isin: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false
    },
    series_name: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    series_short_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    six_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('A','D'),
      allowNull: true,
      defaultValue: "A"
    }
  }, {
    tableName: 'series_names'
  });
};
