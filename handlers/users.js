var User      = require('../models/user'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    respond   = require('./response'),
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
    return respond.error.res(res, 'Please specify an ID in the resource url.');
  }

  User.findById(id, function (err, user) {
    if(err) {
      return respond.error.res(res, err);
    }

    if(!user) {
      return respond.code.notfound(res);
    } else {
      res.status(200).json(normalize.user(user));
    }
  });
}

exports.create = function (req, res, next) {
  winston.info("Creating user");
  console.log(req.body.user);
  var user_data = req.body.user;

  if(!user_data || !user_data.login || !user_data.login.email || !user_data.login.password) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  user_data.active = true;

  bcp.hash(user_data.login.password, 8, function(err, hash) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    user_data.login.password = hash;

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
  });
}

exports.update = function (req, res, next) {
  var user_data = req.body.user;

  if(!user_data || !user_data._id || !req.params.id) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  User.findById(req.params.id, function (err, user) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    user.login.email  = user_data.login.email || user.login.email;
    user.name.company = user_data.name || user.name;
    user.app          = user_data.app || user.app;

    user.save(function (err, record) {
      if(err) {
        return res.status(500).json({
          status: 'error',
          error: err
        });
      }

      res.status(200).json(normalize.user(record));
    });
  });
}

exports.del = function (req, res, next) {
  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
}