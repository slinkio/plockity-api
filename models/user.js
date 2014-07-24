/*
  User - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

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
  apps:       [ { type : mongoose.Schema.ObjectId, ref : 'App' } ],
  active:     Boolean,
  time_stamp: { type: String, default: momentDate() }
});

module.exports = mongoose.model('User', userSchema);