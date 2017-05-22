'use strict';

const  async = require('async')
const moment = require('moment')
const _ = require('lodash')
const QuickBooks = require('node-quickbooks')
const request = require('request')

module.exports = function(
  Configs,
  Sequelize,
  QBAPIAccountModel,
  QBTransactionListModel,
  QBAccountListModel,
  QBItemModel,
  QBCustomerModel,
  QBAccountModel,
  QBInvoiceModel,
  QBClassModel,
  QBInvoicesMaintenanceModel,
  TheoremIncomeStatementModel,
  SeriesNamesModel,
  SeriesFeesTermsModel
) {
  const that = this

  const mappings = {
    'qb_transaction_list': syncTransactionList,
    'qb_account_list': syncAccountList,
    'qb_account': syncAccounts,
    'qb_class': syncClasses,
    'qb_item': syncItems,
    'qb_customer': syncCustomers,
    'qb_invoice': syncInvoices,
    'qb_general_ledger': syncGeneralLedger,
    'qb_invoices_maintenance': generateInvoicesMaintenanceFees,
    'qb_invoices_maintenance_send': sendMaintenanceFeeInvoices
  }

  this.getQBO = (config) => {
    return new QuickBooks(
      config.consumerKey,
      config.consumerSecret,
      config.token,
      config.tokenSecret,
      config.realmId,
      config.useSandbox,
      config.debug
    )
  }

  this.findAndSync = (table, path, from, to) => {
    to = to || new Date()
    return new Promise((resolve, reject) => {
      mappings[table](from, to).then(resolve)
    })
  }

  function syncTransactionList (from, to) {
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": Object.keys(QBTransactionListModel.attributes)
    }
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.reportTransactionList(opts, (err, report) => {
          if(err) {
            return cb()
          }
          let rows = that.transformReport(report)
          console.info(`loaded ${rows.length} reports @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert report name:${row.name}`)
            QBTransactionListModel.upsert(row).then(() => {
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncAccountList (from, to) {
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": Object.keys(QBTransactionListModel.attributes)
    }
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.reportAccountListDetail(opts, (err, report) => {
          if(err) {
            return cb()
          }
          let rows = that.transformReport(report)
          console.info(`loaded ${rows.length} reports @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert report name:${row.account_name}`)
            QBAccountListModel.upsert(row).then(() => {
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncGeneralLedger (from, to) {
    let opts = {
      // "transaction_type": "Invoice",
      "start_date": moment(from).format('YYYY-MM-DD'),
      "end_date": moment(to).format('YYYY-MM-DD'),
      "columns": [
        'account_name',
        'chk_print_state',
        'create_by',
        'create_date',
        'cust_name',
        'doc_num',
        'emp_name',
        'inv_date',
        'is_adj',
        'is_ap_paid',
        'is_ar_paid',
        'is_cleared',
        'item_name',
        'last_mod_by',
        'last_mod_date',
        'memo',
        'name',
        'quantity',
        'rate',
        'split_acc',
        'tx_date',
        'txn_type',
        'vend_name'
      ]
    }
    return new Promise((resolve, reject) => {
      const fs = require('fs')
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.reportGeneralLedgerDetail(opts, (err, report) => {
          fs.writeFile(config.account, JSON.stringify(report, undefined, 2), (err) => {
            cb()
          })
        })
      })
    })
  }

  function syncAccounts (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findAccounts({fetchall: true}, (err, data) => {
          let accounts = data.QueryResponse.Account
          if(err || !accounts) {
            return cb()
          }
          let rows = accounts.map((account) => {
            return {
              id                               : account.Id,
              name                             : account.Name,
              description                      : account.Description,
              fully_qualified_name             : account.FullyQualifiedName,
              classification                   : account.Classification,
              account_type                     : account.AccountType,
              account_sub_type                 : account.AccountSubType,
              current_balance                  : account.CurrentBalance,
              current_balance_with_sub_accounts: account.CurrentBalanceWithSubAccounts,
              currency_code                    : _.get(account, 'CurrencyRef.value'),
              active                           : account.Active
            }
          })
          console.info(`loaded ${rows.length} account @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert account name:${row.name}`)
            QBAccountModel.upsert(row).then(() => {
              _cb()
            }).catch((err) => {
              console.error(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncClasses (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findClasses({fetchall: true}, (err, data) => {
          let classes = data.QueryResponse.Class
          if(err || !classes) {
            return cb()
          }
          let rows = classes.map((cls) => {
            return {
              id: cls.Id,
              qb_account: config.account,
              name: cls.Name,
              fully_qualified_name: cls.FullyQualifiedName,
              active: cls.Active
            }
          })
          console.info(`loaded ${rows.length} class @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert class name:${row.name}`)
            QBClassModel.upsert(row).then(() => {
              _cb()
            }).catch((err) => {
              console.error(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncItems (from, to) {
    return new Promise((resolve, reject) => {
      QBAPIAccountModel.findAll().then((qbConfigs) => {
        async.eachSeries(qbConfigs, (config, cb) => {
          let qbo = that.getQBO({
            consumerKey: config.consumer_key,
            consumerSecret: config.consumer_secret,
            token: config.token,
            tokenSecret: config.token_secret,
            realmId: config.realm_id,
            useSandbox: config.use_sandbox,
            debug: config.debug
          })
          qbo.findItems({fetchall: true}, (err, data) => {
            let items = data.QueryResponse.Item
            if(err || !items) {
              return cb()
            }
            let rows = items.map((item) => {
              return {
                id: item.Id,
                qb_account: config.account,
                name: item.Name,
                description: item.Description,
                type: item.Type,
                parent_id: item.ParentRef? item.ParentRef.value : null,
                income_account_id: item.IncomeAccountRef? item.IncomeAccountRef.value : null,
                expense_account_id: item.ExpenseAccountRef? item.ExpenseAccountRef.value : null,
                asset_account_id: item.AssetAccountRef? item.AssetAccountRef.value : null,
                active: item.Active
              }
            })
            console.info(`loaded ${rows.length} item @${config.account}`)
            async.eachSeries(rows, (row, _cb) => {
              row.qb_account = config.account
              console.info(`insert item name:${row.name}`)
              QBItemModel.upsert(row).then(() => {
                _cb()
              }).catch((err) => {
                console.error(err)
                _cb()
              })
            }, () => {
              cb()
            })
          })
        }, () => {
          resolve()
        })
      })
    })
  }

  function syncCustomers (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findCustomers({fetchall: true}, (err, data) => {
          let customers = data.QueryResponse.Customer
          if(err || !customers) {
            return cb()
          }
          let rows = customers.map((customer) => {
            return {
              id: customer.Id,
              qb_account: config.account,
              email: customer.PrimaryEmailAddr? customer.PrimaryEmailAddr.Address : null,
              given_name: customer.GivenName,
              middle_name: customer.MiddleName,
              family_name: customer.FamilyName,
              fully_qualified_name: customer.FullyQualifiedName,
              company_name: customer.CompanyName,
              display_name: customer.DisplayName,
              print_on_check_name: customer.PrintOnCheckName,
              bill_addr_line1: customer.BillAddr? customer.BillAddr.Line1: null,
              bill_addr_city: customer.BillAddr? customer.BillAddr.City: null,
              bill_addr_country_sub_division_code: customer.BillAddr? customer.BillAddr.CountrySubDivisionCode: null,
              bill_addr_postal_code: customer.BillAddr? customer.BillAddr.BillAddrPostalCode: null,
              currency_code: _.get(customer, 'CurrencyRef.value'),
              active: customer.Active
            }
          })
          console.info(`loaded ${rows.length} customer @${config.account}`)
          async.eachSeries(rows, (row, _cb) => {
            row.qb_account = config.account
            console.info(`insert customer name:${row.display_name}`)
            QBCustomerModel.upsert(row).then(() => {
              _cb()
            }).catch((err) => {
              console.error(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function syncInvoices (from, to) {
    return new Promise((resolve, reject) => {
      async.eachSeries(Configs.quickbooks, (config, cb) => {
        let qbo = that.getQBO(config)
        qbo.findInvoices({fetchall: true}, (err, data) => {
          let invoices = _.get(data, 'QueryResponse.Invoice')
          if (!invoices) {
            return cb()
          }
          invoices = invoices.map((invoice) => {
            return {
              qb_account: config.account,
              id: invoice.Id,
              customer_id: _.get(invoice, 'CustomerRef.value'),
              doc_num: invoice.DocNumber,
              total_amount: invoice.TotalAmt,
              currency_code: _.get(invoice, 'CurrencyRef.value'),
              exchange_rate: invoice.ExchangeRate,
              due_date: invoice.DueDate,
              txn_date: invoice.TxnDate,
              email_status: invoice.EmailStatus,
              balance: invoice.Balance,
              einvoice_status: invoice.EInvoiceStatus
            }
          })
          async.eachSeries(invoices, (invoice, _cb) => {
            QBInvoiceModel.upsert(invoice).then(() => {
              _cb()
            }).catch((err) => {
              console.log(err)
              _cb()
            })
          }, () => {
            cb()
          })
        })
      }, () => {
        resolve()
      })
    })
  }

  function generateInvoicesMaintenanceFees (from, to) {
    from = moment(from).toDate()
    return new Promise((resolve, reject) => {
      async.waterfall([
        (cb) => {
          SeriesFeesTermsModel.findAll({
            where: {
              external_offset: 'Yes'
            }
          }).then((feesTerms) => {
            SeriesNamesModel.findAll({
              where: {
                status: 'A'
              }
            }).then((seriesNames) => {
              let validSeries = []
              feesTerms.forEach((feesTerm) => {
                seriesNames.forEach((seriesName) => {
                  if (feesTerm.series_number === seriesName.series_number &&
                      validSeries.indexOf(seriesName.series_number) === -1) {
                    validSeries.push(seriesName.series_number)
                  }
                })
              })
              cb(undefined, validSeries)
            })
          })
        },
        (validSeries, cb) => {
          let rows = []
          async.eachSeries(validSeries, (seriesNumber, _cb) => {
            TheoremIncomeStatementModel.findAll({
              where: {
                series_number: seriesNumber,
                period: {
                  $gte: from,
                  $lte: to
                }
              }
            }).then((incomeStatements) => {
              let row = {series_number: seriesNumber, from: from, to: to}
              let totalCheck = 0
              Object.keys(QBInvoicesMaintenanceModel.attributes).forEach((colName) => {
                if (QBInvoicesMaintenanceModel.attributes[colName].type instanceof Sequelize.DOUBLE ||
                    QBInvoicesMaintenanceModel.attributes[colName].type instanceof Sequelize.DECIMAL) {

                  row[colName] = _.reduce(incomeStatements, (sum, incomeStatement) => {
                    let value = incomeStatement[colName]
                    if (!value) {
                      return sum
                    }

                    let newVal = sum + value
                    totalCheck += newVal
                    return newVal
                  }, 0)
                  //flip the value for QuickBooks invoice
                  row[colName] = -row[colName]
                }
              })
              if (totalCheck !== 0) {
                rows.push(row)
              }
              _cb()
            })
          }, () => {
            cb(undefined, rows)
          })
        },
        (rows, cb) => {
          async.eachSeries(rows, (row, _cb) => {
            QBInvoicesMaintenanceModel.create(row).then(() => {
              console.info(`Record inserted, series_number: ${row.series_number}, from: ${from}, to: ${to}`)
              _cb()
            }).catch((ex) => {
              console.error(ex)
              console.info(`Record already exist, series_number: ${row.series_number}, from: ${from}, to: ${to}`)
              _cb()
            })
          }, () => {
            cb()
          })
        }
      ])
    }, (err) => {
      if (err) {
        return reject(err)
      }
      resolve()
    })
  }

  function sendMaintenanceFeeInvoices (){
    return new Promise((resolve, reject) => {
      QBInvoicesMaintenanceModel.findAll({
        where: {
          invoice_sent_date: null
        }
      }).then((maintenanceInvoices) => {
        async.eachSeries(maintenanceInvoices, (maintenanceInvoice, cb) => {
          if (maintenanceInvoice.invoice_sent_date) {
            console.log(`skipped invoice as it has sent - series number: ${maintenanceInvoice.series_number}, from: ${maintenanceInvoice.from}, to: ${maintenanceInvoice.to}`)
            return cb()
          }
          var options = {
            url: Configs.panelAPI.url + '/api/panel/qb/maintenance-invoice/' + maintenanceInvoice.series_number,
            headers: {
              'internal-key': Configs.panelAPI.internalKey
            },
            method: 'POST',
            json: {
              from: maintenanceInvoice.from,
              to: maintenanceInvoice.to
            }
          };
          request(options, (error, response, body) => {
            if(error) {
              console.error(error)
            }
            cb()
          })
        }, () => {
          resolve()
        })
      })
    })
  }

  this.transformReport = (data) => {
    let columns = data.Columns.Column.map((col) => {
      return col.MetaData[0].Value
    })
    if (!data.Rows.Row) {
      return []
    }
    let rows = data.Rows.Row.map((row) => {
      let transformedRow = {}
      for(let i = 0; i < row.ColData.length; i++){
        transformedRow[columns[i]] = row.ColData[i].value
      }
      return transformedRow
    })
    return rows
  }

  return this;
};
