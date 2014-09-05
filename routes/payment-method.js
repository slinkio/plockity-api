var express        = require('express'),
    sessionHandler = require('../handlers/session'),
    paymentMethodHandler    = require('../handlers/payment-method');

module.exports = function (app) {
  var paymentMethodRouter = express.Router();

  paymentMethodRouter.use( sessionHandler.authorize );

  paymentMethodRouter.get('/', paymentMethodHandler.fetchAll);
  paymentMethodRouter.get('/:id', paymentMethodHandler.fetchByID);

  paymentMethodRouter.post('/', paymentMethodHandler.create);

  paymentMethodRouter.put('/:id', paymentMethodHandler.update);

  paymentMethodRouter.delete('/:id', paymentMethodHandler.del);

  app.use('/api/paymentMethods', paymentMethodRouter);
};
