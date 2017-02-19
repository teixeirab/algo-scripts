'use strict';
var request = require("request"),
    async = require('async'),
    iconv = require('iconv-lite'),
    jsdom = require("jsdom"),
    moment = require('moment'),
    xml2js = require('xml2js'),
    parseString = xml2js.parseString,
    xmlBuilder = new xml2js.Builder(),
    _ = require('lodash'),
    fs = require("fs");

module.exports = function(Configs) {
    this.getLastDate = function(code, category, callback){
        var that =this;
        var urlObj = {
            "assetAllocationUrl": "http://jingzhi.funds.hexun.com/database/zcpz.aspx?fundcode=" + code,
            "financialIndicatorUrl": "http://jingzhi.funds.hexun.com/database/cwzb.aspx?fundcode=" + code,
            "bondPortfolioUrl": "http://jingzhi.funds.hexun.com/database/zqtz.aspx?fundcode=" + code,
            "industryInvestmentUrl": "http://jingzhi.funds.hexun.com/database/hytz.aspx?fundcode=" + code,
        };
        var options = {
            url: urlObj[category],
            encoding: null
        };
        that.scrapeRequest(options, function(err, $, window){
            if($){
                var strDate = $($("#enddate option")[0]).val();
                window.close();
                callback(undefined, strDate);
            }
            else{
                callback(err, undefined);
            }
        })
    }

    this.editDate = function(str){ //'2015-12-15'
        if(str){
            var oDate = new Date(str);
            var strMonth = oDate.getMonth() + 1;
            if(strMonth === 6 || strMonth === 9){
                return oDate.getFullYear() + '-' + strMonth + '-' + '30';
            }
            else{
                return oDate.getFullYear() + '-' + strMonth + '-' + '31';
            }
        }
        else{
            return str;
        }
    }

    this.scrapeFundAssetAllocation = function(code, date, callback){
        var that = this;
        var fundAssetAllocation = {};
        var assetAllocationUrl = "http://jingzhi.funds.hexun.com/database/zcpz.aspx?fundcode=" + code + "&&enddate=" + date;
        var financialIndicatorUrl = "http://jingzhi.funds.hexun.com/database/cwzb.aspx?fundcode=" + code + "&&enddate=" + date;
        async.waterfall([
            function(cb){
                var options = {
                    url: assetAllocationUrl,
                    encoding: null
                };
                that.scrapeRequest(options, function(err, $, window){
                    if($){
                        fundAssetAllocation.code = code;
                        fundAssetAllocation.date = that.editDate(date);
                        var htmlData = $('#fundData tr');
                        var basicData = [
                            {"name":'权益投资(股票)', 'symbol': 'equity'},
                            {"name":'固定收益投资(债券)', 'symbol': 'bond'},
                            {"name":'买入返售金融资产', 'symbol': 'inverseRepo'},
                            {"name":'银行存款和结算备付金', 'symbol': 'cash'},
                            {"name":'其他资产', 'symbol': 'other'},
                            {"name":'合计', 'symbol': 'asset'}
                        ];
                        for (var i = htmlData.length - 1; i >= 1; i--) {
                            var trName = $($(htmlData[i]).find('td')[1]).text();
                            for (var j = basicData.length - 1; j >= 0; j--) {
                                if(basicData[j].name === trName){
                                    fundAssetAllocation[basicData[j].symbol] = Number($($(htmlData[i]).find('td')[2]).text());
                                }
                            };
                        };
                        window.close();
                        cb(undefined, fundAssetAllocation);
                    }
                    else{
                        cb(err, undefined);
                    }
                })
            },
            function(fundAssetAllocation, cb){
                if(fundAssetAllocation){
                    var options = {
                        url: financialIndicatorUrl,
                        encoding: null
                    }
                    that.scrapeRequest(options, function(err, $, window){
                        if($){
                            var htmlData = $('#fundName + #fundData tr');
                            for (var i = htmlData.length - 1; i >= 0; i--) {
                                if($($(htmlData[i]).find('td')[0]).text() === '期末基金资产净值'){
                                    fundAssetAllocation.netAsset = Number($($(htmlData[i]).find('td')[1]).text());
                                }
                            };
                            window.close();
                            cb(undefined, fundAssetAllocation);
                        }
                        else{
                            cb(err, undefined);
                        }
                    })
                }
                else{
                    cb("err", undefined);
                }
            }
            ],function(err, result){
                callback(err, fundAssetAllocation);
        });
    }

    this.scrapeBondSectorBreakdown = function(code, date, callback){
        var that = this;
        var bondSectorBreakdown = {};
        var bondPortfolioUrl = 'http://jingzhi.funds.hexun.com/database/zqtz.aspx?fundcode=' + code + "&&enddate=" + date;;
        var options = {
            url: bondPortfolioUrl,
            encoding: null
        }
        that.scrapeRequest(options, function(err, $, window){
            if($){
                bondSectorBreakdown.code = code;
                bondSectorBreakdown.date = that.editDate(date);
                var htmlData = $('#fundData tr');
                var basicData = [
                    {"name":'国家债券', 'symbol': 'treasuryBond'},
                    {"name":'央行票据', 'symbol': 'centralBankNote'},
                    {"name":'金融债券', 'symbol': 'financialBond'},
                    {"name":'企业债券', 'symbol': 'corporateBond'},
                    {"name":'企业短期融资券', 'symbol': 'commercialPaper'},
                    {"name":'中期票据', 'symbol': 'medianTermNote'},
                    {"name":'可转债', 'symbol': 'convertible'},
                    {"name":'其它债券', 'symbol': 'otherBond'}
                ];
                for (var i = htmlData.length - 1; i >= 0; i--) {
                    var trName = $($(htmlData[i]).find('td')[1]).text();
                    for (var j = basicData.length - 1; j >= 0; j--) {
                        if(basicData[j].name === trName){
                            bondSectorBreakdown[basicData[j].symbol] = Number($($(htmlData[i]).find('td')[2]).text());
                        }
                    };
                };
                window.close();
                callback(undefined, bondSectorBreakdown);
            }
            else{
                callback(err, undefined);
            }
        })
    }

    this.scrapeEquitySectorBreakdown = function(code, date, callback){
        var that = this;
        var equitySectorBreakdown = {};
        var industryInvestmentUrl = 'http://jingzhi.funds.hexun.com/database/hytz.aspx?fundcode=' + code + "&&enddate=" + date;;
        var options = {
            url: industryInvestmentUrl,
            encoding: null
        }
        that.scrapeRequest(options, function(err, $, window){
            if($){
                equitySectorBreakdown.code = code;
                equitySectorBreakdown.date = that.editDate(date);
                var htmlData = $('#fundData tr');
                for (var i = htmlData.length - 2; i >= 1; i--) {
                    var trCode = $($(htmlData[i]).find('td')[0]).text();
                    equitySectorBreakdown[trCode] = Number($($(htmlData[i]).find('td')[2]).text());
                };
                window.close();
                callback(undefined, equitySectorBreakdown);
            }
            else{
                callback(err, undefined);
            }
        })
    }

    this.editPercentFromStrToDouble = function(str){
        var result;
        if(str.charAt(1) === '-'){
            return 0;
        }
        else{
            result = str.replace("%", "");
            return  Number(result);
        }
    }

    this.scrapeFeeInfo = function(code, callback){
        var that = this;
        var feeInfo = {};
        var feeInfoUrl = 'http://stock.finance.sina.com.cn/fundInfo/view/FundInfo_JJFL.php?symbol=' + code;
        console.log('scrape  fee info %s'.yellow, code);
        var options = {
            url: feeInfoUrl,
            encoding: null,
        }
        that.scrapeRequest(options, function(err, $, window){
            if($){
                var htmlData = $('#right .tableContainer table');
                var manageTable = $($(htmlData[1]).find('tbody tr')[1]).find('td');
                feeInfo.code = code;
                feeInfo.managementFee = that.editPercentFromStrToDouble($(manageTable[0]).text());
                feeInfo.custodianFee = that.editPercentFromStrToDouble($(manageTable[1]).text());
                feeInfo.serviceFee = that.editPercentFromStrToDouble($(manageTable[2]).text());
                var frontEndLoadColumns = $($($(htmlData[3]).find('tbody tr')[0]).find('td')[0]).attr('colspan');
                var loadTableTitle = $($(htmlData[3]).find('tbody tr')[1]).find('td');
                var loadTableContent = $($(htmlData[3]).find('tbody tr')[2]).find('td');
                var frontEndLoadContent = "";
                var backEndLoadContent = "";

                for (var i=0; i< loadTableTitle.length; i++) {
                    if(i<frontEndLoadColumns){
                        if($(loadTableTitle[i]).text() != '--' &&  $(loadTableTitle[i]).text().substr(0,2) != '0万'){
                            frontEndLoadContent += $(loadTableTitle[i]).text().trim() + ' ' + $(loadTableContent[i]).text().trim() + '\n';
                            //get maxfrontendload
                            if($(loadTableTitle[i]).text().charAt(0) === '0'){
                                feeInfo.maxFrontendLoad = $(loadTableTitle[i]).text().trim() + ' ' + $(loadTableContent[i]).text().trim();
                            }
                        }
                        else{
                            frontEndLoadContent = '';
                        }
                    }
                    else{
                        if($(loadTableTitle[i]).text() != '--' || $(loadTableTitle[i]).text().substr(0,2) === '0万'){
                            backEndLoadContent += $(loadTableTitle[i]).text().trim() + ' ' + $(loadTableContent[i]).text().trim() + '\n';
                            //get maxbackendload
                            if($(loadTableTitle[i]).text().charAt(0) === '0'){
                                feeInfo.maxBackendLoad = $(loadTableTitle[i]).text().trim() + ' ' + $(loadTableContent[i]).text().trim();
                            }
                        }
                        else{
                            backEndLoadContent = '';
                        }
                    }
                };

                if(!feeInfo.maxFrontendLoad){
                    feeInfo.maxFrontendLoad = '';
                }

                if(!feeInfo.maxBackendLoad){
                    feeInfo.maxBackendLoad = '';
                }

                feeInfo.frontendLoad = frontEndLoadContent;
                feeInfo.backendLoad = backEndLoadContent;


                var redemptionFeeRows = $(htmlData[4]).find('tbody tr');
                var redemptionFeeContent = "";
                var maxRedemptionFeeContent ="";
                for(var j=0; j<redemptionFeeRows.length; j++ ){
                    var redemptionFeeCell = $(redemptionFeeRows[j]).find('td');
                    for(var len=0; len < redemptionFeeCell.length; len++){
                        redemptionFeeContent +=  $(redemptionFeeCell[len]).text() + ' ';
                    }
                    redemptionFeeContent += "/n";

                    if($(redemptionFeeCell[0]).text().charAt(0) === '0'){
                        maxRedemptionFeeContent = $(redemptionFeeCell[0]).text() + ' ' + $(redemptionFeeCell[1]).text()
                    }
                }
                feeInfo.redemptionFee = redemptionFeeContent;
                feeInfo.maxRedemptionFee = maxRedemptionFeeContent;
                window.close();
                callback(undefined, feeInfo);
            }
            else{
                callback(err, undefined);
            }
        })
    }

    this.scrapeSharesChange = function(code, callback){
        var that = this;
        var sharesChanges = [];
        var sharesChangeUrl = 'http://stock.finance.sina.com.cn/fundInfo/view/FundInfo_SGSH.php?symbol=' + code;
        console.log('scrape  shares change %s'.yellow, code);
        var options = {
            url: sharesChangeUrl,
            encoding: null
        };
        var removeThousandsSeparator = function(str){
            var res =  str.replace(/,/g, "")
            return Number(res);
        }
        async.waterfall([
            function(cb){
                that.scrapeRequest(options, function(err, $, window){
                    if($){
                        var htmlData = $('#right .tableContainer tr');
                        for (var i = htmlData.length - 1; i >= 3; i--) {
                            var innerHtmlData = $(htmlData[i]).find('td');
                            var sharesChange = {};
                            sharesChange.code = code;
                            sharesChange.date = $(innerHtmlData[0]).text();
                            sharesChange.inisTotalShares = removeThousandsSeparator($(innerHtmlData[1]).text());
                            sharesChange.totalShares = removeThousandsSeparator($(innerHtmlData[2]).text());
                            sharesChange.sharesPurchased = removeThousandsSeparator($(innerHtmlData[3]).text());
                            sharesChange.sharesRedeemed = removeThousandsSeparator($(innerHtmlData[4]).text());
                            sharesChange.netSharesChange = removeThousandsSeparator($(innerHtmlData[5]).text());
                            sharesChange.percentChange = that.editPercentFromStrToDouble($(innerHtmlData[6]).text());
                            sharesChanges.push(sharesChange);
                        };
                        window.close();
                        cb(undefined, sharesChanges);
                    }
                    else{
                        cb(err, undefined);
                    }
                })
            },
            function(sharesChanges, cb){
                if(sharesChanges){
                    for (var i = sharesChanges.length - 1; i >= 1; i--) {
                        if(sharesChanges[i].date === sharesChanges[i-1].date){
                            if(sharesChanges[i-2]){
                                if(sharesChanges[i].inisTotalShares === sharesChanges[i-2].totalShares){
                                    sharesChanges.splice(i-1,1);
                                }
                                else{
                                    sharesChanges.splice(i, 1);
                                }
                            }
                            else{
                                sharesChanges.splice(i, 1);
                            }
                        }
                    };
                    cb(undefined, sharesChanges)
                }
                else{
                    cb("err", undefined);
                }
            }

        ],function(err, sharesChanges){
            callback(err, sharesChanges);
        })
    }

    this.scrapeRequest = function(options, callback){
        var jquery = fs.readFileSync("./node_modules/jquery/dist/jquery.min.js", "utf-8");
        request(options, function (error, response, body) {
            if(!error){
                var html = iconv.decode(body, 'gb2312');
                jsdom.env({
                  html: html,
                  src: [jquery],
                  encoding: null,
                  decoding: 'GBK',
                  done: function (errors, window) {
                    var $ = window.$;
                    callback(undefined, $, window);
                  }
                });
            }
            else{
                callback(error, undefined);
            }
        });
    }

    this.scrapeLatestFundAssetAllocation = function(code, callback){
        var that = this;
        var category = 'assetAllocationUrl';
        console.log('scrape latest fund asset allocation %s'.yellow, code);
        async.waterfall([
            function(cb){
                that.getLastDate(code, category, function(err, date){
                    if(!err){
                        cb(undefined, date);
                    }
                    else{
                        cb("err", undefined);
                    }
                })
            },
            function(date, cb){
                that.scrapeFundAssetAllocation(code, date, function(err, fundAssetAllocation){
                    if(fundAssetAllocation){
                        cb(undefined, fundAssetAllocation);
                    }
                    else{
                        cb("err", undefined);
                    }
                })
            }
            ],function(err, returnFundAssetAllocation){
                callback(err, returnFundAssetAllocation);
            })
    }

    this.scrapeLatestBondSectorBreakdown = function(code, callback){
        var that = this;
        var category = 'bondPortfolioUrl';
        console.log('scrape latest fund bond sector breakdown %s'.yellow, code);
        async.waterfall([
            function(cb){
                that.getLastDate(code, category, function(err, date){
                    if(!err){
                        cb(undefined, date);
                    }
                    else{
                        cb("err", undefined);
                    }
                })
            },
            function(date, cb){
                that.scrapeBondSectorBreakdown(code, date, function(err, bondSectorBreakdown){
                    if(bondSectorBreakdown){
                        cb(undefined, bondSectorBreakdown);
                    }
                    else{
                        cb("err", undefined);
                    }

                })
            }
            ],function(err, bondSectorBreakdown){
                callback(err, bondSectorBreakdown);
            })
    }

    this.scrapeLatestEquitySectorBreakdown = function(code, callback){
        var that = this;
        var category = 'industryInvestmentUrl';
        console.log('scrape latest equity sector breakdown %s'.yellow, code);
        async.waterfall([
            function(cb){
                that.getLastDate(code, category, function(err, date){
                    if(!err){
                        cb(undefined, date);
                    }
                    else{
                        cb("err", undefined);
                    }
                })
            },
            function(date, cb){
                that.scrapeEquitySectorBreakdown(code, date, function(err, equitySectorBreakdown){
                    if(equitySectorBreakdown){
                        cb(undefined, equitySectorBreakdown);
                    }
                    else{
                        cb("err", undefined);
                    }

                })
            }
            ],function(err, equitySectorBreakdown){
                callback(err, equitySectorBreakdown);
            })
    }

    this.scrapeAllPortfolios = function(callback){
        var options = {
            url: Configs.apiHost + '/allportfolios',
            headers: {
                'x-apikey': Configs.apiKey
            },
            encoding: null
        };
        request(options, function(error, response, body){
            console.log(error);
            if(!error){
                var allPortfolioStr = iconv.decode(body, 'gb2312');
                var allPortfolio = JSON.parse(allPortfolioStr);
                callback(error, allPortfolio);
            }
            else{
                callback(error, undefined);
            }
        });
    }

    this.scrapePortfolioScores = function(pid, callback){
        var getScoresurl = Configs.apiHost + '/portfolio/' + pid + '/scores';
        var options = {
            url: getScoresurl,
            headers: {
                'x-apikey': Configs.apiKey
            },
            encoding: null
        }
        request(options, function(error, response, body){
            if(!error){
                var portfolioHoldingScores;
                try {
                    portfolioHoldingScores = JSON.parse(iconv.decode(body, 'gb2312'));
                }catch(ex) {
                    return callback(ex);
                }
                delete portfolioHoldingScores.assetFactors;
                if(!portfolioHoldingScores){
                    return callback({});
                }
                if(portfolioHoldingScores && !portfolioHoldingScores.portfolio){
                    return callback({});
                }
                for (var i = portfolioHoldingScores.portfolio.portfolio_holdings.length - 1; i >= 0; i--) {
                    delete portfolioHoldingScores.portfolio.portfolio_holdings[i].fund;
                    delete portfolioHoldingScores.portfolio.target_period;
                    delete portfolioHoldingScores.portfolio.user_id;
                    delete portfolioHoldingScores.portfolio.name;
                    delete portfolioHoldingScores.portfolio.comment;
                    delete portfolioHoldingScores.portfolio.deleted;
                };
                for (var i = portfolioHoldingScores.portfolio.portfolio_holdings.length - 1; i >= 0; i--) {
                    delete portfolioHoldingScores.portfolio.portfolio_holdings[i].fund;
                };
                callback(error, portfolioHoldingScores);
            }
            else{
                callback(error, undefined);
            }
        });
    }

    this.scrapeNAVFromSina = function(funds, from, to, callback) {
        var page = 0, navs = [], goOn = true;
        var queue = async.queue(function(fund, cb) {
            var fid = fund.Code;
            var query = 'symbol=' + fid + '&datefrom=' + moment(from).format('YYYY-MM-DD') + '&dateto=' + moment(to).format('YYYY-MM-DD');
            async.doWhilst(
                function(_cb) {
                    page ++;
                    var options = {
                        url: 'http://stock.finance.sina.com.cn/fundInfo/api/openapi.php/CaihuiFundInfoService.getNav?' + query + '&page=' + page
                    };
                    request(options, function(error, response, body){
                        try{
                            var json = JSON.parse(body).result;
                            if(json) {
                                // totalCount = parseInt(json.data.total_num);
                                // some json.data.data = null.
                                // such as 000009, 000010 and so non-monetary funds on.
                                // or page * 20(or 21) >= totalCount.
                                var data = json.data.data;
                                if(data){
                                    json.data.data.forEach(function(nav){
                                        var modelValue = {code: fid, date: moment(nav.fbrq).toDate(), nav: nav.jjjz, LastUpdate: new Date()};
                                        navs.push(modelValue);
                                    });
                                }else {
                                    goOn = false;
                                }
                            }
                        }catch(ex){
                            console.error(options.url, ex);
                        }
                        _cb();
                    });
                },
                function(cb) {
                    // return page * 20 < totalCount;
                    // can not use <=, e.g. 002811, total_num 220, page 12 json.data.data = null
                    // can not use total_num, total_num 220, while 230 data in total.
                    return goOn;
                },
                function(err) {
                    cb()
                }
            )
        }, 1);
        queue.push(funds, function(){
            // console.log('finished nav load for one fund')
        });
        queue.drain = function() {
            callback(navs);
        }
    };

    this.scrapeNAVFromSinaVip = function(callback) {
        var options = {
            url: 'http://vip.stock.finance.sina.com.cn/fund_center/data/jsonp.php/I/NetValue_Service.getNetValueOpen?page=1&num=4000&sort=nav_date&asc=0&ccode=&type2=0&type3=',
            encoding: null
        };
        request(options, function(error, response, body){
            body = iconv.decode(body, 'gb2312');
            var matches = body.match(/\(\(\{.*\}\)\)/);
            var str = matches[0].replace(/\(\(/, '').replace(/\)\)/, '');
            var cleanedString = str.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2": ');
            var navobj;
            navobj = JSON.parse(cleanedString);
            var data = navobj.data.map(function(data) {
                if(data.jjlx === "货币型基金") {
                    return {Code: data.symbol, Yield: data.nav_a, Date: moment(data.nav_date).toDate()};
                }
                return {Code: data.symbol, NAV: data.per_nav, Date: moment(data.nav_date).toDate()};
            });
            callback(undefined, data);
        });
    };

    this.scrapeNAVFromEast = function(callback) {
        var options = {
            url: 'http://fund.eastmoney.com/Data/Fund_JJJZ_Data.aspx?t=1&lx=1&letter=&gsid=&text=&sort=zdf,desc&page=1,9999&dt=1471232627821&atfc=&onlySale=0',
            encoding: null
        };
        request(options, function(error, response, body){
            body = iconv.decode(body, 'utf-8');
            var matches = body.match(/\[\[.*\]\]/);
            var navobj;
            navobj = JSON.parse(matches);
            var navs = [];
            navobj.forEach(function(navobj){
                    navs.push({
                        'Code': navobj[0],
                        'NAV': navobj[3],
                        'Date': moment().toDate()
                    });
            });
            callback(undefined, navs);
        });
    };

    // scrape indexes
    this.scrapeIndexes = function(indexCode, index, from, to, callback) {
            var hsis = [],
                urlPrefix = 'https://query2.finance.yahoo.com/v8/finance/chart/%5E' + index + '?';
            var period1 = Math.round(from / 1000); //from ms directly, but it's a Date object?
            var period2 = Math.round(to / 1000);
            var query = 'formatted=true&crumb=LpIF.PpX4O%2F&lang=en-US&region=US&period1=' + period1 + '&period2=' + period2 + '&interval=1d&events=div%7Csplit&corsDomain=finance.yahoo.com';
            var url = urlPrefix + query;
            async.retry(
                {times: 5},
                function(cb, result){
                    request.get(url, {timeout: 3000}, function(err, res, body) {//It won't return err without timeout!
                        if(err) {
                            return cb(err);
                        }
                        try {
                            var json = (JSON.parse(body).chart.result)[0]; //ok
                            if (json) {
                                var timestamps = json.timestamp;
                                for (var i = 0; i < timestamps.length; i++) {
                                    var timestamp = timestamps[i];
                                    var modelValue = {
                                        code: indexCode,
                                        // here the time of date gotten is 9:30, different price at different time, but we set it to 0:00 for store
                                        date: moment(timestamp*1000).startOf('day').toDate(),//timestamp is duration with s, not ms!!!
                                        ClosePrice: null, //some null in api, pass in services.scrapers.
                                        LastUpdate: new Date()
                                    };
                                    hsis.push(modelValue);
                                }
                                var close = (json.indicators.quote)[0].close;
                                for (var i = 0; i < close.length; i++) {
                                    var closePrice = close[i];
                                    if(closePrice) {
                                        hsis[i].ClosePrice = closePrice.toFixed(2);
                                    }
                                }
                            }
                        } catch (ex) {
                            console.error(url, ex);
                        }
                        cb();
                    });
                },
                function(err, result) {
                    callback(hsis);
                });
        };

    /**
     * [scrapeFundNewIssues]
     */
    this.scrapeFundNewIssues = function(fromdate, callback){
        // var url = 'http://fund.eastmoney.com/data/FundNewIssue.aspx?t=xcln&sort=jzrgq,desc&y=&page=1,50&isbuy=1&v=0.8071509246694086';
        /* [params in url]
        t = 'xcln',//necessary, don't change
        sort = 'jzrgq,desc',//necessary, don't change. the 1st param is short for chinese spell of the column name
        clrq: order by inception.
        y = '',//no matter, can without(tested in broswer)
        page='1,50',//page 1, 50 per page.
        isbuy='1',//able to buy
        v='0.8071509246694086';//?no matter, can without.
        */
        var urlPrefix='http://fund.eastmoney.com/data/FundNewIssue.aspx?';
        var modelValues = [];
        var page = 0;
        var goOn = true;
        async.whilst(
            function(){
                return goOn;
            },function(cb){
                page++;
                var url=urlPrefix+'t=xcln&sort=clrq,desc&y=&page='+page+',50&isbuy=1';
                request(url, function (error, response, body) {//request() is async function, can not be used in while(), we need async while loop -- async.whilst.
                    if (!error && response.statusCode == 200) {
                        var dataStr = body.slice(16);
                        var dataJSONStr = dataStr.replace('datas:', '"datas":').replace('record:', '"record":').replace('pages:', '"pages":').replace('curpage:', '"curpage":');
                        var dataJSON = JSON.parse(dataJSONStr);
                        var data = dataJSON.datas;
                        for (var i = 0; i < data.length; i++) {//forEach will run over the current cycle after return.
                            /*
                            sample of item in data:
                            ['501050',==> [0]code
                            '华夏上证50AH优选指数', ==> [1]name
                            '华夏基金', ==> [2]company
                            '80000222',
                            '股票指数', ==> [4]category
                            '6.82',
                            '2016-10-27', ==> [6]inception
                            '0.80',
                            '荣膺',
                            '开放申购', ==> [9]type × we don't have a variable to show whether open, type is '开放'（开放式基金）, '封闭', or ETF.
                            '16/09/19～16/10/21',
                            '1','
                            ',
                            '华夏基金',
                            '',
                            '',
                            '4',
                            '30387787',
                            '0.60%']
                             */
                            var issue = data[i];
                            var inception = moment(issue[6]).toDate();
                            if (moment(fromdate).isAfter(moment(inception))) {
                                goOn = false;
                                return callback(modelValues);
                            }
                            var modelValue = {
                                code: issue[0],
                                name: issue[1],
                                company: issue[2],
                                category: issue[4],
                                inception: inception,
                                lastUpdate: new Date()
                            };
                            modelValues.push(modelValue);
                        }
                    } else if(error) {
                        console.log('%s'.red, error);
                    } else {
                        console.log('statusCode: %s'.yellow, response.statusCode);
                        console.log(body);
                    }
                    cb();
                });
            },function(err){
                //finish
            });
        }

    /**
     * [scrapeDataFromCSRC]
     */
    this.scrapeDataFromCSRC = function(endpoint, dataDate, fundCode, startTime, endTime, reportType, reportElements, startDate, countRequest, callback){
        // url in options
        var url = ''; //must var out of switch!
        // swtich to get url
        switch (endpoint) {
            case "getData":
                url = 'http://111.200.34.82/XBRLDSS/JJJZDataService?getData';
                break;
            case "getJJJZDataByPubTime":
                url = 'http://111.200.34.82/XBRLDSS/JJJZDataPublishService?getJJJZDataByPubTime';
                break;
            case "getReportData":
                url = 'http://111.200.34.82/XBRLDSS/ReportDataService?getReportData';
                break;
            case "getReportList":
                url = 'http://111.200.34.82/XBRLDSS/ReportListService?getReportList';
                break;
            case "getUpdatedReportList":
                url = 'http://111.200.34.82/XBRLDSS/UpdatedReportListService?getUpdatedReportList';
                break;
            default:
                break;
        }

        //headers in options
        var headers = {
            'Origin': 'http://111.200.34.82',
            'Accept-Encoding': 'gzip, deflate, br',
            'Accept-Language': 'en-US,en;q=0.8,zh-CN;q=0.6,zh;q=0.4',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36',
            'Content-Type': 'text/xml; charset=UTF-8',
            'Accept': 'application/xml, text/xml, */*; q=0.01',
            'Referer': 'http://111.200.34.82/',
            'X-Requested-With': 'XMLHttpRequest',
            'Connection': 'keep-alive',
            'SOAPAction': 'getData'
        };

        // body in options
        var bodyTemplate = '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema"><SOAP-ENV:Body><m:endpoint xmlns:m="http://xbrl.seid.com.cn/wsdl"><username>J02e8nstwl</username><password>pmI8JgtNOsg9Nibb</password>params</m:endpoint></SOAP-ENV:Body></SOAP-ENV:Envelope>';
        // JSON to xml and substring
        var paramsJSON = { //must set the JSON here, after difined params
            dataDate: dataDate,
            fundCode: fundCode,
            startTime: startTime,
            endTime: endTime,
            reportType: reportType,
            elements: reportElements,
            startDate: startDate
        };
        var paramsXml = xmlBuilder.buildObject(paramsJSON);
        // just substring
        var paramsStr = paramsXml.substring(65, paramsXml.length - 8);
        var body = bodyTemplate.replace(/endpoint/g, endpoint).replace("params", paramsStr);
        // console.log("request body: \n %s".yellow, body);

        // tag for get data in result
        var ns2 = "ns2:" + endpoint + "Response";

        // options JSON in request;
        var options = {
            url: url,
            method: 'POST',
            headers: headers,
            body: body,
            timeout: 3000
        };

        //post request with retry
        var countRetry = 0;
        async.retry({
            times: 5,
            interval: 1000
        }, function(cb_retry) {
            request(options, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    parseString(body, {
                        trim: true,
                        explicitArray: false,
                        ignoreAttrs: true
                    }, function(err, result) {
                        var dataStr = result['S:Envelope']['S:Body'][ns2].data; //here use ['S:Envelope'] to deal with XMl from soap

                        // put "" around the key, and then parse it to JSON
                        var dataJSONStr = dataStr.replace('code:', '"code":').replace('msg:', '"msg":').replace('data:', '"data":');
                        var dataJSON = JSON.parse(dataJSONStr);
                        var data = dataJSON.data;
                        if (data) {
                            callback(data);
                        }else {
                            console.log("%s fund%s retry %s".red, endpoint, countRequest, ++countRetry);
                            cb_retry(new Error());
                        }
                    });
                } else if(error) {//why ran here when the first "if" ran? sometimes..
                    console.log('%s'.red, error);
                    cb_retry(error);//sometimes VPN breakdown.
                } else {
                    console.log('statusCode: %s'.yellow, response.statusCode);
                    console.log(body);
                }
            });
        }, function(err) {
            //finish retrying.
        });
    }

    /**
    scrape reportList with CSRC API4
    keys of items in reportList: [ 'fundCode', 'reportType', 'dataDate' ].
    */
    this.scrapeReportList = function(dataDate, reportType, callback){
        this.scrapeDataFromCSRC("getReportList", dataDate, '', '', '', reportType, '', '', 0, function(reportList) {
            console.log('fetched reportList of %s funds by API:%s'.green, reportList.length, "getReportList");
            callback(reportList);
        });
    }

    /**
     * [scrapeReportData description]
     * @param  {[type]}   dataDate       [description]
     * @param  {[type]}   fundCode       [description]
     * @param  {[type]}   reportType     [description]
     * @param  {[type]}   reportElements [description]
     * @param  {[type]}   countRequest   [description]
     * @param  {Function} callback       [description]
     * @return {[type]}                  [description]
     */
    this.scrapeReportData = function(dataDate, fundCode, reportType, reportElements, countRequest, callback){
        this.scrapeDataFromCSRC("getReportData", dataDate, fundCode, '', '', reportType, reportElements, '', countRequest, function(reportData){
            var data = {};//Cannot set property \'...\' of undefined, so we have to var an object;
            var titleKeys = [];
            reportData.forEach(function(element){
                /*
                SAMPLE whole reportData:
                [ { name: 'JiJinBenQiLiRun',
                    label: '基金本期利润',
                    startDate: '20160701',
                    endDate: '20160930',
                    currency: 'iso4217:CNY',
                    value: '47102947.65' },
                  { name: 'JiJinJiaoYiDaiMa',
                    label: '基金交易代码',
                    endDate: '20160930',
                    value: '000001' },
                  ...
                  { tuple: 'BaoGaoQiMoAnGongYunJiaZhiZhanJiJinZiChanJingZhiBiLiDaXiaoPaiXuDeQianShiMingGuPiaoMingXi',
                    label: '按公允价值占基金资产净值比例大小排序的股票明细',
                    child:
                    [ { name: 'BGQMAGYJZZJJZCJZBLDXPXDQSMGMXXuHao',
                        label: '股票序号',
                        endDate: '20160930',
                        currency: 'pure',
                        value: '7' },
                        ...]}]
                all titleKeys[ 'name', 'tuple' ]
                 */

                var titleKey = Object.keys(element)[0];
                if (titleKeys.indexOf(titleKey) === -1) {
                    titleKeys.push(titleKey);
                }
                var key = element[titleKey];
                if (data[key]) {
                    data[key].push(element);
                }else{
                    data[key] = [element];
                }
            });
            callback(data);
        });
    }

    this.parseReportData = function(dataDate, fundCode, reportType, data, dataType, elementKeys, modelKeys, callback) {
        /*
         SAMPLE data:
         { JiJinJiaoYiDaiMa:
             [ { name: 'JiJinJiaoYiDaiMa',
                label: '基金交易代码',
                endDate: '20160930',
                dimension: [Object],
                value: '165525' },
                ...
            ],
           ...
           BaoGaoQiMoAnGongYunJiaZhiZhanJiJinZiChanJingZhiBiLiDaXiaoPaiXuDeQianShiMingGuPiaoMingXi:
             [ { tuple: 'BaoGaoQiMoAnGongYunJiaZhiZhanJiJinZiChanJingZhiBiLiDaXiaoPaiXuDeQianShiMingGuPiaoMingXi',
                 label: '按公允价值占基金资产净值比例大小排序的股票明细',
                 child: [Object] } ] }

         SAMPLE elementKeys:
         ['JiJinJiaoYiDaiMa',
         'BGQMJJZCZHQKQuanYiLeiTouZi',
         ...
         'BGQMJJZCZHQKHeJiZhanJiJinZongZiChanDeBiLi']

         SAMPLE modelKeys:
         ['equity','fund','fixed','metal','derivatives','resold','deposit','others','total']
         */
        var modelValues = [];
        switch (dataType) {
            /*
            data in child of tuple
             */
            case 'BaoGaoQiMoAnGongYunJiaZhiZhanJiJinZiChanJingZhiBiLiDaXiaoPaiXuDeQianShiMingGuPiaoMingXi'://tuple
                if (!data[dataType]) { //some data of top10 is null, without equity.
                    return callback();
                }
                var tupleDataRaw = data[dataType][0].child;
                var countRank = 0;

                var tupleDataSelected = [];// in whole reportData, includes many elements we don't need!
                tupleDataRaw.forEach(function(element){
                    var name = element.name;
                    if (elementKeys.indexOf(name) != -1 && element.endDate === dataDate) {
                        tupleDataSelected.push(element);
                        if (name === elementKeys[0]) {
                            countRank++;
                        }
                    }
                });
                var countInfo = elementKeys.length;
                if (tupleDataSelected.length === countRank * countInfo) { //else, the top10 has incomplete info, unable to get.
                    var tupleData = _.chunk(tupleDataSelected, countInfo);
                    // the order of 4 elements is not certain, so we must translate to JSON object.
                    tupleData.forEach(function(iterm) {
                        var modelValue = {
                            dataDate: moment(dataDate, 'YYYYMMDD').toDate(),
                            reportType: reportType,
                            lastUpdate: new Date()
                        };
                        var tupleJson = {};
                        iterm.forEach(function(element){
                            tupleJson[element.name] = element.value;
                        });
                        for (var i = 0; i < elementKeys.length; i++) {
                            modelValue[modelKeys[i]] = tupleJson[elementKeys[i]];
                        }
                        modelValues.push(modelValue);
                    });
                } else {
                    modelValues = [{
                        dataDate: moment(dataDate, 'YYYYMMDD').toDate(),
                        reportType: reportType,
                        rank: 0,
                        stockCode: '-',
                        name: '-',
                        proportion: '-',
                        lastUpdate: new Date()
                    }];
                }
                break;

            /*
            data with proportion, but sometimes needs to calc proportion with total
             */
            case 'ZhanJiJinZongZiChanDeBiLi':
            case 'ZhanJiJinZiChanJingZhiBiLi':
                var modelValue = {
                    dataDate: moment(dataDate, "YYYYMMDD").toDate(), //moment(dayString) will be 00:00:00, while new Date(dayString) will be 08:00:00.
                    reportType: reportType,
                    // defaultValue of lastDate in model is same as the value when the function run. get the date here to change with time.
                    lastUpdate: new Date()
                };

                //some fund has value but not proportion, in this case, we calculate the proportion with the total value.
                for (var i = 0; i < elementKeys.length; i++) {
                    var elementKey = elementKeys[i];
                    var modelKey = modelKeys[i];
                    var proportionKey = elementKey + dataType;
                    var total = data[elementKeys[elementKeys.length - 1]];//here data is a array of Json objects!
                    if (data[proportionKey]) {
                        modelValue[modelKey] = data[proportionKey][0].value;
                    } else if (data[elementKey] && total) {
                        // some funds have data '0'... e.g. 360005, http://fund.csrc.gov.cn/web/html_view.instance?instanceid=4028e4b757d5a4c40157e63e749f1bed
                        var total_value = [0].value;
                        if (total_value > 0) {
                            modelValue[modelKey] = round(data[elementKey][0].value / total_value, 4);
                        }
                    } else {
                        modelValue[modelKey] = '-';
                    }
                }
                modelValues.push(modelValue);
                break;
            /*
            one elementKey with duplicates
             */
            case 'JiJinJiaoYiDaiMa'://only one elementKey, just use dataType
                modelValues = [fundCode];//some have mainCode, others not. we put it at first.
                if (data[dataType]) { // can not var variable in () in js.
                    data[dataType].forEach(function(element) {
                        if (modelValues.indexOf(element.value) === -1) {
                            modelValues.push(element.value);
                        }
                    });
                }
                break;
            default:
        }
        callback(modelValues);
    }

    this.accessAccelerator = function(code, callback){
        var result;
        var options = {
            url: Configs.apiHost + '/portfolio/accelerator/' + code,
            headers: {
                'x-apikey': Configs.apiKey
            }
        };
        request(options, function(err, res, body){
            if(err){
                console.error(err, 'code#', code);
                return callback({});
            }
            var json;
            try{
                json = JSON.parse(body);
            }catch(ex){
                console.error(ex, 'code#', code);
                return callback({});
            }
            callback(undefined, json);
        })
    }

    this.getRisklevel = function(code, callback){
        var options = {
            url: Configs.apiHost + '/portfolio/getRisklevel/' + code
        };
        request(options, function(err, res, body) {
            var result;
            if(err) {
                return callback(null);
            } else {
                var res = JSON.parse(body);
                var risklevel = res.risklevel;
                var stdev = res.stdev;
                var assetFactors = res.assetFactors;
                callback(risklevel, stdev, assetFactors);
            }
        });
    }

    this.getNavFromEastMoney = function(callback) {
        var that = this;
        var url = "http://fund.eastmoney.com/fund.html#os_0;isall_1;ft_;pt_1";
        var options = {
            url: url
        };
        that.scrapeRequest(options, function(err, $, window){
            if($){
                var table = $("#oTable");
                //get date
                var thead = $(table).find("thead")[0];
                var tbody = $(table).find("tbody")[0];
                var td = $($(thead).find("tr")[0]).find("td")[5];
                var date = moment($($(td).find("span")[0]).html()).format('L');
                var today = moment().format('L');
                if(date !== today){
                    return callback(err, undefined);
                }
                //get nav
                var trs = $(tbody).find("tr");
                var result = [];
                var keys = Object.keys(trs);
                async.each(keys, function(key, cb) {
                    if(!isNaN(key)) {
                        var code = $($(trs[key]).find(".bzdm")[0]).html();
                        var value = $($(trs[key]).find(".dwjz")[0]).html();
                        if(!isNaN(value)) {
                            result.push({
                                code: code,
                                nav: parseFloat(value)
                            });
                        }
                    }
                    cb(null);
                }, function(err) {
                    callback(undefined, result);
                });
            } else {
                callback(err, undefined);
            }
        });
    }

    this.requestFundPieAPI = function(options, callback) {
        request(options, callback);
    };

    /**
     * [scrapeMmktYield]
     */
    this.scrapeMmktYield = function(fromdate, todate, subType, fids, callback){
        /*
        data web: http://jingzhi.funds.hexun.com/jz/kaifang.htm
        url: 'http://jingzhi.funds.hexun.com/jz/JsonData/HuobiJingz.aspx?callback=callbackCurTb&subtype=40&fundcompany=--%E5%85%A8%E9%83%A8%E5%9F%BA%E9%87%91%E7%AE%A1%E7%90%86%E5%85%AC%E5%8F%B8--&enddate=2016-12-07&curpage=1&pagesize=20&sortName=fundcode&sortType=up&fundisbuy=0';
        callback=callbackCurTb // callbackCurTb() in response body. without this param, callback() in response body, not matter data.
        subtype=40 //40-货币型基金，70-创新理财型基金
        fundcompany=--%E5%85%A8%E9%83%A8%E5%9F%BA%E9%87%91%E7%AE%A1%E7%90%86%E5%85%AC%E5%8F%B8--//全部基金管理公司 in UTF-8, not matter, can without
        enddate=2016-12-07
        curpage=1 // if without, default 1st page.
        pagesize=20 // if without, all data in one page.
        sortName=fundcode, sortType=up
        fundisbuy=0 // 0-all, 1-only sale。
        */
        var subtype = subType[0];
        var urlPrefix='http://jingzhi.funds.hexun.com/jz/JsonData/HuobiJingz.aspx?';
        var modelValues = [];
        var enddate = moment(todate);
        var count = 0;
        async.whilst(function(){
            return moment(fromdate).isSameOrBefore(enddate, "day");
        },function(cb_whilst){
            count ++;
            if (count % 10 === 0) {
                console.log('scraping MmktYield at: %s ...'.yellow, enddate.format("YYYY-MM-DD"));
            }
            var url=urlPrefix+'subtype='+subtype+'&enddate='+enddate.format("YYYY-MM-DD")+'&sortName=fundcode&sortType=up&fundisbuy=0';// enddate must be string! otherwise, enddate=1997 in url.
            request(url, function (error, response, body) {
                if (!error && response.statusCode == 200) {
                    /*
                    SAMPLE data:
                    callback({
                    "sum":521,
                    "today":"2016-12-07",
                    "before":"2016-12-06",
                    "cxLevelday":"2016-12-02",
                    "list":[{
                    "num":"1",
                    "fundCode":"000009",
                    "fundName":"易方达天天理财A",
                    "fundLink":"http://jingzhi.funds.hexun.com/000009.shtml",
                    "trendLink":"http://jingzhi.funds.hexun.com/database/jzzshb.aspx?fundcode=000009",
                    "baLink":"http://jijinba.hexun.com/000009,jijinba.html",
                    "tThousands":"0.6952",
                    "tDay7":"2.4670%",
                    "bThousands":"0.6774",
                    "bDay7":"2.4610%",
                    "thisyear":"2.38%",
                    "cxLevel":"★★",
                    "discount":"--",
                    "ratefee":"--",
                    "buy":"1",
                    "buyLink":"https://emall.licaike.com/fund/purchase/FirstLoad.action?fundCode=000009&knownChannel=hexun_jjjz_goumai",
                    "dtLink":"https://emall.licaike.com/fund/fundplan/InitAdd.action?fundCode=000009&knownChannel=hexun_jjjz_dinggou"}]
                })
                */
                var dataJSONStr = body.slice(9, body.length-1);
                var dataJSON = JSON.parse(dataJSONStr);
                var data = dataJSON.list;
                /*
                keys of items in data:
                ['num',
                'fundCode', ==>Code
                'fundName', 'fundLink', 'trendLink', 'baLink',
                'tThousands',==>Yield
                'tDay7', 'bThousands', 'bDay7', 'thisyear', 'cxLevel', 'discount', 'ratefee', 'buy', 'buyLink', 'dtLink']
                */
                for (var i = 0; i < data.length; i++) {
                    var item = data[i];
                    var item_yield = item.tThousands;//yield--strict mode reserved word
                    var item_fid = item.fundCode;
                    if (item_yield >0 && fids.indexOf(item_fid) != -1) {
                        var modelValue = {
                            Code: item_fid,
                            Date: enddate.startOf('day').toDate(),
                            Yield: item_yield,
                            LastUpdate: new Date()
                        }
                        modelValues.push(modelValue);
                    }
                }
                enddate = enddate.subtract(1, 'day');
                cb_whilst();
                } else if(error) {
                    console.log('%s'.red, error);
                } else {
                    console.log('statusCode: %s'.yellow, response.statusCode);
                }
            });

        },function(error){
            callback(modelValues);
        });
    };

    /**
     * [scrapeDividend]
     */
    this.scrapeDividend = function(fromdate, callback){
        /*
        data page: http://fund.eastmoney.com/data/fundfenhong.html#FSRQ,desc,1,,,
        request url: 'http://fund.eastmoney.com/Data/funddataIndex_Interface.aspx?dt=8&page=1&rank=DJR&sort=desc&gs=&ftype=&year=';
        page=1 //need to change
        dt=8,//can not change
        rank=DJR, //sort type: DJR-权益登记日，FSRQ-除息日期（we need）
        sort=desc,
        gs=, //search by company, can without
        ftype=, //search by fundType
        year= //search by year
        */
        var urlPrefix='http://fund.eastmoney.com/Data/funddataIndex_Interface.aspx?';
        var modelValues = [];
        var page = 0;
        var goOn = true;
        async.whilst(
            function(){
                return goOn;
            },function(cb){
                page++;
                var url=urlPrefix+'dt=8&page='+page+'&rank=FSRQ&sort=desc';
                console.log("%s".yellow, url);
                request(url, function (error, response, body) {//request() is async function, can not be used in while(), we need async while loop -- async.whilst.
                    if (!error && response.statusCode == 200) {
                        /*
                        SAMPLE data in body:
                        var pageinfo =[74, 100, 1];//totalPages-74; countPerPage-100; currentPage-1.
                        var jjfh_data=[["000005","嘉实增强信用定期债券","2014-12-24","2014-12-24","0.0212","2014-12-25"],
                                        ["002021","华夏回报二号混合","2014-12-23","2014-12-23","0.0275","2014-12-24"]];
                        var jjfh_jjgs=["中邮创业基金","中邮创业","中银基金"];
                        var jjfh_year=["2015","2014"];
                        var jjfh_ftype=["债券指数","债券型"];
                         */
                        var items = body.split(/=|;/);//'' can not put two conditions.
                        var dataStr = items[3];
                        var data = JSON.parse(dataStr);
                        /*
                        SAMPLE item in data:
                        [   '161820', ==> [0]code
                            '银华纯债信用债券',
                            '2016-12-13',//权益分配日
                            '2016-12-13', ==> [3]exDivDate
                            '0.039', ==> [4]dividend
                            '2016-12-15',//分红发放日
                            '1' //是否可购买
                        ]
                         */
                        for (var i = 0; i < data.length; i++) {//forEach will run over the current cycle after return.
                            var item = data[i];
                            var exDivDate = moment(item[3]).toDate();
                            if (moment(fromdate).isAfter(moment(exDivDate),"day")) {//fromdate is Date object, 08:00, just compare "day"
                                goOn = false;
                                return callback(modelValues);
                            }
                            var modelValue = {
                                Code: item[0],
                                ExDivDate: exDivDate,
                                Dividend: item[4],
                                LastUpdate: new Date()
                            };
                            modelValues.push(modelValue);
                        }
                    } else if(error) {
                        console.log('%s'.red, error);
                    } else {
                        console.log('statusCode: %s'.yellow, response.statusCode);
                        console.log(body);
                    }
                    var goOn = false;
                    cb();
                });
            },function(err){
                //finish
            });
    }

    /**
     * [scrapeCSI300]
     */
    this.scrapeCSI300 = function(dataDate, callback){
        // var url = 'http://datainterface.eastmoney.com/EM_DataCenter/JS.aspx?type=SHSZZS&sty=SHSZZS&st=0&sr=-1&p=1&ps=50&js=var%20bIPnlxMs={pages:(pc),data:[(x)]}&code=000300&rt=49389275';
        /* [params in url], type=SHSZZS, &sty=SHSZZS, // same always, not test.
        &st=0, &sr=-1 //(0,-1)==>code desc; (1,1)==>code asc.
        &p=1 //page number
        &ps=50 //count per page
        &js=var%20bIPnlxMs={pages:(pc),data:[(x)]} // the format of response(x without'()''), bIPnlxMs differs in different pages. if without, response x with '()'
        &code=000300
        &rt=49389275 //?changing with page and time? some matter when last 2 data in item. can without.
        */
        var urlPrefix='http://datainterface.eastmoney.com/EM_DataCenter/JS.aspx?';
        var modelValues = [];
        var url=urlPrefix+'type=SHSZZS&sty=SHSZZS&st=1&sr=1&p=1&ps=300&code=000300';
        request(url, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                /*
                SAMPLE body:
                (["603993,洛阳钼业,有色金属,洛阳市,0.03,1.06,3.32,168.87198699,168.87198699,3.93,509.0816164707,85.3,0.159877,000300,2016-12-14,3.91,-0.51,52075,20343314",...])
                 */
                var dataJSONStr = body.slice(1, body.length - 1);
                var data = JSON.parse(dataJSONStr);
                /*
                SAMPLE data:
                ['603993,洛阳钼业,有色金属,洛阳市,0.03,1.06,3.32,168.87198699,168.87198699,3.93,509.0816164707,85.3,0.159877,000300,2016-12-14,3.91,-0.51,52075,20343314',...]
                 */
                for (var i = 0; i < data.length; i++) {//forEach will run over the current cycle after return.
                    var issue = data[i].split(",");
                    /*
                    SAMPLE issue
                    [ '000001', ==> [0] code
                      '平安银行', ==> [1] name
                      '金融', ==> [2] industry
                      '深圳市', ==> [3] region
                      '1.09',
                      '10.38',
                      '10.41',
                      '171.70411366',
                      '146.31180387',
                      '9.42',
                      '1378.2571924554',
                      '6.48',
                      '0.860359',
                      '000300',
                      '2016-12-14',
                      '9.46',
                      '0.42',
                      '190808',
                      '180425329' ]
                     */
                    var modelValue = {
                        code: issue[0],
                        dataDate: moment(dataDate).startOf('day').toDate(),
                        name: issue[1],
                        industry: issue[2],
                        region: issue[3],
                        lastUpdate: new Date()
                    };
                    modelValues.push(modelValue);
                }
                callback(modelValues);
            } else if(error) {
                console.log('%s'.red, error);
            } else {
                console.log('statusCode: %s'.yellow, response.statusCode);
                console.log(body);
            }
        });
    }

    return this;
};

// padding number
function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

/**
 * [round: fixed number point and return a number]
 * @param  {[double and so on]} number    [description]
 * @param  {[int]} decimals [the number of decimals]
 * @return {[same as number]}          [description]
 */
function round(number, decimals) {
  return Number(Math.round(number+'e'+decimals)+'e-'+decimals);
}
