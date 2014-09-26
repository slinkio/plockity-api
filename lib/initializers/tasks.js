/*
  Initializer - Startup Task Registration
*/

var winston   = require('winston'),
    chalk     = require('chalk'),
    Scheduler = require('../cron/scheduler'),
    _         = require('lodash');

var globSync = require('glob').sync,
    tasks    = globSync('../tasks/**/*.js', { cwd: __dirname }).map(require);

var runningTasks = [];

exports.init = function () {

  if( tasks && _.isArray( tasks ) ) {
    tasks.forEach(function ( task ) {
      if( task.autoInit ) {
        var scheduled = new Scheduler( task );

        runningTasks.push( scheduled );
      }
    });
  }

};
