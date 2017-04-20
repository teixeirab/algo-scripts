const moment = require('moment')

module.exports = function(FlexFundsDB, Sequelize) {
  let model = FlexFundsDB.define('qb_account_list', {
    "account_name": {
      type: Sequelize.STRING,
      allowNull: true
    },
    "account_type": {
      type: Sequelize.STRING,
      allowNull: true
    },
    "detail_acc_type": {
      type: Sequelize.STRING,
      allowNull: true
    },
    "create_date": {
      type: Sequelize.DATE,
      allowNull: true
    },
    "create_by": {
      type: Sequelize.STRING,
      allowNull: true
    },
    "last_mod_date": {
      type: Sequelize.DATE,
      allowNull: true
    },
    "last_mod_by": {
      type: Sequelize.STRING,
      allowNull: true
    },
    "account_desc": {
      type: Sequelize.STRING,
      allowNull: true
    },
    "account_bal": {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    dt_added: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'qb_account_list',
    hooks: {
      beforeValidate: (instance) => {
        Object.keys(instance.dataValues).forEach((col) => {
          if (model.attributes[col] && model.attributes[col].type instanceof Sequelize.DOUBLE) {
            let val = parseFloat(instance[col])
            instance[col] = val ? val : null
          }
          if (model.attributes[col] && model.attributes[col].type instanceof Sequelize.DATE) {
            if (!moment(new Date(instance[col])).isValid()) {
              instance[col] = null
            }
          }
        })
      }
    }
  });

  return model
};

// {
//   "ColTitle": "Account",
//   "ColType": "String",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "account_name"
//     }
//   ]
// },
// {
//   "ColTitle": "Type",
//   "ColType": "String",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "account_type"
//     }
//   ]
// },
// {
//   "ColTitle": "Detail type",
//   "ColType": "String",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "detail_acc_type"
//     }
//   ]
// },
// {
//   "ColTitle": "Create Date",
//   "ColType": "TimeStamp",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "create_date"
//     }
//   ]
// },
// {
//   "ColTitle": "Created By",
//   "ColType": "String",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "create_by"
//     }
//   ]
// },
// {
//   "ColTitle": "Last Modified",
//   "ColType": "TimeStamp",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "last_mod_date"
//     }
//   ]
// },
// {
//   "ColTitle": "Last Modified By",
//   "ColType": "String",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "last_mod_by"
//     }
//   ]
// },
// {
//   "ColTitle": "Description",
//   "ColType": "String",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "account_desc"
//     }
//   ]
// },
// {
//   "ColTitle": "Balance",
//   "ColType": "Money",
//   "MetaData": [
//     {
//       "Name": "ColKey",
//       "Value": "account_bal"
//     }
//   ]
// }
