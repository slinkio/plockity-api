/*
  BT Payment Method
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    gateway = require('../../config/braintree').init(),
    Promise = require('bluebird'); // jshint ignore:line

var paymentMethod = Promise.promisifyAll(gatway.paymentMethod);

exports.find = function ( token ) {

};

exports.update = function ( token, update ) {
  return paymentMethod.update( token, update );
};
