'use strict';

const  async = require('async')
const moment = require('moment')
const _ = require('lodash')
const QuickBooks = require('node-quickbooks')

module.exports = function(
  Configs,
  QBTransactionListModel,
  QBAccountListModel,
  QBItemModel,
  QBCustomerModel,
  QBClassModel
) {
  const that = this

  const mappings = {
    'qb_transaction_list': syncTransactionList,
    'qb_account_list': syncAccountList,
    'qb_class': syncClasses,
    'qb_item': syncItems,
    'qb_customer': syncCustomers,
    'qb_general_ledger': syncGeneralLedger
  }

  this.getQBO = (config) => {
    return new QuickBooks(
      config.consumerKey,
      config.consumerSecret,
      config.token,
      config.tokenSecret,
      config.realmId,
      config.useSandbox,
      config.debug
    )
  }

  this.findAndSync = (table, path, from) => {
    let to = new Date()
    return new Promise((resolve, reject) => {
      mappings[table](from, to).then(resolve)
    })
  }

  function syncTransactionList (from, to) {
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": Object.keys(QBTransactionListModel.attributes)
    }
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.reportTransactionList(opts, (err, report) => {
          if(err) {
            return cb()
          }
          let rows = that.transformReport(report)
          console.info(`loaded ${rows.length} reports @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert report name:${row.name}`)
            QBTransactionListModel.upsert(row).then(() => {
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncAccountList (from, to) {
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": Object.keys(QBTransactionListModel.attributes)
    }
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.reportAccountListDetail(opts, (err, report) => {
          if(err) {
            return cb()
          }
          let rows = that.transformReport(report)
          console.info(`loaded ${rows.length} reports @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert report name:${row.account_name}`)
            QBAccountListModel.upsert(row).then(() => {
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncGeneralLedger (from, to) {
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": [
        'account_name',
        'chk_print_state',
        'create_by',
        'create_date',
        'cust_name',
        'doc_num',
        'emp_name',
        'inv_date',
        'is_adj',
        'is_ap_paid',
        'is_ar_paid',
        'is_cleared',
        'item_name',
        'last_mod_by',
        'last_mod_date',
        'memo',
        'name',
        'quantity',
        'rate',
        'split_acc',
        'tx_date',
        'txn_type',
        'vend_name'
      ]
    }
    return new Promise((resolve, reject) => {
      const fs = require('fs')
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.reportGeneralLedgerDetail(opts, (err, report) => {
          fs.writeFile(config.account, JSON.stringify(report, undefined, 2), (err) => {
            cb()
          })
        })
      })
    })
  }

  function syncClasses (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findClasses((err, data) => {
          let classes = data.QueryResponse.Class
          if(err || !classes) {
            return cb()
          }
          let rows = classes.map((cls) => {
            return {
              id: cls.Id,
              qb_account: config.account,
              name: cls.Name,
              fully_qualified_name: cls.FullyQualifiedName,
              active: cls.Active
            }
          })
          console.info(`loaded ${rows.length} class @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert class name:${row.name}`)
            QBClassModel.upsert(row).then(() => {
              _cb()
            }).catch((err) => {
              console.error(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncItems (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findItems((err, data) => {
          let items = data.QueryResponse.Item
          if(err || !items) {
            return cb()
          }
          let rows = items.map((item) => {
            return {
              id: item.Id,
              qb_account: config.account,
              name: item.Name,
              description: item.Description,
              type: item.Type,
              parent_id: item.ParentRef? item.ParentRef.value : null,
              income_account_id: item.IncomeAccountRef? item.IncomeAccountRef.value : null,
              expense_account_id: item.ExpenseAccountRef? item.ExpenseAccountRef.value : null,
              active: item.Active
            }
          })
          console.info(`loaded ${rows.length} item @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert item name:${row.name}`)
            QBItemModel.upsert(row).then(() => {
              _cb()
            }).catch((err) => {
              console.error(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncCustomers (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findCustomers((err, data) => {
          let customers = data.QueryResponse.Customer
          if(err || !customers) {
            return cb()
          }
          let rows = customers.map((customer) => {
            return {
              id: customer.Id,
              qb_account: config.account,
              email: customer.PrimaryEmailAddr? customer.PrimaryEmailAddr.Address : null,
              given_name: customer.GivenName,
              middle_name: customer.MiddleName,
              family_name: customer.FamilyName,
              fully_qualified_name: customer.FullyQualifiedName,
              company_name: customer.CompanyName,
              display_name: customer.DisplayName,
              print_on_check_name: customer.PrintOnCheckName,
              bill_addr_line1: customer.BillAddr? customer.BillAddr.Line1: null,
              bill_addr_city: customer.BillAddr? customer.BillAddr.City: null,
              bill_addr_country_sub_division_code: customer.BillAddr? customer.BillAddr.CountrySubDivisionCode: null,
              PostalCode: customer.BillAddr? customer.BillAddr.bill_addr_postal_code: null,
              active: customer.Active
            }
          })
          console.info(`loaded ${rows.length} customer @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert customer name:${row.display_name}`)
            QBCustomerModel.upsert(row).then(() => {
              _cb()
            }).catch((err) => {
              console.error(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  this.transformReport = (data) => {
    let columns = data.Columns.Column.map((col) => {
      return col.MetaData[0].Value
    })
    if (!data.Rows.Row) {
      return []
    }
    let rows = data.Rows.Row.map((row) => {
      let transformedRow = {}
      for(let i = 0; i < row.ColData.length; i++){
        transformedRow[columns[i]] = row.ColData[i].value
      }
      return transformedRow
    })
    return rows
  }
  return this;
};
