/*
  Vault Document - Server Data Model
*/

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

var fieldSchema = new Schema({
  encrypt: { type: Boolean, default: true },
  path:    String,
  value:   String
});

var vaultDocSchema = new Schema({
  data:       [ fieldSchema ],
  app:        { type: Schema.ObjectId, ref: 'App' },
  time_stamp: { type: Date, default: Date.now() }
});

module.exports = mongoose.model('VaultDocument', vaultDocSchema);
