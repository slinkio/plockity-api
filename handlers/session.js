var moment        = require('moment'),
    jwt           = require('jwt-simple'),
    App           = require('../models/app'),
    keys          = require('../config/keys'),
    Authorization = require('../models/authorization'),
    keygen        = require('keygenerator'),
    _             = require('lodash');

exports.sendGenerateToken = function (req, res, next) {
  res.json({
    status: 'ok',
    token: jwt.encode( req.user, keys.globalSignature )
  });
}