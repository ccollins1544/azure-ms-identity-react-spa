global.APP_NAME = require("./package.json").name;

global.APP_AUTHOR = require("./package.json").author?.name;
global.APP_AUTHOR_EMAIL = require("./package.json").author?.email;
global.APP_DESCRIPTION = require("./package.json").description;
global.APP_VERSION = require("./package.json").version;
global.THE_YEAR = new Date().getFullYear();

const os = require('os');
global.APP_HOSTNAME = os.hostname();
global.APP_PLATFORM = os.platform();
global.APP_ARCH = os.arch();

// Save IP in memory for better performance 
global.IP = null;
global.TARGET_HOSTNAME = null;
module.exports = global;