'use strict';

const  async = require('async')
const moment = require('moment')
const _ = require('lodash')
const QuickBooks = require('node-quickbooks')

module.exports = function(Configs, QBTransactionListModel, Sequelize) {
  const that = this
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
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": QBTransactionListModel.qbFields
    }
    return new Promise((resolve, reject) => {
      qbo.reportTransactionList(opts, (err, report) => {
        if(err) {
          return reject(err)
        }
        let rows = that.transform(report)
        async.eachSeries(rows, (row, cb) => {
          QBTransactionListModel.upsert(row).then(() => {
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
