var express = require('express'),
    vault   = require('../handlers/vault');

var authMiddleware         = require('../lib/middleware/app-auth'),
    subscriptionMiddleware = require('../lib/middleware/subscription'),
    payloadParser          = require('../lib/middleware/payload-parser');

module.exports = function ( app ) {
  var vaultRouter = express.Router();

  vaultRouter.use( authMiddleware(true) );
  vaultRouter.use( subscriptionMiddleware );
  vaultRouter.use( payloadParser('payload') );

  vaultRouter.post('/', vault.insert);
  vaultRouter.put('/', vault.update);
  vaultRouter.delete('/', vault.delete);

  vaultRouter.get('/compare/', vault.compare);
  vaultRouter.get('/raw', vault.raw);

  app.use('/api/vault', vaultRouter);
};
