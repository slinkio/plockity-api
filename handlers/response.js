/*
  Global Response Handlers
*/

var logger = require('winston');

exports.error = {
  res: function ( res, err, thr ) {
    logger.log('debug', err);
    
    if( thr ) {
      res.status(500).send( err );
      throw new Error(err);
    } else {
      res.status(400).send( err );
    }
  },
  log: function ( err ) {
    logger.log('error', err);
  }
};

exports.code = {
  unauthorized: function (res, msg) {
    res.status(401).json({
      status: 'Unauthorized',
      error: msg || 'You are not authorized to access that resource.'
    });
  },
  notfound: function (res, msg) {
    res.status(404).json({
      status: 'Not Found',
      error: msg || 'That resource was not found or is unavailable.'
    });
  },
  ok: function (res, msg) {
    if(msg) {
      res.send(200, msg);
    } else {
      res.send(200);
    }
  }
};
