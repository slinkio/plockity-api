var express      = require('express'),
    plansHandler = require('../handlers/plans');

module.exports = function (app) {
  var plansRouter = express.Router();

  plansRouter.get('/', plansHandler.fetchAll);
  plansRouter.get('/:id', plansHandler.fetchByID);

  plansRouter.post('/', plansHandler.create);

  plansRouter.put('/:id', plansHandler.update);

  plansRouter.delete('/:id', plansHandler.del);
  
  app.use('/api/plans', plansRouter);
};