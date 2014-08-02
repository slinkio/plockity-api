/*
  Braintree configuration
*/

var mongoose        = require('mongoose'),
    winston         = require('winston'),
    braintree       = require('braintree'),
    braintreeConfig = require('../config/keys').braintree;


exports.init = function () {
  winston.info('Connecting to braintree...');
  // Set Braintree Environment
  braintreeConfig.environment = braintree.Environment.Sandbox;
  // Return gateway
  return braintree.connect(braintreeConfig);
}
