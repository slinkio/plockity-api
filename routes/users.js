var express      = require('express'),
    usersHandler = require('../handlers/users');

module.exports = function (app) {
  var usersRouter = express.Router();

  usersRouter.get('/', usersHandler.fetchAll);
  usersRouter.get('/:id', usersHandler.fetchByID);

  usersRouter.post('/', usersHandler.create);

  usersRouter.put('/:id', usersHandler.update);

  usersRouter.delete('/:id', usersHandler.del);
  
  app.use('/api/users', usersRouter);
};