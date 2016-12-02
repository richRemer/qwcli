module.exports = require("./lib/cli");
module.exports.head = require("./lib/sentinel").head;
module.exports.lead = require("./lib/sentinel").lead;
module.exports.rest = require("./lib/sentinel").rest;
module.exports.State = require("./lib/state");
module.exports.ParseError = require("./lib/parse-error");
module.exports.Interface = require("./lib/interface");

