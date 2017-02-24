var gulp = require('gulp');
var gutil = require('gulp-util');
var mocha = require('gulp-mocha');
var exit = require('gulp-exit');
var argv = require('yargs').argv;

var paths = {
    sources: [
        './app/**/*.js'
    ],
    tests: [
        './tests/specs/*.js'
    ]
}

gulp.task('enableDBLog', function() {
    process.env.DB_LOG = true;
});
gulp.task('testConfig', function() {
    process.env.NODE_ENV = 'test';
    if(argv.seqerr) {
      process.env.SEQ_ERR = true;
    }
});
gulp.task('globalConfig', function() {
    var mode = argv.mode;
    mode = mode || 'local';
    process.env.NODE_ENV = mode;
    if(argv.l){
        process.env.DB_LOG = true;
    }
});
gulp.task('setupApp', function() {
    require('./app');
});
gulp.task('runApp', function(){
    global.app.run();
});

gulp.task('test', ['testConfig', 'setupApp'], function() {
    return gulp.src(paths.tests, {
            read: false
        })
        .pipe(mocha({
            recursive: true,
            reporter: 'spec',
            timeout: 10000,
            ui: 'bdd'
        }))
        .pipe(exit())
        .on('error', gutil.log);
});

// gulp.task('watch', ['testConfig', 'setupApp'], function() {
//     gulp.watch(paths.tests.concat(paths.sources), ['test']);
// });

gulp.task('run', ['globalConfig', 'setupApp', 'runApp']);
gulp.task('syncdb', ['globalConfig', 'setupApp'], function() {
    require('./app/syncdb');
});

// gulp.task('default', ['test']);
