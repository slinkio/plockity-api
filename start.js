var winston        = require('winston'),
    mongooseConfig = require('./config/mongoose'),
    initializers   = require('./initializer').init();

winston.info('Starting server...');

var express = require('express'),
    app     = require('./index').init(express());

var port = process.env.PORT || 3000;

app.listen(port, function () {
  winston.info('Server listening on port', port, '...');
});

process.stdin.resume();//so the program will not close instantly

function withExit ( options ) {
  mongooseConfig.cleanup();

  if( options.exit ) {
    process.exit();
  }
}

process.on('exit', withExit.bind(null, { clean: true }));

process.on('SIGINT', withExit.bind(null, { exit: true }));
