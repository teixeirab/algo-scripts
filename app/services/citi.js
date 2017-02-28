'use strict';

var  async = require('async');
var moment = require('moment');
var _ = require('lodash');
const Promise = require('bluebird')

module.exports = function(
  utils,
  FileService,
  CommonService,
  CitiAllTransactionsModel,
  CitiAvailablePositionModel,
  CitiFixedIncomePositionTransactionsModel,
  CitiUnsettledTransactionsModel
) {

  var that = this;

  const modelMappings = {
    citi_all_transactions: CitiAllTransactionsModel,
    citi_unsettled_transactions: CitiUnsettledTransactionsModel,
    citi_fixed_income_settled_position: CitiFixedIncomePositionTransactionsModel,
    citi_available_position: CitiAvailablePositionModel
  }
  this.nameInfoListExtractConfigs = function(path, fromDate) {
    return {
      citi_all_transactions: {
        path: path,
        startLine: 0,
        fromDate: fromDate,
        dateFormat: ['YYYY-MM-DD'],
        pattern: 'all_transactions_+(${date[0]}).CSV',
        filterNameInfoListFn: this.useLatest,
        extractFn: this.extractAllTransactionsFileNameInfo,
        saveRowsFn: this.upsertRows,
        csvPostProcessFn: this.allTransactionsCsvPostProcessFn
      },
      citi_unsettled_transactions: {
        path: path,
        startLine: 0,
        fromDate: fromDate,
        dateFormat: ['YYYY-MM-DD'],
        pattern: 'unsettled_transactions_+(${date[0]}).CSV',
        filterNameInfoListFn: this.useLatest,
        extractFn: this.extractUnsettledFileNameInfo,
        saveRowsFn: this.saveUnsettledTxRows,
        csvPostProcessFn: this.unsettledCsvPostProcessFn
      },
      citi_fixed_income_settled_position: {
        path: path,
        startLine: 0,
        fromDate: fromDate,
        dateFormat: ['YYYY-MM-DD'],
        pattern: 'fixed_income_settled_position_+(${date[0]}).CSV',
        filterNameInfoListFn: this.useLatest,
        extractFn: this.extractFixedIncomeSettledPositionFileNameInfo,
        saveRowsFn: this.upsertRows,
        csvPostProcessFn: this.fixedIncomeCsvPostProcessFn
      },
      citi_available_position: {
        path: path,
        startLine: 0,
        fromDate: fromDate,
        dateFormat: ['YYYY-MM-DD'],
        pattern: 'available_positions_+(${date[0]}).CSV',
        filterNameInfoListFn: this.useLatest,
        assignDataFn: this.assignAvailablePositionDataFn,
        extractFn: this.extractAvailablePositionFileNameInfo,
        saveRowsFn: this.upsertRows,
        csvPostProcessFn: this.availableCsvPostProcessFn
      }
    }
  }

  this.useLatest = function(nameInfoList) {
    const limit = 1
    nameInfoList.sort((a, b) => {
      return b.date - a.date
    })
    nameInfoList.splice(limit, nameInfoList.length)
    return nameInfoList
  }

  this.assignAvailablePositionDataFn = function(data, nameInfo) {
    data['period'] = nameInfo.date
    return data
  }

  this.extractUnsettledFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = moment(infos[2], 'YYYY-MM-DD').toDate()
    return {
      path: path,
      date: date,
      source: 'Citi Bank',
      table: 'citi_unsettled_transactions'
    }
  }

  this.extractFixedIncomeSettledPositionFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = moment(infos[4], 'YYYY-MM-DD').toDate()
    return {
      path: path,
      source: 'Citi Bank',
      table: 'citi_fixed_income_settled_position'
    }
  }

  this.extractAvailablePositionFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = moment(infos[2], 'YYYY-MM-DD').toDate()
    return {
      path: path,
      date: date,
      source: 'Citi Bank',
      table: 'citi_available_position'
    }
  }

  this.extractAllTransactionsFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = moment(infos[2], 'YYYY-MM-DD').toDate()
    return {
      path: path,
      date: date,
      source: 'Citi Bank',
      table: 'citi_all_transactions'
    }
  }

  const copyFromPrev = function(csvObject, fields) {
    let prevRow
    csvObject.forEach((row) => {
      let empty = true
      fields.forEach((field) => {
        if (row[field] && row[field] !== '') {
          empty = false
        }
        return;
      })
      if (empty) {
        fields.forEach((field) => {
          row[field] = prevRow[field]
        })
      }
      prevRow = row
    })
    return csvObject
  }

  this.fixedIncomeCsvPostProcessFn = function(csvObject) {
    const fieldsToCheck = [
      'ISO Country Name',
      'Branch Name',
      'Account ID',
      'Account Name'
    ]
    return copyFromPrev(csvObject, fieldsToCheck)
  }

  this.availableCsvPostProcessFn = function(csvObject) {
    const fieldsToCheck = [
      'Actual Branch Name',
      'Account ID',
      'Account Name'
    ]
    return copyFromPrev(csvObject, fieldsToCheck)
  }

  this.unsettledCsvPostProcessFn = function(csvObject) {
    const fieldsToCheck = [
      'Actual Branch Name',
      'Account ID',
      'Account Name'
    ]
    return copyFromPrev(csvObject, fieldsToCheck)
  }

  this.allTransactionsCsvPostProcessFn = function(csvObject) {
    const fieldsToCheck = [
      'Actual Branch Name',
      'Account ID',
      'Account Name'
    ]
    return copyFromPrev(csvObject, fieldsToCheck)
  }

  this.update = function(nameInfoList) {
    return CommonService.syncToDatabase(nameInfoList, modelMappings)
  }

  this.getFileNameInfoList = function(table, path, fromDate) {
    const extractConfigs = this.nameInfoListExtractConfigs(path, fromDate)[table]
    return CommonService.getFileNameInfoList(
      extractConfigs.path,
      extractConfigs.startLine,
      extractConfigs.fromDate,
      extractConfigs.dateFormat,
      extractConfigs.pattern,
      extractConfigs.extractFn,
      extractConfigs.assignDataFn,
      extractConfigs.saveRowsFn,
      extractConfigs.csvPostProcessFn,
      extractConfigs.filterNameInfoListFn
    )
  }

  this.findAndSync = function(table, path, fromDate, limit) {
    return this
      .getFileNameInfoList(table, path, fromDate)
      .then((nameInfoList) => {
        if(limit) {
          nameInfoList.splice(limit, nameInfoList.length)
        }
        return this.update(nameInfoList)
      })
  }

  this.upsertRows = function(model, rows, nameInfo) {
    const deferred = Promise.pending()
    async.eachSeries(rows, (row, _cb) => {
      if (nameInfo.assignDataFn) {
        row = nameInfo.assignDataFn(row, nameInfo)
      }
      model.upsert(row, {defaults: row}).then(() => {
        _cb()
      }).catch((err) => {
        utils.logError(err, nameInfo)
        _cb()
      })
    }, () => {
      deferred.resolve()
    })
    return deferred.promise
  }

  this.saveUnsettledTxRows = function(model, rows, nameInfo) {
    const deferred = Promise.pending()
    async.waterfall([
      (cb) => {
        model.findAll().then((unsettledTXs) => {
          _.remove(unsettledTXs, (tx) => {
            return _.find(rows, (row) => {
              return row.client_reference === tx.client_reference
            })
          })
          cb(undefined, unsettledTXs)
        })
      },
      (toDelete, cb) => {
        async.eachSeries(toDelete, (unsettledTx, _cb) => {
          CitiAllTransactionsModel.update({
            counterparty_id: unsettledTx.counterparty_id,
            legal_confirm: unsettledTx.legal_confirm
          }, {
            where: {
              client_reference: unsettledTx.client_reference
            },
            fields: ['counterparty_id', 'legal_confirm']
          }).then(() => {
            unsettledTx.destroy().then(() => {
              _cb()
            })
          })
        }, cb)
      },
      (cb) => {
        async.eachSeries(rows, (row, _cb) => {
          model.upsert(row, {defaults: row}).then(() => {
            _cb()
          }).catch((err) => {
            utils.logError(err, nameInfo)
            _cb()
          })
        }, cb)
      }
    ], () => {
      deferred.resolve()
    })
    return deferred.promise
  }

  return this;
};
