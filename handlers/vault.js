var App       = require('../models/app'),
    winston   = require('winston'),
    bcp       = require('bcrypt'),
    respond   = require('./response'),
    _         = require('lodash'),
    Promise   = require('bluebird'), // jshint ignore: line
    normalize = require('../config/data-normalization'),
    fields    = require('../lib/vault/field-constructor');

var VaultDocument = require('../models/vault-document');

exports.insert = function ( req, res, next ) {
  var auth    = req.authorization,
      payload = req.parsedPayload;

  if( !payload ) {
    return respond.error.res(res, 'Please provide your payload in a JSON object prefixed with "payload".');
  }

  var rdoc    = payload.document,
      dataKey = payload.dataKey;

  if( !dataKey ) {
    return respond.error.res(res, 'Missing dataKey in payload');
  } else if( !rdoc ) {
    return respond.error.res(res, 'Missing document in payload');
  }

  VaultDocument.findOne({ app: auth.app._id, dataKey: dataKey }, function ( err, existingDocument ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( !!existingDocument ) {
      return respond.error.res(res, 'Document with key "' + dataKey + '"" already exists.');
    }

    var options = req.body.options || {};

    fields.construct( rdoc, options ).then(function ( constructed ) {
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

        res.status(201).end();
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
  var auth    = req.authorization,
      dataKey = req.params.dataKey;

  VaultDocument.findOneAndRemove({ app: auth.app._id, dataKey: dataKey }, function ( err, result ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( !result ) {
      res.status(404).send('No document found for ' + dataKey);
    } else {
      res.send( result );
    }
  });
};

exports.compare = function ( req, res, next ) {
  var auth    = req.authorization,
      dataKey = req.params.dataKey,
      payload = req.parsedPayload;

  if( !payload ) {
    return respond.error.res(res, 'Please include comparisons in your payload');
  }

  VaultDocument.findOne({ app: auth.app._id, dataKey: dataKey }, function ( err, record ) {
    if( err ) {
      return respond.error.res(res, err, true);
    }

    if( !record ) {
      return res.status(404).send('No document found for ' + dataKey);
    }

    fields.construct(payload).then(function ( comparisons ) {
      var fieldData = record.data;
      var results = comparisons.map(function ( comparison ) {
        return new Promise(function ( resolve, reject ) {
          if( !comparison || !comparison.path ) {
            return resolve({
              value: comparison.value
            });
          }

          var comparisonValue      = comparison.value,
              fieldIndexInDocument = _.findIndex(fieldData, { path: comparison.path }),
              dataToCompare        = ( fieldIndexInDocument !== undefined ) ? fieldData[ fieldIndexInDocument ] : { path: comparison.path, value: undefined },
              compareResult;

          var resolveResult = function ( bool ) {
            resolve({
              path:  comparison.path,
              value: bool
            });
          };

          if( dataToCompare.encrypted && !( dataToCompare.value === undefined || dataToCompare.value === null ) ) {
            bcp.compare(comparisonValue.toString(), dataToCompare.value, function ( err, bcpResult ) {
              if( err ) throw err;
              resolveResult(bcpResult);
            });
          } else {
            resolveResult( dataToCompare.value === comparisonValue );
          }
        });
      });

      Promise.all(results).then(function ( result ) {
        res.status(200).send(fields.hydrate(result));
      }).catch(function ( err ) {
        respond.error.res(res, err);
      });
    }).catch(function ( err ) {
      respond.error.res(res, err);
    });
  });
};

exports.raw = function ( req, res, next ) {
  var auth = req.authorization;

  VaultDocument.findOne({ app: auth.app._id, dataKey: req.params.dataKey }, function ( err, record ) {
    if( err ) {
      return respond.error.res( res, err, true );
    }

    if( !record ) {
      return respond.code.notfound( res );
    }

    var returnRecord = {
      key:  record.dataKey,
      data: fields.hydrate( record.data )
    };

    res.send( returnRecord );
  });
};
