var express        = require('express'),
    sessionHandler = require('../handlers/session'),
    usersHandler   = require('../handlers/users');

module.exports = function (app) {
  var usersRouter = express.Router();

  usersRouter.get('/', sessionHandler.authorize, usersHandler.fetchAll);
  usersRouter.get('/:id', sessionHandler.authorize, usersHandler.fetchByID);

  usersRouter.post('/', usersHandler.create);

  usersRouter.put('/:id', sessionHandler.authorize, usersHandler.update);

  usersRouter.delete('/:id', sessionHandler.authorize, usersHandler.del);
  
  app.use('/api/users', usersRouter);
};