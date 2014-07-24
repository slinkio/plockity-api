/*
  Generate a moment data
*/

var moment = require('moment');

module.exports = function () {
  return moment().format("YYYY-MM-DD HH:mm:ss");
}