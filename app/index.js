global.app = require('../app/setup');
global.app.run();

// process.on('uncaughtException', (err) => {
// 	console.error(err, err.stack);
// 	process.exit(1);
// });
// process.on('unhandledRejection', (reason) => {
// 	console.error(reason, reason.stack);
// 	process.exit(1);
// });
