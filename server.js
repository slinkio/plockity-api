var bodyParser = require('body-parser'),
    express    = require('express'),
    globSync   = require('glob').sync,
    routes     = globSync('./routes/**/*.js', { cwd: __dirname }).map(require),
    winston    = require('winston'),
    morgan     = require('morgan');

require('./config/mongoose').init();

exports.init = function (app) {
  winston.info("Setting up middleware...");

  var logRoute = ( process.env.environment === 'test' ) ? process.env.verboseLogging : true;

  if( logRoute ) {
    app.use( morgan('dev') );
  }

  app.use( bodyParser.json() );
  app.use( bodyParser.urlencoded({
    extended: true
  }) );

  winston.info("Getting routes...");

  routes.forEach(function ( route ) {
    route( app );
  });

  winston.info('Setting server options...');

  app.enable('trust proxy');
  app.set('x-powered-by', 'Plockity');

  return app;
};
