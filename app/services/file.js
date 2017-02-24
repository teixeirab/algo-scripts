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
    let extension = parts[parts.length - 1].toLowerCase()
    if(extension === 'csv') {
      const stream = this.setStartLineInStream(fs.createReadStream(nameInfo.path), nameInfo.startLine)
      return this.streamToObject(stream, nameInfo)
    }
    let workbook;
    if(extension === 'xlsx' || extension === 'xls') {
      workbook = XLSX.readFile(nameInfo.path);
      return this.xlsxToCsvObject(workbook, nameInfo)
    }
  };

  this.sheetToCsv = function(sheet) {
    const deferred = Promise.pending()
    let csvStr = XLSX.utils.sheet_to_csv(sheet, {raw: true});
    return csvStr;
  }

  this.setStartLineInStream = function(stream, startLine) {
    return stream.pipe(split(/(\r?\n)/))
                 .pipe(startAt(startLine))
  }

  const transposeFn = m => m[0].map((x,i) => m.map(x => x[i]))

  this.csvStringToObject = function(csvStr, nameInfo) {
    let stream = new Readable
    stream.push(csvStr)
    stream.push(null)
    let pipe = this.setStartLineInStream(stream, nameInfo.startLine)
    return this.streamToObject(pipe, nameInfo)
  }

  this.streamToObject = function(stream, nameInfo) {
    const deferred = Promise.pending()

    this.processCsvStream(stream, nameInfo).then((csvObject) => {
      if(nameInfo.csvPostProcessFn) {
        csvObject = nameInfo.csvPostProcessFn(csvObject)
        // console.log(csvObject)
      }
      deferred.resolve(csvObject)
    })
    return deferred.promise;
  }

  this.processCsvStream = function(stream, nameInfo) {
    const deferred = Promise.pending()
    if(!nameInfo.transpose) {
      stream.pipe(csv.parse({
        relax_column_count: true,
        columns: true
      }, function(err, data){
        if(err) {
          return deferred.reject(err);
        }
        deferred.resolve(data)
      }))
    }else {
      stream.pipe(csv.parse({
      }, function(err, data){
        if(err) {
          return deferred.reject(err);
        }
        data = transposeFn(data)
        csv.transform(data, function(row) {
          row = row.map((col) => {
            col.replace(/\\/g, "\\\\")
               .replace(/\n/g, "\\n")
            return '"' + col + '"'
          })
          return row.join(',');
        }, function(err, output) {
          output = output.join('\n')
          csv.parse(output, {
            relax_column_count: true,
            columns: true
          }, function(err, data){
            if(err) {
              return deferred.reject(err);
            }
            if(nameInfo.row > 0) {
              data = [data[nameInfo.row - 1]]
            }
            deferred.resolve(data)
          })
        })
      }))
    }
    return deferred.promise;
  }

  this.sheetToCsvObject = function(sheet, nameInfo) {
    const csvStr = this.sheetToCsv(sheet)
    return this.csvStringToObject(csvStr, nameInfo)
  }

  this.xlsxToCsvObject = function(workbook, nameInfo) {
    const sheet = workbook.Sheets[nameInfo.sheet]
    return this.sheetToCsvObject(sheet, nameInfo)
  }

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
