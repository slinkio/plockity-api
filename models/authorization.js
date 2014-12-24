/*
  Authorization - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

var Promise     = require('bluebird'), // jshint ignore:line
    createModel = require('./helpers/create-model'),
    tokenModule = require(process.cwd() + '/lib/auth/token'),
    _           = require('lodash');

expirationGen = tokenModule.expirationGenerator(2, 'hours');

var authorizationSchema = new Schema({
  publicKey:  { type: String, index: true },
  privateKey: String,

  app: { type: Schema.ObjectId, ref: 'App', index: true },

  expiration: { type: Date, default: expirationGen, index: true },
  created:    { type: Date, default: Date.now }
});

authorizationSchema.virtual('isExpired').get(function () {
  var now = new Date();

  return this.expiration < now;
});

/**
 * Removes stale sessions
 * 
 * @return {Object} Promise
 */
authorizationSchema.methods.removeStale = function () {
  var self = this;

  return new Promise(function ( resolve, reject ) {
    var now = new Date();

    self.model('Authorization').remove({ app: self.app, expiration: { $lt: now } }, function ( err, removed ) {
      if( err ) {
        return reject( err );
      }

      resolve( removed );
    });
  });
};

/**
 * Refreshes expiration
 *
 * @return {Object} Promise
 */
authorizationSchema.methods.refresh = function () {
  var self = this;

  return new Promise(function ( resolve, reject ) {
    self.expiration = expirationGen();

    self.save(function ( err, refreshed ) {
      if( err ) {
        return reject( err );
      }

      resolve( refreshed );
    });
  });
};

/**
 * Retrieve Authorization
 * 
 * @param  {String} token Public Key
 * @return {Object}       Promise
 */
authorizationSchema.statics.retrieve = function ( token ) {
  var Authorization = this;

  return new Promise(function ( resolve, reject ) {
    if( !token ) {
      return reject( new Error('You must pass a token') );
    }

    Authorization.findOne({ publicKey: token }).populate('app').exec(function ( err, appAuthorization ) {
      if( err ) {
        return reject( err );
      }

      return resolve( appAuthorization );
    });
  });
};

/**
 * Authorization Creation
 *
 * Refreshes latest, freshest authorization - or creates one if that's not available - and returns it
 * 
 * @param  {String|ObjectId} id App's id
 * @param  {Object} data        Data to be encoded in the App's token
 * @return {Object}             Promise
 */
authorizationSchema.statics.createAuthorization = function ( id, data ) {
  var Authorization = this;

  return new Promise(function ( resolve, reject ) {
    if( !id ) {
      return reject( new Error('You must pass an id') );
    }

    var now = new Date();

    Authorization.findOne({ app: id, expiration: { $gt: now } }).exec(function ( err, existingAuthorization ) {
      if( err ) {
        return reject( err );
      }

      if( existingAuthorization ) {
        return existingAuthorization.refresh().then( resolve ).catch( reject );
      } else {
        var keypair = tokenModule.createKeypair( data );

        var appAuthorization = new Authorization(_.merge({}, {
          app: id
        }, keypair));

        appAuthorization.save(function ( err, newAppAuthorization ) {
          if( err ) {
            return reject( err );
          }

          newAppAuthorization.removeStale().then(function ( result ) {
            resolve( newAppAuthorization );
          });
        });
      }
    });
  });
};

module.exports = createModel('Authorization', authorizationSchema);
