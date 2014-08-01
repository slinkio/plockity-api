var express      = require('express'),
    transactionHandler = require('../handlers/transaction');

module.exports = function (app) {
  var transactionRouter = express.Router();

  transactionRouter.get('/token', transactionHandler.generateBraintreeToken);
  
  app.use('/api/transaction', transactionRouter);
};