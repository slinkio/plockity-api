/*
  Field constructor module
*/

var Promise = require('bluebird'), // jshint ignore:line
    flat    = require('flat'),
    _       = require('lodash');

var fieldConstructor = module.exports = function ( dataObject, options ) {
  options = options || {};

  return new Promise(function ( resolve, reject ) {
    var fields   = [],
        disabled = options.disableEncryption;

    _.forOwn(flat.flatten( dataObject ), function ( value, path ) {
      var hasNumber = _.findIndex(path.split('.'), function ( segment ) {
        return !isNaN( segment );
      });

      var checkPath = ( hasNumber > -1 ) ? path.split('.').slice(0, hasNumber).join('.') : path,
          encrypt   = ( disabled ) ? !_.contains(disabled, checkPath) : true;

      fields.push({
        encrypt: encrypt,
        path: path,
        value: value
      });
    });

    resolve( fields );
  });
};