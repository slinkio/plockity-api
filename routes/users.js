var express        = require('express'),
    sessionHandler = require('../handlers/session'),
    usersHandler   = require('../handlers/users'),
    userUtilities  = require('../handlers/user-utilities');

module.exports = function (app) {
  var usersRouter = express.Router(),
      userUtilityRouter = express.Router();

  usersRouter.get('/', sessionHandler.authorize, usersHandler.fetchAll);
  usersRouter.get('/:id', sessionHandler.authorize, usersHandler.fetchByID);
  usersRouter.post('/', usersHandler.create);
  usersRouter.put('/:id', sessionHandler.authorize, usersHandler.update);
  usersRouter.delete('/:id', sessionHandler.authorize, usersHandler.del);

  userUtilityRouter.get('/:id/vault-count', sessionHandler.authorize, userUtilities.vaultCount);

  app.use('/api/users', usersRouter);
  app.use('/api/user', userUtilityRouter);
};