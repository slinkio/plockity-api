/*
  Braintree configuration
*/

var mongoose        = require('mongoose'),
    winston         = require('winston'),
    braintree       = require('braintree'),
    braintreeConfig = require('../config/keys').braintree,
    connection;

exports.init = function () {
  if( connection ) {
    return connection;
  } else {
    winston.info('Connecting to braintree...');
    // Set Braintree Environment
    braintreeConfig.environment = braintree.Environment.Sandbox;
    // Return gateway
    connection = braintree.connect(braintreeConfig);

    return connection;
  }
};
