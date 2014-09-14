/*
  BT Subscription
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    gateway = require('../../config/braintree').init(),
    Promise = require('bluebird'); // jshint ignore:line

var App           = require('../../models/app'),
    PaymentMethod = require('../../models/payment-method');

/**
 * Attach subscriptions to apps
 * @param  {Array} apps
 * @return {Promise}
 */
exports.attach = function ( apps ) {
  return Promise.map( apps, attachOne );
};

exports.attachOne = attachOne;

/**
 * Attach subscription to app ~ used by exports.attach
 * @param  {Object} app
 * @return {Promise}
 */
function attachOne ( app ) {
  return new Promise(function ( resolve, reject ) {
    var subid = app.subscriptionId;

    if( !subid ) {
      return resolve( app );
    }

    gateway.subscription.find(subid, function ( err, subscription ) {
      if( err ) {
        reject( err );
      }

      app.subscription = subscription;

      return app;
    });
  });
}

/**
 * Creates a Subscription and returns the result
 * @param  {String} userId
 * @return {Object} Subscription from Braintree
 */
exports.create = function ( userId ) {

};

/**
 * Subscribes all apps using default payment method to paymentMethod passed
 * @param  {Object} paymentMethod Model::PaymentMethod
 * @return {Promise}
 */
exports.subscribeDefault = function ( paymentMethod ) {
  
  return new Promise(function ( resolve, reject ) {
    var q = {
      usingDefault: true
    };

    App.find(q, function ( err, apps ) {
      if( err ) {
        reject( err );
      }

      // Populate a promises array
      var promises = apps.map(function ( app ) {

        return new Promise(function ( resolve, reject ) {
          // Build the subscription object
          var sub = {

          };

          // Create a new subscription for each app
          gatway.subscription.create( sub, function ( err, rSub ) {
            if( err ) {
              reject( err );
            }

            // Assign rSub to app
            app.subscription   = rSub;              // Store subscription, raw
            app.subscriptionId = rSub.id;           // id? Check bt return object for appropriate assignment here
            app.paymentMethod  = paymentMethod._id; // Assign paymentMethod to app

            // Save the new assignments
            app.save(function ( err, doc ) {
              if( err ) {
                reject( err );
              }

              resolve( doc );
            }); // app.save
          }); // gateway.subscription.create
        }); // return new Promise
      }); // apps.map

      // Resolve all the promises
      Promise.all( promises ).then(function ( result ) {
        resolve( result );
      }).catch(function ( err ) {
        reject( err );
      }); // Shorten this chain

    });
  });
};

/**
 * Unsubscribes all apps with paymentMethod passed
 * @param  {Object} paymentMethod Model::PaymentMethod
 * @return {Promise}
 */
exports.unsubscribe = function ( paymentMethod ) {

  return new Promise(function ( resolve, reject ) {
    var q = {
      paymentMethod: paymentMethod._id
    };

    App.where( q ).setOptions( { multi: true } ).update({ $set: { subscription: null, subscriptionId: null, paymentMethod: null } }, function ( err, result ) {
      if( err ) {
        return reject( err );
      }

      resolve( paymentMethod );
    });

  });

};
