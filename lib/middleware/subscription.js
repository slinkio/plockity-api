/*
  Subscription Route Middleware

  Checks app subscription status, plan, and usage
*/

var App     = require('../../models/app'),
    respond = require('../../handlers/response'),
    gateway = require('../../config/braintree').init();

/**
 * Subscription checker middleware
 * @middleware
 * @param  {Object}   req  Express request
 * @param  {Object}   res  Express response
 * @param  {Function} next cb
 * @return {Undefined}
 */
module.exports = function ( req, res, next ) {
  var authorization = req.authorization;

  var finishUp = function ( app ) {
    if( app.requestsMade > app.plan.maxRequests ) {
      return res.status(400).send('Your app\'s max requests has exceeded the allowed limit for the current cycle.');
    }

    app.markRequest().then(function ( /* updatedApp */ ) {
      req.authorization.app = app;
      next();
    }).catch(function ( err ) {
      respond.error.res(res, err, true);
    });
  };

  App.populate(authorization.app, { path: 'plan' }, function ( err, appPopulated ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    if( !appPopulated.plan ) {
      return res.status(401).send('Your app does not have a plan. Please select a plan before using the api.');
    }

    if( appPopulated.plan.price > 0 ) {
      if( !appPopulated.paymentMethod || !appPopulated.subscriptionId ) {
        return res.status(400).send('Your app is not subscribed. This is likely because you have not added a payment method or have cancelled a subscription. Please contact support for continuing issues regarding billing.');
      }

      gateway.subscription.find(subid, function ( err, subscription ) {
        if( err ) {
          return respond.error.res(res, err, true);
        }

        if( !subscription ) {
          return res.status(400).send('Your subscription could not be found. Please contact support for continuing issues regarding billing.');
        } else if( subscription.status.toLowerCase() !== 'active' ) {
          return res.status(400).send('Your subscription is currently ' + subscription.status + '.');
        }

        req.appSubscription = subscription;
        finishUp( appPopulated );
      });
    } else {
      finishUp( appPopulated );
    }
  });
};
