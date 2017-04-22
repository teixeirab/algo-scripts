module.exports = {
  dbHost: 'localhost',
  dialect: 'sqlite',
  mappingFilePath: './tests/data/mapping.xlsx',
  sequelizeErrorLog: process.env.SEQ_ERR,
  quickbooks: [
    {
      account: 'kata.choi@gmail.com',
      consumerKey:     'qyprdmo0k4zNWYg02AAuGfqaoC1mAr',
      consumerSecret:  'vY0ivLWoS88RwfZzjTSbVs661O1rtcNMIB8Q8dHq',
      token:           'qyprdd2brFdkST5neF228WkeabLldEPBkPfusLrQQjAQmyx0',
      tokenSecret:     '06EtkSduVSqaWRvVLLQkLQcSZjFTa7ZS7hXxET4I',
      realmId:         123145808149854,
      useSandbox:      true,
      debug:           false
    }
  ],
  // dbLogging: console.log
}
