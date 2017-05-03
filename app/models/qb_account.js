module.exports = function(FlexFundsDB, Sequelize) {
  let model = FlexFundsDB.define('qb_account', {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    qb_account: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    fully_qualified_name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    classification: {
      type: Sequelize.STRING,
      allowNull: true
    },
    account_type: {
      type: Sequelize.STRING,
      allowNull: false
    },
    account_sub_type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    current_balance: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true
    },
    current_balance_with_sub_accounts: {
      type: Sequelize.DECIMAL(12, 2),
      allowNull: true
    },
    currency_code: {
      type: Sequelize.STRING(3),
      allowNull: true
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: false
    },
    dt_added: {
      type: Sequelize.DATE,
      defaultValue: new Date(),
      allowNull: false
    }
  }, {
    tableName: 'qb_account'
  });

  return model
};
