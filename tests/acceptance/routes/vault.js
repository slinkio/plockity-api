/* jshint expr:true */
var cwd = process.cwd();

var chai    = require('chai'),
    expect  = chai.expect,
    moment  = require('moment'),
    _       = require('lodash'),
    chalk   = require('chalk'),
    winston = require('winston'),
    Promise = require('bluebird'); // jshint ignore:line

var plugins = [
  require('chai-as-promised'),
  require('chai-http')
];

plugins.map(function ( plugin ) {
  chai.use( plugin );
});

chai.request.addPromises(Promise);

var app           = require(cwd + '/app').init( require('express')() ),
    Authorization = require(cwd + '/models/authorization'),
    App           = require(cwd + '/models/app'),
    mongoose      = require('mongoose');

describe('Route :: Vault', function () {

  describe('Endpoints', function () {
    var _authorization;

    /* Test support */
    before(function ( done ) {
      var app = new App({

      });

      var authorizationData = {
        app: app._id.toString()
      };

      Authorization.createAuthorization( app._id, authorizationData ).then(function ( appAuthorization ) {
        _authorization = appAuthorization.publicKey;
        done();
      });
    });

    after(function ( done ) {
      var mongoose = require('mongoose');
      mongoose.connection.db.dropDatabase(done);
    });
    /* ./ Test support */
  });
});
