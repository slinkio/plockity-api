/*
  Payment Method - Server Data Model
*/

var mongoose   = require('mongoose'),
    Schema     = mongoose.Schema,
    momentDate = require('../utils/moment-date');

var btPaymentMethod = require('../lib/braintree/payment-method');

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
  btPaymentMethod.remove( this ).then(function ( paymentMethod ) {
    btPaymentMethod.save( paymentMethod ).then(function ( paymentMethod ) {

      console.log('saved paymentmethod in braintree');

      next.call( paymentMethod );

    }).catch( next );
  }).catch( next );
});

paymentMethodSchema.pre('remove', function ( next ) {
  btPaymentMethod.remove( this ).then(function ( doc ) {
    console.log('Removed pm from braintree');
    next();
  }).catch( next );
});

// Export
module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
