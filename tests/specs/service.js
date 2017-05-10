'use strict'

var async = require('async');
var assert = require('assert');
var moment = require('moment');
var helper = require('../../tests/helper')
var _ = require('lodash');

describe('service tests', function() {
  let vars = [
    'FileService',
    'InteractiveBrokerService',
    'TheoremService',
    'CitiService',
    'PershingService',
    'QuickBookService',
    'InteractiveBrokerActivityModel',
    'InteractiveBrokerCashReportModel',
    'InteractiveBrokerNavModel',
    'InteractiveBrokerPositionsModel',
    'CitiAllTransactionsModel',
    'CitiUnsettledTransactionsModel',
    'CitiFixedIncomePositionTransactionsModel',
    'CitiAvailablePositionModel',
    'CitiPositionsValuationsModel',
    'CitiCashBalancesModel',
    'TheoremIncomeStatementModel',
    'TheoremBalanceSheetModel',
    'PershingPositionsModel',
    'PershingTradesModel',
    'QBTransactionListModel',
    'QBAccountListModel',
    'QBClassModel',
    'QBItemModel',
    'QBCustomerModel',
    'QBAccountModel',
    'FlexFundsDB'
  ]
  const formatDate = (date) => {
    if (!date) {
      return null
    }
    return moment(date).format('YYYY-MM-DD')
  }
  beforeEach(function(done) {
    vars.forEach((dep) => {
      vars[dep] = app.summon.get(dep)
    })
    vars['FlexFundsDB'].sync({
      // logging: console.log,
      force: true
    }).then(function() {
      done();
    });
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
            assert.equal(formatDate(nameInfoList[0].date), '2017-02-15')
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
              assert.equal(formatDate(nameInfoList[0].date), '2017-02-15')
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
                assert.equal(models[0].trade_id, '504343277')
                assert.equal(models[0].type, 'D')
                assert.equal(models[0].account_id, 'U1891163')
                assert.equal(models[0].con_id, '97589595')
                assert.equal(models[0].security_id, '')
                assert.equal(models[0].symbol, 'CLH7')
                assert.equal(models[0].bb_ticker, 'CLH7')
                assert.equal(models[0].bb_global_id, 'BBG0028FBLW9')
                assert.equal(models[0].security_description, 'CL MAR17')
                assert.equal(models[0].asset_type, 'FUT')
                assert.equal(models[0].currency, 'USD')
                assert.equal(models[0].base_currency, 'USD')
                assert.equal(formatDate(models[0].trade_date), '2017-02-16')
                assert.equal(models[0].trade_time, '10:30:25')
                assert.equal(formatDate(models[0].settle_date), '2017-02-17')
                assert.equal(models[0].transaction_type, 'SELL')
                assert.equal(models[0].quantity, -1)
                assert.equal(models[0].unit_price, 52.8)
                assert.equal(models[0].gross_amount, 52800)
                assert.equal(models[0].sec_fee, 0)
                assert.equal(models[0].commission, -54.36)
                assert.equal(models[0].tax, 0)
                assert.equal(models[0].net, -614.36)
                assert.equal(models[0].net_in_base, -614.36)
                assert.equal(models[0].tax_basis_election, 'FI')
                assert.equal(models[0].description, 'TRADE CL MAR17')
                assert.equal(models[0].fx_rate_to_base, 1)
                assert.equal(models[0].contraparty_name, '')
                assert.equal(models[0].clr_firm_id, '')
                assert.equal(models[0].exchange, 'NYMEX')
                assert.equal(models[0].master_account_id, '')
                assert.equal(models[0].van, '')
                assert.equal(models[0].away_broker_commission, 0)
                assert.equal(models[0].order_id, '364796120')
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
                  assert.equal(models.length, 5)
                  assert.equal(formatDate(models[0].trade_date), '2017-02-16')
                  assert.equal(formatDate(models[0].settle_date), '2017-02-22')
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
              assert.equal(formatDate(nameInfoList[0].date), '2017-02-15')
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
                assert.equal(formatDate(models[0].period), '2017-02-15')
                assert.equal(models[0].account_id, 'U1161356')
                done();
              })
            })
          });
          it('#findAndSync', function (done) {
            vars['InteractiveBrokerService'].findAndSync('ib_cash_report', './tests/data/ib/', '2017-02-15', 1).then(() => {
              vars['InteractiveBrokerCashReportModel'].findAll().then((models) => {
                assert.equal(models.length, 15)
                assert.equal(formatDate(models[0].period), '2017-02-15')
                assert.equal(models[0].account_id, 'U1161356')
                assert.equal(models[0].label, 'Starting Cash')
                assert.equal(models[0].currency, 'USD')
                assert.equal(models[0].base_summary, 'Y')
                assert.equal(models[0].type, 'D')
                assert.equal(models[0].total, -3635972.47732594)
                assert.equal(models[0].securities, -3635972.47732594)
                assert.equal(models[0].futures, 0)
                assert.equal(models[0].ibukl, 0)
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
                assert.equal(models.length, 1)
                assert.equal(formatDate(models[0].period), '2017-02-15')
                assert.equal(models[0].account_id, 'U1161356')
                assert.equal(models[0].base_currency, 'USD')
                assert.equal(models[0].type, 'D')
                assert.equal(models[0].cash, -3619475.24732598)
                assert.equal(models[0].cash_collateral, 0)
                assert.equal(models[0].stocks, 5545171)
                assert.equal(models[0].securities_borrowed, 0)
                assert.equal(models[0].securities_lent, 0)
                assert.equal(models[0].options, 0)
                assert.equal(models[0].bonds, 8865.3)
                assert.equal(models[0].commodities, 0)
                assert.equal(models[0].funds, 0)
                assert.equal(models[0].notes, 0)
                assert.equal(models[0].accruals, -2042.42)
                assert.equal(models[0].dividend_accruals, 11.2)
                assert.equal(models[0].soft_dollars, 0)
                assert.equal(models[0].totals, 1932529.83267402)
                assert.equal(models[0].twr, -0.124385986)
                done();
              })
            })
          });
        });
      });
      describe('position', function () {
        describe('find and save to db', function () {
          it('filter month end', function (done) {
            vars['InteractiveBrokerService'].findAndSync('ib_positions', './tests/data/ib/', '2017-01-31', 1).then(() => {
              vars['InteractiveBrokerPositionsModel'].findAll().then((models) => {
                assert.equal(models.length, 10)
                done();
              })
            })
          });
          it('filter for friday or month end', function (done) {
            vars['InteractiveBrokerService'].findAndSync('ib_positions', './tests/data/ib/', '2017-02-10', 1).then(() => {
              vars['InteractiveBrokerPositionsModel'].findAll().then((models) => {
                assert.equal(models.length, 11)
                assert.equal(models[0].type, 'D')
                assert.equal(models[0].account_id, 'U1161356')
                assert.equal(models[0].con_id, '85004379')
                assert.equal(formatDate(models[0].report_date), '2017-02-10')
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
                assert.equal(models[0].market_price, 25.605)
                assert.equal(models[0].market_value, 947385)
                assert.equal(models[0].market_value_in_base, 947385)
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
                assert.equal(formatDate(models[0].period), '2017-02-10')
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
                assert.equal(models[0].portfolio_income, 12013.25)
                assert.equal(models[0].manager_fees, -1101.45)
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
                assert.equal(models[0].total_assets, 3828841.83)
                assert.equal(models[0].total_liabilities, 3687.11)
                assert.equal(models[0].total_equity, 3825154.71)
                assert.equal(models[0].number_of_units_held, 40170.00)
                assert.equal(models[0].nav_per_unit, 95.2242)
                assert.equal(models[0].operating_fees_payable, 616.6)
                assert.equal(models[0].management_fees_payable, 3070.52)
                assert.equal(models[0].investments_long, 3828841.83)
                assert.equal(models[0].annual_series_fees_payable, 0)
                assert.equal(models[0].arranger_fees_payable, 554.99)
                assert.equal(models[0].audit_fees_payable, 82.18)
                assert.equal(models[0].inventory_costs_payable, 0.01)
                assert.equal(models[0].price_dissemination_fees_payable, 46.05)
                assert.equal(models[0].transfer_agent_fees_payable, 65.94)
                assert.equal(models[0].trustee_agent_fees_payable, 137.66)
                assert.equal(models[0].external_expense_offset_accrued, 0)
                assert.equal(models[0].extraordinary_expenses_payable, 0)
                assert.equal(models[0].manager_fees_payable, 2515.53)
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
                assert.equal(models[0].total_assets, 30136881.00)
                assert.equal(models[0].total_liabilities, 0)
                assert.equal(models[0].total_equity, 30136881.00)
                assert.equal(models[0].number_of_units_held, 244920.00)
                assert.equal(models[0].nav_per_unit, 123.0479)
                assert.equal(models[0].operating_fees_payable, 11618.22)
                assert.equal(models[0].management_fees_payable, 138430.80)
                assert.equal(models[0].investments_long, 30136881.00)
                assert.equal(models[0].debt_instruments, 30136881.00)
                assert.equal(models[0].arranger_fees_payable, 138430.80)
                assert.equal(models[0].audit_fees_payable, 2934.70)
                assert.equal(models[0].price_dissemination_fees_payable, 1605.21)
                assert.equal(models[0].transfer_agent_fees_payable, 2676.26)
                assert.equal(models[0].trustee_agent_fees_payable, 4402.06)
                assert.equal(models[0].external_expense_offset_accrued, -150049.03)
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
                assert.equal(models[0].loan_interest_income, 0)
                assert.equal(models[0].loan_interest_income_received, 0)
                assert.equal(models[0].dividend, 0)
                assert.equal(models[0].portfolio_income, 0)
                assert.equal(models[0].stcg, 0)
                assert.equal(models[0].unrealized_gain, 68706.00)
                assert.equal(models[0].manager_fees, 0)
                assert.equal(models[0].audit_fees, -179.97)
                assert.equal(models[0].price_dissemination_fees, -100)
                assert.equal(models[0].trustee_corporate_fees, -269.95)
                assert.equal(models[0].transfer_agent_fees, -169.86)
                assert.equal(models[0].arranger_fees, -8789.92)
                assert.equal(models[0].external_expense_offset, 9509.70)
                done();
              })
            })
          });
        });
      });
    });
    describe('citibank', function () {
      describe('all transactions', function (done) {
        it('#findAndSync', function (done) {
          vars['CitiService'].findAndSync('citi_all_transactions', './tests/data/Citibank/', '2017-02-15').then(() => {
            vars['CitiAllTransactionsModel'].findAll().then((models) => {
              assert.equal(models.length, 20)
              assert.equal(models[0].client_reference, 'AH21085811481166')
              assert.equal(models[0].account_id, 'XXXXX')
              assert.equal(formatDate(models[0].trade_date), '2017-01-30')
              assert.equal(formatDate(models[0].settlement_date), '2017-02-02')
              assert.equal(models[0].transaction_type, 'DVP')
              assert.equal(models[0].sec_id_type, 'LOCAL')
              assert.equal(models[0].sec_id, '96008822')
              assert.equal(models[0].isin, 'XXXX')
              assert.equal(models[0].issue_name, 'XXXXSTRUC')
              assert.equal(models[0].quantity, '600000')
              assert.equal(models[0].settled_quantity, 600000)
              assert.equal(models[0].currency, 'USD')
              assert.equal(models[0].setltement_amount, 600000)
              assert.equal(formatDate(models[0].asd), '2017-02-02')
              assert.equal(models[0].counterparty, 'CEDEL 83320')
              assert.equal(models[0].settlement_location, 'O/A EUROCLEAR                  *')
              assert.equal(models[0].position_held, 'HELD AT DEPOSITORY')
              assert.equal(models[0].counterparty_id, '0')
              assert.equal(models[0].legal_confirm, 0)
              assert.equal(models[0].wire_confirm, 0)
              assert.equal(models[0].wire_amount, 0)
              done();
            })
          })
        });
      });
      describe('unsettled transactions', function () {
        it('#findAndSync', function (done) {
          vars['CitiService'].findAndSync('citi_unsettled_transactions', './tests/data/Citibank/', '2017-02-15').then(() => {
            vars['CitiUnsettledTransactionsModel'].findAll().then((models) => {
              assert.equal(models.length, 5)
              assert.equal(models[0].client_reference, 'AH21086504963212')
              assert.equal(models[0].account_number, 'XXXXX')
              assert.equal(formatDate(models[0].settlement_date), '2017-02-09')
              assert.equal(models[0].txn_type, 'RVP')
              assert.equal(models[0].custodian_reference, '56054827626')
              assert.equal(models[0].sec_id_type, 'LOCAL')
              assert.equal(models[0].sec_id, 'XXX')
              assert.equal(models[0].isin, 'XXX')
              assert.equal(models[0].issue_name, 'STRUC')
              assert.equal(models[0].quantity, 140000)
              assert.equal(models[0].settled_quantity, 0)
              assert.equal(models[0].currency, 'USD')
              assert.equal(models[0].settlement_amount, 148162)
              assert.equal(formatDate(models[0].trade_date), '2017-02-06')
              assert.equal(models[0].counterparty_ec, 'EUROCLEAR 97375')
              assert.equal(models[0].counterparty_id, null)
              assert.equal(models[0].legal_confirm, 0)
              done();
            })
          })
        });
        it('should update or delete unsettled records based on data source file', function (done) {
          async.waterfall([
            (cb) => {
              helper.batchCreateInstances([
                ['CitiUnsettledTransactionsModel',
                [
                  {
                    client_reference: 'AH21086504963212',
                    account_number: 'test1',
                    settlement_date: moment('2017-02-09').toDate(),
                    txn_type: 'RVP',
                    custodian_reference: '56054827626',
                    sec_id_type: 'LOCAL',
                    sec_id: 'XXX',
                    isin: 'XXX',
                    issue_name: 'STRUC',
                    quantity: 140000,
                    settled_quantity: 0,
                    currency: 'USD',
                    settlement_amount: 148162,
                    trade_date: moment('2017-02-06').toDate(),
                    counterparty_ec: 'EUROCLEAR 97375',
                    counterparty_id: 1,
                    legal_confirm: 1
                  },
                  {
                    client_reference: 'settledOrcancelled',
                    account_number: 'test1',
                    settlement_date: moment('2017-02-09').toDate(),
                    txn_type: 'RVP',
                    custodian_reference: '56054827626',
                    sec_id_type: 'LOCAL',
                    sec_id: 'XXX',
                    isin: 'XXX',
                    issue_name: 'STRUC',
                    quantity: 140000,
                    settled_quantity: 0,
                    currency: 'USD',
                    settlement_amount: 148162,
                    trade_date: moment('2017-02-06').toDate(),
                    counterparty_ec: 'EUROCLEAR 97375',
                    counterparty_id: 1,
                    legal_confirm: 1
                  }
                ]]
              ], cb)
            },
            (cb) => {
              helper.batchCreateInstances([
                ['CitiAllTransactionsModel',
                [
                  {
                    client_reference: 'settledOrcancelled',
                    account_id: 'XXXXX',
                    trade_date: moment('2017-01-30').toDate(),
                    settlement_date: moment('2017-02-02').toDate(),
                    transaction_type: 'DVP',
                    sec_id_type: 'LOCAL',
                    sec_id: '96008822',
                    isin: 'XXXX',
                    issue_name: 'XXXXSTRUC',
                    quantity: '600000',
                    settled_quantity: 600000,
                    currency: 'USD',
                    setltement_amount: 600000,
                    asd: '2/2/2017',
                    counterparty: 'CEDEL 83320',
                    settlement_location: 'O/A EUROCLEAR                  *',
                    position_held: 'HELD AT DEPOSITORY',
                    counterparty_id: null,
                    legal_confirm: 0,
                    wire_confirm: 0,
                    wire_amount: 0
                  }
                ]]
              ], cb)
            },
            (cb) => {
              vars['CitiService'].findAndSync('citi_unsettled_transactions', './tests/data/Citibank/', '2017-02-15').then(() => {
                vars['CitiUnsettledTransactionsModel'].findAll().then((models) => {
                  //2 existing, 5 from data source
                  //updated one and deleted one
                  assert.equal(models.length, 5)
                  assert.equal(models[0].client_reference, 'AH21086504963212')
                  //override based the value in data source file
                  assert.equal(models[0].account_number, 'XXXXX')
                  assert.equal(formatDate(models[0].settlement_date), '2017-02-09')
                  assert.equal(models[0].txn_type, 'RVP')
                  assert.equal(models[0].custodian_reference, '56054827626')
                  assert.equal(models[0].sec_id_type, 'LOCAL')
                  assert.equal(models[0].sec_id, 'XXX')
                  assert.equal(models[0].isin, 'XXX')
                  assert.equal(models[0].issue_name, 'STRUC')
                  assert.equal(models[0].quantity, 140000)
                  assert.equal(models[0].settled_quantity, 0)
                  assert.equal(models[0].currency, 'USD')
                  assert.equal(models[0].settlement_amount, 148162)
                  assert.equal(formatDate(models[0].trade_date), '2017-02-06')
                  assert.equal(models[0].counterparty_ec, 'EUROCLEAR 97375')
                  //should preserved if these two columns have been manually updated
                  assert.equal(models[0].counterparty_id, 1)
                  assert.equal(models[0].legal_confirm, 1)
                  vars['CitiUnsettledTransactionsModel'].findAll({
                    where: {
                      client_reference: 'settledOrcancelled'
                    }
                  }).then((txs) => {
                    assert.equal(txs.length, 0)
                    vars['CitiAllTransactionsModel'].findAll({
                      where: {
                        client_reference: 'settledOrcancelled'
                      }
                    }).then((txs) => {
                      assert.equal(txs[0].counterparty_id, 1)
                      assert.equal(txs[0].legal_confirm, 1)
                      cb()
                    })
                  })
                })
              })
            }
          ], done)
        });
      });
      describe('fixed income position', function () {
        it('#findAndSync', function (done) {
          vars['CitiService'].findAndSync('citi_fixed_income_settled_position', './tests/data/Citibank/', '2017-02-15').then(() => {
            vars['CitiFixedIncomePositionTransactionsModel'].findAll().then((models) => {
              assert.equal(models.length, 2)
              assert.equal(models[0].account_id, 'XXXXX')
              assert.equal(formatDate(models[0].as_of_date), '2017-02-08')
              assert.equal(models[0].isin, 'XXXX')
              assert.equal(formatDate(models[0].maturity_date), '2024-12-31')
              assert.equal(models[0].sec_id_type, 'LOCAL')
              assert.equal(models[0].sec_id, 'XXXX')
              assert.equal(models[0].issue_name, 'XXXXSTRUC')
              assert.equal(models[0].how_position_is_held, 'HELD AT DEPOSITORY')
              assert.equal(models[0].settled_quantity, 880000)
              assert.equal(models[0].interest_rate, 0)
              assert.equal(models[0].current_face_value, 0)
              done();
            })
          })
        });
      });
      describe('available position', function () {
        it('#findAndSync', function (done) {
          vars['CitiService'].findAndSync('citi_available_position', './tests/data/Citibank/', '2017-02-15').then(() => {
            vars['CitiAvailablePositionModel'].findAll().then((models) => {
              assert.equal(formatDate(models[0].period), '2017-02-16')
              assert.equal(models[0].account_id, '6017709722')
              assert.equal(models[0].isin, 'XS0855794367')
              assert.equal(models[0].iso_country_name, 'GB')
              assert.equal(models[0].branch_name, 'CITIBANK NA LONDON')
              assert.equal(models[0].account_name, 'IA CAPITAL - NOTE UNWIND ACCOUNT - USD')
              assert.equal(models[0].issue_name, 'IA CAPITAL STRUC')
              assert.equal(models[0].settled_position, 1150000)
              assert.equal(models[0].confirmed_delivers, -200000)
              assert.equal(models[0].confirmed_receives, 0)
              assert.equal(models[0].unconfirmed_delivers, 0)
              assert.equal(models[0].unconfirmed_receives, 0)
              assert.equal(models[0].blocked_position, 0)
              assert.equal(models[0].available_position, 950000)
              assert.equal(models[0].additional_informaiton, '')
              assert.equal(models[0].blocked_to_delivery, 0)
              done();
            })
          })
        });
      });
      describe('position valuation', function () {
        it('#findAndSync', function (done) {
          vars['CitiService'].findAndSync('citi_positions_valuations', './tests/data/Citibank/', '2017-02-15').then(() => {
            vars['CitiPositionsValuationsModel'].findAll().then((models) => {
              assert.equal(models.length, 102)
              assert.equal(models[0].id, 1)
              assert.equal(models[0].account_id, 6017709722)
              assert.equal(models[0].account_name, 'IA CAPITAL - NOTE UNWIND ACCOUNT - USD')
              assert.equal(formatDate(models[0].as_of_date), '2017-03-28')
              assert.equal(models[0].issue_name, 'IA CAPITAL STRUCTURES PLC')
              assert.equal(models[0].maturity_date, '11-14-2019')
              assert.equal(models[0].sec_id_type, 'LOCAL')
              assert.equal(models[0].sec_id, '0096546019')
              assert.equal(models[0].settled_quantity, 9980000)
              assert.equal(models[0].market_value, 9980000)
              assert.equal(models[0].currency, null)
              assert.equal(models[0].interest_rate, 0)
              assert.equal(models[0].isin, 'XS1514984936')
              done();
            })
          })
        });
      });
      describe('cash balances', function () {
        it('#findAndSync', function (done) {
          vars['CitiService'].findAndSync('citi_cash_balances', './tests/data/Citibank/', '2016-12-01').then(() => {
            vars['CitiCashBalancesModel'].findAll().then((models) => {
              assert.equal(models.length, 13)
              assert.equal(models[0].currency, 'USD')
              assert.equal(models[0].account_id, '17161085')
              assert.equal(models[0].account_name, 'IA CAPITAL STRUCTURES (IRELAND) - USD')
              assert.equal(formatDate(models[0].period), '2017-03-31')
              assert.equal(models[0].opening_balance, '270834.58')
              assert.equal(models[0].ledger_balance, '270834.58')
              assert.equal(models[0].available_balance, '270834.58')
              done();
            })
          })
        });
      });
    });
    describe('pershing', function () {
      describe('positions', function () {
        it('#findAndSync', function (done) {
          vars['PershingService'].findAndSync('pershing_positions', './tests/data/Pershing/', '2017-04-03', 1).then(() => {
            vars['PershingPositionsModel'].findAll().then((models) => {
              assert.equal(models.length, 8)
              assert.equal(models[0].security_id, 'BUD4327481')
              assert.equal(models[0].account_number, 'JWC042504')
              assert.equal(models[0].cusip, '035242AP1')
              assert.equal(models[0].accrued_interest, null)
              assert.equal(models[0].market_value_change, null)
              assert.equal(models[0].coupon, null)
              assert.equal(models[0].rating, null)
              assert.equal(formatDate(models[0].last_activity_date), null)
              assert.equal(models[0].account_name, '')
              assert.equal(models[0].description, 'ANHEUSER-BUSCH INBEV FIN INC GTD FXD RT NT  3.650% 02/01/26 B/E DTD 01/25/16 CLB  CLB 11/01/2025 @100')
              assert.equal(models[0].asset_classification, 'FIXED INCOME')
              assert.equal(models[0].quantity, 300000)
              assert.equal(models[0].price, 101.12)
              assert.equal(models[0].timezone, 'ET')
              assert.equal(models[0].change_price_amount, 0.431)
              assert.equal(models[0].change_price, 0.0043)
              assert.equal(models[0].market_value, 303360)
              assert.equal(models[0].disposition_method, 'FI')
              assert.equal(models[0].dividend_reinvestment, null)
              assert.equal(models[0].market, 'NYSE')

              assert.equal(models[2].security_id, 'VZ.MT')
              assert.equal(models[2].account_number, 'JWC042504')
              assert.equal(models[2].cusip, '92344GAM8')
              assert.equal(models[2].accrued_interest, 3875)
              assert.equal(models[2].market_value_change, -861)
              assert.equal(models[2].coupon, 7.75)
              assert.equal(models[2].rating, 'BAA1')
              assert.equal(formatDate(models[2].last_activity_date), '2016-01-19')
              assert.equal(models[2].account_name, '')
              assert.equal(models[2].description, 'VERIZON GLOBAL FDG CORP DEB  7.750% 12/01/30 B/E DTD 12/12/00   N/C')
              assert.equal(models[2].asset_classification, 'FIXED INCOME')
              assert.equal(models[2].quantity, 150000)
              assert.equal(models[2].price, 134.569)
              assert.equal(models[2].timezone, 'ET')
              assert.equal(models[2].change_price_amount, -0.574)
              assert.equal(models[2].change_price, -0.0042)
              assert.equal(models[2].market_value, 201853.5)
              assert.equal(models[2].disposition_method, 'FI')
              assert.equal(models[2].dividend_reinvestment, null)
              assert.equal(models[2].market, 'NYSE')

              assert.equal(formatDate(models[7].price_as_of_date), '2017-04-03')
              done();
            })
          })
        });
      });
      describe('trades', function () {
        it('#findAndSync', function (done) {
          vars['PershingService'].findAndSync('pershing_trades', './tests/data/Pershing/', '2017-02-08', 1).then(() => {
            vars['PershingTradesModel'].findAll().then((models) => {
              assert.equal(models.length, 309)
              assert.equal(models[0].account, 'JXXXXXX')
              assert.equal(formatDate(models[0].date), '2017-02-07')
              assert.equal(models[0].cusip, 'USD999997')
              assert.equal(models[0].net_amount, 63452.98)
              assert.equal(models[0].price, 0)
              assert.equal(models[0].account_nickname, '')
              assert.equal(models[0].security_id, '')
              assert.equal(models[0].description, 'MONEY FUND REDEMPTION')
              assert.equal(models[0].quantity, 0)
              assert.equal(models[0].principal, 0)
              assert.equal(models[0].commission_fees, 0)
              assert.equal(models[0].account_type, 'CASH')
              assert.equal(models[0].details, 'BNY MELLON US TREAS SERVICE SHS MMF DUTG G1206E151')
              done();
            })
          })
        });
      });
    });
  });
  describe('quickbooks', function () {
<<<<<<< HEAD
    describe('transaction list', function () {
      it('sync for a period', function (done) {
        vars['QuickBookService']
=======
    describe('reports', function () {
      describe('transaction list', function () {
        it('sync for a period', function (done) {
          vars['QuickBookService']
>>>>>>> auto_setup_fee
          .findAndSync('qb_transaction_list', null, new Date(2017, 3, 1))
          .then((report) => {
            vars['QBTransactionListModel'].findAll().then((txns) => {
              assert.equal(1, txns.length)
              done()
            })
          })
        });
      });
      describe('account list', function () {
        it('sync for a period', function (done) {
          vars['QuickBookService']
          .findAndSync('qb_account_list', null, new Date(2017, 3, 1))
          .then((report) => {
            vars['QBAccountListModel'].findAll().then((accounts) => {
              assert.equal(90, accounts.length)
              done()
            })
          })
        });
      });
    });
    describe('entity', function () {
      describe('accounts', function () {
        it.only('sync', function (done) {
          vars['QuickBookService']
            .findAndSync('qb_account')
            .then(() => {
              vars['QBAccountModel'].findAll().then((account) => {
                console.log(account[0].toJSON())
                assert.equal(144, account.length)
                done()
              })
            })
        });
      });
      xdescribe('class', function () {
        it('sync', function (done) {
          vars['QuickBookService']
          .findAndSync('qb_class')
          .then((report) => {
            vars['QBClassModel'].findAll().then((classes) => {
              assert.equal(149, classes.length)
              done()
            })
          })
        });
      });
      xdescribe('items', function () {
        it('sync', function (done) {
          vars['QuickBookService']
          .findAndSync('qb_item')
          .then((report) => {
            vars['QBItemModel'].findAll().then((classes) => {
              assert.equal(27, classes.length)
              done()
            })
          })
        });
      });
      xdescribe('customers', function () {
        it('sync', function (done) {
          vars['QuickBookService']
          .findAndSync('qb_customer')
          .then((report) => {
            vars['QBCustomerModel'].findAll().then((classes) => {
              assert.equal(27, classes.length)
              done()
            })
          })
        });
      });
      xdescribe('invoices', function () {
        it('sync', function (done) {
          vars['QuickBookService']
          .findAndSync('qb_invoice')
          .then((report) => {
            done()
            // vars['QBCustomerModel'].findAll().then((classes) => {
            //   assert.equal(27, classes.length)
            //   done()
            // })
          })
        });
      });
    });
    // describe('general ledger', function () {
    //   it('sync for a period', function (done) {
    //     vars['QuickBookService']
    //       .findAndSync('qb_general_ledger', null, new Date(2017, 3, 1))
    //       .then((report) => {
    //         console.log(JSON.stringify(report, undefined, 2))
    //         // vars['QBAccountListModel'].findAll().then((accounts) => {
    //         //   assert.equal(90, accounts.length)
    //         //   done()
    //         // })
    //       })
    //   });
    // });
  });
});
