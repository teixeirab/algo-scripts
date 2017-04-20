module.exports = {
  dbHost: 'localhost',
  dialect: 'sqlite',
  mappingFilePath: './tests/data/mapping.xlsx',
  sequelizeErrorLog: process.env.SEQ_ERR,
  quickbooks: {
    consumerKey:     'qyprdmo0k4zNWYg02AAuGfqaoC1mAr',
    consumerSecret:  'vY0ivLWoS88RwfZzjTSbVs661O1rtcNMIB8Q8dHq',
    token:           'qyprdcPtoNHT9JM9VT2hTmLnGLo3nuRkXl6rUO3o3IRTwxvz',
    tokenSecret:     '5AhBBXMDmKMQQYc9mWR3dm8xNIQlSj19ZYrPhsCA',
    realmId:         123145808149854,
    useSandbox:      true,
    debug:           false
  },
  // dbLogging: console.log
}
