/*
  Global Error Handler
*/

var logger = require('winston');


exports.logError = function (err) {
  logger.log('error', err);
}

exports.resError = function (res, err) {
  logger.log('error', err);

  res.json({
    status: 'error',
    error: err
  });

  throw new Error(err);
}