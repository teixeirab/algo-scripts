/* jshint indent: 2 */

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ib_positions', {
    id: {
      type: DataTypes.INTEGER(11),
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    account_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    con_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    security_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    symbol: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bb_ticker: {
      type: DataTypes.STRING,
      allowNull: true
    },
    bb_global_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    security_description: {
      type: DataTypes.STRING,
      allowNull: true
    },
    asset_type: {
      type: DataTypes.STRING,
      allowNull: true
    },
    currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    base_currency: {
      type: DataTypes.STRING,
      allowNull: true
    },
    quantity: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    quantity_in_base: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    cost_price: {
      type: "DOUBLE",
      allowNull: true
    },
    cost_basis: {
      type: "DOUBLE",
      allowNull: true
    },
    cost_basis_in_base: {
      type: "DOUBLE",
      allowNull: true
    },
    market_price: {
      type: "DOUBLE",
      allowNull: true
    },
    market_value: {
      type: "DOUBLE",
      allowNull: true
    },
    market_value_in_base: {
      type: "DOUBLE",
      allowNull: true
    },
    open_date_time: {
      type: "DOUBLE",
      allowNull: true
    },
    fx_rate_to_base: {
      type: "DOUBLE",
      allowNull: true
    },
    report_date: {
      type: DataTypes.INTEGER(11),
      allowNull: true
    },
    settled_quantity: {
      type: "DOUBLE",
      allowNull: true
    },
    settled_quantity_in_base: {
      type: "DOUBLE",
      allowNull: true
    },
    master_account_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    van: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accrued_int: {
      type: "DOUBLE",
      allowNull: true
    },
    originating_order_id: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dt_added: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'ib_positions'
  });
};
