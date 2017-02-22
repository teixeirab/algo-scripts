'use strict';

var  async = require('async');
var moment = require('moment');
var _ = require('lodash');
const Promise = require('bluebird')

module.exports = function(
  FileService,
  CommonService,
  TheoremIncomeStatementModel,
  TheoremBalanceSheetModel
) {

  var that = this;

  const modelMappings = {
    theorem_income_statement: TheoremIncomeStatementModel,
    theorem_balance_sheet: TheoremBalanceSheetModel
  }
  this.nameInfoListExtractConfigs = function(path, fromDate) {
    return {
      theorem_balance_sheet_weekly: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYY_MM_DD', 'YYYYMMDD'],
        pattern: 'weekly_reports/+(${date[0]})/+(${date[1]})_Series_*_Financials.xlsx',
        extractFn: this.extractBSWeeklyFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          data['series_number'] = nameInfo.seriesNumber
          data['type'] = nameInfo.type
          return data
        }
      },
      theorem_income_statement_weekly: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYY_MM_DD', 'YYYYMMDD'],
        pattern: 'weekly_reports/+(${date[0]})/+(${date[1]})_Series_*_Financials.xlsx',
        extractFn: this.extractISWeeklyFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          data['series_number'] = nameInfo.seriesNumber
          data['type'] = nameInfo.type
          return data
        }
      },
      theorem_balance_sheet_monthly: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYY_MM', 'YYYYMM'],
        pattern: 'monthly_reports/+(${date[0]})/+(${date[1]})_Series_*_Financials.xlsx',
        extractFn: this.extractBSMonthlyFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          data['series_number'] = nameInfo.seriesNumber
          data['type'] = nameInfo.type
          return data
        }
      },
      theorem_income_statement_monthly: {
        path: path,
        startLine: 1,
        fromDate: fromDate,
        dateFormat: ['YYYY_MM', 'YYYYMM'],
        pattern: 'monthly_reports/+(${date[0]})/+(${date[1]})_Series_*_Financials.xlsx',
        extractFn: this.extractISMonthlyFileNameInfo,
        assignDataFn: (data, nameInfo) => {
          data['period'] = nameInfo.date
          data['series_number'] = nameInfo.seriesNumber
          data['type'] = nameInfo.type
          return data
        }
      }
    }
  }

  this.extractBSWeeklyFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = infos[0]
    const seriesNumber = infos[2]
    return {
      path: path,
      date: moment(date, 'YYYYMMDD').toDate(),
      seriesNumber: seriesNumber,
      source: 'Theorem',
      type: 'Weekly',
      sheet: 'Balance Sheet',
      transpose: true,
      row: 2,
      table: 'theorem_balance_sheet'
    }
  }

  this.extractISWeeklyFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = infos[0]
    const seriesNumber = infos[2]
    return {
      path: path,
      date: moment(date, 'YYYYMMDD').toDate(),
      seriesNumber: seriesNumber,
      source: 'Theorem',
      type: 'Weekly',
      sheet: 'Income Statement',
      transpose: true,
      row: 1,
      table: 'theorem_income_statement'
    }
  }

  this.extractBSMonthlyFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = infos[0]
    const seriesNumber = infos[2]
    return {
      path: path,
      date: moment(date, 'YYYYMMDD').toDate(),
      seriesNumber: seriesNumber,
      source: 'Theorem',
      type: 'Monthly',
      sheet: 'Balance Sheet',
      transpose: true,
      row: 2,
      table: 'theorem_balance_sheet'
    }
  }

  this.extractISMonthlyFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const date = infos[0]
    const seriesNumber = infos[2]
    return {
      path: path,
      date: moment(date, 'YYYYMMDD').toDate(),
      seriesNumber: seriesNumber,
      source: 'Theorem',
      type: 'Monthly',
      sheet: 'Income Statement',
      transpose: true,
      row: 1,
      table: 'theorem_income_statement'
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
