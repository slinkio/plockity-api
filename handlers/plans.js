var Plan      = require('../models/plan'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    normalize = require('../config/data-normalization'),
    respond   = require('./response');

exports.fetchAll = function (req, res, next) {
  Plan.find({}, function (err, plans) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    res.status(200).json({
      plan: plans
    });
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

  Plan.findById(id, function (err, plan) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if(!plan) {
      return res.status(404).json({
        status: 'not found'
      });
    } else {
      res.status(200).json({
        plan: plan
      });
    }
  });
};

exports.create = function (req, res, next) {
  if(req.session.token_unsigned.type !== 'admin') {
    return respond.code.unauthorized(res);
  }

  winston.info("Creating plan");
  console.log(req.body.plan);
  var plan_data = req.body.plan;

  if(!plan_data || !plan_data.title || !plan_data.description || !plan_data.tagline || typeof plan_data.price !== "number" || !plan_data.features) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  var plan = new Plan(plan_data);

  plan.save(function (err, record) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    res.status(200).json({
      plan: record
    });
  });
};

exports.update = function (req, res, next) {
  // TODO: Middleware.adminOnly below
  if(req.session.token_unsigned.type !== 'admin') {
    return respond.code.unauthorized(res);
  }

  res.status(501).json({
    status: 'error',
    error: 'This route has not been implemented yet.'
  });
};

exports.del = function ( req, res, next ) {
  if( req.session.token_unsigned.type !== 'admin' ) {
    return respond.code.unauthorized( res );
  }

  var id = req.params.id;

  if( !id ) {
    return respond.error.res( res, 'Please specify an ID in the resource url.' );
  }

  Plan.remove({ _id: id }, function ( err ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    respond.code.ok(res);
  });
};
