var moment        = require('moment'),
    jwt           = require('jwt-simple'),
    keys          = require('../config/keys'),
    Authorization = require('../models/authorization'),
    keygen        = require('keygenerator'),
    _             = require('lodash');

exports.sendGenerateToken = function (req, res, next) {
  var expiration = moment().add('hours', 2).format("YYYY/MM/DD HH:mm:ss");
  res.json({
    status:  'ok',
    user:    req.user._id.toString(),
    expires: expiration,
    token: jwt.encode( {
        type:        "user",
        credential:  req.user.login.email,
        expires:     expiration,
        id:          keygen.session_id()
    }, keys.globalSignature )
  });
}