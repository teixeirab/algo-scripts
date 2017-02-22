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
    'PershingService',
    'InteractiveBrokerActivityModel',
    'InteractiveBrokerCashReportModel',
    'InteractiveBrokerNavModel',
    'InteractiveBrokerPositionsModel',
    'CitiAllTransactionsModel',
    'TheoremIncomeStatementModel',
    'TheoremBalanceSheetModel',
    'PershingPositionsModel',
    'PershingTradesModel',
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
      describe('position', function () {
        describe('find and save to db', function () {
          it('#findAndSync', function (done) {
            vars['InteractiveBrokerService'].findAndSync('ib_positions', './tests/data/ib/', '2017-02-15', 1).then(() => {
              vars['InteractiveBrokerPositionsModel'].findAll().then((models) => {
                assert.equal(models.length, 8)
                assert.equal(models[0].type, 'D')
                assert.equal(models[0].account_id, 'U1161356')
                assert.equal(models[0].con_id, '85004379')
                assert.equal(models[0].report_date, 20170215)
                assert.equal(models[0].security_id, '361860208')
                assert.equal(models[0].symbol, 'ALLY PRA')
                assert.equal(models[0].bb_ticker, '')
                assert.equal(models[0].bb_global_id, '')
                assert.equal(models[0].security_description, 'GMAC CAPITAL TRUST I')
                assert.equal(models[0].asset_type, 'STK')
                assert.equal(models[0].currency, 'USD')
                assert.equal(models[0].base_currency, 'USD')
                assert.equal(models[0].quantity, 37000)
                assert.equal(models[0].quantity_in_base, 0)
                assert.equal(models[0].cost_price, 25.13264372)
                assert.equal(models[0].cost_basis, 929907.817475)
                assert.equal(models[0].cost_basis_in_base, 929907.817475)
                assert.equal(models[0].market_price, 25.8)
                assert.equal(models[0].market_value, 954600)
                assert.equal(models[0].market_value_in_base, 954600)
                assert.equal(models[0].open_date_time, '')
                assert.equal(models[0].fx_rate_to_base, 1)
                assert.equal(models[0].settled_quantity, 0)
                assert.equal(models[0].settled_quantity_in_base, 0)
                assert.equal(models[0].master_account_id, '')
                assert.equal(models[0].van, 'U1161356')
                assert.equal(models[0].accrued_int, 0)
                done();
              })
            })
          });
        });
      });
    });
    describe('theorem', function () {
      describe('weekly', function () {
        describe('income statement', function () {
          it('#update', function (done) {
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
          it('#findAndSync', function (done) {
            vars['TheoremService'].findAndSync('theorem_income_statement_weekly', './tests/data/theorem/', '2017-02-10', 1).then(() => {
              vars['TheoremIncomeStatementModel'].findAll().then((models) => {
                assert.equal(models.length, 1)
                assert.equal(models[0].series_number, 16)
                assert.equal(models[0].type, 'Weekly')
                assert.equal(models[0].portfolio_income, '12,013.25')
                assert.equal(models[0].manager_fees, '-1,101.45')
                assert.equal(models[0].audit_fees, -40.81)
                assert.equal(models[0].price_dissemination_fees, -23.01)
                assert.equal(models[0].trustee_corporate_fees, -68.36)
                assert.equal(models[0].transfer_agent_fees, -38.36)
                assert.equal(models[0].arranger_fees, -220.29)
                assert.equal(models[0].listing_agent_fees, -40.81)
                done();
              })
            })
          });
        });
        describe('balance sheet', function () {
          it('#update', function (done) {
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
          it('#findAndSync', function (done) {
            vars['TheoremService'].findAndSync('theorem_balance_sheet_weekly', './tests/data/theorem/', '2017-02-10', 1).then(() => {
              vars['TheoremBalanceSheetModel'].findAll().then((models) => {
                assert.equal(models.length, 1)
                assert.equal(models[0].series_number, 16)
                assert.equal(models[0].type, 'Weekly')
                assert.equal(models[0].total_assets, '3,828,841.83')
                assert.equal(models[0].total_liabilities, '3,687.11')
                assert.equal(models[0].total_equity, '3,825,154.71')
                assert.equal(models[0].number_of_units_held, '40,170.00')
                assert.equal(models[0].nav_per_unit, 95.2242)
                assert.equal(models[0].operating_fees_payable, 616.6)
                assert.equal(models[0].management_fees_payable, '3,070.52')
                assert.equal(models[0].investments_long, '3,828,841.83')
                assert.equal(models[0].annual_series_fees_payable, null)
                assert.equal(models[0].arranger_fees_payable, 554.99)
                assert.equal(models[0].audit_fees_payable, 82.18)
                assert.equal(models[0].inventory_costs_payable, 0.01)
                assert.equal(models[0].price_dissemination_fees_payable, 46.05)
                assert.equal(models[0].transfer_agent_fees_payable, 65.94)
                assert.equal(models[0].trustee_agent_fees_payable, 137.66)
                assert.equal(models[0].external_expense_offset_accrued, null)
                assert.equal(models[0].extraordinary_expenses_payable, null)
                assert.equal(models[0].manager_fees_payable, '2,515.53')
                done();
              })
            })
          });
        });
      });
      describe('monthly', function () {
        describe('balance sheet', function () {
          it('#findAndSync', function (done) {
            vars['TheoremService'].findAndSync('theorem_balance_sheet_monthly', './tests/data/theorem/', '2017-01-01', 1).then(() => {
              vars['TheoremBalanceSheetModel'].findAll().then((models) => {
                assert.equal(models.length, 1)
                assert.equal(models[0].series_number, 11)
                assert.equal(models[0].type, 'Monthly')
                assert.equal(models[0].total_assets, '30,136,881.00')
                assert.equal(models[0].total_liabilities, 0)
                assert.equal(models[0].total_equity, '30,136,881.00')
                assert.equal(models[0].number_of_units_held, '244,920.00')
                assert.equal(models[0].nav_per_unit, 123.0479)
                assert.equal(models[0].operating_fees_payable, '11,618.22')
                assert.equal(models[0].management_fees_payable, '138,430.80')
                assert.equal(models[0].investments_long, '30,136,881.00')
                assert.equal(models[0].debt_instruments, '30,136,881.00')
                assert.equal(models[0].arranger_fees_payable, '138,430.80')
                assert.equal(models[0].audit_fees_payable, '2,934.70')
                assert.equal(models[0].price_dissemination_fees_payable, '1,605.21')
                assert.equal(models[0].transfer_agent_fees_payable, '2,676.26')
                assert.equal(models[0].trustee_agent_fees_payable, '4,402.06')
                assert.equal(models[0].external_expense_offset_accrued, '-150,049.03')
                done();
              })
            })
          });
        });
        describe('income statement', function () {
          it('#findAndSync', function (done) {
            vars['TheoremService'].findAndSync('theorem_income_statement_monthly', './tests/data/theorem/', '2017-01-01', 1).then(() => {
              vars['TheoremIncomeStatementModel'].findAll().then((models) => {
                assert.equal(models.length, 1)
                assert.equal(models[0].series_number, 11)
                assert.equal(models[0].type, 'Monthly')
                assert.equal(models[0].loan_interest_income, null)
                assert.equal(models[0].loan_interest_income_received, null)
                assert.equal(models[0].dividend, null)
                assert.equal(models[0].portfolio_income, null)
                assert.equal(models[0].stcg, null)
                assert.equal(models[0].unrealized_gain, '68,706.00')
                assert.equal(models[0].manager_fees, null)
                assert.equal(models[0].audit_fees, -179.97)
                assert.equal(models[0].price_dissemination_fees, -100)
                assert.equal(models[0].trustee_corporate_fees, -269.95)
                assert.equal(models[0].transfer_agent_fees, -169.86)
                assert.equal(models[0].arranger_fees, '-8,789.92')
                assert.equal(models[0].external_expense_offset, '9,509.70')
                done();
              })
            })
          });
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
    describe('pershing', function () {
      describe('positions', function () {
        it('#findAndSync', function (done) {
          vars['PershingService'].findAndSync('pershing_positions', './tests/data/Pershing/', '2017-02-08', 1).then(() => {
            vars['PershingPositionsModel'].findAll().then((models) => {
              assert.equal(models.length, 12)
              assert.equal(models[0].security_id, 'CASH')
              assert.equal(models[0].account_number, 'PXXXXXXX')
              assert.equal(models[0].cusip, 'EUR999995')
              assert.equal(models[0].account_name, 'IA CAPITAL - NETALPHA')
              assert.equal(models[0].description, 'EURO CURRENCY')
              assert.equal(models[0].asset_classification, 'CASH, MONEY FUNDS, BANK DEPOSITS')
              assert.equal(models[0].quantity, 0)
              assert.equal(models[0].price, 1.07)
              assert.equal(models[0].timezone, 'ET')
              assert.equal(models[0].change_price_amount, 0)
              assert.equal(models[0].change_price, '0.00%')
              assert.equal(models[0].market_value, 0)
              assert.equal(models[0].market_value_change, 0)
              assert.equal(models[0].last_activity_date.toISOString(), '2017-02-07T16:00:00.000Z')
              assert.equal(models[0].accrued_interest, 0)
              assert.equal(models[0].disposition_method, 'N/A')
              assert.equal(models[0].dividend_reinvestment, 'Payout In Cash')
              assert.equal(models[0].market, 'NASD')
              done();
            })
          })
        });
      });
    });
  });
});
