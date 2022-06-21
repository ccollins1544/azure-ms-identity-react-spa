/**
 * ===============[ TABLE OF CONTENTS ]=====================
 * A. Initialize
 *   A.1 Libraries
 *   A.2 Library Functions
 *   A.3 Globals
 * 
 * B. Main Functions 
 *   B.1 sendMail
 * 
 * Documentation:
 * https://nodemailer.com/dkim/
 * 
 * ***********************************************************/
// =========================[ A. Initialize ]====================================
/* eslint-disable no-mixed-operators */
// A.1 Libraries
// eslint-disable-next-line no-undef
APP_NAME === undefined && require('../globals');
require('colors');
const path = require('path');
const scriptName = path.basename(__filename).split('.').slice(0, -1).join('.');
// eslint-disable-next-line no-undef
const debug = require('debug')(APP_NAME + ':utils/' + scriptName.brightWhite);
const nodemailer = require("nodemailer");
const fs = require('fs');

// A.2 Library Functions
const { asyncForEach } = require("./asyncArray");
const { prettyHtmlTable, isObject, humanize } = require("./helperFn");

// A.3 Globals
const config = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 465,
  secure: false,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3'
  },
  ...(process.env.EMAIL_SERVICE && { service: process.env.EMAIL_SERVICE })
};
debug(`*-*-*-*-*-*-*-*-*-*[ ${scriptName} config ]-*-*-*-*-*-*-*-*-*-*-*`.yellow);
debug(config);
const transporter = nodemailer.createTransport(config);

// =========================[ B. Main Functions ]================================
/**
 * B.1 sendMail
 * All in one function to send email.
 * 
 * @param {object} param0 
 *   fromEmail: {string} - sender email address
 *   replyTo : {string} - reply to email address (optional)
 *   toEmail: {string} - list of receivers
 *   toEmailList: {array} - list of receivers (optional)
 *   subject: {string} - Subject line
 *   textEmailMessage: {string} - plain text body
 *   htmlEmailMessage: {string} - html body
 *   attachmentFile: {string} - path to file to attach (optional)
 *   emailTemplate: {string} - Email Template to use. Can be 'PasswordReset' or 'FailedLogin' (optional)
 *   emailTemplateParams: {object} - params to pass to email template (optional)
 *   htmlTable: {array} - array of objects to be converted to html table (optional)
 *   dryRun: {boolean} - true to not actually send the email (optional)
 * 
 * @returns {object} - response object. i.e.
 * {
 *  accepted: [ 'some-email@gmail.com' ],
 *  rejected: [],
 *  envelopeTime: 155,
 *  messageTime: 384,
 *  messageSize: 294,
 *  response: '250 2.0.0 Ok: queued as 09F0E5C02C4 FA84D972559 via compute1',
 *  envelope: { from: 'email@bsomail.com', to: [ 'some-email@gmail.com' ] },
 *  messageId: '<a4f70fab-4eec-abde-93be-343fb5027863@bsomail.com>'
 * }
 */
const sendMail = async ({
  fromEmail = process.env.EMAIL_USERNAME, replyTo, toEmail = '', toEmailList = [],
  subject = "Notification", textEmailMessage = '', htmlEmailMessage = '', attachmentFile,
  emailTemplate = null, emailTemplateParams = {}, htmlTable = [{}], dryRun = false,
} = {}) => {
  // Format toEmailList as an array if it is not already
  if (!Array.isArray(toEmailList)) {
    if (typeof toEmailList === 'string' && toEmailList.includes("@")) {
      toEmailList = toEmailList.includes(',') ? toEmailList.split(',') : [toEmailList];
    } else {
      toEmailList = [];
    }
  }

  // Combine toEmailList and toEmail as comma separated string
  if (Array.isArray(toEmailList) && toEmailList.length > 0) {
    if (toEmail) {
      toEmailList.push(toEmail);
    }
    toEmail = toEmailList.join(', ');
  }

  if (!toEmail) {
    debug("❌ No toEmail provided".red);
    return null;
  }

  // Prepare email message params
  let params = {
    from: fromEmail,
    to: toEmail,
    subject,
    ...(replyTo && { replyTo }),
    ...(textEmailMessage ? { text: textEmailMessage } : { text: '' }),
    ...(htmlEmailMessage ? { html: htmlEmailMessage } : { html: '' }),
  };

  // Reset variables for later use
  textEmailMessage = '';
  htmlEmailMessage = '';

  // Attach file if provided
  if (attachmentFile) {
    if (typeof attachmentFile === 'string') {
      if (fs.existsSync(attachmentFile)) {
        params.attachments = [{
          filename: path.basename(attachmentFile),
          content: fs.createReadStream(attachmentFile)
        }];
      } else {
        debug(`❌ Attachment file not found: ${attachmentFile} `.red);
      }
    } else if (Array.isArray(attachmentFile) && attachmentFile.length > 0) {
      await asyncForEach(attachmentFile, async (attachment) => {
        if (fs.existsSync(attachment)) {
          if (!params?.attachments) {
            params.attachments = [];
          }
          params.attachments.push({
            filename: path.basename(attachment),
            content: fs.createReadStream(attachment)
          });
        } else {
          debug(`❌ Attachment file not found: ${attachment} `.red);
        }
      });
    } else {
      debug(`❌ Attachment file not found ${attachmentFile} `.red);
    }
  }

  // Use email template if provided
  if (emailTemplate) {
    try {
      switch (emailTemplate) {
        case "PasswordReset":
          htmlEmailMessage += fs.readFileSync(path.resolve(__dirname, "./PasswordReset.html"), { encoding: 'utf8', flag: 'r' });
          break;

        case "FailedLogin":
          if (Array.isArray(htmlTable) && htmlTable.length > 0 && htmlTable[0] && Object.keys(htmlTable[0]).length > 0 || isObject(htmlTable) && Object.keys(htmlTable).length > 0) {
            if (!Array.isArray(htmlTable)) {
              htmlTable = [htmlTable];
            }
            if (htmlTable[0]?.strike_name) {
              params.subject = htmlTable[0].strike_name.includes("_") ? `${humanize(htmlTable[0].strike_name)} ` : `${htmlTable[0].strike_name} `;
            }
            if (htmlTable[0]?.page_title) {
              params.subject += `: ${htmlTable[0].page_title} `;
            }
          }
          break;

        default:
          debug(`❌ Email template not found ${emailTemplate} `.red);
          break;
      }
    } catch (err) {
      debug(err, err?.stack, err?.message);
      debug(`❌ Error reading email template ${emailTemplate} `.red);
    }
  }

  // Replace template params
  if (htmlEmailMessage && emailTemplateParams && Object.keys(emailTemplateParams).length > 0) {
    Object.entries((emailTemplateParams)).forEach(([key, value]) => {
      htmlEmailMessage += htmlEmailMessage.replace(`{ {$${key} } } `, value);
    });
  }

  // Build table if provided
  if (Array.isArray(htmlTable) && htmlTable.length > 0 && htmlTable[0] && Object.keys(htmlTable[0]).length > 0 || isObject(htmlTable) && Object.keys(htmlTable).length > 0) {
    if (!Array.isArray(htmlTable)) {
      htmlTable = [htmlTable];
    }

    if (dryRun) {
      debug("[Dry Run] htmlTable".cyan, htmlTable);
    }

    if (emailTemplate === "FailedLogin") {
      // htmlEmailMessage += `<div id="email-template"> ${failedLoginCache.header}${failedLoginCache.paragraph}${prettyHtmlTable(htmlTable)}</div>`;
      // textEmailMessage += `${failedLoginCache.header_text} \n\n${prettyHtmlTable(htmlTable, false)} \n\n${failedLoginCache.paragraph_text} `;
    } else {
      htmlEmailMessage += `<div id= "email-template"> ${prettyHtmlTable(htmlTable)}</div> `;
      textEmailMessage += `\n\n${prettyHtmlTable(htmlTable, false)} `;
    }
  }

  // Add any additional text to the email message
  if (htmlEmailMessage) {
    params.html += htmlEmailMessage;
  }
  if (textEmailMessage) {
    params.text += textEmailMessage;
  }

  // Send the email message
  let response = null;
  try {
    if (!params.html && !params.text) {
      throw new Error("❌ No email body provided");
    }
    if (dryRun) {
      debug("====================[ Dry run email html message ]====================".cyan, "\n", params.html);
      debug("====================[ Dry run email text message ]====================".cyan, "\n", params.text);
      response = {
        accepted: [...params.to.split(",")],
        rejected: [],
        envelopeTime: 155,
        messageTime: 384,
        messageSize: 294,
        response: '250 2.0.0 Ok: queued as 09F0E5C02C4 FA84D972559 via compute1',
        envelope: { from: params.from, to: [...params.to.split(",")] },
        messageId: '<a4f70fab-4eec-abde-93be-343fb5027863@bsomail.com>'
      };
    } else {
      response = await transporter.sendMail(params);
    }
  } catch (err) {
    response = err;
    debug(err, err?.stack, err?.message);
  }

  if (!response || response.rejected && response.rejected.length > 0 || response.accepted && response.accepted.length === 0 || !response?.accepted) {
    debug(response);
    debug("❌ sendMail".red, Object.entries(params).filter(([k, v]) => !Array.isArray(v) && !['text', 'html'].includes(k)).map(([key, value]) => `${key}: `.red + `${value} `.yellow).join(', '.red));
  } else {
    debug("✔ sendMail".green, Object.entries(params).filter(([k, v]) => !Array.isArray(v) && !['text', 'html'].includes(k)).map(([key, value]) => `${key}: `.green + `${value} `.magenta).join(', '.green));
  }
  return response;
};

module.exports = {
  // B. Main Functions
  sendMail,
};