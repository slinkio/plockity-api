var App       = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    respond   = require('./response'),
    normalize = require('../config/data-normalization');

exports.fetchAll = function (req, res, next) {
  if(!req.query.ids && req.session.token_unsigned.type === 'user') {
    return respond.code.unauthorized(res, 'Specify ids to fetch if using GET /apps');
  }

  App.find().where('_id').in(req.query.ids).populate('plan').lean().exec(function (err, apps) {
    if(err) {
      return respond.error.res(res, err, true);
    }

    if(!apps || apps.length < 1) {
      return respond.code.notfound(res);
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

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.app || req.session.user.app.indexOf(id) < 0 ) ) {
    return respond.code.unauthorized(res);
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

  if(!app_data || !app_data._id || !req.params.id) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.app || req.session.user.app.indexOf(app_data._id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  App.findById(req.params.id, function (err, app) {
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
  var id = req.params.id;

  if(!id) {
    return respond.error.res(res, 'Please specify an ID in the resource url.');
  }

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.app || req.session.user.app.indexOf(id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  App.remove({ _id: id }, function (err) {
    if(err) {
      return respond.error.res(res, err, true);
    }

    res.status(200).json({
      status: 'ok'
    });
  });
}