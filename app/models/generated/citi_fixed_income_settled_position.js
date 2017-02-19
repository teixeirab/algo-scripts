/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('citi_fixed_income_settled_position', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    maturity_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sec_id_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sec_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    issue_name: {
      type: DataTypes.STRING,
      allowNull: true
    },
    how_position_is_held: {
      type: DataTypes.STRING,
      allowNull: true
    },
    settled_quantity: {
      type: "DOUBLE",
      allowNull: true
    },
    interest_rate: {
      type: "DOUBLE",
      allowNull: true
    },
    current_face_value: {
      type: "DOUBLE",
      allowNull: true
    },
    as_of_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isin: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'citi_fixed_income_settled_position'
  });
};
