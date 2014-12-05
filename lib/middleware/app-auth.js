/*
  App Auth Route Middleware

  Checks app session, etc.
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    Promise = require('bluebird'), // jshint ignore:line
    _       = require('lodash');

var App           = require(process.cwd() + '/models/app'),
    Authorization = require(process.cwd() + '/models/authorization'),
    respond       = require(process.cwd() + '/handlers/response'),
    jwt           = require('jwt-simple');

/**
 * Generates a auth middleware function
 * 
 * @param  {Boolean}  refreshes Should refresh the session?
 * @return {Function}
 */
var generator = module.exports = function ( refreshes ) {
  return function ( req, res, next ) {
    var token     = req.header('X-API-Token'),
        refreshes = ( refreshes === undefined ) ? true : refreshes;

    if( !token ) {
      return res.status(401).send('This resource requires the "X-API-Token" header with a fresh and relevant session\'s token');
    }

    var allErrors = function ( err ) {
      return respond.error.res( res, err, true );
    };

    Authorization.retrieve( token ).then(function ( appAuthorization ) {
      if( !appAuthorization ) {
        return res.status(401).send('The token you supplied could not be found - The authorization is either expired or non-existant');
      }

      if( appAuthorization.isExpired ) {
        return res.status(401).send('Your session has expired');
      }

      var attachAndNext = function () {
        req.authorization = appAuthorization;
        next();
      };

      if( refreshes ) {
        appAuthorization.refresh().then( attachAndNext );
      } else {
        attachAndNext();
      }
    }).catch( allErrors );
  };
};
