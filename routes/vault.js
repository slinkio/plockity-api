var express = require('express'),
    auth    = require('../handlers/authorize'),
    vault   = require('../handlers/vault');

module.exports = function ( app ) {
  var vaultRouter = express.Router();

  vaultRouter.post('/', vault.insert);
  vaultRouter.put('/', vault.update);
  vaultRouter.delete('/', vault.delete);

  vaultRouter.get('/compare/', vault.compare);
  vaultRouter.get('/raw', vault.raw);

  app.use('/api/vault', vaultRouter);
};
