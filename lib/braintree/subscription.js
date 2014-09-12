/*
  BT Subscription
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    gateway = require('../../config/braintree').init(),
    Promise = require('bluebird'); // jshint ignore:line

var App = require('../../models/app');

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

exports.subscribeDefault = function ( paymentMethod ) {
  
};

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
