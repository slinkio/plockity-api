var express          = require('express'),
    checkEmailHandler = require('../handlers/check-email');

module.exports = function (app) {
  var checkEmailRouter = express.Router();

  checkEmailRouter.get('/user/', checkEmailHandler.checkUserEmail);
  checkEmailRouter.get('/admin/', checkEmailHandler.checkAdminEmail);
  
  app.use('/api/check-email', checkEmailRouter);
};