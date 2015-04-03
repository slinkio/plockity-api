var moment = require('moment'),
    jwt    = require('jwt-simple'),
    App    = require('../models/app'),
    User   = require('../models/user'),
    keygen = require('keygenerator'),
    bcp    = require('bcrypt'),
    _      = require('lodash');

exports.login = function (req, res, next) {
  var email    = req.body.email,
      password = req.body.password;

    return res.status(401).json({
      status: 'error',
      error: 'Please provide required information.'
    });
  }

  User.findOne({ 'login.email': email }, function (err, user) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

      return res.status(404).json({
        status: 'error',
        error: 'User not found with that email'
      });
    }

    bcp.compare(password, user.login.password, function (err, result) {
        console.error(err);
        return res.status(500).json({
          status: 'error',
          error: 'Error processing password'
        });
      }

        req.user = user;

        next();
      } else {
        res.status(401).json({
          status: 'error',
          error: 'Incorrect password'
        });
      }
    });
  });
