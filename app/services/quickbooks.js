'use strict';

const  async = require('async')
const moment = require('moment')
const _ = require('lodash')
const QuickBooks = require('node-quickbooks')

module.exports = function(Configs, QBTransactionListModel, QBAccountListModel, Sequelize) {
  const that = this

  const mappings = {
    'qb_transaction_list': syncTransactionList,
    'qb_account_list': syncAccountList,
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
          let rows = that.transform(report)
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
          let rows = that.transform(report)
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

  this.transform = (data) => {
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
