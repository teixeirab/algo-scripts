/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ftp_translation', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    database_field: {
      type: DataTypes.STRING,
      allowNull: false
    },
    report_field: {
      type: DataTypes.STRING,
      allowNull: false
    },
    source: {
      type: DataTypes.ENUM('Theorem','Citi','Interactive Brokers','Pershing'),
      allowNull: false
    },
    table_loc: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'ftp_translation'
  });
};
