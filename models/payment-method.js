/*
  Payment Method - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

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

module.exports = mongoose.model('PaymentMethod', paymentMethodSchema);
