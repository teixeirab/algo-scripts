/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('citi_available_position', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "",
      primaryKey: true
    },
    period: {
      type: DataTypes.DATE,
      allowNull: true
    },
    iso_country_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    branch_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    issue_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settled_position: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    confirmed_delivers: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    confirmed_receives: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    unconfirmed_delivers: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    unconfirmed_receives: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    blocked_position: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    available_position: {
      type: DataTypes.DECIMAL,
      allowNull: true
    },
    additional_informaiton: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    blocked_to_delivery: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'citi_available_position'
  });
};
