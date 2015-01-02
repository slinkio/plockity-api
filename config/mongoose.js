/*
  Mongoose configuration
*/

var mongoose = require('mongoose'),
    winston  = require('winston').loggers.get('default'),
    chalk    = require('chalk');

var connection;

exports.init = function ( db, address, singleton ) {
  // Defaults
  db      = ( process.env.environment === 'test' ) ? 'plockitytest' : ( db ) ? db : 'plockity';
  address = address || 'localhost';

  if( !connection && !singleton ) {
    mongoose.connection.close();

    winston.debug(chalk.dim('Connecting to', db, 'db...'));

    connection = mongoose.connect(address, db);

    return connection;

  } else if( singleton ) {
    winston.debug(chalk.dim('Singleton connection to', db, 'db...'));

    return mongoose.createConnection(address + '/' + db);
  } else {
    winston.debug(chalk.dim('Returning existing connection'));

    return connection;
  }
};
