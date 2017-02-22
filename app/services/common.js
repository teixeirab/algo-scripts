'use strict';

const  async = require('async');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const template = require('backtick-template');

module.exports = function(Configs, FileService) {
  var that = this;

  this.getMappings = function() {
    return FileService.readFile({path: Configs.mappingFilePath, sheet: 'Sheet1'})
  }

  this.getDBMappings = function(mappings, nameInfo) {
    const deferred = Promise.pending()
    const sourceMappings = _.filter(mappings, (mapping) => {
      return mapping.table === nameInfo.table
    })
    FileService.readFile(nameInfo).then((csvObject) => {
      let dbMappings = {}
      csvObject.forEach((row) => {
        let dbMapping = {}
        Object.keys(row).forEach((reportField) => {
          sourceMappings.forEach((mapping) => {
            if (mapping.report_field.replace(/_/g, '') === reportField.replace(/_/g, '')) {
              dbMapping[mapping.table] = dbMapping[mapping.table] || {}
              dbMapping[mapping.table][mapping.database_field] = row[reportField]
            }
          })
        })
        Object.keys(dbMapping).forEach((table) => {
          dbMappings[table] = dbMappings[table] || []
          dbMappings[table].push(dbMapping[table])
        })
      })
      deferred.resolve(dbMappings)
    })
    return deferred.promise
  }

  this.syncToDatabase = function(nameInfoList, modelMappings) {
    const deferred = Promise.pending()
    this
      .getMappings()
      .then((mappings) => {
        async.eachSeries(nameInfoList, (nameInfo, cb) => {
          this.getDBMappings(mappings, nameInfo).then((dbMappings) => {
            Object.keys(dbMappings).forEach((table) => {
              const model = modelMappings[table], rows = dbMappings[table]
              this.saveRows(model, rows, nameInfo).then(() => {
                cb()
              })
            })
          })
        }, (err) => {
          if(err) {
            return deferred.reject(err)
          }
          deferred.resolve()
        })
      })
    return deferred.promise
  }

  this.saveRows = function(model, rows, nameInfo) {
    const deferred = Promise.pending()
    async.eachSeries(rows, (row, cb) => {
      if (nameInfo.assignDataFn) {
        row = nameInfo.assignDataFn(row, nameInfo)
      }
      model.create(row).then((persistedObj) => {
        cb()
      }).catch((err) => {
        if (Configs.sequelizeErrorLog) {
          // console.log(err)
          if(err.errors) {
            console.error(`sequelize error: ${err.errors[0].message}  field: ${err.errors[0].path}  table: ${nameInfo.table}`)
          }else {
            console.error(err)
          }
        }
        cb()
      })
    }, () => {
      deferred.resolve()
    })
    return deferred.promise
  }

  this.getFileNameInfoList = function(path, startLine, fromDate, dateFormat, pattern, nameInfoExtractFn, assignDataFn) {
    const deferred = Promise.pending()
    let dateFormats = [], dateStrs = []
    if (!Array.isArray(dateFormat)) {
      dateFormats.push(dateFormat)
    }else {
      dateFormats = dateFormat
    }
    dateFormats.forEach((df) => {
      let dateStr = ''
      for (var m = moment(fromDate); m.diff(new Date(), 'days') <= 0; m.add(1, 'days')) {
        if (dateStr !== '') {
          dateStr += '|'
        }
        dateStr += m.format(df)
      }
      dateStrs.push(dateStr)
    })
    pattern = template(pattern, {date: dateStrs})
    FileService
      .findFiles(pattern, path)
      .then((files) => {
        let nameInfoList = files.map((path) => {
          let nameInfo = nameInfoExtractFn(path)
          if (nameInfo) {
            nameInfo.startLine = startLine
            nameInfo.assignDataFn = assignDataFn
          }
          return nameInfo
        })

        deferred.resolve(nameInfoList)
      })
    return deferred.promise
  }

  return this;
};
