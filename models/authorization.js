/*
  Authorization - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

var authorizationSchema = new Schema({
  app: { type: Schema.Types.ObjectId, ref: 'App' },
  session_key: String,
  expires: String,
  time_stamp: { type: String, default: new momentDate() }
});

module.exports = mongoose.model('Authorization', authorizationSchema);