var App       = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    respond   = require('./response'),
    normalize = require('../config/data-normalization'),
    fields    = require('../lib/vault/field-constructor');

var VaultDocument = require('../models/vault-document');

exports.insert = function ( req, res, next ) {
  var auth    = req.authorization,
      dataKey = req.body.dataKey,
      payload = req.parsedPayload;

  if( !req.body.dataKey ) {
    return respond.error.res(res, 'Missing dataKey in request body');
  }

  VaultDocument.findOne({ app: auth.app._id, dataKey: req.body.dataKey }, function ( err, existingDocument ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( existingDocument ) {
      var error = new Error('Document with key ' + req.dataKey + ' already exists.');
      return respond.error.res( res, error );
    }

    var options = req.body.options || {};

    fields.construct( payload, options ).then(function ( constructed ) {
      var data = {
        data:    constructed,
        dataKey: dataKey,
        app:     auth.app._id
      };

      var doc = new VaultDocument( data );

      doc.save(function ( err, record ) {
        if( err ) {
          return respond.error.res( res, err, true );
        }

        res.status(200);
      });
    });
  });
};

exports.update = function ( req, res, next ) {
  var auth = req.authorization;

  var update = {
    $set: {
      // TODO: Construct update query ( only allow certain fields )
    }
  };

  VaultDocument.findOneAndUpdate({ app: auth.app._id, dataKey: req.dataKey }, update, function ( err, updated ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    res.send( updated );
  });
};

exports.delete = function ( req, res, next ) {
  var auth = req.authorization;

  VaultDocument.findOneAndRemove({ app: auth.app._id, dataKey: req.dataKey }, function ( err, result ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    res.send( result );
  });
};

exports.compare = function ( req, res, next ) {
  // TODO: Write compare api
};

exports.raw = function ( req, res, next ) {
  var auth = req.authorization;

  VaultDocument.findOne({ app: auth.app._id, dataKey: req.dataKey }, function ( err, record ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( !record ) {
      return respond.code.notfound( res );
    }

    var returnRecord = {
      key: record.dataKey,
      data: fields.hydrate( record.data )
    };

    res.send( returnRecord );
  });
};
