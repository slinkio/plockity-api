var PaymentMethod = require('../models/payment-method'),
    mongoose      = require('mongoose'),
    winston       = require('winston'),
    bcp           = require('bcrypt'),
    respond       = require('./response'),
    normalize     = require('../config/data-normalization');

exports.fetchAll = function (req, res, next) {
  var query = req.query || {};

  if(req.session.token_unsigned.type !== 'admin') {
    query.customerId = req.session.token_unsigned.user_id;
  }

  PaymentMethod.find(query).exec(function (err, paymentMethods) {
    if(err) {
      return respond.error.res(res, err, true);
    }

    if(!paymentMethods || paymentMethods.length < 1) {
      res.status(200).json(normalize.paymentMethods([]));
    } else {
      res.status(200).json(normalize.paymentMethods(paymentMethods));
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

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.paymentMethod || req.session.user.paymentMethod.indexOf(id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  PaymentMethod.findById(id).exec(function (err, paymentMethod) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    if(!paymentMethod) {
      return res.status(404).json({
        status: 'not found'
      });
    } else {
      res.status(200).json(normalize.paymentMethod(paymentMethod));
    }
  });
}

exports.create = function (req, res, next) {
  winston.info("Creating paymentMethod");
  console.log(req.body.paymentMethod);
  var paymentMethod_data = req.body.paymentMethod;

  if(!paymentMethod_data || !paymentMethod_data.name || !paymentMethod_data.nonce) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }
  
  delete paymentMethod_data._id;

  console.log(paymentMethod_data);

  PaymentMethod.findOne({ customerId: paymentMethod_data.customerId, nonce: paymentMethod_data.nonce }, function ( err, record ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    console.log('record?', record);

    if( record && record._id ) {
      return respond.error.res(res, 'That payment method already exists.');
    }

    var paymentMethod = new PaymentMethod(paymentMethod_data);

    paymentMethod.save(function ( err, record ) {
      if(err) {
        return respond.error.res(res, err, true);
      }
      console.log(record);

      PaymentMethod.findById(record._id).exec(function (err, paymentMethod) {
        if(err) {
          return res.status(500).json({
            status: 'error',
            error: err
          });
        }

        if(!paymentMethod) {
          return res.status(404).json({
            status: 'not found'
          });
        } else {
          res.status(200).json(normalize.paymentMethod(paymentMethod));
        }
      });
    });
  });
}

exports.update = function (req, res, next) {
  var paymentMethod_data = req.body.paymentMethod;

  if(!paymentMethod_data || !req.params.id) {
    return res.status(500).json({
      status: 'error',
      error: 'Missing information to complete request.'
    });
  }

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.paymentMethod || req.session.user.paymentMethod.indexOf(req.params.id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  PaymentMethod.findById(req.params.id, function (err, paymentMethod) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    }

    for (var key in paymentMethod_data) {
      if(key !== "id" || key !== "_id") {
        paymentMethod[key] = paymentMethod_data[key];
      }
    }

    paymentMethod.save(function (err, record) {
      if (err) {
        return res.status(500).json({
          status: 'error',
          error: err
        });
      }

      PaymentMethod.findById(record._id).exec(function (err, paymentMethod) {
        if(err) {
          return res.status(500).json({
            status: 'error',
            error: err
          });
        }

        if(!paymentMethod) {
          return res.status(404).json({
            status: 'not found'
          });
        } else {
          res.status(200).json(normalize.paymentMethod(paymentMethod));
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

  if(req.session.token_unsigned.type === 'user' && ( !req.session.user.paymentMethod || req.session.user.paymentMethod.indexOf(id) < 0 ) ) {
    return respond.code.unauthorized(res);
  }

  PaymentMethod.remove({ _id: id }, function (err) {
    if(err) {
      return respond.error.res(res, err, true);
    }

    respond.code.ok(res);
  });
}