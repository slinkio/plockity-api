var express        = require('express'),
    sessionHandler = require('../handlers/session'),
    appsHandler    = require('../handlers/apps');

module.exports = function (app) {
  var appsRouter = express.Router();

  appsRouter.get('/', sessionHandler.authorize, appsHandler.fetchAll);
  appsRouter.get('/:id', sessionHandler.authorize, appsHandler.fetchByID);
  appsRouter.get('/:id/reset-key', sessionHandler.authorize, appsHandler.resetKey);

  appsRouter.post('/', appsHandler.create);

  appsRouter.put('/:id', sessionHandler.authorize, appsHandler.update);

  appsRouter.delete('/:id', sessionHandler.authorize, appsHandler.del);
  
  app.use('/api/apps', appsRouter);
};