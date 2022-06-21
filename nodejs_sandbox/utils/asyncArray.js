/**
 * ===============[ TABLE OF CONTENTS ]=================
 * 1. Async Array Functions 
 *   1.1 asyncFilter
 *   1.2 asyncForEach
 *   1.3 asyncForEachChunk
 *   1.4 asyncMap
 *   1.5 asyncReduce
 *   1.6 asyncSome
 * 
 ******************************************************/
/* ===============[ 1. Async Array Functions ]========*/
/**
 * 1.1 asyncFilter
 * @param {Array} arr 
 * @param {Function} cb 
 */
const asyncFilter = async (arr, cb) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }
  const filteredArray = [];

  let len = arr.length;
  for (let i = 0; i < len; i++) {
    if (await cb(arr[i], i, arr)) {
      filteredArray.push(arr[i])
    }
  }

  return filteredArray;
}

/**
 * 1.2 asyncForEach
 * @param {Array} arr 
 * @param {Function} cb 
 */
const asyncForEach = async (arr, cb) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }
  let len = arr.length;
  for (let i = 0; i < len; i++) {
    await cb(arr[i], i, arr);
  }
}

/**
 * 1.3 asyncForEachChunk
 * @param {array} arr 
 * @param {integer} chunk 
 * @param {function} cb 
 */
const asyncForEachChunk = async (arr, chunk, cb) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }
  if (chunk === -1) {
    return asyncForEach(arr, cb);
  } else if (!chunk || chunk === 0 || typeof chunk !== 'number') {
    chunk = 1;
  }

  if (chunk > arr.length) {
    chunk = arr.length;
  }

  let tempArr = [];
  let chunkTotal = Math.round(arr.length / chunk);
  for (let i = 0, j = arr.length; i < j; i += chunk) {
    tempArr = arr.slice(i, i + chunk);
    let chunkIndex = (i / chunk) + 1;
    await cb(tempArr, chunkIndex, chunkTotal, arr, i);
  }
}

/**
 * 1.4 asyncMap
 * @param {Array} arr 
 * @param {Function} cb 
 */
const asyncMap = async (arr, cb) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }

  let len = arr.length;
  const resp = new Array(len);
  for (let i = 0; i < len; i++) {
    resp[i] = await cb(arr[i], i, arr);
  }

  return resp;
}

/**
 * 1.5 asyncReduce
 * @param {Array} arr 
 * @param {Function} cb 
 * @param {*} val 
 */
const asyncReduce = async (arr, cb, val) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }

  let len = arr.length;
  for (let i = 0; i < len; i++) {
    val = await cb(val, arr[i], i, arr);
  }

  return val;
}

/**
 * 1.6 asyncSome
 * @param {Array} arr 
 * @param {Function} cb 
 */
const asyncSome = async (arr, cb) => {
  if (!Array.isArray(arr)) {
    throw new TypeError('arr must be an array');
  }

  let len = arr.length;
  for (let i = 0; i < len; i++) {
    const isFinished = await cb(arr[i], i, arr);
    if (isFinished) {
      return isFinished;
    };
  }
}

module.exports = {
  asyncFilter,
  asyncForEach,
  asyncForEachChunk,
  asyncMap,
  asyncReduce,
  asyncSome
};