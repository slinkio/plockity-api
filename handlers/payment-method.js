var PaymentMethod = require('../models/payment-method'),
    mongoose      = require('mongoose'),
    winston       = require('winston'),
    bcp           = require('bcrypt'),
    respond       = require('./response'),
    normalize     = require('../config/data-normalization');

var Promise = require('bluebird'), // jshint ignore:line
    braintreePaymentMethod = require('../config/braintree').init().paymentMethod;

exports.fetchAll = function ( req, res, next ) {
  var query = req.query || {};

  if( req.session.token_unsigned.type !== 'admin' ) {
    query.customerId = req.session.token_unsigned.user_id;
  }

  console.log(query);

  PaymentMethod.find(query).select('-braintreeToken').exec(function ( err, paymentMethods ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    console.log(paymentMethods);

    if( !paymentMethods || paymentMethods.length < 1 ) {
      res.status(200).json(normalize.paymentMethods([]));
    } else {
      res.status(200).json(normalize.paymentMethods(paymentMethods));
    }
  });
};

exports.fetchByID = function ( req, res, next ) {
  var id = req.params.id;

  if( !id ) {
    return res.status(500).json({
      status: 'error',
      error: 'Please specify an ID in the resource url.'
    });
  }

  if( req.session.token_unsigned.type === 'user' && ( !req.session.user.paymentMethod || req.session.user.paymentMethod.indexOf(id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  PaymentMethod.findById(id).exec(function (err, paymentMethod) {
    if( err ) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if( !paymentMethod ) {
      return res.status(404).json({
        status: 'not found'
      });
    } else {
      res.status(200).json( normalize.paymentMethod(paymentMethod) );
    }
  });
};

exports.create = function ( req, res, next ) {
  winston.info("Creating paymentMethod");
  console.log(req.body.paymentMethod);
  var paymentMethod_data = req.body.paymentMethod;

  if( !paymentMethod_data || !paymentMethod_data.name || !paymentMethod_data.nonce ) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }
  
  delete paymentMethod_data._id;

  PaymentMethod.findOne({ customerId: paymentMethod_data.customerId, nonce: paymentMethod_data.nonce }, function ( err, record ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    if( record && record._id ) {
      return respond.error.res(res, 'That payment method already exists.');
    }

    PaymentMethod.find({ customerId: paymentMethod_data.customerId }, function ( err, paymentMethods ) {

      paymentMethod_data.isDefault = paymentMethods.length < 1;

      var paymentMethod = new PaymentMethod(paymentMethod_data);

      paymentMethod.save(function ( err, record ) {
        if( err ) {
          return respond.error.res(res, err, true);
        }

        res.status(200).json( normalize.paymentMethod(record) );
      });

    });
  });
};

exports.update = function ( req, res, next ) {
  var paymentMethod_data = req.body.paymentMethod;

  if( !paymentMethod_data || !req.params.id ) {
    return respond.error.res(res, 'Missing information to complete request.');
  }

  if( req.session.token_unsigned.type === 'user' && ( !req.session.user.paymentMethod || req.session.user.paymentMethod.indexOf(req.params.id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  PaymentMethod.findById(req.params.id, function ( err, paymentMethod ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    paymentMethod.name       = paymentMethod_data.name       || paymentMethod.name;
    paymentMethod.customerId = paymentMethod_data.customerId || paymentMethod.customerId;
    paymentMethod.app        = paymentMethod_data.app        || paymentMethod.app;
    paymentMethod.address    = paymentMethod_data.address    || paymentMethod.address;
    paymentMethod.nonce      = paymentMethod_data.nonce      || paymentMethod.nonce;
    paymentMethod.isDefault  = paymentMethod_data.isDefault;

    paymentMethod.save(function ( err, record ) {
      if(err) {
        return respond.error.res(res, err, true);
      }

      res.status(200).json( normalize.paymentMethod(record) );
    });
  });
};

exports.del = function ( req, res, next ) {
  var id = req.params.id;

  if( !id ) {
    return respond.error.res(res, 'Please specify an ID in the resource url.');
  }

  var query = {
    _id: id
  };

  if( req.session.token_unsigned.type === 'user' ) {
    query.customer_id = req.session.user.user_id;
  }

  PaymentMethod.remove(query, function ( err ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    respond.code.ok(res);
  });
};