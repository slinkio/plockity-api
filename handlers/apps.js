var App      = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    normalize = require('../config/data-normalization');

exports.fetchAll = function (req, res, next) {
  App.find().where('_id').in(req.query.ids).populate('plan').lean().exec(function (err, apps) {
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
      res.status(200).json(normalize.apps(apps));
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

  App.findById(id).populate('plan').lean().exec(function (err, app) {
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
      res.status(200).json(normalize.app(app));
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
  
  delete app_data._id;

  console.log(app_data);

  var app = new App(app_data);

  app.save(function (err, record) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }
    console.log(record);

    App.findById(record._id).populate('plan').lean().exec(function (err, app) {
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
        res.status(200).json(normalize.app(app));
      }
    });
  });
}

exports.update = function (req, res, next) {
  var app_data = req.body.app;

  if(!app_data || !app_data._id) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  App.findById(app_data._id, function (err, app) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    for (var key in app_data) {
      if(key !== "id" || key !== "_id") {
        app[key] = app_data[key];
      }
    }

    app.save(function (err, record) {
      if (err) {
        return res.status(500).json({
          status: 'error',
          error: err
        });
      }

      App.findById(record._id).populate('plan').lean().exec(function (err, app) {
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
          res.status(200).json(normalize.app(app));
        }
      });
    });
  });
}

exports.del = function (req, res, next) {
  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
}