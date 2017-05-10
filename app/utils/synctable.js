var argv = require('yargs').argv;
var syncModel = argv.model;
var syncDB = argv.db;
const app = require('../setup')
app.summon.get(syncModel);
var db = app.summon.get(syncDB);
db.sync({logging: console.log}).then(function(){
    process.exit(0);
});
