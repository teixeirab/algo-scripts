'use strict';

const  async = require('async');
const moment = require('moment');
const _ = require('lodash');
const fs = require('fs');
const glob = require('glob');
const csv = require('csv');
const XLSX = require('xlsx');
const split = require('split');
const through = require('through2');
const Readable = require('stream').Readable;
const Promise = require('bluebird');

module.exports = function() {
  var that = this;

  this.findFiles = function(pattern, path) {
    const deferred = Promise.pending()
    glob(path + '/' + pattern, function(err, files) {
      deferred.resolve(files)
    })
    return deferred.promise
  }

  this.extractFileListNameInfo = function(files, translationFn) {
    let nameInfoList = []
    files.forEach((path)=> {
      nameInfoList.push(translationFn(path))
    })
    return nameInfoList
  }

  this.readFile = function(nameInfo) {
    const parts = nameInfo.path.split('.')
    const deferred = Promise.pending()
    let extension = parts[parts.length - 1]
    if(extension === 'csv') {
      fs.createReadStream(nameInfo.path)
        .pipe(split(/(\r?\n)/))
        .pipe(startAt(nameInfo.startLine))
        .pipe(csv.parse({
          relax_column_count: true,
          columns: true
        }, function(err, data){
          if(err) {
            return deferred.reject(err);
          }
          deferred.resolve(data)
        }))
    }
    let workbook;
    if(extension === 'xlsx' || extension === 'xls') {
      workbook = XLSX.readFile(nameInfo.path);
      return this.xlsxToCsvObject(workbook, nameInfo)
    }
    return deferred.promise;
  };

  this.sheetToCsv = function(sheet) {
    const deferred = Promise.pending()
    let csvStr = XLSX.utils.sheet_to_csv(sheet, {raw: true});
    return csvStr;
  }

  this.csvStringToObject = function(csvStr, startLine) {
    const deferred = Promise.pending()
    let stream = new Readable
    stream.push(csvStr)
    stream.push(null)
    stream
      .pipe(split(/(\r?\n)/))
      .pipe(startAt(startLine))
      .pipe(csv.parse({
        relax_column_count: true,
        columns: true
      }, function(err, data){
        if(err) {
          return deferred.reject(err);
        }
        deferred.resolve(data)
      }))
    return deferred.promise;
  }

  this.sheetToCsvObject = function(sheet, startLine) {
    const csvStr = this.sheetToCsv(sheet)
    return this.csvStringToObject(csvStr, startLine)
  }

  this.xlsxToCsvObject = function(workbook, nameInfo) {
    const sheet = workbook.Sheets[nameInfo.sheet]
    return this.sheetToCsvObject(sheet, nameInfo.startLine)
  }

  // this.getMappings = function() {
  //   return this.readFile({
  //     path: './tests/data/mapping.xlsx',
  //     sheet: 'Sheet1'
  //   })
  // }

  return this;
};

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
