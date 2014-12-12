/*
  BT Subscription
*/

var cwd     = process.cwd(),
    winston = require('winston'),
    chalk   = require('chalk'),
    gateway = require('../../config/braintree').init(),
    Promise = require('bluebird'); // jshint ignore:line

var Plan          = require('../../models/plan'),
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
 * Subscribes an app to either the default paymentMethod ( if it is usingDefault ) or the paymentMethod passed
 * @param  {Object} app           Model::App
 * @param  {Object} paymentMethod Model::paymentMethod -> id
 * @return {Object}               Subscription from Braintree
 */
exports.setupSubscription = function ( app, paymentMethodId ) {

  return new Promise(function ( resolve, reject ) {

    var gotPaymentMethod = function ( err, paymentMethod ) {
      console.log('pm on gotPaymentMethod', paymentMethod);
      console.log(app.plan);
      Plan.findById(app.plan, function ( err, plan ) {
        if( err || !paymentMethod || !paymentMethod.token ) {
          var error = err || 'No paymentMethod found for id ' + paymentMethodId;
          return reject( error );
        }

        if( plan.price === 0 ) {
          return resolve( app );
        }

        var gotSubscription = function ( err, res ) {
          if( err ) {
            return reject( err );
          }

          console.log(res);

          app.subscription   = res.subscription;
          app.subscriptionId = res.subscription.id;
          app.paymentMethod  = paymentMethod._id;

          resolve( app );
        };

        var sub = {
          planId:             plan.title.toLowerCase().replace(/\s/g, '_'),
          paymentMethodToken: paymentMethod.token
        };

        if( app.subscriptionId ) {
          gateway.subscription.update( app.subscriptionId, sub, gotSubscription );
        } else {
          gateway.subscription.create( sub, gotSubscription );
        }
      });
    };

    if( app.usingDefault ) {
      PaymentMethod.findOne( { isDefault: true }, gotPaymentMethod );
    } else {
      PaymentMethod.findById( paymentMethodId, gotPaymentMethod );
    }
  });

};

/**
 * Subscribes all apps using default payment method to paymentMethod passed
 * @param  {Object} paymentMethod Model::PaymentMethod
 * @return {Promise}
 */
exports.subscribeDefault = function ( paymentMethod ) {
  var App = require('../../models/app'); // Required here because of a inverse dependency
  console.log('Subscribing apps w/ default...');

  console.log(paymentMethod.customerId);

  return new Promise(function ( resolve, reject ) {
    var q = {
      usingDefault: true,
      creator: paymentMethod.customerId
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
              return reject( err );
            }

            console.log(res);

            if( !res.subscription ) {
              return gateway.subscription.create(sub, gotSubscription);
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
          console.log(paymentMethod);
          console.log(sub);

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
      creator: paymentMethod.customerId,
      paymentMethod: paymentMethod._id
    };

    if( paymentMethod.isDefault ) {
      q.usingDefault = true;
    }

    App.where( q ).setOptions( { multi: true } ).update({ $set: { subscription: null, subscriptionId: null, paymentMethod: null } }, function ( err, result ) {
      if( err ) {
        return reject( err );
      }

      console.log('removed subscriptions for ', result.length);

      resolve( paymentMethod );
    });

  });

};

/**
 * Cancels subscription
 * @param  {String} subscriptionId
 * @return {Promise}
 */
exports.cancel = function ( subscriptionId ) {

  return new Promise(function ( resolve, reject ) {
    if( !subscriptionId ) {
      return reject( new Error('You must specify a subscriptionId') );
    }

    gateway.subscription.cancel(subscriptionId, function ( err, result ) {
      if( err ) {
        return reject( err );
      }

      resolve( result );
    });
  });

};
