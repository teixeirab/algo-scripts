var async = require('async');
var assert = require('assert');
var helper = require('../helper');
var moment = require('moment');
var _ = require('lodash');

describe('service tests', function() {
  var fileService, interactiveBrokerService;
  beforeEach(function(done) {
    app.summon.resolve({}, function(FileService, InteractiveBrokerService) {
      fileService = FileService;
      interactiveBrokerService = InteractiveBrokerService
    });
    app.summon.resolve({}, function(FlexFundsDB) {
      async.parallel([
        function(cb) {
          FlexFundsDB.sync({
            logging: false,
            force: true
          }).then(function() {
            cb();
          });
        }
      ], function() {
        done();
      })
    });
  });
  describe('read data source files', function () {
    it('read csv', function (done) {
      const filePath = './tests/data/ib/U1161356_Activity_20170130.csv';
      const startLine = 1;
      fileService.readFile(filePath, startLine).then((data) => {
        assert(data[0].Type, 'D')
        assert(data[0].AccountID, 'U1161356')
        assert(data[0].TradeDate, '20170130')
        done()
      });
    });
    it('read xlsx', function (done) {
      const filePath = './tests/data/theorem/weekly_reports/2017_02_10/20170210_Series_16_Financials.xlsx';
      fileService.readFile(filePath).then((workbook) => {
        const sheetNames = Object.keys(workbook.Sheets)
        assert.equal(sheetNames[0], 'Balance Sheet')
        assert.equal(sheetNames[1], 'Income Statement')
        assert(workbook.Sheets[sheetNames[0]])
        assert(workbook.Sheets[sheetNames[1]])
        done()
      });
    });
    it('read xls', function (done) {
      const filePath = './tests/data/Pershing/Series_XX_History_02-09-2017.xls';
      fileService.readFile(filePath).then((workbook) => {
        const sheetNames = Object.keys(workbook.Sheets)
        assert.equal(sheetNames[0], 'History')
        assert(workbook.Sheets[sheetNames[0]])
        done()
      })
    });
    it('convert xls/xlsx sheet to csv, set start line, and then to json', function (done) {
      const filePath = './tests/data/Pershing/Series_XX_History_02-09-2017.xls';
      const startLine = 2
      fileService.xlsxToCsvObject(filePath, 'History', startLine).then((csvObject) => {
        assert.equal(Object.keys(csvObject[0]).length, 15)
        assert.equal(csvObject.length, 481)
        done()
      })
    });
  });
  describe('read and save to database based on mappings', function () {
    describe('interactive broker', function () {
      it('look for data files with a period later or equal than specified', function (done) {
        //extract the info from the file names
        //account_id / report type / period
        fileService
          .findFiles('*_Activity_+(20170215|20170216).csv', './tests/data/ib/')
          .then((files) => {
            const nameInfoList = fileService.extractFileListNameInfo(files, interactiveBrokerService.extractActivityFileNameInfo)
            assert.equal(nameInfoList.length, 30)
            assert.equal(nameInfoList[0].path, './tests/data/ib/U1161356_Activity_20170215.csv')
            assert.equal(nameInfoList[0].accountId, 'U1161356')
            assert.equal(nameInfoList[0].type, 'Activity')
            assert.equal(nameInfoList[0].date.toISOString(), '2017-02-14T16:00:00.000Z')
            done();
          })
      });
      describe('activity', function () {
        it('look for data files with a period later or equal than specified', function (done) {
          const path = './tests/data/ib/'
          interactiveBrokerService
            .findActivityFiles(path, '2017-02-15')
            .then((nameInfoList) => {
              assert.equal(nameInfoList.length, 30)
              assert.equal(nameInfoList[0].path, './tests/data/ib/U1161356_Activity_20170215.csv')
              assert.equal(nameInfoList[0].accountId, 'U1161356')
              assert.equal(nameInfoList[0].type, 'Activity')
              assert.equal(nameInfoList[0].date.toISOString(), '2017-02-14T16:00:00.000Z')
              done();
            })
        });
        it('find and save to database', function (done) {
          const nameInfoList = [
            {
              path: './tests/data/ib/U1891163_Activity_20170216.csv',
              accountId: 'U1891163',
              type: 'Activity',
              date: moment('2017-02-16').toDate(),
              startLine: 1,
              source: 'Interactive Brokers',
              table: 'ib_activity'
            }
          ]
          interactiveBrokerService.update(nameInfoList).then(() => {
            done();
          })
        });
      });
      it('cash report', function (done) {

        done();
      });
      it('nav', function (done) {

        done();
      });
      it('position', function (done) {

        done();
      });
    });
  });
});
