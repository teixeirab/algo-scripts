'use strict';

const  async = require('async');
const moment = require('moment');
const _ = require('lodash');
const numeral = require('numeral')
const Promise = require('bluebird')

module.exports = function(
  FileService,
  CommonService,
  PershingPositionsModel,
  PershingTradesModel
) {

  var that = this;

  const modelMappings = {
    pershing_positions: PershingPositionsModel,
    pershing_trades: PershingTradesModel,
  }

  this.nameInfoListExtractConfigs = function(path, fromDate) {
    return {
      pershing_positions: {
        path: path,
        startLine: 2,
        fromDate: fromDate,
        dateFormat: ['MM-DD-YYYY'],
        pattern: 'Series_*_Positions_+(${date[0]}).xls',
        extractFn: this.extractPositionsFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          data['change_price'] = numeral(data['change_price']).value()
          const priceDate = moment(data['price_as_of_date'], 'MM/DD/YYYY h:mm:ss a')
          data['price_as_of_date'] = priceDate.isValid() ? priceDate.toDate() : null
          return data
        }
      },
      pershing_trades: {
        path: path,
        startLine: 2,
        fromDate: fromDate,
        dateFormat: ['MM-DD-YYYY'],
        pattern: 'Series_*_History_+(${date[0]}).xls',
        extractFn: this.extractTradesFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          const tradeDate = moment(data['trade_date'], 'MM/DD/YYYY')
          const settlementDate = moment(data['settlement_date'], 'MM/DD/YYYY')
          data['trade_date'] = tradeDate.isValid() ?  tradeDate.toDate() : null
          data['settlement_date'] = settlementDate.isValid() ?  settlementDate.toDate() : null
          return data
        }
      }
    }
  }

  this.extractPositionsFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const seriesNumber = infos[1]
    const date = infos[3]
    return {
      path: path,
      seriesNumber: seriesNumber,
      sheet: 'Positions',
      date: moment(date, 'MM-DD-YYYY').toDate(),
      source: 'Pershing',
      table: 'pershing_positions'
    }
  }

  this.extractTradesFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const seriesNumber = infos[1]
    const date = infos[3]
    return {
      path: path,
      seriesNumber: seriesNumber,
      sheet: 'History',
      date: moment(date, 'MM-DD-YYYY').toDate(),
      source: 'Pershing',
      table: 'pershing_trades'
    }
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
      extractConfigs.assignDataFn
    )
  }

  this.update = function(nameInfoList) {
    return CommonService.syncToDatabase(nameInfoList, modelMappings)
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

  return this;
};
