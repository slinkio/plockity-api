/*
  Payment Method - Server Data Model
*/

var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    createModel = require('./helpers/create-model'),
    momentDate  = require('../utils/moment-date');

var btPaymentMethod = require('../lib/braintree/payment-method'),
    subscription    = require('../lib/braintree/subscription');

var paymentMethodSchema = new Schema({
  name:      String,
  // Relational
  customerId: { type : mongoose.Schema.ObjectId, ref : 'User' },
  app:        [{ type : mongoose.Schema.ObjectId, ref : 'App' }],

  // Options
  isDefault: Boolean,

  // Customer Data
  address: {
    line1:   String,
    line2:   String,
    city:    String,
    state:   String,
    zipcode: String
  },

  nonce:     String,
  token:     String,

  // System
  methodError: String,
  time_stamp: { type: String, default: momentDate() }
});

/*
  Statics & Hooks
*/

paymentMethodSchema.pre('save', function ( next ) {
  if( !this.isNew ) {
    return next();
  }
  console.log('saving in bt');
  btPaymentMethod.save( this ).then(function ( paymentMethod ) {
    console.log('saved paymentmethod in braintree');
    next.call( paymentMethod );
  }).catch( next );
});

paymentMethodSchema.pre('save', function ( next ) {
  if( this.isDefault && this.token ) {
    console.log('subscribing defaults');
    var doc = this;
    btPaymentMethod.setDefault( this ).then( function ( /* res */ ) {
      console.log(doc);
      console.log('finishing up');
      next.call( doc );
    }).catch( next );
  } else {
    next();
  }
});

paymentMethodSchema.post('save', function ( doc ) {
  if( doc.isDefault && doc.token ) {
    return subscription.subscribeDefault( doc ).then(function () {
      console.log('subscribed defaults.');
    });
  }
});

paymentMethodSchema.pre('remove', function ( next ) {
  btPaymentMethod.remove( this ).then(function ( doc ) {
    console.log('Removed pm from braintree');
    next();
  }).catch( next );
});

paymentMethodSchema.pre('remove', function ( next ) {
  // Reassign new default
  if( this.isDefault === true ) {
    this.constructor.findOne({ customerId: this.customerId }, function ( err, paymentMethod ) {
      if( err ) {
        return next( err );
      }

      if( !paymentMethod ) {
        return next();
      }

      paymentMethod.isDefault = true;

      paymentMethod.save(function ( err, newDefault ) {
        next( err );
      });
    });
  } else {
    next();
  }
});

// Export
module.exports = createModel('PaymentMethod', paymentMethodSchema);
