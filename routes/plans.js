var express        = require('express'),
    sessionHandler = require('../handlers/session'),
    plansHandler   = require('../handlers/plans');

module.exports = function (app) {
  var plansRouter = express.Router();

  plansRouter.get('/', plansHandler.fetchAll);
  plansRouter.get('/:id', plansHandler.fetchByID);

  plansRouter.post('/', sessionHandler.authorize, plansHandler.create);

  plansRouter.put('/:id', sessionHandler.authorize, plansHandler.update);

  plansRouter.delete('/:id', sessionHandler.authorize, plansHandler.del);
  
  app.use('/api/plans', plansRouter);
};
