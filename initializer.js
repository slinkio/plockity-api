/*
  Initializer Loader
*/

var winston   = require('winston'),
    chalk     = require('chalk'),
    _         = require('lodash');

var globSync     = require('glob').sync,
    initializers = globSync('./lib/initializers/**/*.js', { cwd: __dirname }).map(require);

exports.init = function () {

  winston.log('info', chalk.dim('Initializer :: Init'));

  if( initializers && _.isArray( initializers ) ) {
    winston.log('info', chalk.dim('Initializer :: Loading server initializers...'));
    initializers.forEach(function ( initializer, index ) {
      winston.log('info', chalk.dim('Initializer :: Loading initalizer', index, 'of', initializers.length));
      initializer.init();

    });

  }

};
