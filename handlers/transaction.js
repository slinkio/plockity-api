var gateway = require('../config/braintree').init(),
    User    = require('../models/user');

/*
  Method for generating Braintree client-side SDK token.

  1. Will check for BT vault existance
  2. Will register customer if not in BT vault
  3. Will generate token with BT customer id

  -> GET /transaction/token
  <- Object > @status, @token
*/
exports.generateBraintreeToken = function (req, res, next) {
  var user = req.query.user;

  if(!user) {
    return res.status(500).json({
      status: 'error',
      error: 'Please provide a user that we can generate the token for'
    });
  }

  findCustomer(user, function (err, customer) {
    if(err && err.name !== 'notFoundError') {
      return res.status(500).json({
        status: 'error',
        error: err
      });
    } else if(!customer) {
      return registerCustomer(user, function (err, newCustomer) {
        if(err) {
          return res.status(500).json({
            status: 'error',
            error: err
          });
        }

        generateToken({
          customerId: newCustomer.id
        });
      });
    }
    generateToken({
      customerId: user
    });
  });

  var generateToken = function (op) {
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
}


/*
  Private Methods
*/
function findCustomer (id, callback) {
  gateway.customer.find(id, callback);
}

function registerCustomer (id, callback) {
  User.findById(id, function (err, user) {
    if(err) {
      return callback(err);
    }

    var braintreeCustomer = {
      id: id,
      firstName: user.name.first,
      lastName: user.name.last,
      email: user.login.email
    };

    gateway.customer.create(braintreeCustomer, callback);
  });
}