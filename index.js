global.rootRequire = function (name) { return require(__dirname + '/' + name); };
global.rootFolder = global.rootFolder || __dirname;
const config = require('config');
const log4js = require('./lib/ovp-log4js');
const transactionLogger = require('./lib/transactionLogger');
const log = log4js.getLogger();

module.exports = {
    trace : function(msg, req, res){
        try {
            transactionLogger.extractAndPrintBaseLogLine(msg,req,res,"TRACE");
        } catch (err){
            log.error(err)
        }
    },
    debug : function(msg, req, res){
        try {
            transactionLogger.extractAndPrintBaseLogLine(msg,req,res,"DEBUG");
        } catch (err){
            log.error(err)
        }
    },
    info : function(msg, req, res){
        try {
            transactionLogger.extractAndPrintBaseLogLine(msg,req,res,"INFO");
        } catch (err){
            log.error(err)
        }
    },
    warn : function(msg, req, res){
        try {
            transactionLogger.extractAndPrintBaseLogLine(msg,req,res,"WARN");
        } catch (err){
            log.error(err)
        }
    },
    error : function(msg, req, res){
        try {
            transactionLogger.extractAndPrintBaseLogLine(msg,req,res,"ERROR");
        } catch (err){
            log.error(err)
        }
    },
    fatal : function(msg, req, res){
        try {
            transactionLogger.extractAndPrintBaseLogLine(msg,req,res,"FATAL");
        } catch (err){
            log.error(err)
        }
    },
    start : function(msg, req){
        try {
            transactionLogger.initRequest(msg, req);
        } catch (err){
            log.error(err)
        }
    },
    end : function(msg, req, res) {
        try {
            transactionLogger.finishRequest(msg, req, res);
        } catch (err){
            log.error(err)
        }
    },
    startHttp : function (req, component, reqOpt){
        try {
            transactionLogger.startHttpRequest(req, component, reqOpt);
        } catch (err){
            log.error(err)
        }
    },
    endHttp : function (req, component, reqOpt, res, err){
        try {
            transactionLogger.endHttpRequest(req, component, reqOpt, res, err);
        } catch (err){
            log.error(err)
        }
    },
    startCron : function (req, msg){
        try {
            transactionLogger.startCronJob(req, msg);
        } catch (err){
            log.error(err)
        }
    },
    endCron : function (req, msg){
        try {
            transactionLogger.endCronJob(req, msg);
        } catch (err){
            log.error(err)
        }
    },
    startMongo : function (req, msg){
        try {
            transactionLogger.startMongoCall(req, msg);
        } catch (err){
            log.error(err)
        }
    },
    endMongo : function (req, msg){
        try {
            transactionLogger.endMongoCall(req, msg);
        } catch (err){
            log.error(err)
        }
    }
};

if (config.log.setGlobalvar){
    global[config.log.setGlobal] = module.exports;
}

module.exports.trace("ovp-log4js initiated with success!");