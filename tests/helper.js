var moment = require('moment');
var async = require('async');

var Helper = function() {
    this.getFactoredNavs = function(initialPrices, fromDate, toDate, ignoreDates) {
        var navs = [];
        fromDate = moment(fromDate);
        toDate = moment(toDate);

        for (var i in initialPrices) {
            var fid = initialPrices[i].fid;
            var initialPrice = initialPrices[i];
            var count = 0;
            for (var date = moment(fromDate); date <= toDate; date.add(1, 'd')) {
                var nav = {code: fid};
                var ignore = false;
                if (ignoreDates) {
                    for (var j = 0; j < ignoreDates.length; j++) {
                        if (date.diff(ignoreDates[j], 'd') === 0) {
                            ignore = true;
                            break;
                        }
                    }
                }
                if (ignore) {
                    count++;
                    continue;
                }
                nav.nav = initialPrice.value * Math.pow((1 + initialPrice.factor), count);
                nav.date = moment(date).toDate();

                navs.push(nav);
                count++;
            }
        }
        return navs;
    };
    this.getFactoredIndexPrices = function(initialPrices, fromDate, toDate, ignoreDates) {
        var navs = [];
        fromDate = moment(fromDate);
        toDate = moment(toDate);

        for (var i in initialPrices) {
            var fid = initialPrices[i].fid;
            var initialPrice = initialPrices[i];
            var count = 0;
            for (var date = moment(fromDate); date <= toDate; date.add(1, 'd')) {
                var nav = {code: fid};
                var ignore = false;
                if (ignoreDates) {
                    for (var j = 0; j < ignoreDates.length; j++) {
                        if (date.diff(ignoreDates[j], 'd') === 0) {
                            ignore = true;
                            break;
                        }
                    }
                }
                if (ignore) {
                    count++;
                    continue;
                }
                nav.ClosePrice = initialPrice.value * Math.pow((1 + initialPrice.factor), count);
                nav.date = moment(date).toDate();

                navs.push(nav);
                count++;
            }
        }
        return navs;
    };
    this.createInstances = function(type, values, callback) {
        var model = app.container.get(type);
        async.each(values, function(value, cb){
            model.create(value).then(function(){
                cb();
            });
        }, function(){
            callback();
        });
    };
    this.batchCreateInstances = function(dataList, callback) {
        var that = this;
        async.each(dataList, function(data, cb){
            that.createInstances(data[0], data[1], function(){
                cb();
            })
        }, callback);
    };
};

module.exports = new Helper();
