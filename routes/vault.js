var express = require('express'),
    auth    = require('../handlers/authorize'),
    vault   = require('../handlers/vault');

module.exports = function ( app ) {
  var vaultRouter = express.Router();

  vaultRouter  .post('/', auth.checkAuthorization, vault.insert);
  vaultRouter   .put('/', auth.checkAuthorization, vault.update);
  vaultRouter.delete('/', auth.checkAuthorization, vault.delete);

  vaultRouter.get('/compare/', auth.checkAuthorization, vault.compare);
  vaultRouter.get('/raw', auth.checkAuthorization, vault.raw);
  
  app.use('/api/vault', vaultRouter);
};
