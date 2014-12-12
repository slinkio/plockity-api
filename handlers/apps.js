var App       = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    respond   = require('./response'),
    normalize = require('../config/data-normalization');

var subscription = require('../lib/braintree/subscription');

exports.fetchAll = function (req, res, next) {
  var query = req.query || {};

  if(req.session.token_unsigned.type !== 'admin') {
    query.creator = req.session.token_unsigned.user_id;
  }

  console.log('Fetching apps...');

  App.find(query).populate('plan paymentMethod').lean().exec(function (err, apps) {
    if(err) {
      return respond.error.res( res, err, true );
    }

    if( !apps || apps.length < 1 ) {

      return res.status(200).json( normalize.apps( apps ) );

    } else {

      subscription.attach( apps ).then(function ( apps ) {

        res.status(200).json( normalize.apps( apps ) );

      }).catch(function ( err ) {

        respond.error.res( res, err, true );

      });
    } // ./ if( !apps || apps.length < 1 )
  });
};

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

  App.findById(id).populate('plan paymentMethod').lean().exec(function ( err, app ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if(!app) {

      return respond.code.notfound( res );

    } else {

      subscription.attachOne( app ).then(function ( app ) {

        res.status(200).json( normalize.app( app ) );

      }).catch(function ( err ) {

        respond.error.res( res, err, true );

      });
    }
  });
};

exports.create = function (req, res, next) {
  winston.info("Creating app");
  console.log(req.body.app);
  var app_data = req.body.app;

  if(!app_data || !app_data.name || !app_data.url || !app_data.plan || !app_data.creator) {
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
      throw err;
    }
    console.log(record);

    App.findById(record._id).populate('plan paymentMethod').lean().exec(function (err, app) {
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
};

exports.update = function (req, res, next) {
  var app_data = req.body.app;

  if(!app_data || !req.params.id) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.app || req.session.user.app.indexOf(req.params.id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  App.findById(req.params.id, function (err, app) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    app.name = app_data.name || app.name;
    app.plan = app_data.plan || app.plan;
    app.paymentMethod = app_data.paymentMethod || app.paymentMethod;
    app.url = app_data.url || app.url;
    app.usingDefault = app_data.usingDefault;

    app.save(function (err, record) {
      if (err) {
        return respond.error.res(res, err, true);
      }

      App.findById(record._id).populate('plan paymentMethod').lean().exec(function (err, app) {
        if(err) {
          return respond.error.res(res, err, true);
        }

        if(!app) {
          return respond.code.notfound(res);
        } else {
          res.status(200).json(normalize.app(app));
        }
      });
    });
  });
};

exports.del = function (req, res, next) {
  var id = req.params.id;

  if(!id) {
    return respond.error.res(res, 'Please specify an ID in the resource url.');
  }

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.app || req.session.user.app.indexOf( id ) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  App.remove({ _id: id }, function (err) {
    if(err) {
      return respond.error.res(res, err, true);
    }

    respond.code.ok(res);
  });
};

exports.resetKey = function ( req, res, next ) {
  var id = req.params.id;

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.app || req.session.user.app.indexOf(id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  App.findById(id, function ( err, app ) {
    if( err ) {
      throw err;
    }

    if( !app ) {
      return res.status(404).send('We couldn\'t find an app with id:' + id);
    }

    app.newApiKey().then(function ( newApp ) {
      res.status(200).send({
        key: newApp.apiKey
      });
    }).catch(function ( err ) {
      throw err;
    });
  });
};
