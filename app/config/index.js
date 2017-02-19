'use strict';

module.exports = function() {
  let config;
  if(process.env.NODE_ENV === 'test'){
  	config = require('./test');
  	if(process.env.DB_LOG)
  	config.dbLogging = console.log;
  }
  if(process.env.NODE_ENV === 'local') {
  	config = require('./local');
  }
  if(process.env.NODE_ENV === 'dev'){
  	config = require('./dev');
  }
  if(process.env.NODE_ENV === 'prod'){
  	config = require('./prod');
  }
  return config;
};
