/*
  App - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

var appSchema = new Schema({
  name:      String,
  creator:   { type: mongoose.Schema.ObjectId, ref: 'User' },
  plan:      { type: mongoose.Schema.ObjectId, ref: 'Plan' },
  paymentMethod: { type: mongoose.Schema.ObjectId, ref: 'PaymentMethod' },
  subscriptionId: String,
  domain:    String,
  active:    Boolean,
  purchased: {
    product: String,
    expiry:  String
  },
  requests:  Number,
  time_stamp: { type: String, default: momentDate() }
});

module.exports = mongoose.model('App', appSchema);
