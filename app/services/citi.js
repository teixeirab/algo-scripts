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
  CitiUnsettledTransactionsModel
) {

  var that = this;

  const modelMappings = {
    citi_all_transactions: CitiAllTransactionsModel,
    citi_unsettled_transactions: CitiUnsettledTransactionsModel
  }
  this.nameInfoListExtractConfigs = function(path, fromDate) {
    return {
      citi_all_transactions: {
        path: path,
        startLine: 1,
        pattern: 'all_transactions.CSV',
      },
      citi_unsettled_transactions: {
        path: path,
        startLine: 0,
        pattern: 'unsettled_transactions.CSV',
        extractFn: this.extractFileNameInfo,
        saveRowsFn: this.saveRows
      }
    }
  }

  this.extractFileNameInfo = function(path) {
    return {
      path: path,
      source: 'Citi Bank',
      table: 'citi_unsettled_transactions'
    }
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
      extractConfigs.saveRowsFn
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

  this.saveRows = function(model, rows, nameInfo) {
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
            utils.logError(err)
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
