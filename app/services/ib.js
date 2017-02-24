'use strict';

var  async = require('async');
var moment = require('moment');
var _ = require('lodash');
const Promise = require('bluebird')

module.exports = function(
  FileService,
  CommonService,
  InteractiveBrokerActivityModel,
  InteractiveBrokerNavModel,
  InteractiveBrokerPositionsModel,
  InteractiveBrokerCashReportModel
) {

  var that = this;

  const modelMappings = {
    ib_activity: InteractiveBrokerActivityModel,
    ib_cash_report: InteractiveBrokerCashReportModel,
    ib_positions: InteractiveBrokerPositionsModel,
    ib_nav: InteractiveBrokerNavModel
  }

  this.nameInfoListExtractConfigs = function(path, fromDate) {
    return {
      ib_activity: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYYMMDD'],
        pattern: '*_Activity_+(${date[0]}).csv',
        extractFn: this.extractActivityFileNameInfo
      },
      ib_cash_report: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYYMMDD'],
        pattern: '*_CashReport_+(${date[0]}).csv',
        extractFn: this.extractCashReportFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          return data
        }
      },
      ib_nav: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYYMMDD'],
        pattern: '*_NAV_+(${date[0]}).csv',
        extractFn: this.extractNavFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          return data
        }
      },
      ib_positions: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYYMMDD'],
        pattern: '*_Position_+(${date[0]}).csv',
        extractFn: this.extractPositionFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['report_date'] = moment(data['report_date'], 'YYYYMMDD').toDate()
          return data
        }
      }
    }
  }

  this.extractActivityFileNameInfo = function(path) {
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
      table: 'ib_activity'
    }
  }

  this.extractCashReportFileNameInfo = function(path) {
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

  this.extractNavFileNameInfo = function(path) {
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
      table: 'ib_nav'
    }
  }

  this.extractPositionFileNameInfo = function(path) {
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
      table: 'ib_positions'
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
