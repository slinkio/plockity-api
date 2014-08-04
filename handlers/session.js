var moment        = require('moment'),
    jwt           = require('jwt-simple'),
    keys          = require('../config/keys'),
    Authorization = require('../models/authorization'),
    User          = require('../models/user'),
    Session       = require('../models/session'),
    keygen        = require('keygenerator'),
    respond       = require('./response'),
    _             = require('lodash');

exports.sendGenerateToken = function (req, res, next) {
  var sendSession = function (ses) {
    res.json(_.merge({ status: 'ok' }, ses));
  };

  findActiveSession(req.user._id, function (err, foundSession) {
    if(err) {
      return respond.error.res(res, err);
    }

    if(foundSession) {
      return sendSession({
        user:    req.user._id.toString(),
        expires: foundSession.expires,
        token:   foundSession.token
      });
    } else {
      // Generate expiration string
      var expiration = sessionExpiration();
          
      // Generate session_id with keygenerator
      var session_id = keygen.session_id();

      /* 
        Sign a new json web token with the session_id.
        ---
        Signing the jwt with a random id will obfuscate
        encrypted details and make it possible to
        validate sessions while making it impossible
        to mess with the token itself. token.type will
        always remain system set.
      */
      var json_token = jwt.encode({
        type:       "user",
        credential: req.user.login.email,
        id:         session_id
      }, session_id);

      // Build the session data object
      var session_data = {
        user:        req.user._id,
        expires:     expiration,
        token:       json_token,
        session_key: session_id
      };

      // Create a new session from the data object
      var session = new Session(session_data);

      // Save the session and send the response
      session.save(function (err, record) {
        if(err) {
          return respond.error.res(res, err, true);
        }

        return sendSession({
          user:    req.user._id.toString(),
          expires: expiration,
          token:   json_token
        });
      });
    } // if(foundSession) { ... } else { ... 
  });
}

/*
  The following export is a middleware function
  to authorize and validate sessions via json
  web tokens generated in exports.sendGenerateToken
*/
exports.authorize = function (req, res, next) {
  // Get token from the Session header key
  var token   = req.header('Session'),
      user_id = req.header('User');

  // Handle unauthorized access
  if(!token || !user_id) {
    return respond.code.unauthorized(res, 'Please include a Session and User header to access this resource.');
  }

  findActiveSession({ token: token, user: user_id }, function (err, foundSession) {
    if(err) {
      return respond.error.res(res, err);
    }

    // Handle unauthorized access
    if(!foundSession) {
      return respond.code.unauthorized(res, 'No session was found. Please make sure you are logged in.');
    }

    // Refind the session to populate the user.
    Session.findById(foundSession._id).populate('user').exec(function (err, authorizedSession) {
      if(err) {
        return respond.error.res(res, err);
      }

      // Decode the json web token for use by handlers
      authorizedSession.token_unsigned = jwt.decode(authorizedSession.token, authorizedSession.session_key);

      // Assign the session to a request global for use by handlers
      req.session = authorizedSession;

      // Continue
      next();
    });
  });
}

/*
  Private Methods
*/

function sessionExpiration () {
  return moment().add('hours', 2).format("YYYY/MM/DD HH:mm:ss");
}

function findActiveSession (query, callback) {
  // Set the query up
  var query = (typeof query === 'object') ? query : { user: query };
  var foundSession;

  Session.find(query, function (err, records) {
    if(err) {
      return callback(err);
    }

    if(records && records.length > 1) {
      // Loop through the records
      records.forEach(function (record) {
        // If the record.expires is after the current time (still active)
        if( !foundSession && record.expires && moment(record.expires, "YYYY-MM-DD HH:mm:ss").isAfter(moment()) ) {
          // Flag so we don't invoke the callback twice
          foundSession = true;
          // Renew the session and follow up with the callback
          return Session.findByIdAndUpdate(record._id, { $set: { expires: sessionExpiration() } }, callback);
        }

      });

      if(!foundSession) {
        return callback();
      }

    } else {
      return callback();
    }
  });
}