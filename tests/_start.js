var winston = require('winston');

before(function () {
  process.env.environment = 'test';

  if( !process.env.verboseLogging ) {
    // Suppress debug logging
    winston.loggers.add('default', {
      transports: [
        new ( winston.transports.Console )({ level: 'info' })
      ]
    });
  }
});
