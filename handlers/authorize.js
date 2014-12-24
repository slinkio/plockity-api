var moment        = require('moment'),
    jwt           = require('jwt-simple'),
    respond       = require('./response'),
    App           = require('../models/app'),
    Authorization = require('../models/authorization'),
    _             = require('lodash');

exports.auth = function ( req, res, next ) {
  var payload = req.query;

  if( !payload.apiKey ) {
    return respond.error.res( res, 'Please provide an api key in your request' );
  }

  App.findOne({ 'apiKey': payload.apiKey }).exec(function ( err, app ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( !app ) {
      return res.status(401).send('Unable to validate app. That api key does not exist.');
    }

    var authorizationData = {
      app: app._id.toString()
    };

    Authorization.createAuthorization( app._id, authorizationData ).then(function ( appAuthorization ) {
      res.json({
        token:      appAuthorization.publicKey,
        expiration: appAuthorization.expiration,
        user:       appAuthorization.app.toString()
      });
    }).catch(function ( err ) {
      return respond.error.res( res, err, true );
    });
  });
};
