// var config;
// if(process.env.NODE_ENV === 'test'){
// 	config = require('./config/test');
// 	if(process.env.DB_LOG)
// 	config.dbLogging = console.log;
// }
// if(process.env.NODE_ENV === 'local') {
// 	config = require('./config/local');
// }
// if(process.env.NODE_ENV === 'dev'){
// 	config = require('./config/dev');
// }
// if(process.env.NODE_ENV === 'prod'){
// 	config = require('./config/prod');
// }

global.app = require('../app');
global.app.run();

process.on('uncaughtException', (err) => {
	console.error(err, err.stack);
	process.exit(1);
});
process.on('unhandledRejection', (reason) => {
	console.error(reason, reason.stack);
	process.exit(1);
});
