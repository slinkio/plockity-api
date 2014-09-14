/*
  Initializer Loader
*/

var winston   = require('winston'),
    chalk     = require('chalk'),
    Scheduler = require('../cron/scheduler'),
    _         = require('lodash');

var globSync     = require('glob').sync,
    initializers = globSync('../lib/initializers/**/*.js', { cwd: __dirname }).map(require);

exports.init = function () {

  if( initializers && _.isArray( initializers ) ) {

    initializers.forEach(function ( initializer ) {

      initializer.init();

    });

  }

};
