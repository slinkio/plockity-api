/*
  App - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    jwt      = require('jwt-simple'),
    keygen   = require('keygenerator');

var subscription = require('../lib/braintree/subscription');

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
  requests:       Number,

  signatures: {
    publicKey:  String,
    privateKey: String
  },

  time_stamp: { type: Date, default: Date.now() }
});

appSchema.pre('save', function ( next ) {
  if( !this.isNew ) {
    return next();
  }

  this.privateKey = keygen._();
  this.publicKey  = jwt.encode( this._id.toString(), this.privateKey );

  next();
});

appSchema.pre('save', function ( next ) {
  var args = [ this ],
      self = this;

  this.constructor.findById(this._id, function ( err, oldDoc ) {
    if( err ) {
      return next( err );
    }

     // Only continue if there isn't an oldDoc or if the paymentMethod or plan doesn't equal
     // what we already have ( the only time we need to trigger a resubcribe call )
    if( oldDoc && oldDoc.paymentMethod === self.paymentMethod && oldDoc.plan === self.plan ) {
      return next.call( self );
    }

    if( self.usingDefault === false ) {
      args.push( self.paymentMethod );
    }

    subscription.setupSubscription.apply( this, args ).then(function ( app ) {
      next.call( app );
    });

  });
});

module.exports = mongoose.model('App', appSchema);
