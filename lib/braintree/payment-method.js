/*
  BT Payment Method
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    gateway = require('../../config/braintree').init(),
    Promise = require('bluebird'); // jshint ignore:line

var subscription = require('./subscription');

exports.save = function ( paymentMethod ) {

  return new Promise(function ( resolve, reject ) {
    winston.log('info', 'creating pm in bt');
    gateway.paymentMethod.create({
      customerId:         paymentMethod.customerId,
      paymentMethodNonce: paymentMethod.nonce,

      billingAddress: {
        streetAddress:    paymentMethod.address.line1,
        extendedAddress:  paymentMethod.address.line2,
        locality:         paymentMethod.address.city,
        postalCode:       paymentMethod.address.zipcode,
        region:           paymentMethod.address.state
      },

      options: {
        makeDefault: paymentMethod.isDefault
      }

    }, function ( err, braintreePaymentMethod ) {

      winston.log('info', 'got bt create res');

      if( err ) {
        return reject( err );
      }

      winston.log('info', 'bt pm created');

      paymentMethod.token = braintreePaymentMethod.token;

      resolve( paymentMethod );

    });
  });

};

exports.remove = function ( paymentMethod ) {

  return new Promise(function ( resolve, reject ) {
    if( !paymentMethod.token ) {
      winston.log('info', 'no pm to remove, resolving');
      return resolve( paymentMethod );
    }

    winston.log('info', 'deleting pm');

    gateway.paymentMethod.delete( paymentMethod.token, function ( err ) {
      if( err ) {
        return reject( err );
      }

      paymentMethod.token = null;

      winston.log('info', 'deleting pm');

      subscription.unsubscribe( paymentMethod ).then( resolve ).catch( reject );
    });
  });

};