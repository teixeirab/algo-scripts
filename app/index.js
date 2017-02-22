'use strict';

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
      describe: '',
      demand: true
    })
    .argv
  // const service = serviceMappings[argv.table]
  // if (!service) {
  //   console.error(`No data conversion service found for ${argv.table}`)
  //   process.exit(1)
  // }
};

module.exports = app;
