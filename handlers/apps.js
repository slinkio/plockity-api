var App      = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    normalize = require('../config/data-normalization');

exports.fetchAll = function (req, res, next) {
  App.find({}, function (err, apps) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if(!apps || apps.length < 1) {
      return res.status(404).json({
        status: 'not found'
      });
    } else {
      res.status(200).json({
        app: apps
      });
    }
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

  App.findById(id, function (err, app) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if(!app) {
      return res.status(404).json({
        status: 'not found'
      });
    } else {
      res.status(200).json(app);
    }
  });
}

exports.create = function (req, res, next) {
  winston.info("Creating app");
  console.log(req.body.app);
  var app_data = req.body.app;

  if(!app_data || !app_data.name || !app_data.domain || !app_data.plan || !app_data.creator) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  var app = new App(app_data);

  app.save(function (err, record) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    res.status(200).json({
      app: record
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