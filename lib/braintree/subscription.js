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

    console.log(subid);

    gateway.subscription.find(subid, function ( err, subscription ) {
      if( err ) {
        return reject( err );
      }

      app.subscription = subscription;

      resolve( app );
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
  console.log('Subscribing...');

  return new Promise(function ( resolve, reject ) {
    var q = {
      usingDefault: true
    };

    App.find( q ).populate('plan').exec(function ( err, apps ) {
      if( err ) {
        reject( err );
      }

      apps = apps.filter(function ( a ) {
        return ( a.plan ) ? a.plan.price > 0 : false;
      });

      // Populate a promises array
      var promises = apps.map(function ( app ) {

        return new Promise(function ( resolve, reject ) {

          // Handle subscription return
          var gotSubscription = function ( err, res ) {
            if( err ) {
              reject( err );
            }

            // Assign subscription to app
            app.subscription   = res.subscription;    // Store subscription, raw
            app.subscriptionId = res.subscription.id; // Subscription id
            app.paymentMethod  = paymentMethod._id;   // Assign paymentMethod to app

            // Save the new assignments
            app.save(function ( err, doc ) {
              if( err ) {
                reject( err );
              }

              resolve( doc );
            }); // app.save
          };

          // Build the subscription object
          var sub = {
            planId:             app.plan.title.toLowerCase().replace(/\s/g, '_'), // Example->example, Example Stuff->example_stuff
            paymentMethodToken: paymentMethod.token                               // Braintree payment method id
          };

          if( app.subscriptionId ) {
            gateway.subscription.update( app.subscriptionId, sub, gotSubscription );
          } else {
            gateway.subscription.create( sub, gotSubscription );
          }

        }); // return new Promise
      }); // apps.map

      // Resolve all the promises
      Promise.all( promises ).then( resolve ).catch( reject );

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
