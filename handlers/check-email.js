var User = require('../models/user'),
    winston = require('winston');

exports.checkUserEmail = function (req, res, next) {
  var email = req.query.email;

  if(!email) {
    return res.status(500).json({
      status: 'error',
      error: 'Please provide an email address to check.'
    });
  }

  User.findOne({ 'login.email': email }, function (err, result) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if(result && result.login.email) {
      res.json({
        status: 'found user'
      });
    } else {
      res.json({
        status: 'ok',
        message: 'No user found.'
      });
    }

  });
}

exports.checkAdminEmail = function (req, res, next) {
  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
}