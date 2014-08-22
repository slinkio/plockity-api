var bodyParser = require('body-parser'),
    express    = require('express'),
    globSync   = require('glob').sync,
    routes     = globSync('./routes/**/*.js', { cwd: __dirname }).map(require),
    winston    = require('winston'),
    morgan     = require('morgan');

require('./config/mongoose').init();

exports.init = function (app) {

  winston.info("Setting up middleware...");
  app.use( morgan('dev') );
  app.use( bodyParser.json() );

  app.use( bodyParser.urlencoded({
    extended: true
  }) );

  winston.info("Getting routes...");

  routes.forEach(function(route) {
    route(app);
  });

  winston.info('Setting server options...');

  app.enable('trust proxy');
  app.set('x-powered-by', false);

  return app;
};
