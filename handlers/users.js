var User = require('../models/user'),
    winston = require('winston'),
    normalize = require('../config/data-normalization');

exports.fetchAll = function (req, res, next) {
  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
}

exports.fetchByID = function (req, res, next) {
  var id = req.params.id;

  if(!id) {
    return res.status(500).json({
      status: 'error',
      error: 'Please specify an ID in the resource url.'
    });
  }

  User.findById(id, function (err, user) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if(!user) {
      return res.status(404).json({
        status: 'not found'
      });
    } else {
      res.status(200).json(normalize.user(user));
    }
  });
}

exports.create = function (req, res, next) {
  winston.info("Creating user");
  console.log(req.body.user);
  var user_data = req.body.user;

  if(!user_data.login.email || !user_data.login.password) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  user_data.active = true;

  var user = new User(user_data);

  user.save(function (err, record) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    res.status(200).json({
      user: record
    });
  });
}

exports.update = function (req, res, next) {
  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
}

exports.del = function (req, res, next) {
  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
}