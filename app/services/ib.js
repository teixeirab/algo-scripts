'use strict';

var  async = require('async');
var moment = require('moment');
var _ = require('lodash');
const Promise = require('bluebird')

module.exports = function(FileService, InteractiveBrokerActivityModel) {
  var that = this;

  const modelMappings = {
    ib_activity: InteractiveBrokerActivityModel
  }

  this.extractActivityFileNameInfo = function(path) {
    const parts = path.split('/')
    let filename = parts[parts.length - 1]
    filename = filename.split('.')[0]
    const infos = filename.split('_')
    const accountId = infos[0]
    const type = infos[1]
    const date = infos[2]
    return {
      path: path,
      accountId: accountId,
      type: type,
      date: moment(date, 'YYYYMMDD').toDate()
    }
  }

  this.findActivityFiles = function(path, fromDate) {
    const deferred = Promise.pending()
    let dateStr = ''
    for (var m = moment(fromDate); m.diff(new Date(), 'days') <= 0; m.add(1, 'days')) {
      if (dateStr !== '') {
        dateStr += '|'
      }
      dateStr += m.format('YYYYMMDD')
    }
    let pattern = `*_Activity_+(${dateStr})`
    const extension = '.csv'
    FileService
      .findFiles(pattern + extension, path)
      .then((files) => {
        let nameInfoList = files.map((path) => {
          let nameInfo = this.extractActivityFileNameInfo(path)
          if (nameInfo) {
            nameInfo.startLine = 1
          }
          return nameInfo
        })

        deferred.resolve(nameInfoList)
      })
    return deferred.promise
  }

  this.update = function(nameInfoList) {
    const deferred = Promise.pending()
    FileService
      .xlsxToCsvObject('./tests/data/mapping.xlsx', 'Sheet1')
      .then((csvObject) => {
        const mappings = csvObject
        async.eachSeries(nameInfoList, (nameInfo, cb) => {
          const sourceMappings = _.filter(mappings, (mapping) => {
            return mapping.table === nameInfo.table
          })
          FileService.readFile(nameInfo.path, nameInfo.startLine).then((csvObject) => {
            let dbMappings = {}
            csvObject.forEach((row) => {
              let dbMapping = {}
              Object.keys(row).forEach((reportField) => {
                sourceMappings.forEach((mapping) => {
                  if (mapping.report_field === reportField) {
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
            console.log(dbMappings)
            Object.keys(dbMappings).forEach((table) => {
              const model = modelMappings[table]
              async.eachSeries(dbMappings[table], (row, _cb) => {
                model.create(row).then((persistedObj) => {
                  _cb()
                })
              }, cb)
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

  return this;
};
