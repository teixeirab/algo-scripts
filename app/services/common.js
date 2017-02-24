'use strict';

const  async = require('async');
const moment = require('moment');
const _ = require('lodash');
const Promise = require('bluebird');
const template = require('backtick-template');

module.exports = function(Configs, utils, FileService, FtpTranslationModel) {
  var that = this;

  this.getMappings = function() {
    if (process.env.NODE_ENV === 'test') {
      return FileService.readFile({path: Configs.mappingFilePath, sheet: 'Sheet1'})
    }
    return FtpTranslationModel.findAll()
  }

  this.getDBMappings = function(mappings, nameInfo) {
    const deferred = Promise.pending()
    if (!nameInfo.path) {
      return deferred.reject({msg: 'undefined path in nameInfo'})
    }
    const sourceMappings = _.filter(mappings, (mapping) => {
      return mapping.table === nameInfo.table
    })
    FileService.readFile(nameInfo).then((csvObject) => {
      let dbMappings = {}, matched = false
      if(!csvObject || csvObject.length === 0) {
        return deferred.reject({msg: `no records parsed from file: ${nameInfo.path}`})
      }
      csvObject.forEach((row) => {
        let dbMapping = {}
        Object.keys(row).forEach((reportField) => {
          sourceMappings.forEach((mapping) => {
            if (mapping.report_field.replace(/_/g, '').toLowerCase() === reportField.replace(/_/g, '').toLowerCase()) {
              matched = true
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
      if (!matched) {
        return deferred.reject({msg: `no matched fields from the mappings, file: ${nameInfo.path}`})
      }
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
              if(nameInfo.saveRowsFn) {
                nameInfo.saveRowsFn(model, rows, nameInfo).then(() => {
                  cb()
                })
                return
              }
              this.saveRows(model, rows, nameInfo).then((stats) => {
                console.info(`table: ${table}, file: ${nameInfo.path}, added records: ${stats.added}, skip: ${stats.skip}`)
                cb()
              })
            })
          }).catch((err) => {
            console.log(err)
            if (Configs.sequelizeErrorLog) {
              if(err) {
                console.error(err.msg)
              }else {
                console.error(err)
              }
            }
            cb()
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
    let stats = {
      added: 0,
      skip: 0
    }
    async.eachSeries(rows, (row, cb) => {
      if (nameInfo.assignDataFn) {
        row = nameInfo.assignDataFn(row, nameInfo)
      }
      model.create(row).then((persistedObj) => {
        stats.added ++
        cb()
      }).catch((err) => {
        utils.logError(err, nameInfo)
        stats.skip ++
        cb()
      })
    }, () => {
      deferred.resolve(stats)
    })
    return deferred.promise
  }

  this.getFileNameInfoList = function(path, startLine, fromDate, dateFormat, pattern, nameInfoExtractFn, assignDataFn, saveRowsFn, csvPostProcessFn) {
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
            nameInfo.saveRowsFn = saveRowsFn
            nameInfo.csvPostProcessFn = csvPostProcessFn
          }
          return nameInfo
        })

        deferred.resolve(nameInfoList)
      })
    return deferred.promise
  }

  return this;
};
