/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('counterparties', {
    counterparty_key: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    person_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cellphone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address_1: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    address_2: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    state: {
      type: DataTypes.STRING,
      allowNull: true
    },
    country: {
      type: DataTypes.STRING,
      allowNull: true
    },
    zipcode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    custodian: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    euroclear_clearstream_account: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('A','D'),
      allowNull: false
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'counterparties'
  });
};
