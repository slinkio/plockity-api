/*
  Task - Subscription Info Getter
*/

var winston = require('winston'),
    chalk   = require('chalk'),
    Promise = require('bluebird'); // jshint ignore:line

module.exports = {
  name:      'BT::Subscription Information', // Task Name
  startHook: task,                           // Task Hook
  autoInit:  true                            // Start this task on app initialization
};

var task = function () {
  var App     = require('../../models/app'),
      gateway = require('../../config/braintree');

  winston.info('is running task!');

  App.find({}, function ( err, apps ) {
    if( err ) {
      winston.log( 'error', chalk.bgRed( err ) );
      throw new Error( err );
    }

    var promises = [];

    apps.forEach(function ( app ) {

      if( !app.subscriptionId ) {
        return;    
      }

      var promise = new Promise(function ( resolve, reject ) {

        gateway.subscription.find(subscriptionId, function ( err, subscription ) {
          if( err ) {
            return reject( err );
          }

          app.subscription = subscription;

          app.save(function ( err, doc ) {
            if( err ) {
              return reject( err );
            }

            resolve( doc );
          });
        });

      });

      promises.push( promise );

    });

    Promise.all( promises ).then(function ( results ) {

      winston.info('Got app subscription refs');

    }).catch(function ( err ) {

      winston.log( 'error', err );
      throw new Error( err );

    });
  });
};
