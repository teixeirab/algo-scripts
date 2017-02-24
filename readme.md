# FlexFunds Data Updater
A command line tool to search data source files and sync them into database based on mappings.

## Install
After clone this repo, run command below to install all necessary packages

```bash
npm install
```

## How to use
To show the command tool's usage:

```bash
node app
```

It should show the usage tips as below:
```
Options:
  --target, -t   Data source target to update. Available targets:
                 pershing_trades
                 pershing_positions
                 theorem_in.come_statement_monthly
                 theorem_balance_sheet_monthly
                 theorem_balance_sheet_weekly
                 theorem_income_statement_weekly
                 ib_positions
                 ib_nav
                 ib_cash_report
                 ib_activity
                 citi_all_transactions
                 citi_unsettled_transactions
                 citi_fixed_income_settled_position
                 citi_available_position                              [required]
  --path, -p     Path of the data source files to search from         [required]
  --from, -f     Date, from which to search data source files, YYYY-MM-DD; If
                 not specified, it defaults to current date.
  --verbose, -v  Whether to show verbose info
```

Example:
```bash
node app -t ib_nav -p /path/to/interactive/broker/folder -f 2017-02-15
```

This will search for all the ftp files later or equal than the date of 2017-02-15 in that folder, and try to insert into the database based on the ftp_transaction table mappings.
