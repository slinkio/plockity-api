/*
  Plan - Server Data Model
*/

var mongoose =   require('mongoose'),
    Schema =     mongoose.Schema,
    momentDate = require('../utils/moment-date');

var planSchema = new Schema({
  price:       Number,
  description: String,
  tagline:     String,
  title:       String,
  features:    Array,
  apps:        [ { type : mongoose.Schema.ObjectId, ref : 'App' } ]
});

module.exports = mongoose.model('Plan', planSchema);