# Data Updater
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
                      
  --path, -p     Path of the data source files to search from         [required]
  --from, -f     Date, from which to search data source files, YYYY-MM-DD; If
                 not specified, it defaults to current date.
  --verbose, -v  Whether to show verbose info
```

### Config
To use the app/config/dev.js config, set the NODE_ENV environment variable to `dev`
```
export NODE_ENV=dev
```

### Example
```bash
node app -t ib_nav -p /path/to/interactive/broker/folder -f 2017-02-15
```

This will search for all the ftp files later than or equal to the date of 2017-02-15 in that folder, and try to insert into the database based on the ftp_transaction table mappings.
