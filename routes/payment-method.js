var express        = require('express'),
    sessionHandler = require('../handlers/session'),
    paymentMethodHandler    = require('../handlers/payment-method');

module.exports = function (app) {
  var paymentMethodRouter = express.Router();

  paymentMethodRouter.get('/', sessionHandler.authorize, paymentMethodHandler.fetchAll);
  paymentMethodRouter.get('/:id', sessionHandler.authorize, paymentMethodHandler.fetchByID);

  paymentMethodRouter.post('/', paymentMethodHandler.create);

  paymentMethodRouter.put('/:id', sessionHandler.authorize, paymentMethodHandler.update);

  paymentMethodRouter.delete('/:id', sessionHandler.authorize, paymentMethodHandler.del);
  
  app.use('/api/paymentMethods', paymentMethodRouter);
};
