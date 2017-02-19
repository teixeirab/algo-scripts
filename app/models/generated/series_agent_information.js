/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('series_agent_information', {
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      defaultValue: "0",
      primaryKey: true
    },
    Calculation Agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Arranger: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Administrator: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Custodian: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    BD of Record: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Sale Agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Placing Agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    Portfolio Manager: {
      type: DataTypes.DECIMAL,
      allowNull: true
    }
  }, {
    tableName: 'series_agent_information'
  });
};
