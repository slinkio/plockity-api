/*
  Plan - Server Data Model
*/

var mongoose    = require('mongoose'),
    Schema      = mongoose.Schema,
    createModel = require('./helpers/create-model'),
    momentDate  = require('../utils/moment-date');

var planSchema = new Schema({
  price:       Number,
  description: String,
  tagline:     String,
  title:       String,
  maxRequests: Number,
  features:    Array
});

module.exports = createModel('Plan', planSchema);
