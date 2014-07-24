var express          = require('express'),
    authorizeHandler = require('../handlers/authorize');

module.exports = function (app) {
  var authorizeRouter = express.Router();

  authorizeRouter.get('/', authorizeHandler.checkAuthorization, authorizeHandler.sendGenerateToken);
  
  app.use('/api/authorize', authorizeRouter);
};