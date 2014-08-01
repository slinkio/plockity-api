var braintreeConfig = require('../config/keys').braintree,
    gateway         = require('./config/braintree').init(braintreeConfig);

/*
  Method for generating Braintree client-side SDK token.

  -> GET /transaction/token
  <- Object > @status, @token
*/
exports.generateBraintreeToken = function (req, res, next) {
  if(!user) {
    return res.status(500).json({
      status: 'error',
      error: 'Please provide a user that we can generate the token for'
    });
  }

  var op = {
    customerId: req.user
  };

  gateway.clientToken.generate(op, function (err, braintreeRes) {
    if(err) {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    } else if(!braintreeRes.clientToken) {
      return res.status(500).json({
        status: 'error',
        error: 'Unable to generate token'
      });
    }

    res.status(200).json({
      status: 'ok',
      token: braintreeRes.clientToken
    });
  });
}

function findCustomer (id, callback) {
  gateway.customer.find(id, function(err, customer) {
    callback(err, customer);
  });
}