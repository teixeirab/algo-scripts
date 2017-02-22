'use strict';

var  async = require('async');
var moment = require('moment');
var _ = require('lodash');
const Promise = require('bluebird')

module.exports = function(
  FileService,
  CommonService,
  PershingPositionsModel
) {

  var that = this;

  const modelMappings = {
    pershing_positions: PershingPositionsModel
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
          return data
        }
      },
      pershing_trades: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['MM-DD-YYYY'],
        pattern: 'Series_*_History_+(${date[0]}).xls',
        extractFn: this.extractTradesFileNameInfo
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
