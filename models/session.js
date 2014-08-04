/*
  User Session - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

var sessionSchema = new Schema({
  user:        { type: Schema.Types.ObjectId, ref: 'User' },
  session_key: String,
  token:       String,
  expires:     String,
  time_stamp:  { type: String, default: new momentDate() }
});

module.exports = mongoose.model('Session', sessionSchema);