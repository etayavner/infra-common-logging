const config = require('config');
const log4js = require('log4js');
const stackTrace = require('stack-trace');
//2019-05-01T11:42:53.582, INFO, filename=apiUtils.js:23,FCID=6HJGPT4RK84T9EVM7D0HK0MT,action=getVodPurchaseOptions,transactionType=HTTP,httpMethod=GET,url=http://127.0.0.1:52633/purchaseoptions/v1/vodPurchaseOptions?contentId=SODI2Django00001SPRPUPL10S~SODI3Django00001SPRPUPL10S,result=success,httpCode=200,durationOmbo=1,durationUpm=2,duration=3
const logPattern = config.log.pattern;

log4js.configure({
    appenders: {
        FileAppender: {
            type: 'file', // Can be switched to dateFile.
            filename: rootFolder + config.log.filename,
            pattern: config.log.file.pattern,
            maxLogSize: config.log.file.maxLogSize,
            backups: config.log.file.backups,
            daysToKeep: config.log.file.daysToKeep,
            keepFileExt: config.log.file.keepFileExt,
            alwaysIncludePattern: config.log.file.alwaysIncludePattern,
            compress: config.log.file.compress,
            layout: {
                type: 'pattern',
                pattern: logPattern,
                tokens: {
                    trace: function (){ return getTrace(stackTrace.get()) }
                }
            }
        },
        Stdout: {
            type: 'stdout',
            layout: {
                type: 'pattern',
                pattern: logPattern,
                tokens: {
                    trace: function (){ return getTrace(stackTrace.get()) }
                }
            }
        }
    },
    categories: {
        default: {
            appenders: getAppenders(),
            level: "TRACE"
        }
    }
});

function getAppenders(){
    let appenders = [];
    if (config.log.appenders.fileAppender){
        appenders.push("FileAppender");
    }
    if (config.log.appenders.stdout){
        appenders.push("Stdout");
    }
    return appenders;
}

function getTrace (trace) {
    let i,j;
    let filesTrace = [];
    for (i = 0 ; i < trace.length ; i++){
        if (trace[i].getFileName() && trace[i].getFileName().indexOf(config.server.name) >= 0) {
            // console.log(`index=${i} ${trace[i].getFileName()} + ${trace[i].getFunctionName()} + ${trace[i].getLineNumber()}`);
            filesTrace.push(trace[i]);
        }
    }
    for (i = 0 ; i < filesTrace.length ; i++) {
        if (filesTrace[i].getFileName().indexOf('transactionLogger') >= 0) {
            // console.log(`index=${i} ${filesTrace[i].getFileName()} + ${filesTrace[i].getFunctionName()} + ${filesTrace[i].getLineNumber()}`);
            j = i+2;
        }
    }
    if (!j) {
        return `undefined`
    }
    if (filesTrace[j] === undefined) {
        j = j-1; // Special case - when we print log from the transactionLogger
    }
    let path = filesTrace[j].getFileName().split(/[/\\$]/);
    let filename = path[path.length -1];
    let line = filesTrace[j].getLineNumber();
    return `${filename}:${line}`;
}

module.exports = log4js;