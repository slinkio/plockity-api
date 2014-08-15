/*
  Mongoose configuration
*/

var mongoose = require('mongoose'),
    winston  = require('winston');


exports.init = function () {
  winston.info('Connecting to mongodb...');
  mongoose.connect('localhost', 'plockity');
}

exports.cleanup = function () {
  winston.info('Shutting down mongodb...');
  mongoose.disconnect();
}