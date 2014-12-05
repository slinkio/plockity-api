/*
  Vault Document - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var fieldSchema = new Schema({
  encrypted: { type: Boolean, default: false },
  encrypt:   { type: Boolean, default: true },
  path:      String,
  value:     String
});

var vaultDocSchema = new Schema({
  data:       [ fieldSchema ],
  app:        { type: Schema.ObjectId, ref: 'App' },
  dataKey:    { type: String, index: true },
  time_stamp: { type: Date, default: Date.now() }
});

/* Middleware */
vaultDocSchema.pre('save', function ( next ) {
  var bcp     = require('bcrypt'),
      Promise = require('bluebird'),
      _       = require('lodash'),
      self    = this;

  this.constructor.populate(this, { path: 'app' }, function ( err, record ) {
    if( err ) {
      return next( err );
    }

    record.app.constructor.populate( record.app, { path: 'plan' }, function ( err, app ) {
      if( err ) {
        return next( err );
      }

      var encryptionRounds = app.plan.encryptionRounds || 10;

      Promise.map(self.data, function ( field ) {
        if( !field.encrypt || !_.isString(field.value) || field.encrypted ) {
          return field;
        }

        return new Promise(function ( resolve ) {
          bcp.genSalt( encryptionRounds, function ( err, salt ) {
            if( err ) {
              throw err;
            }

            bcp.hash(field.value, salt, function ( err, hash ) {
              if( err ) {
                throw err;
              }

              field.value = hash;
              resolve( field );
            });
          });
        });
      }).then(function ( parsedData ) {
        self.data = parsedData;
        next.call( self );
      }).catch( next );
    });
  });
});

module.exports = mongoose.model('VaultDocument', vaultDocSchema);
