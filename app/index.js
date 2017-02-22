'use strict';
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
  'ib_activity': 'InteractiveBrokerService'
}

app.run = function() {
  if(process.env.NODE_ENV === 'test') {
    return
  }
  const argv = require('yargs')
    .option('table', {
      alias: 't',
      describe: 'mysql table to update',
      demand: true
    })
    .option('path', {
      alias: 'p',
      describe: 'path of the data source files',
      demand: true
    })
    .option('from', {
      alias: 'f',
      describe: 'date, from which to search data source files, YYYY-MM-DD; If not specified, it defaults to current date.'
    })
    .argv

  let table = argv.table, path = argv.path, fromDate = argv.from || moment().format('YYYY-MM-DD')
  const serviceName = serviceMappings[table]
  if (!serviceName) {
    console.error(`No data conversion service found for ${table}`)
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
    if(path[path.length - 1] !== '/') {
      path += '/'
    }
    path = pt.resolve(path)
    const service = app.summon.get(serviceName)
    console.info('Find data source files and sync with the database...')
    console.info(`Table: ${table}, Path: ${path}, Since: ${fromDate}`)
    service.findAndSync(table, path, fromDate).then(() => {
      console.info('DONE')
      process.exit(0)
    })
  });
};

module.exports = app;
