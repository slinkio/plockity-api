var Promise = require('bluebird'), // jshint ignore:line
    logSl   = require('single-line-log').stdout,
    bcp     = require('bcrypt');

module.exports = function ( workFactor, str, rounds ) {
  return new Promise(function ( resolve, reject ) {
    var tasks = [];

    workFactor = workFactor || 10;

    for ( var i = 0; i < rounds; i++ ) {
      tasks.push({});
    }

    Promise.reduce(tasks, function ( calcs, task, index ) {
      var start = new Date();

      logSl( (index + 1) + '/' + rounds + ' Calcs Complete...' );

      return calc( workFactor, str ).then(function () {
        var end = new Date();

        calcs.push( end.getTime() - start.getTime() );
        return calcs;
      });
    }, []).then(function ( calcs ) {
      calcs = calcs.reduce( sum, 0 ) / calcs.length;
      resolve( calcs );
    });
  });
};

function calc ( workFactor, str ) {
  return new Promise(function ( resolve, reject ) {

    bcp.genSalt(workFactor, function ( err, salt ) {
      if( err ) {
        return reject( err );
      }

      bcp.hash(str, salt, function ( err, hash ) {
        if( err ) {
          return reject( err );
        }

        resolve( hash );
      });
    });

  });
}

function sum ( a, b ) {
  return a + b;
}
