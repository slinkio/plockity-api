var bodyParser = require('body-parser'),
    express    = require('express'),
    globSync   = require('glob').sync,
    routes     = globSync('./routes/**/*.js', { cwd: __dirname }).map(require),
    winston    = require('winston').loggers.get('default'),
    chalk      = require('chalk'),
    morgan     = require('morgan');

require('./config/mongoose').init();

exports.init = function (app) {
  winston.debug("Setting up middleware...");

  var logRoute = ( process.env.environment === 'test' ) ? process.env.verboseLogging : true;

  if( logRoute ) {
    app.use( morgan('dev') );
  }

  app.use( bodyParser.json() );
  app.use( bodyParser.urlencoded({
    extended: true
  }) );

  winston.debug("Getting routes...");

  routes.forEach(function ( route ) {
    route( app );
  });

  winston.debug('Setting server options...');

  app.enable('trust proxy');
  app.set('x-powered-by', 'Plockity');

  return app;
};

/**
 * Registers all plans from the manifest
 * @return {Promise}
 */
exports.registerPlans = function () {
  var Plan    = require(process.cwd() + '/models/plan'),
      plans   = require(process.cwd() + '/config/plans'),
      Promise = require('bluebird'),
      _       = require('lodash');

  return Promise.all(plans.map(function ( plan ) {

  winston.debug(chalk.dim('Registering plan:', plan.title));

    return new Promise(function ( resolve, reject ) {
      Plan.findOne({ title: plan.title }, function ( err, foundPlan ) {
        if ( err ) {
          return reject( err );
        }

        var createdPlan = ( foundPlan ) ? _.merge(foundPlan, plan) : new Plan( plan );
        winston.debug(chalk.dim((foundPlan) ? 'Overwrote plan' : 'Created plan'));

        createdPlan.save(function ( err, newPlan ) {
          if ( err ) {
            return reject( err );
          }

          winston.debug(chalk.dim('Save plan', newPlan.title));
          resolve( newPlan );
        });
      });
    });
  }));
};
