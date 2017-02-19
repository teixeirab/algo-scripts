var moment = require('moment');

var utils = function() {
    var Errors = require('../error');
    this.normalizeDateString = function(date) {
        return moment(date).endOf('d').toISOString();
    };
    //trick to make all nested sequelize obj
    this.daoToJSON = function(instance) {
        return JSON.parse(JSON.stringify(instance));
    };
    this.mergeDao = function(froms, tos, mapKeys, as) {
        var fromKey = mapKeys[0];
        var toKey = mapKeys[1];
        tos.forEach(function(to){
            froms.forEach(function(from){
                if(to[toKey] === from[fromKey]){
                    if(!to.setDataValue){
                        to[as] = from;
                        return;
                    }
                    to.setDataValue(as, from);
                }
            });
        });
    };
    this.getError = function(code) {
        return {code: code, msg: Errors[code]};
    };

    this.getFirstDateString = function(dates) {
        return dates.sort(function(a, b) {
            return new Date(a) - new Date(b);
        })[0];
    };

    this.getLastDateString = function(dates) {
        return dates.sort(function(a, b) {
            return new Date(b) - new Date(a);
        })[0];
    };
};
module.exports = new utils();