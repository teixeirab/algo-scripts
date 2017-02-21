'use strict'

var async = require('async');
var assert = require('assert');
var helper = require('../helper');
var moment = require('moment');
var _ = require('lodash');

describe('service tests', function() {
  let vars = [
    'FileService',
    'InteractiveBrokerService',
    'TheoremService',
    'CitiService',
    'InteractiveBrokerActivityModel',
    'InteractiveBrokerCashReportModel',
    'InteractiveBrokerNavModel',
    'CitiAllTransactionsModel',
    'TheoremIncomeStatementModel',
    'TheoremBalanceSheetModel',
    'FlexFundsDB'
  ]
  beforeEach(function(done) {
    vars.forEach((dep) => {
      vars[dep] = app.summon.get(dep)
    })
    done()
  });
  describe('read data source files', function () {
    it('read csv', function (done) {
      const filePath = './tests/data/ib/U1161356_Activity_20170130.csv';
      const startLine = 1;
      vars['FileService'].readFile({path: filePath, startLine}).then((data) => {
        assert(data[0].Type, 'D')
        assert(data[0].AccountID, 'U1161356')
        assert(data[0].TradeDate, '20170130')
        done()
      });
    });
    xit('read xlsx', function (done) {
      const filePath = './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_16_Financials.xlsx';
      vars['FileService'].readFile({path: filePath}).then((workbook) => {
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
      vars['FileService'].readFile({path: filePath}).then((workbook) => {
        const sheetNames = Object.keys(workbook.Sheets)
        assert.equal(sheetNames[0], 'History')
        assert(workbook.Sheets[sheetNames[0]])
        done()
      })
    });
    it('convert xls/xlsx sheet to csv, set start line, and then to json', function (done) {
      const filePath = './tests/data/Pershing/Series_XX_History_02-09-2017.xls';
      const startLine = 2
      vars['FileService'].readFile({path: filePath, sheet: 'History', startLine}).then((csvObject) => {
        assert.equal(Object.keys(csvObject[0]).length, 15)
        assert.equal(csvObject.length, 481)
        done()
      })
    });
  });
  describe('read and save to database based on mappings', function () {
    beforeEach(function (done) {
      vars['FlexFundsDB'].sync({
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
        vars['FileService']
          .findFiles('*_Activity_+(20170215|20170216).csv', './tests/data/ib/')
          .then((files) => {
            const nameInfoList = vars['FileService'].extractFileListNameInfo(files, vars['InteractiveBrokerService'].extractActivityFileNameInfo)
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
          vars['InteractiveBrokerService']
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
            vars['InteractiveBrokerService'].update(nameInfoList).then(() => {
              vars['InteractiveBrokerActivityModel'].findAll().then((models) => {
                assert.equal(models[0].trade_date.toISOString(), '2017-02-15T16:00:00.000Z')
                assert.equal(models[0].settle_date.toISOString(), '2017-02-16T16:00:00.000Z')
                assert.equal(models.length, 11)
                done();
              })
            })
          });
          it('#findAndSync', function (done) {
            vars['InteractiveBrokerService']
              .findAndSync('ib_activity', './tests/data/ib/', '2017-02-16', 10)
              .then(() => {
                vars['InteractiveBrokerActivityModel'].findAll().then((models) => {
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
          vars['InteractiveBrokerService']
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
            vars['InteractiveBrokerService'].update(nameInfoList).then(() => {
              vars['InteractiveBrokerCashReportModel'].findAll().then((models) => {
                assert.equal(models.length, 15)
                assert.equal(models[0].period.toISOString(), '2017-02-14T16:00:00.000Z')
                assert.equal(models[0].account_id, 'U1161356')
                done();
              })
            })
          });
          it('#findAndSync', function (done) {
            vars['InteractiveBrokerService'].findAndSync('ib_cash_report', './tests/data/ib/', '2017-02-15', 1).then(() => {
              vars['InteractiveBrokerCashReportModel'].findAll().then((models) => {
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
            vars['InteractiveBrokerService'].findAndSync('ib_nav', './tests/data/ib/', '2017-02-15', 1).then(() => {
              vars['InteractiveBrokerNavModel'].findAll().then((models) => {
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
    describe('theorem', function () {
      describe('weekly', function () {
        it('income statement', function (done) {
          const nameInfoList = [
            {
              path: './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_95_Financials.xlsx',
              seriesNumber: '95',
              type: 'Weekly',
              date: moment('2017-02-10').toDate(),
              startLine: 0,
              source: 'Theorem',
              table: 'theorem_income_statement',
              sheet: 'Income Statement',
              transpose: true,
              row: 1,
              assignDataFn: (data, nameInfo) => {
                data['period'] = nameInfo.date
                data['series_number'] = nameInfo.seriesNumber
                data['type'] = nameInfo.type
                return data
              }
            }
          ]
          vars['TheoremService'].update(nameInfoList).then(() => {
            vars['TheoremIncomeStatementModel'].findAll().then((models) => {
              assert.equal(models[0].period.toISOString(), '2017-02-09T16:00:00.000Z')
              assert.equal(models[0].series_number, 95)
              assert.equal(models[0].audit_fees, -40.81)
              assert.equal(models[0].price_dissemination_fees, -23.01)
              assert.equal(models[0].trustee_corporate_fees, -63.26)
              assert.equal(models[0].transfer_agent_fees, -40.81)
              assert.equal(models[0].external_expense_offset, 167.91)
              assert.equal(models[0].type, 'Weekly')
              done();
            })
          })
        });
        it('balance sheet', function (done) {
          const nameInfoList = [
            {
              path: './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_95_Financials.xlsx',
              seriesNumber: '95',
              type: 'Weekly',
              date: moment('2017-02-10').toDate(),
              startLine: 0,
              source: 'Theorem',
              table: 'theorem_balance_sheet',
              sheet: 'Balance Sheet',
              transpose: true,
              row: 2,
              assignDataFn: (data, nameInfo) => {
                data['period'] = nameInfo.date
                data['series_number'] = nameInfo.seriesNumber
                data['type'] = nameInfo.type
                return data
              }
            }
          ]
          vars['TheoremService'].update(nameInfoList).then(() => {
            vars['TheoremBalanceSheetModel'].findAll().then((models) => {
              assert.equal(models[0].total_liabilities, -0.01)
              assert.equal(models[0].series_number, 95)
              assert.equal(models[0].audit_fees_payable, 252.12)
              assert.equal(models[0].inventory_costs_payable, 300)
              assert.equal(models[0].price_dissemination_fees_payable, 141.37)
              assert.equal(models[0].transfer_agent_fees_payable, 252.12)
              assert.equal(models[0].trustee_agent_fees_payable, 390.78)
              assert.equal(models[0].external_expense_offset_accrued, '-1,536.40')
              assert.equal(models[0].accounting_fees_payable, 200)
              assert.equal(models[0].type, 'Weekly')
              done();
            })
          })
        });
      });
    });
    describe('citibank', function () {
      it('all transactions', function (done) {
        const nameInfoList = [
          {
            path: './tests/data/Citibank/all_transactions.CSV',
            type: 'AllTransactions',
            source: 'Citibank',
            table: 'citi_all_transactions',
            csvPostProcess: vars['CitiService'].csvPostProcess
          }
        ]
        vars['CitiService'].update(nameInfoList).then(() => {
          vars['CitiAllTransactionsModel'].findAll().then((models) => {
            assert.equal(models.length, 20)
            assert.equal(models[0].client_reference, 'AH21085811481166')
            assert.equal(models[0].account_id, 'XXXXX')
            assert.equal(models[0].trade_date.toISOString(), '2017-01-29T16:00:00.000Z')
            assert.equal(models[0].settlement_date.toISOString(), '2017-02-01T16:00:00.000Z')
            assert.equal(models[0].transaction_type, 'DVP')
            assert.equal(models[0].sec_id_type, 'LOCAL')
            assert.equal(models[0].sec_id, '96008822')
            assert.equal(models[0].isin, 'XXXX')
            assert.equal(models[0].issue_name, 'XXXXSTRUC')
            assert.equal(models[0].issue_name, 'XXXXSTRUC')
            assert.equal(models[0].quantity, '600000')
            assert.equal(models[0].settled_quantity, 600000)
            assert.equal(models[0].currency, 'USD')
            assert.equal(models[0].setltement_amount, 600000)
            assert.equal(models[0].asd, '2/2/2017')
            assert.equal(models[0].counterparty, 'CEDEL 83320')
            assert.equal(models[0].settlement_location, 'O/A EUROCLEAR                  *')
            assert.equal(models[0].position_held, 'HELD AT DEPOSITORY')
            assert.equal(models[0].counterparty_id, null)
            assert.equal(models[0].legal_confirm, 0)
            assert.equal(models[0].wire_confirm, 0)
            assert.equal(models[0].wire_amount, 0)
            done();
          })
        })
      });
    });
  });
});
