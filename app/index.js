'use strict';

const argv = require('yargs').argv
const moment = require('moment')
const _ = require('lodash')
const glob = require("glob")
const csv = require('csv')
const XLSX = require('xlsx')
const fs = require('fs')
var split = require('split');
var through = require('through2');
const dependConfigs = require('./depend.json')
let app = {}
const summon = require('summonjs')({
    configs: dependConfigs
})

app.summon = summon

function startAt (nthLine) {
  var i = 0;
  nthLine = nthLine || 0;
  var stream = through(function (chunk, enc, next) {
    if (i>=nthLine) this.push(chunk);
    if (chunk.toString().match(/(\r?\n)/)) i++;
    next();
  })
  return stream;
}

function readFile (filePath, callback) {
  var parts = filePath.split('.')
  let extension = parts[parts.length - 1]
  if(extension === 'csv') {
    fs.createReadStream(filePath)
      .pipe(split(/(\r?\n)/))
      .pipe(startAt(1))
      .pipe(csv.parse({
        relax_column_count: true,
        // relax: 2,
        columns: true,
        // from: 1
      }, function(err, data){
        callback(err, data);
      }))
  }
  let workbook;
  console.log(extension)
  if(extension === 'xlsx' || extension === 'xls') {
    console.log('test')
    workbook = XLSX.readFile(filePath);
    callback(undefined, workbook);
  }
}

function getMappings (callback) {
  const filePath = './data/mapping.xlsx'
  readFile(filePath, (err, data) => {
    callback(err, data)
  })
}

app.run = function() {
  var fileName = argv.fileName
  var filePath = argv.filePath
  var ScraperService = app.summon.get('ScraperService')
  glob('./tests/data/ib/*_Activity_*.csv', function(err, files) {
    readFile(files[files.length - 1], (err, data) => {
      getMappings((err, data) => {
        let result = XLSX.utils.sheet_to_csv(data.Sheets['Sheet1'], {raw: true});
        console.log(err, result)
      })
    })
    // const XLSX = require('xlsx');
    // let workbook = XLSX.readFile(files[files.length - 1]);
    // console.log(workbook)
  })

  // if(argv.updater){
  //     if(argv.updater === 'fundAssetAllocation'){
  //         ScraperService.updateFundAssetAllocation()
  //     }
  // }
};

module.exports = app;
