process.env.DOTENV_LOADED || require("dotenv").config();
typeof APP_NAME === 'undefined' && require("./globals");
require("colors");
const path = require('path');
const scriptName = path.basename(__filename).split('.').slice(0, -1).join('.');
// eslint-disable-next-line no-undef
const debug = require('debug')(APP_NAME + ':scripts/tests/' + scriptName.brightWhite);
const moment = require('moment-timezone');
const { sendMail } = require("./utils/emailFn");

// Globals 
let PARAMS = {
  dryRun: false,
  toEmail: "chris@ccollins.io",
  htmlTable: [{
    a: "1",
    b: "2",
    c: "3",
    date: moment().format("MMMM D, YYYY hh:mm:ss A"),
  }],
};

(async (args) => {
  debug(`*-*-*-*-*-*-*-*-*-*[ ${scriptName} args ]-*-*-*-*-*-*-*-*-*-*-*`.yellow);
  debug(args);
  let response = await sendMail(args);
  let exit_code = 0; // Ok
  // eslint-disable-next-line no-mixed-operators
  if (!response || response.rejected && response.rejected.length > 0 || response.accepted && response.accepted.length === 0 || !response?.accepted) {
    exit_code = 1;
  }
  return process.exit(exit_code);
})(PARAMS);
