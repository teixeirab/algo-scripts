'use strict'

var async = require('async');
var assert = require('assert');
var helper = require('../helper');
var moment = require('moment');
var _ = require('lodash');

describe('service tests', function() {
  let fileService,
      interactiveBrokerService,
      interactiveBrokerActivityModel,
      interactiveBrokerCashReportModel,
      interactiveBrokerNavModel,
      db;
  beforeEach(function(done) {
    app.summon.resolve(function(
      FlexFundsDB,
      FileService,
      InteractiveBrokerService,
      InteractiveBrokerActivityModel,
      InteractiveBrokerNavModel,
      InteractiveBrokerCashReportModel) {

        fileService = FileService
        interactiveBrokerService = InteractiveBrokerService
        interactiveBrokerActivityModel = InteractiveBrokerActivityModel
        interactiveBrokerCashReportModel = InteractiveBrokerCashReportModel
        interactiveBrokerNavModel = InteractiveBrokerNavModel
        db = FlexFundsDB
        done()
    });
  });
  describe('read data source files', function () {
    it('read csv', function (done) {
      const filePath = './tests/data/ib/U1161356_Activity_20170130.csv';
      const startLine = 1;
      fileService.readFile({path: filePath, startLine}).then((data) => {
        assert(data[0].Type, 'D')
        assert(data[0].AccountID, 'U1161356')
        assert(data[0].TradeDate, '20170130')
        done()
      });
    });
    xit('read xlsx', function (done) {
      const filePath = './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_16_Financials.xlsx';
      fileService.readFile({path: filePath}).then((workbook) => {
        const sheetNames = Object.keys(workbook.Sheets)
        assert.equal(sheetNames[0], 'Balance Sheet')
        assert.equal(sheetNames[1], 'Income Statement')
        assert(workbook.Sheets[sheetNames[0]])
        assert(workbook.Sheets[sheetNames[1]])
        done()
      });
    });
    xit('read xls', function (done) {
      const filePath = './tests/data/Pershing/Series_XX_History_02-09-2017.xls';
      fileService.readFile({path: filePath}).then((workbook) => {
        const sheetNames = Object.keys(workbook.Sheets)
        assert.equal(sheetNames[0], 'History')
        assert(workbook.Sheets[sheetNames[0]])
        done()
      })
    });
    it('convert xls/xlsx sheet to csv, set start line, and then to json', function (done) {
      const filePath = './tests/data/Pershing/Series_XX_History_02-09-2017.xls';
      const startLine = 2
      fileService.readFile({path: filePath, sheet: 'History', startLine}).then((csvObject) => {
        assert.equal(Object.keys(csvObject[0]).length, 15)
        assert.equal(csvObject.length, 481)
        done()
      })
    });
  });
  describe('read and save to database based on mappings', function () {
    beforeEach(function (done) {
      db.sync({
        // logging: console.log,
        force: true
      }).then(function() {
        done();
      });
    });
    describe('interactive broker', function () {
      it('look for data files with a period later or equal than specified', function (done) {
        //extract the info from the file names
        //account_id / report type / period
        fileService
          .findFiles('*_Activity_+(20170215|20170216).csv', './tests/data/ib/')
          .then((files) => {
            const nameInfoList = fileService.extractFileListNameInfo(files, interactiveBrokerService.extractActivityFileNameInfo)
            assert.equal(nameInfoList.length, 27)
            assert.equal(nameInfoList[0].path, './tests/data/ib/U1161356_Activity_20170215.csv')
            assert.equal(nameInfoList[0].accountId, 'U1161356')
            assert.equal(nameInfoList[0].type, 'Activity')
            assert.equal(nameInfoList[0].date.toISOString(), '2017-02-14T16:00:00.000Z')
            done();
          })
      });
      describe('activity', function () {
        it('look for data files with a period later or equal than specified', function (done) {
          const path = './tests/data/ib/'
          interactiveBrokerService
            .getFileNameInfoList('ib_activity', path, '2017-02-15')
            .then((nameInfoList) => {
              assert.equal(nameInfoList.length, 27)
              assert.equal(nameInfoList[0].path, './tests/data/ib/U1161356_Activity_20170215.csv')
              assert.equal(nameInfoList[0].accountId, 'U1161356')
              assert.equal(nameInfoList[0].type, 'Activity')
              assert.equal(nameInfoList[0].date.toISOString(), '2017-02-14T16:00:00.000Z')
              assert.equal(nameInfoList[0].source, 'Interactive Brokers')
              assert.equal(nameInfoList[0].table, 'ib_activity')
              done();
            })
        });
        describe('find and save to database', function () {
          it('#update', function (done) {
            const nameInfoList = [
              {
                path: './tests/data/ib/U1891163_Activity_20170216.csv',
                accountId: 'U1891163',
                type: 'Activity',
                date: moment('2017-02-16').toDate(),
                startLine: 1,
                source: 'Interactive Brokers',
                table: 'ib_activity'
              }
            ]
            interactiveBrokerService.update(nameInfoList).then(() => {
              interactiveBrokerActivityModel.findAll().then((models) => {
                assert.equal(models[0].trade_date.toISOString(), '2017-02-15T16:00:00.000Z')
                assert.equal(models[0].settle_date.toISOString(), '2017-02-16T16:00:00.000Z')
                assert.equal(models.length, 11)
                done();
              })
            })
          });
          it('#findAndSync', function (done) {
            interactiveBrokerService
              .findAndSync('ib_activity', './tests/data/ib/', '2017-02-16', 10)
              .then(() => {
                interactiveBrokerActivityModel.findAll().then((models) => {
                  assert.equal(models.length, 3)
                  assert.equal(models[0].trade_date.toISOString(), '2017-02-15T16:00:00.000Z')
                  assert.equal(models[0].settle_date.toISOString(), '2017-02-21T16:00:00.000Z')
                  assert.equal(models.length, 3)
                  done();
                })
              })
          });
        });
      });
      describe('cash report', function (done) {
        it('look for data files with a period later or equal than specified', function (done) {
          const path = './tests/data/ib/'
          interactiveBrokerService
            .getFileNameInfoList('ib_cash_report', path, '2017-02-15')
            .then((nameInfoList) => {
              assert.equal(nameInfoList.length, 30)
              assert.equal(nameInfoList[0].path, './tests/data/ib/U1161356_CashReport_20170215.csv')
              assert.equal(nameInfoList[0].accountId, 'U1161356')
              assert.equal(nameInfoList[0].type, 'CashReport')
              assert.equal(nameInfoList[0].date.toISOString(), '2017-02-14T16:00:00.000Z')
              assert.equal(nameInfoList[0].source, 'Interactive Brokers')
              assert.equal(nameInfoList[0].table, 'ib_cash_report')
              assert(nameInfoList[0].assignDataFn)
              done();
            })
        });
        describe('find and save to database', function (done) {
          it('#update', function (done) {
            const nameInfoList = [
              {
                path: './tests/data/ib/U1161356_CashReport_20170215.csv',
                accountId: 'U1161356',
                type: 'CashReport',
                date: moment('2017-02-15').toDate(),
                startLine: 1,
                source: 'Interactive Brokers',
                table: 'ib_cash_report',
                assignDataFn: function(data, nameInfo) {
                  data['period'] = nameInfo.date
                  return data
                }
              }
            ]
            interactiveBrokerService.update(nameInfoList).then(() => {
              interactiveBrokerCashReportModel.findAll().then((models) => {
                assert.equal(models.length, 15)
                assert.equal(models[0].period.toISOString(), '2017-02-14T16:00:00.000Z')
                assert.equal(models[0].account_id, 'U1161356')
                done();
              })
            })
          });
          it('#findAndSync', function (done) {
            interactiveBrokerService.findAndSync('ib_cash_report', './tests/data/ib/', '2017-02-15', 1).then(() => {
              interactiveBrokerCashReportModel.findAll().then((models) => {
                assert.equal(models.length, 15)
                assert.equal(models[0].period.toISOString(), '2017-02-14T16:00:00.000Z')
                assert.equal(models[0].account_id, 'U1161356')
                done();
              })
            })
          });
        });
      });
      describe('nav', function (done) {
        describe('find and save to db', function () {
          it('#findAndSync', function (done) {
            interactiveBrokerService.findAndSync('ib_nav', './tests/data/ib/', '2017-02-15', 1).then(() => {
              interactiveBrokerNavModel.findAll().then((models) => {
                assert.equal(models.length, 2)
                assert.equal(models[0].period.toISOString(), '2017-02-14T16:00:00.000Z')
                assert.equal(models[0].account_id, 'U1161356')
                done();
              })
            })
          });
        });
      });
      it('position', function (done) {

        done();
      });
    });
    xdescribe('theorem', function () {
      describe('weekly', function () {
        it('sync row based sheet', function (done) {
          const nameInfoList = [
            {
              path: './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_95_Financials.xlsx',
              seriesNumber: '95',
              type: 'Weekly',
              date: moment('2017-02-10').toDate(),
              startLine: 0,
              source: 'Theorem',
              table: 'theorem_balance_sheet',
              sheet: 'Balance Sheet'
            },
            {
              path: './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_95_Financials.xlsx',
              seriesNumber: '95',
              type: 'Weekly',
              date: moment('2017-02-10').toDate(),
              startLine: 0,
              source: 'Theorem',
              table: 'theorem_income_statement',
              sheet: 'Income Statement'
            }
          ]
          interactiveBrokerService.update(nameInfoList).then(() => {
            interactiveBrokerActivityModel.findAll().then((models) => {
              assert.equal(models[0].trade_date.toISOString(), '2017-02-15T16:00:00.000Z')
              assert.equal(models[0].settle_date.toISOString(), '2017-02-16T16:00:00.000Z')
              assert.equal(models.length, 11)
              done();
            })
          })
        });
      });
    });
  });
});
