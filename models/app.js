/*
  App - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    jwt      = require('jwt-simple'),
    keygen   = require('keygenerator'),
    Promise  = require('bluebird'); // jshint ignore:line

var subscription = require('../lib/braintree/subscription');

var requestSchema = new Schema({
  time: { type: Date, default: Date.now() }
}, { _id: false });

var appSchema = new Schema({
  name:      String,

  creator:       { type: mongoose.Schema.ObjectId, ref: 'User' },
  plan:          { type: mongoose.Schema.ObjectId, ref: 'Plan' },
  paymentMethod: { type: mongoose.Schema.ObjectId, ref: 'PaymentMethod' },

  usingDefault:   { type: Boolean, default: true },
  subscriptionId: String,
  subscription:   Object,
  domain:         String,
  active:         Boolean,
  requests:       [ requestSchema ],
  requestsNumber: Number,

  apiKey:  String,

  time_stamp: { type: Date, default: Date.now() }
});

appSchema.pre('save', function ( next ) {
  if( !this.isNew ) {
    return next();
  }

  this.apiKey = keygen._();

  next();
});

appSchema.pre('save', function ( next ) {
  var args = [ this ],
      self = this,
      Model = this.constructor;

  Model.populate(this, { path: 'plan' }, function ( err, newDoc ) {
    Model.findById(self._id).populate('plan').exec(function ( err, oldDoc ) {
      if( err ) {
        return next( err );
      }

       // Only continue if there isn't an oldDoc or if the paymentMethod or plan doesn't equal
       // what we already have ( the only time we need to trigger a resubcribe call )
      if( oldDoc && oldDoc.paymentMethod === self.paymentMethod && oldDoc.plan._id === newDoc.plan._id ) {
        return next.call( self );
      }

      if( newDoc.plan.price <= 0 ) {
        subscription.cancel( newDoc.subscriptionId ).then(function ( result ) {
          self.subscriptionId = self.subscription = self.paymentMethod = undefined;
          next.call( self );
        }).catch( next );
      } else {
        if( self.usingDefault === false ) {
          args.push( self.paymentMethod );
        }

        subscription.setupSubscription.apply( this, args ).then(function ( app ) {
          next.call( app );
        }).catch( next );
      }
    });
  });
});

appSchema.pre('remove', function ( next ) {
  if( this.subscriptionId && this.paymentMethod ) {
    subscription.cancel(this.subscriptionId).then(function ( /* result */ ) {
      next();
    }).catch( next );
  }
});

appSchema.methods.newApiKey = function () {
  var app = this;

  return new Promise(function ( resolve, reject ) {
    app.apiKey = keygen._();

    app.save(function ( err, record ) {
      if( err ) {
        return reject( err );
      }

      resolve( record );
    });
  });
};

module.exports = mongoose.model('App', appSchema);
