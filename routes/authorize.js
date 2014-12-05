var express          = require('express'),
    authorizeHandler = require('../handlers/authorize');

module.exports = function (app) {
  var authorizeRouter = express.Router();

  authorizeRouter.get('/', authorizeHandler.auth);
  
  app.use('/api/authorize', authorizeRouter);
};