/**
 * @constructor
 * This will order the keys list in the print of a log line
 * Keys that are not included here will be randomly set at the line
 */
var WhitelistKeys = function () {
    this.FCID = "";
    this.action = "";
    this.householdId = "";
    this.transactionType = "";
    this.ipSrc = "";
    this.portSrc = "";
    this.httpMethod = "";
    this.url = "";
    this.msg = "";
    this.requestHttpBody = "";
    this.responseBody = "";
    this.result = "";
    this.httpCode = "";
    this.offerId = "";
    this.serviceId = "";
    this.durationOmbo = "";
    this.durationPds = "";
    this.durationApc = "";
    this.durationHep = "";
    this.durationAuthz = "";
    this.durationCoupon = "";
    this.durationOperateoffers = "";
    this.durationUpm = "";
    this.durationChannellineup = "";
    this.durationRs = "";
    this.durationEvergent = "";
    this.durationMongo = "";
    this.duration = "";
};
module.exports = WhitelistKeys;