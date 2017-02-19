var argv = require('yargs').argv;
var syncModel = argv.model;
var syncDB = argv.db;

app.summon.register('Configs', app.container.get('Configs'));
app.summon.get(syncModel);
var db = app.summon.get(syncDB);
db.sync({logging: console.log}).then(function(){
    process.exit(0);
});
