var winston        = require('winston'),
    mongooseConfig = require('./config/mongoose'),
    initializers   = require('./initializer'),
    express        = require('express'),
    cluster        = require('cluster'),
    os             = require('os');

winston.info('Starting server...');

if( cluster.isMaster ) {
  initializers.init();

  os.cpus().forEach(function ( cpu ) {
    cluster.fork();
  });
} else {
  process.title = 'Plockity Worker - ' + cluster.worker.id + ' - Node.js';

  var app = require('./server').init( express() );

  var port = process.env.PORT || 3000;

  app.listen(port, function () {
    winston.info('Worker [', cluster.worker.id, '] listening on port', port, '...');
  });
}

function withExit ( options ) {
  mongooseConfig.cleanup();

  if( options.exit ) {
    process.exit();
  }
}

process.on('exit', withExit.bind(null, { clean: true }));

process.on('SIGINT', withExit.bind(null, { exit: true }));
