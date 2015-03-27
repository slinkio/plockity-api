var winston        = require('winston'),
    mongooseConfig = require('./config/mongoose'),
    initializers   = require('./initializer'),
    express        = require('express'),
    cluster        = require('cluster'),
    os             = require('os');

var logLevel = ( process.env.environment === 'development' || process.env.environment === 'dev' ) ? 'debug' : 'info';

winston.loggers.add('default', {
  transports: [
    new ( winston.transports.Console )({ level: logLevel })
  ]
});

var port = process.env.port || 3000,
    app  = require('./server');

if ( cluster.isMaster ) {
  var workers = [];

  os.cpus().forEach(function ( cpu, cpuIndex ) {
    function boot ( i ) {
      workers[ i ] = cluster.fork();

      workers[ i ].on('exit', function ( message ) {
        winston.error(chalk.bgRed('Oh noes, a worker died. RIP Worker', i, '. Rebooting...'));
        winston.error(chalk.bgRed(message));
        boot(i);
      });
    }

    boot( cpuIndex );
  });

  initializers.init();

  app.registerPlans().catch(function ( err ) {
    winston.error(chalk.bgRed('Error registering plans.', err.stack));
  });
} else {
  process.title = 'Plockity Worker - ' + cluster.worker.id + ' - Node.js';

  var server = app.init( express() );

  server.listen(port, function () {
    winston.info('Worker [', cluster.worker.id, '] listening on port', port, '...');
  });
}
