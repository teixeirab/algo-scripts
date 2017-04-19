module.exports = {
  dbHost: 'localhost',
  dialect: 'sqlite',
  mappingFilePath: './tests/data/mapping.xlsx',
  sequelizeErrorLog: process.env.SEQ_ERR,
  quickbooks: {
    consumerKey:     'qyprdmo0k4zNWYg02AAuGfqaoC1mAr',
    consumerSecret:  'vY0ivLWoS88RwfZzjTSbVs661O1rtcNMIB8Q8dHq',
    token:           'qyprd6x9yHoGAe5hAWdIZL8Nu0I5p5e0OvXYNm5nC7GKpmwO',
    tokenSecret:     'mtCoeRE42qwsQ7eT0O0lalKpnPs2R8MPVqJurZR0',
    realmId:         123145808149854,
    useSandbox:      true,
    debug:           false
  },
  // dbLogging: console.log
}
