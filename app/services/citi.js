'use strict';

var  async = require('async');
var moment = require('moment');
var _ = require('lodash');
const Promise = require('bluebird')

module.exports = function(
  FileService,
  CommonService,
  CitiAllTransactionsModel
) {

  var that = this;

  const modelMappings = {
    citi_all_transactions: CitiAllTransactionsModel
  }
  this.nameInfoListExtractConfigs = function(path, fromDate) {
    return {
      theorem_balance_sheet: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: 'YYYYMMDD',
        pattern: '*_Activity_+(${dateStr}).csv',
        // extractFn: this.extractActivityFileNameInfo
      },
      theorem_income_statement: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: 'YYYYMMDD',
        pattern: '*_CashReport_+(${dateStr}).csv',
        // extractFn: this.extractCashReportFileNameInfo,
        // assignDataFn: (data, nameInfo) => {
        //   data['period'] = nameInfo.date
        //   return data
        // }
      }
    }
  }

  this.extractWeeklyFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const accountId = infos[0]
    const type = infos[1]
    const date = infos[2]
    return {
      path: path,
      accountId: accountId,
      type: type,
      date: moment(date, 'YYYYMMDD').toDate(),
      source: 'Interactive Brokers',
      table: 'ib_cash_report'
    }
  }

  this.csvPostProcess = function(csvObject) {
    let prevRow
    const columns = [
      'Actual Branch Name',
      'Account ID',
      'Account Name'
    ]
    csvObject.forEach((row) => {
      columns.forEach((col) => {
        if((_.isEmpty(row[col])) && !_.isEmpty(prevRow[col])) {
          row[col] = prevRow[col]
        }
      })
      prevRow = row
    })
    return csvObject
  }

  this.update = function(nameInfoList) {
    return CommonService.syncToDatabase(nameInfoList, modelMappings)
  }

  return this;
};
