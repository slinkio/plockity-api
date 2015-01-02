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
  vaultRouter.put('/:dataKey', vault.update);
  vaultRouter.delete('/:dataKey', vault.delete);

  vaultRouter.get('/compare/:dataKey', vault.compare);
  vaultRouter.get('/raw/:dataKey', vault.raw);

  app.use('/api/vault', vaultRouter);
};
