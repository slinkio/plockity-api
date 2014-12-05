/*
  Payload Parser Middleware

  Parses encrypted payloads
*/

var jwt = require('jwt-simple');

/**
 * Generates a payload parser middleware function
 * 
 * @param  {String}   Path to payload
 * @return {Function}
 */
var generator = module.exports = function ( payloadPath ) {
  return function ( req, res, next ) {
    var authorization = req.authorization,
        body          = req.body || req.query;

    if( !body ) {
      return next();
    }

    req.parsedPayload      = ( body.encrypted ) ? jwt.decode(body[ payloadPath ], authorization.publicKey) : body[ payloadPath ];
    req.payloadIsEncrypted = !!body.encrypted;

    next();
  };
};
