/*
  User - Server Data Model
*/

var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    cryptify    = require('mongoose-cryptify'),
    createModel = require('./helpers/create-model'),
    momentDate  = require('../utils/moment-date');

var userSchema = new Schema({
  login: {
    email:    String,
    password: String
  },
  name: {
    company: String,
    first:   String,
    last:    String
  },

  type: String,

  app: [ { type : mongoose.Schema.ObjectId, ref : 'App' } ],
  paymentMethod: [ { type : mongoose.Schema.ObjectId, ref : 'PaymentMethod' } ],

  active:    Boolean,
  time_stamp: { type: String, default: momentDate() }
});

userSchema.plugin(cryptify, {
  paths: [ 'login.password' ],
  factor: 11
});

module.exports = createModel('User', userSchema);
