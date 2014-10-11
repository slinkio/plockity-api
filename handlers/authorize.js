var moment        = require('moment'),
    jwt           = require('jwt-simple'),
    App           = require('../models/app'),
    Authorization = require('../models/authorization'),
    keygen        = require('keygenerator'),
    _             = require('lodash');

function authExpiration () {
  return moment().add('days', 1).format("YYYY-MM-DD HH:mm:ss");
}

exports.checkAuthorization = function (req, res, next) {
  // Grab the app_key from the request
  var key = req.header('App-Key');

  // If there is no key, we send a 401 Unauthorized.
  if(!key) {
    return res.status(401).json({
      status: 'error',
      error: 'You must send a "key" to authorize your application.'
    });
  }
  
  // Search for the app_key in our database
  App.find({ 'signatures.publicKey': key }, function (err, app) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    // If we can't find the app, there's no app with that app key
    if(!app) {
      return res.status(404).json({
        status: 'error',
        error: 'App not found. Please make sure you have the correct app key.'
      });
    }
    
    // Check to see if the app is active. In the future this can be set by payment status, request overflow, etc.
    if(!app.active) {
      return res.status(401).json({
        status: 'error',
        error: 'App not active. Please activate your app.'
      });
    }
    
    // Reference the app in the request
    req.app = app;
    
    // Look for existing Authorizations with the app we found
    Authorization.find({ app: app._id }, function (err, authorizations) {
      if(err) {
        return res.status(500).json({
          status: 'error',
          error: err
        });
      }

      // See if our query returned any authorizations
      if(authorizations && authorizations.length > 0) {
        // If we have authorizations, loop through them
        authorization.forEach(function (auth) {
          // Determine if the authorization is already expired. If not, update and reuse it.
          if( auth.expires && moment(auth.expires, "YYYY-MM-DD HH:mm:ss").isAfter(moment()) ) {
            return Authorization.findByIdAndUpdate(auth._id, { $set: { expires: authExpiration() } }, function (err, newAuth) {
              if(err) {
                return res.status(500).json({
                  status: 'error',
                  error: err
                });
              }

              // Set the following flags to the sendGenerateToken method
              req.hasAuth = true;
              req.auth = newAuth;

              next();
            });
          }
        });
      }
      // No existing authorizations found, so we continue without setting flags
      next();
    });
  });
};

exports.sendGenerateToken = function (req, res, next) {
  // If we already have a stored authorization, use it. If not, create a new authorization.
  var authorization = ( req.hasAuth ) ? req.auth : new Authorization({
    app: req.app._id,
    session_key: keygen.session_id(),
    expires: authExpiration()
  });

  // If we are creating a new authorization, we need to save it.
  if(!req.hasAuth) {
    authorization.save();
  }

  // Return the authorization object's id, session key and expiration
  return res.json({
    status: 'ok',
    session: authorization._id,
    token: jwt.encode( req.app, authorization.session_key ),
    expires: authorization.expires
  });
};
