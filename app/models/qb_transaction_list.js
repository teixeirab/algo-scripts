/* jshint indent: 2 */
const moment = require('moment')
module.exports = function(FlexFundsDB, Sequelize) {
  let model = FlexFundsDB.define('qb_transaction_list', {
    tx_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    txn_type: {
      type: Sequelize.STRING,
      allowNull: true
    },
    doc_num: {
      type: Sequelize.STRING,
      allowNull: true
    },
    is_no_post: {
      type: Sequelize.BOOLEAN,
      allowNull: true
    },
    create_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    create_by: {
      type: Sequelize.STRING,
      allowNull: true
    },
    last_mod_by: {
      type: Sequelize.STRING,
      allowNull: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    memo: {
      type: Sequelize.STRING,
      allowNull: true
    },
    account_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    other_account: {
      type: Sequelize.STRING,
      allowNull: true
    },
    sales_cust1: {
      type: Sequelize.STRING,
      allowNull: true
    },
    pmt_mthd: {
      type: Sequelize.STRING,
      allowNull: true
    },
    term_name: {
      type: Sequelize.STRING,
      allowNull: true
    },
    due_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    cust_msg: {
      type: Sequelize.STRING,
      allowNull: true
    },
    inv_date: {
      type: Sequelize.DATE,
      allowNull: true
    },
    is_ap_paid: {
      type: Sequelize.STRING,
      allowNull: true
    },
    is_cleared: {
      type: Sequelize.STRING,
      allowNull: true
    },
    printed: {
      type: Sequelize.STRING,
      allowNull: true
    },
    subt_nat_home_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    nat_home_open_bal: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    exch_rate: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    subt_nat_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    currency: {
      type: Sequelize.STRING,
      allowNull: true
    },
    home_tax_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    home_net_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    foreign_tax_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    foreign_net_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    nat_foreign_open_bal: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    nat_foreign_amount: {
      type: Sequelize.DOUBLE,
      allowNull: true
    },
    dt_added: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: new Date()
    }
  }, {
    tableName: 'qb_transaction_list',
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
  // EXAMPLE DATA
  //================================Column Headers=====================================
  // [
  //   {
  //     "ColTitle": "Date",
  //     "ColType": "Date",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "tx_date"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Transaction Type",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "txn_type"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Num",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "doc_num"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Posting",
  //     "ColType": "Boolean",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "is_no_post"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Create Date",
  //     "ColType": "TimeStamp",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "create_date"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Created By",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "create_by"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Last Modified By",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "last_mod_by"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Name",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "name"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Memo/Description",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "memo"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Account",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "account_name"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Split",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "other_account"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Crew #",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "sales_cust1"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Payment Method",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "pmt_mthd"
  //       }
  //     ]
  //   },
    //  {
    //    "ColTitle": "Terms",
    //    "ColType": "String",
    //    "MetaData": [
    //      {
    //        "Name": "ColKey",
    //        "Value": "term_name"
    //      }
    //    ]
    //  },
  //   {
  //     "ColTitle": "Due Date",
  //     "ColType": "Date",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "due_date"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Customer/Vendor Message",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "cust_msg"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Invoice Date",
  //     "ColType": "Date",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "inv_date"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "A/P Paid",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "is_ap_paid"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Clr",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "is_cleared"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Check Printed",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "printed"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Amount",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "subt_nat_home_amount"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Open Balance",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "nat_home_open_bal"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Exchange Rate",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "exch_rate"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Debit",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "term_name"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Credit",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "subt_nat_amount"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Currency",
  //     "ColType": "String",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "currency"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Tax Amount",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "home_tax_amount"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Taxable Amount",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "home_net_amount"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Foreign Tax Amount ",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "foreign_tax_amount"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Foreign Net Amount",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "foreign_net_amount"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Foreign Open Balance",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "nat_foreign_open_bal"
  //       }
  //     ]
  //   },
  //   {
  //     "ColTitle": "Foreign Amount",
  //     "ColType": "Money",
  //     "MetaData": [
  //       {
  //         "Name": "ColKey",
  //         "Value": "nat_foreign_amount"
  //       }
  //     ]
  //   }
  // ]
  //============================ROW============================================
  // [
  //   {
  //     "value": "2017-04-16"
  //   },
  //   {
  //     "value": "Credit Card Expense",
  //     "id": "144"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "Yes"
  //   },
  //   {
  //     "value": "2017-04-16T14:04:25-0700"
  //   },
  //   {
  //     "value": "kata choii"
  //   },
  //   {
  //     "value": "kata choii"
  //   },
  //   {
  //     "value": "",
  //     "id": ""
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "Mastercard",
  //     "id": "41"
  //   },
  //   {
  //     "value": "Automobile",
  //     "id": "55"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "",
  //     "id": ""
  //   },
  //   {
  //     "value": "",
  //     "id": ""
  //   },
  //   {
  //     "value": "0-00-00"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "0-00-00"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "34.00"
  //   },
  //   {
  //     "value": ".00"
  //   },
  //   {
  //     "value": "1.00"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "34.00"
  //   },
  //   {
  //     "value": "USD"
  //   },
  //   {
  //     "value": ".00"
  //   },
  //   {
  //     "value": ".00"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": ".00"
  //   },
  //   {
  //     "value": ""
  //   },
  //   {
  //     "value": "34.00"
  //   }
  // ]
};
