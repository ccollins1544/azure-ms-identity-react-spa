
/**
 * ===============[ TABLE OF CONTENTS ]===============
 * 1. Helper Functions
 *   1.1 isObject 
 * 
 * 2. Sorting Functions
 * 
 * 3. Formatting Functions
 *   3.1 humanize 
 *   3.2 Array2Table
 *   3.3 prettyHtmlTable
 * 
 * 4. File Functions 
 *   4.1 getDirectories 
 *   4.2 listDirFilesByType
 *   4.3 humanFileSize 
 *   4.4 getFilesize
 *   4.5 moveFile 
 * 
 ******************************************************/

/* ===============[ Libraries ]========================*/
process.env.DOTENV_LOADED || require("dotenv").config();
typeof APP_NAME === 'undefined' && require("../globals");
require("colors");
const path = require("path");
const scriptName = path.basename(__filename).split('.').slice(0, -1).join('.');
// eslint-disable-next-line no-undef
const debug = require('debug')(APP_NAME + ':utils/' + scriptName.brightWhite);
// eslint-disable-next-line no-undef
const debugVerbose = require('debug')(APP_NAME.split("-")[0] + ':' + scriptName.magenta);

// Library Functions 
const moment = require('moment-timezone');
const os = require('os');
const fs = require("fs");
const glob = require("glob");
const crypto = require("crypto");
const { generateKeyPairSync } = require("crypto");

/* ===============[ 1. Helper Functions ]====================*/
/**
 * 1.1 isObject
 * @param {object} object 
 * @returns 
 */
const isObject = (object) => {
  return object != null && typeof object === 'object';
};

/* ===============[ 2. Sorting Functions ]===================*/
/* ===============[ 3. Formatting Functions ]================*/
/**
 * 3.1 humanize 
 * ex: request_id = Request Id
 * 
 * @param {string} str 
 * @return Humanized String
 */
const humanize = (str) => {
  if (typeof str !== "string" || str === null || str === undefined || str.length === 0) return str;
  const dateFields = ['download_expires_at', 'last_downloaded_timestamp', 'createdAt', 'updatedAt'];
  let i, frags = /[_]/g.test(str.toString().trim()) ? str.toString().trim().split('_') : (/[ ]/g.test(str.toString().trim()) ? str.toString().trim().split(' ') : [str.toString().trim()]);

  for (i = 0; i < frags.length; i++) {
    frags[i] = frags[i].charAt(0).toUpperCase() + (dateFields.includes(str) ? frags[i].slice(1) : frags[i].slice(1).toLowerCase());
  }

  return frags.join(' ');
};

/**
 * 3.2 Array2Table
 * @param {array} arr - array of objects
 */
const Array2Table = (arr, generateHtml = true) => {
  let Table = [];
  let top_row = [];
  let rows = [];

  for (let i = 0; i < arr.length; i++) {
    let cells = [];

    for (let property in arr[i]) {
      if (top_row.length < Object.keys(arr[i]).length) {
        if (generateHtml) {
          top_row.push(`<th scope="col">${humanize(property)}</th>`);
        } else {
          top_row.push(property);
        }
      }
      if (arr[i][property] === null) {
        if (generateHtml) {
          cells.push(`<td>${null}</td>`);
        } else {
          cells.push(null);
        }
      } else {
        if (generateHtml) {
          cells.push(`<td>${arr[i][property]}</td>`);
        } else {
          cells.push(arr[i][property]);
        }
      }
    }

    if (generateHtml) {
      rows.push(`<tr>${cells.join("")}</tr>`);
    } else {
      rows.push(cells);
    }
  }

  if (generateHtml) {
    Table.push(`<table>`);
    Table.push(`<thead>${top_row.join("")}</thead>`);
    Table.push(`<tbody>${rows.join("")}<tbody>`);
    Table.push("</table>");
    return Table.join("");
  }

  return { top_row, rows };
};


/**
 * 3.3 prettyHtmlTable
 * @param {array} arrayOfObjects 
 * @param {boolean} generateHTML 
 */
const prettyHtmlTable = (arrayOfObjects = {}, generateHTML = true) => {
  let rawText = "";
  let max_columns = 25;
  if (!Array.isArray(arrayOfObjects) && isObject(arrayOfObjects)) {
    rawText = Object.entries(arrayOfObjects).map(([key, value]) => `${humanize(key)}: ${value}`).join("\n");
    if (generateHTML && Object.keys(arrayOfObjects).length > max_columns) {
      generateHTML = false;
    }
  } else if (Array.isArray(arrayOfObjects) && isObject(arrayOfObjects[0])) {
    rawText = arrayOfObjects.map((obj = {}) => Object.entries(obj).map(([key, value]) => `${humanize(key)}: ${value}`).join("\n")).join("\n");
    if (generateHTML && Object.keys((arrayOfObjects[0] || {})).length > max_columns) {
      generateHTML = false;
    }
  } else {
    rawText = `${arrayOfObjects}`;
  }

  if (!generateHTML) {
    return rawText;
  }

  let headHTML = `<style>
  table {
    font-family: Roboto, serif;
  font-size: 16px;
  color: #333;
  width: 100%;
  border-collapse: collapse;
  border-spacing: 0;
  border: 1px solid black;
  background-color: white;
  margin-bottom: 1rem;
  color: #212529;
}

table thead tr th {
  margin: 0;
  padding: 0.10rem 0.20rem;
  text-align: left;
  color: white;
  background-color: #2c2f33;
}

table tbody tr {
  background-color: #b6d9ee;
}

table tbody td {
  padding: 0.10rem 0.20rem;
  margin: 0;
}
</style>`;

  let bodyHTML = "";
  if (isObject(arrayOfObjects) && !Array.isArray(arrayOfObjects)) {
    arrayOfObjects = [arrayOfObjects];
  }
  if (!isObject(arrayOfObjects[0])) {
    console.log(`arrayOfObjects[0] is ${typeof arrayOfObjects[0]} and it should be an object`.red);
    bodyHTML = `<pre>${arrayOfObjects}</pre>`;
  } else {
    bodyHTML = Array2Table(arrayOfObjects, true);
  }

  return [headHTML, bodyHTML].join("");
};

/* ===============[ 4. File Functions ]======================*/

module.exports = {
  // 1. Helper Functions
  isObject,
  // 3. Formatting Functions
  humanize,
  Array2Table,
  prettyHtmlTable
};