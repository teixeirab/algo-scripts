/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('series_fees_terms', {
    series_number: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true
    },
    operating_fees: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    administrator_fees: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    setup_fees: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    arranger_fee: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    portfolio_management_fee: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    performance_fee: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    special_condition: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    external_offset: {
      type: DataTypes.INTEGER(1),
      allowNull: false
    }
  }, {
    tableName: 'series_fees_terms'
  });
};
