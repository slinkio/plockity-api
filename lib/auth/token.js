/*
  Token Module
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    _       = require('lodash');

var keygen = require('keygenerator'),
    jwt    = require('jwt-simple'),
    moment = require('moment');

/**
 * Creates a pub/prv key pair
 * 
 * @param  {Object|String} data Data to include in your public key
 * @return {Object}             Keyset
 */
exports.createKeypair = function ( data ) {
  winston.log('debug', chalk.dim('Token Module :: Generating session data'));

  var privateKey = keygen._({ length: 256 });

  return {
    privateKey: privateKey,
    publicKey:  jwt.encode( data, privateKey )
  };
};

/**
 * Expiration generator ( Useful for setting default in model )
 *
 * expirationGenerator(1, 'day')() // Now + 1 day
 * 
 * @param  {Number} expiration Time (ex. 1, 2)
 * @param  {String} unit       Time unit (ex. day(s), hour(s))
 * @return {Function}          Generator function
 */
exports.expirationGenerator = function ( expiration, unit ) {
  return function () {
    return moment().add(expiration, unit).toDate();
  };
};
