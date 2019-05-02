const config = require('config');
const fs = require('fs');
const log4js = require('./ovp-log4js');
const utils = require('./utils');
const KEY_SPLITTER = config.log.KEY_SPLITTER;
const VALUE_SPLITTER = config.log.VALUE_SPLITTER;
const FATAL = 6, ERROR = 5, WARN = 4, INFO = 3, DEBUG = 2, TRACE = 1;
const log4jsPropertiesFilePath = `${rootFolder}/${config.log["log4js-properties"].path}`;
const log = log4js.getLogger();

try {
    const WhitelistKeys = rootRequire(config.log.whitelistKeys);
} catch (err) {
    log.warn(`Error loading ${rootFolder}/${config.log.whitelistKeys} - using default`);
    const WhitelistKeys = require('./datamodel/WhitelistKeys')
}


let log4jsProperties = JSON.parse(fs.readFileSync(log4jsPropertiesFilePath, 'utf8'));

/*****************************
 *     MAIN HTTP CALLING     *
 *****************************/

function initRequest(msg, req) {
    req.fcid = req.fcid || utils.createFlowContext();
    req.uri = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    utils.startTimer(req,"general");

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.requestApi.init; //TRACE
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.msg = msg;
        req.whitelistKeys.action = req.action;
        req.whitelistKeys.transactionType = "HTTP";
        req.whitelistKeys.url = req.uri;
        req.whitelistKeys.httpMethod = req.method;
        req.whitelistKeys.ipSrc = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        req.whitelistKeys.portSrc = req.connection.remotePort;
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }

    //Print TRACE requestHttpBody
    configLogLevel =  log4jsProperties.requestApi.requestBody;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.requestHttpBody = JSON.stringify(req.body) || "";
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }
}

function finishRequest(msg, req, res) {
    utils.stopTimer(req,"general");

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.requestApi.finish;
    if (res.statusCode > 300){ configLogLevel = "ERROR"; }

    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.msg = msg;
        req.whitelistKeys.httpMethod = req.method;
        req.whitelistKeys.action = req.action;
        req.whitelistKeys.transactionType = "HTTP";
        req.whitelistKeys.url = req.uri;
        req.whitelistKeys.result = res.statusCode < 300 ? "success" : "failure";
        req.whitelistKeys.httpCode = res.statusCode;
        utils.addDurationWhitelistKeys(req);
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }

    configLogLevel = log4jsProperties.requestApi.responseBody;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.responseBody = JSON.stringify(res.body) || "";
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }
}

/*****************************
 *     HTTP OUT CALLING      *
 ****************************/

function startHttpRequest(req, component, reqOpt) {
    utils.startTimer(req,component);

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.httpCalls.start;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.transactionType = "HTTP";
        req.whitelistKeys.msg = `About to send request to ${component}`;
        req.whitelistKeys.httpMethod = reqOpt.method;
        req.whitelistKeys.url = `${reqOpt.hostname}:${reqOpt.port}${reqOpt.path}`;
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }

    configLogLevel =  log4jsProperties.httpCalls.requestBody;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.requestHttpBody = JSON.stringify(reqOpt.body);
        if (req.whitelistKeys.requestHttpBody === null || req.whitelistKeys.requestHttpBody === "null"){
            req.whitelistKeys.requestHttpBody = "{}"
        }
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }
}

function endHttpRequest(req, component, reqOpt, res, err) {
    utils.stopTimer(req,component);

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.httpCalls.end;
    if (err || res.statusCode >= 500){
        configLogLevel = "ERROR";
    }
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.httpMethod = req.method;
        req.whitelistKeys.transactionType = "HTTP";
        req.whitelistKeys.url = `${reqOpt.hostname}:${reqOpt.port}${reqOpt.path}`;
        utils.addDurationWhitelistKeys(req,component);
        if (err){
            req.whitelistKeys.msg = `Error sending request to ${component}: ${err.message}`;
        } else {
            req.whitelistKeys.httpCode = res.statusCode;
        }
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }


    configLogLevel =  req.transactionLogLevel || log4jsProperties.httpCalls.responseBody;
    if (shouldPrintLog(configLogLevel)){
        if (shouldPrintLog(configLogLevel) && res !== null){
            req.whitelistKeys = new WhitelistKeys();
            req.whitelistKeys.FCID = req.fcid;
            req.whitelistKeys.responseBody = res.responseBody || "";
            createAndPrintLogLine(req.whitelistKeys, configLogLevel);
        }
    }

}

/**********************
 *     CRON JOB       *
 *********************/

function startCronJob(msg, req) {
    req.fcid = utils.createFlowContext();
    utils.startTimer(req,"general");

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.cronJobs.start;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.msg = msg;
        req.whitelistKeys.action = req.action;
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }
}

function endCronJob(msg, req) {
    utils.stopTimer(req,"general");

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.cronJobs.end;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.msg = msg;
        utils.addDurationWhitelistKeys(req);
        createAndPrintLogLine(req.whitelistKeys, configLogLevel);
    }
}

/**********************
 *     MONGO JOB      *
 *********************/

function startMongoCall(req, msg) {
    utils.startTimer(req,"MONGO");

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.mongo.start;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.msg = msg;
        createAndPrintLogLine(req.whitelistKeys,configLogLevel);
    }
}

function endMongoCall(req, msg) {
    utils.stopTimer(req,"MONGO");

    let configLogLevel =  req.transactionLogLevel || log4jsProperties.mongo.end;
    if (shouldPrintLog(configLogLevel)){
        req.whitelistKeys = new WhitelistKeys();
        req.whitelistKeys.FCID = req.fcid;
        req.whitelistKeys.msg = msg;
        utils.addDurationWhitelistKeys(req,"MONGO");
        createAndPrintLogLine(req.whitelistKeys,configLogLevel);
    }
}


/*****************************
 *    GENERAL  FUNCTIONS     *
 *****************************/

function createAndPrintLogLine(WhitelistKeys,level) {
    let line = "";
    for (let key in WhitelistKeys){
        if (WhitelistKeys[key] && WhitelistKeys[key] !== ""){
            if (line.length > 0){
                line = line.concat(KEY_SPLITTER);
            }
            if (key === "msg"){
                line = line.concat(`${key}${VALUE_SPLITTER}"${WhitelistKeys[key]}"`)
            } else line = line.concat(`${key}${VALUE_SPLITTER}${WhitelistKeys[key]}`)
        }
    }
    printLine(line,level)
}

function extractAndPrintBaseLogLine(msg,req,res,level){
    if (shouldPrintLog(level)){
        let line = '';
        if (req && req.fcid !== undefined){
            line = line.concat(`FCID${VALUE_SPLITTER}${req.fcid}`)
        }
        if (line.length > 0){
            line = line.concat(KEY_SPLITTER)
        }
        if (msg && msg.length > 0){
            line = line.concat(`msg${VALUE_SPLITTER}"${msg}"`)
        }
        printLine(line,level);
    }
}

function shouldPrintLog(configLogLevel){
    let baseLogInt = getSeverityLevel(log4jsProperties.level);
    let configLogInt = getSeverityLevel(configLogLevel);
    return baseLogInt <= configLogInt;

    function getSeverityLevel(severity){
        switch (severity.toUpperCase()) {
            case "FATAL": return FATAL; // 6
            case "ERROR": return ERROR; // 5
            case "WARN": return WARN;   // 4
            case "INFO": return INFO;   // 3
            case "DEBUG": return DEBUG; // 2
            case "TRACE": return TRACE; // 1
            default: return null;
        }
    }
}

function printLine(line, level) {
    if (line !== undefined && line.length > 0) {
        switch (level.toLowerCase()) {
            case 'info': log.info(line); break;
            case 'debug': log.debug(line); break;
            case 'error': log.error(line); break;
            case 'trace': log.trace(line); break;
            case 'warn': log.warn(line); break;
        }
    }
}

module.exports = {
    initRequest: initRequest,
    finishRequest: finishRequest,
    startHttpRequest: startHttpRequest,
    endHttpRequest: endHttpRequest,
    startCronJob: startCronJob,
    endCronJob: endCronJob,
    startMongoCall: startMongoCall,
    endMongoCall: endMongoCall,
    extractAndPrintBaseLogLine: extractAndPrintBaseLogLine,
};


/*************************
 *     Monitor TASK      *
 ************************/

function monitorLog4jsPropertiesFile() {
    let fsWait = false;
    fs.watch(log4jsPropertiesFilePath, async (event, filename) => {
        if ((event !== "change" || fsWait) && filename) return;
        fsWait = true;
        await new Promise(resolve=>{
            setTimeout(resolve,config.log["log4js-properties"].refreshInterval)
        });
        try {
            log4jsProperties = JSON.parse(fs.readFileSync(log4jsPropertiesFilePath, 'utf8'));
            extractAndPrintBaseLogLine(`log4js-properties was changed and successfully reloaded!`, undefined, undefined, "INFO");
        } catch (err) {
            extractAndPrintBaseLogLine(`log4js-properties was changed and could not be reloaded: ${err.message}`, undefined, undefined, "ERROR");
        } finally {
            fsWait = false;
        }
    });
}

monitorLog4jsPropertiesFile();