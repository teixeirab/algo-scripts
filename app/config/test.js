module.exports = {
  dbHost: 'localhost',
  dialect: 'sqlite',
  mappingFilePath: './tests/data/mapping.xlsx',
  sequelizeErrorLog: process.env.SEQ_ERR
  // dbLogging: console.log
}
