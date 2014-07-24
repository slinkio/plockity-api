var express          = require('express'),
    sessionHandler   = require('../handlers/session'),
    loginHandler     = require('../handlers/login');

module.exports = function (app) {
  var loginRouter = express.Router();

  loginRouter.post('/', loginHandler.login, sessionHandler.sendGenerateToken);
  
  app.use('/api/login', loginRouter);
};