//Will add all durations to he whitelistKeys or if specificTimer is given - only a single timer
function addDurationWhitelistKeys(req, specificTimer){
    for (let timer in req.durations){
        if (specificTimer === undefined || timer === specificTimer ){
            let durationWhitelistKey = getComponentWhitelistKey(timer);
            req.whitelistKeys[durationWhitelistKey] = req.durations[timer].total || 0;
        }
    }
}

function startTimer(req,timer){
    if (req.durations === undefined){ req.durations = {} }
    if (req.durations[timer] === undefined){
        req.durations[timer] = {
            start: new Date().getTime()
        };
    } else req.durations[timer].start = new Date().getTime();
}

function stopTimer(req,timer){
    if (req.durations === undefined) { req.durations = {} }
    req.durations[timer].end = new Date().getTime();
    req.durations[timer].split = req.durations[timer].end - req.durations[timer].start;
    if (req.durations[timer].total !== undefined && req.durations[timer].total > 0){
        req.durations[timer].total = req.durations[timer].total + req.durations[timer].split;
    } else req.durations[timer].total = req.durations[timer].split;
}

function createFlowContext() {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (let i = 0; i < 24; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


module.exports = {
    addDurationWhitelistKeys: addDurationWhitelistKeys,
    startTimer: startTimer,
    stopTimer: stopTimer,
    createFlowContext: createFlowContext,
};


function getComponentWhitelistKey(timer) {
    timer = timer.toLowerCase();
    if (timer === "general") return "duration";
    else  return `duration${timer.charAt(0).toUpperCase()}${timer.slice(1)}`;
}