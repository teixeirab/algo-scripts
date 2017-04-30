module.exports = function(FlexFundsDB, Sequelize) {
  let model = FlexFundsDB.define('qb_invoice', {
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
    doc_num: {
      type: Sequelize.STRING,
      allowNull: false
    },
    total_amount: {
      type: Sequelize.DOUBLE,
      allowNull: false
    },
    due_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    txn_date: {
      type: Sequelize.DATE,
      allowNull: false
    },
    email_status: {
      type: Sequelize.STRING,
      allowNull: false
    },
    active: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    dt_added: {
      type: Sequelize.DATE,
      allowNull: false
    }
  }, {
    tableName: 'qb_invoice'
  });
  return model
};
