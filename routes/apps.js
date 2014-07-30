var express      = require('express'),
    appsHandler = require('../handlers/apps');

module.exports = function (app) {
  var appsRouter = express.Router();

  appsRouter.get('/', appsHandler.fetchAll);
  appsRouter.get('/:id', appsHandler.fetchByID);

  appsRouter.post('/', appsHandler.create);

  appsRouter.put('/:id', appsHandler.update);

  appsRouter.delete('/:id', appsHandler.del);
  
  app.use('/api/apps', appsRouter);
};