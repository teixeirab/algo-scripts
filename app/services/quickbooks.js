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

  const qbo = new QuickBooks(
    Configs.quickbooks.consumerKey,
    Configs.quickbooks.consumerSecret,
    Configs.quickbooks.token,
    Configs.quickbooks.tokenSecret,
    Configs.quickbooks.realmId,
    Configs.quickbooks.useSandbox,
    Configs.quickbooks.debug
  )

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
        let qbo = new QuickBooks(
          config.consumerKey,
          config.consumerSecret,
          config.token,
          config.tokenSecret,
          config.realmId,
          config.useSandbox,
          config.debug
        )
        qbo.reportTransactionList(opts, (err, report) => {
          if(err) {
            return cb()
          }
          let rows = that.transform(report)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
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
        let qbo = new QuickBooks(
          config.consumerKey,
          config.consumerSecret,
          config.token,
          config.tokenSecret,
          config.realmId,
          config.useSandbox,
          config.debug
        )
        qbo.reportAccountListDetail(opts, (err, report) => {
          if(err) {
            return cb()
          }
          let rows = that.transform(report)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
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
      qbo.reportGeneralLedgerDetail(opts, (err, report) => {
        if(err) {
          return reject(err)
        }
        let rows = that.transform(report)
        async.eachSeries(rows, (row, cb) => {
          QBAccountListModel.upsert(row).then(() => {
            cb()
          })
        }, () => {
          resolve()
        })
      })
    })
  }

  this.transform = (data) => {
    let columns = data.Columns.Column.map((col) => {
      return col.MetaData[0].Value
    })
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
