/*
  App - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    jwt      = require('jwt-simple'),
    keygen   = require('keygenerator');

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

module.exports = mongoose.model('App', appSchema);
