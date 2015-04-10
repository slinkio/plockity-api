var User          = require('../models/user'),
    winston       = require('winston'),
    chalk         = require('chalk'),
    bcp           = require('bcrypt'),
    respond       = require('./response'),
    normalize     = require('../config/data-normalization'),
    VaultDocument = require('../models/vault-document'),
    _             = require('lodash');

exports.vaultCount = function ( req, res, next ) {
  var id = req.params.id;

  if ( !id ) {
    return respond.error.res(res, 'Please specify an ID in the resource url.');
  }

  if ( req.session.token_unsigned.type === 'user' && req.session.user._id.toString() !== id ) {
    return respond.code.unauthorized(res);
  }

  User.findById(id, function (err, user) {
    if ( err ) {
      return respond.error.res(res, err);
    }

    if ( !user ) {
      return respond.code.notfound(res);
    }

    VaultDocument.find({ app: { $in: user.app } }, function ( err, vaultDocuments ) {
      if ( err ) {
        return respond.error.res(res, err);
      }

      res.send(vaultDocuments.reduce(function ( ret, vaultDocument ) {
        if ( !vaultDocument.data ) {
          return ret;
        }

        var encyptedNodes = _.filter(vaultDocument.data, { encrypt: true });

        ret.dataNodes.total += vaultDocument.data.length;
        ret.dataNodes.encrypted += encyptedNodes;
        ret.dataNodes.unencrypted += vaultDocument.data.length - encyptedNodes;

        return ret;
      }, { total: vaultDocuments.length, dataNodes: { total: 0, encrypted: 0, unencrypted: 0 }}));
    });
  });
};
