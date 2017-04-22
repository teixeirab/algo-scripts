module.exports = {
  dbHost: '52.24.168.127',
  dialect: 'mysql',
  db: 'flexfunds',
  user: 'root',
  password: 'flexdev',
  sequelizeErrorLog: process.env.SEQERR || false,
  quickbooks: [
    {
      account: 'teixeirabernardo',
      consumerKey:     'qyprdhiv5H9Zxx6bLPuIwFjrobwNeE',
      consumerSecret:  'Ckf5jpDoFuvjVPfprWv2c2KQxZldaZFWfLuVzVC7',
      token:           'lvprdnEEiVohWBE7NdJXINTIu5VTeDpcLnJlO7wwEM0LEJbl',
      tokenSecret:     '6WpVnqmevPY1wBYipWMtd66rKLvWfT3aPTZmi5e5',
      realmId:         193514310567037,
      useSandbox:      false,
      debug:           true
    },
    {
      account: 'teixeirabernardoflex',
      consumerKey:     'qyprd5vJ7XjrqjPFLRauDCzAYGUm0l',
      consumerSecret:  'wH1EqYHtwcJIJo8Yj4cKFuQ5osTv9eHcIadmtR6j',
      token:           'lvprdoYEoOqoV3GF7vb9Z6CXqrAO61Cr2cBnbWSeW1Vw8cLP',
      tokenSecret:     'CZrC4pieIrIBBLLXfFqP0bCxP3VDEHpxfPzneIxd',
      realmId:         403981856,
      useSandbox:      false,
      debug:           true
    }
  ]
  // quickbooks: {
  //   consumerKey: 'qyprdhiv5H9Zxx6bLPuIwFjrobwNeE',
  //   consumerSecret: 'Ckf5jpDoFuvjVPfprWv2c2KQxZldaZFWfLuVzVC7',
  //   token: 'qyprd9OBD87H2l0bn1gaECtOYG1V0yXNuEKakWSq0kRs8iWi',
  //   tokenSecret: 'Qx7UAQZGX8ienxe2hef7xn4HdJxGX90RHvEzJlP4',
  //   realmId: 403981856,
  //   useSandbox: false,
  //   debug: true
  // }
}
