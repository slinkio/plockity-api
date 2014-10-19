var App       = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    respond   = require('./response'),
    normalize = require('../config/data-normalization');

var VaultDocument = require('../models/vault-document');

exports.insert = function ( req, res, next ) {
  var auth = req.auth;

  VaultDocument.findOne({ app: auth.app, key: req.dataKey }, function ( err, existingDocument ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( existingDocument ) {
      var error = new Error('Document with key ' + req.dataKey + ' already exists.');
      return respond.error.res( res, error );
    }

      var data = {
        // TODO: Construct document model w/ options considered
      };

      var doc = new VaultDocument( data );

      doc.save(function ( err, record ) {
        if( err ) {
          return respond.error.res( res, err, true );
        }

        res.send( record );
      });
  });
};

exports.update = function ( req, res, next ) {
  var auth = req.auth;

  var update = {
    $set: {
      // TODO: Construct update query ( only allow certain fields )
    }
  };

  VaultDocument.findOneAndUpdate({ app: auth.app, key: req.dataKey }, update, function ( err, updated ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    res.send( updated );
  });
};

exports.delete = function ( req, res, next ) {
  var auth = req.auth;

  VaultDocument.findOneAndRemove({ app: auth.app, key: req.dataKey }, function ( err, result ) {
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
  var auth = req.auth;

  VaultDocument.findOne({ app: auth.app, key: req.dataKey }, function ( err, record ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }
    // TODO: Strip system fields
    res.send( record );
  });
};
