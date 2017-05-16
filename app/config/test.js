module.exports = {
  dbHost: 'localhost',
  dialect: 'sqlite',
  mappingFilePath: './tests/data/mapping.xlsx',
  sequelizeErrorLog: process.env.SEQ_ERR,
  quickbooks: [
    // {
    //   account: 'kata.choi@gmail.com',
    //   consumerKey:     'qyprdmo0k4zNWYg02AAuGfqaoC1mAr',
    //   consumerSecret:  'vY0ivLWoS88RwfZzjTSbVs661O1rtcNMIB8Q8dHq',
    //   token:           'qyprdd2brFdkST5neF228WkeabLldEPBkPfusLrQQjAQmyx0',
    //   tokenSecret:     '06EtkSduVSqaWRvVLLQkLQcSZjFTa7ZS7hXxET4I',
    //   realmId:         123145808149854,
    //   useSandbox:      true,
    //   debug:           false
    // }
    // {
    //   account: 'teixeirabernardo',
    //   consumerKey:     'qyprdhiv5H9Zxx6bLPuIwFjrobwNeE',
    //   consumerSecret:  'Ckf5jpDoFuvjVPfprWv2c2KQxZldaZFWfLuVzVC7',
    //   token:           'lvprdnEEiVohWBE7NdJXINTIu5VTeDpcLnJlO7wwEM0LEJbl',
    //   tokenSecret:     '6WpVnqmevPY1wBYipWMtd66rKLvWfT3aPTZmi5e5',
    //   realmId:         193514310567037,
    //   useSandbox:      false,
    //   debug:           false
    // },
    // {
    //   account: 'teixeirabernardoflex',
    //   consumerKey:     'qyprd5vJ7XjrqjPFLRauDCzAYGUm0l',
    //   consumerSecret:  'wH1EqYHtwcJIJo8Yj4cKFuQ5osTv9eHcIadmtR6j',
    //   token:           'lvprdoYEoOqoV3GF7vb9Z6CXqrAO61Cr2cBnbWSeW1Vw8cLP',
    //   tokenSecret:     'CZrC4pieIrIBBLLXfFqP0bCxP3VDEHpxfPzneIxd',
    //   realmId:         403981856,
    //   useSandbox:      false,
    //   debug:           false
    // }
  ],
  // dbLogging: console.log
}
