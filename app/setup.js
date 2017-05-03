'use strict';
require('colors')
const fs = require('fs')
const pt = require('path')
const moment = require('moment')
const dependConfigs = require('./depend.json')
const summon = require('summonjs')({
  configs: dependConfigs
})
let app = { summon }

const serviceMappings = {
  'pershing_trades': 'PershingService',
  'pershing_positions': 'PershingService',
  'theorem_income_statement_monthly': 'TheoremService',
  'theorem_balance_sheet_monthly': 'TheoremService',
  'theorem_balance_sheet_weekly': 'TheoremService',
  'theorem_income_statement_weekly': 'TheoremService',
  'ib_positions': 'InteractiveBrokerService',
  'ib_nav': 'InteractiveBrokerService',
  'ib_cash_report': 'InteractiveBrokerService',
  'ib_activity': 'InteractiveBrokerService',
  'citi_all_transactions': 'CitiService',
  'citi_unsettled_transactions': 'CitiService',
  'citi_fixed_income_settled_position': 'CitiService',
  'citi_available_position': 'CitiService',
  'citi_cash_balances': 'CitiService',
  'citi_positions_valuations': 'CitiService',
  'qb_transaction_list': 'QuickBookService',
  'qb_account_list': 'QuickBookService',
  'qb_class': 'QuickBookService',
  'qb_item': 'QuickBookService',
  'qb_customer': 'QuickBookService',
  'qb_account': 'QuickBookService',
  'qb_general_ledger': 'QuickBookService'
}

app.run = function() {
  if(process.env.NODE_ENV === 'test') {
    return
  }
  const argv = require('yargs')
    .option('target', {
      alias: 't',
      describe: 'Data source target to update. Available targets:\n ' + Object.keys(serviceMappings).map((table) => {return table}).join('\n'),
      demand: true
    })
    .option('path', {
      alias: 'p',
      describe: 'Path of the data source files to search from',
      demand: true
    })
    .option('from', {
      alias: 'f',
      describe: 'Date, from which to search data source files, YYYY-MM-DD; If not specified, it defaults to current date.'
    })
    .option('verbose', {
      alias: 'v',
      describe: 'Whether to show verbose info'
    })
    .argv

  let target = argv.target,
      path = argv.path,
      fromDate = argv.from || moment().format('YYYY-MM-DD'),
      verbose = argv.verbose

  const serviceName = serviceMappings[target]
  if (!serviceName) {
    console.error(`No data conversion service found for ${target}`)
    process.exit(1)
  }
  fs.stat(path, function (err, stats){
    if (err) {
      console.error('Folder doesn\'t exist');
      return
    }
    if (!stats.isDirectory()) {
      console.error('The path is not a directory!')
      return
    }
    if (path[path.length - 1] !== '/') {
      path += '/'
    }
    if (verbose) {
      process.env.SEQERR = true
    }
    path = pt.resolve(path)
    const service = app.summon.get(serviceName)
    console.info('Find data source files and sync with the database...')
    console.info(`Table: ${target}, Path: ${path}, Since: ${fromDate}`)
    service.findAndSync(target, path, fromDate).then(() => {
      console.info('DONE')
      process.exit(0)
    })
  });
};

module.exports = app;
