/* jshint expr:true */
var cwd = process.cwd();

var chai    = require('chai'),
    expect  = chai.expect,
    moment  = require('moment'),
    _       = require('lodash'),
    chalk   = require('chalk'),
    winston = require('winston'),
    Promise = require('bluebird'); // jshint ignore:line

var plugins = [
  require('chai-http')
];

plugins.map(function ( plugin ) {
  chai.use( plugin );
});

chai.request.addPromises(Promise);

var app           = require(cwd + '/server').init( require('express')() ),
    Authorization = require(cwd + '/models/authorization'),
    App           = require(cwd + '/models/app'),
    VaultDocument = require(cwd + '/models/vault-document'),
    Plan          = require(cwd + '/models/plan'),
    mongoose      = require('mongoose');

describe('Route :: Vault', function () {

  describe('All Endpoints', function () {
    it('should not accept requests w/o auth header', function ( done ) {
      var expectKey = function ( res ) {
        expect(res).to.have.status(401);
        expect(res.error.text).to.contain('X-App-Authorization');
      };

      var prefix = '/api/vault/';
      var paths = [
        { type: 'get', path: 'raw' },
        { type: 'get', path: 'compare' },
        { type: 'post', path: '' },
        { type: 'delete', path: '' },
        { type: 'put', path: '' }
      ];

      Promise.all(paths.map(function ( pathObject ) {
        return chai.request(app)[pathObject.type](prefix + pathObject.path).then(expectKey);
      })).then(function () {
        done();
      });
    });
  });

  describe('Endpoints', function () {
    var _authorization, _rootAuth, _plockityApp;

    /* Test support */
    before(function ( done ) {
      var plan = new Plan({
          price:       0,
          description: 'Plan for Mocha.js',
          title:       'Mocha',
          maxRequests: 500000
      });

      plan.save(function ( err, savedPlan ) {
        if( err ) throw err;

        var appDoc = new App({
          name: 'Mocha Test',
          plan: savedPlan._id,
          url:  'localhost'
        });

        appDoc.save(function ( err, savedApp ) {
          if( err ) throw err;

          _plockityApp = savedApp;

          var authorizationData = {
            app: savedApp._id.toString()
          };

          Authorization.createAuthorization( savedApp._id, authorizationData ).then(function ( appAuthorization ) {
            _authorization = appAuthorization.publicKey;
            _rootAuth      = appAuthorization;
            done();
          });
        });
      });
    });

    after(function ( done ) {
      mongoose.connection.db.dropDatabase(done);
    });
    /* ./ Test support */

    describe('POST', function () {
      it('should reject an invalid request', function ( done ) {
        chai
          .request(app)
          .post('/api/vault/')
          .send({})
          .set('X-App-Authorization', _authorization)
          .then(function ( res ) {
            expect(res).to.have.status(400);
            expect(res.error.text.toLowerCase()).to.contain('provide').and.to.contain('payload');

            return chai
              .request(app)
              .post('/api/vault/')
              .send({
                payload: {
                  document: {
                    test: 'mocha'
                  }
                }
              })
              .set('X-App-Authorization', _authorization);
          })
          .then(function ( res ) {
            expect(res).to.have.status(400);
            expect(res.error.text.toLowerCase()).to.contain('missing').and.to.contain('datakey');

            return chai
              .request(app)
              .post('/api/vault/')
              .send({
                payload: {
                  dataKey: 'test'
                }
              })
              .set('X-App-Authorization', _authorization);
          })
          .then(function ( res ) {
            expect(res).to.have.status(400);
            expect(res.error.text.toLowerCase()).to.contain('missing').and.to.contain('document');

            done();
          });
      });

      it('should insert a document', function ( done ) {
        var req = {
          payload: {
            dataKey: 'test',
            document: {
              myData: 'that is encrypted',
              awesome: {
                multilevel: 'stuff'
              },
              and: [ 'dont', 'forget', 'about', 'arrays' ]
            }
          }
        };

        chai
          .request(app)
          .post('/api/vault/')
          .send(req)
          .set('X-App-Authorization', _authorization)
          .then(function ( res ) {
            expect(res).to.have.status(201);

            VaultDocument.findOne({ dataKey: 'test', app: _rootAuth.app }).exec(function ( err, vaultDoc ) {
              if( err ) throw err;

              expect(vaultDoc).to.exist;
              expect(vaultDoc.dataKey).to.equal(req.payload.dataKey);
              expect(vaultDoc.data).to.have.length(6);

              done();
            });
          });
      });

      it('should reject duplicate dataKeys', function ( done ) {
        var req = {
          payload: {
            dataKey: 'test',
            document: {
              myData: 'that is encrypted'
            }
          }
        };

        chai
          .request(app)
          .post('/api/vault/')
          .send(req)
          .set('X-App-Authorization', _authorization)
          .then(function ( res ) {
            expect(res).to.have.status(400);
            expect(res.error.text.toLowerCase()).to.contain('exists');

            done();
          });
      });

      // TODO: Test options
    });
  
    describe('GET', function () {
      var _doc;

      before(function ( done ) {
        var fields = require(process.cwd() + '/lib/vault/field-constructor');
        var dataForDoc = {
          test: 'data',
          nested: {
            test: 'data2'
          },
          arrays: [ 'are', 'ok', 'too' ]
        };

        fields.construct(dataForDoc).then(function ( constructed ) {
          var testDoc = new VaultDocument({
            dataKey: 'test123',
            data:    constructed,
            app:     _plockityApp._id
          });

          testDoc.save(function ( err, doc ) {
            if( err ) throw err;
            _doc = doc;
            done();
          });
        });
      });

      after(function ( done ) {
        _doc.remove(function ( err ) {
          if( err ) throw err;
          done();
        });
      });

      describe('raw', function () {
        it('should 404 when no document is found', function ( done ) {
          chai.request(app)
            .get('/api/vault/raw/123notfound')
            .set('X-App-Authorization', _authorization)
            .then(function ( res ) {
              expect(res).to.have.status(404);
              done();
            });
        });

        it('should get raw data', function ( done ) {
          chai.request(app)
            .get('/api/vault/raw/' + _doc.dataKey)
            .set('X-App-Authorization', _authorization)
            .then(function ( res ) {
              expect(res).to.have.status(200);
              expect(res.body.data).to.exist.and.to.have.property('test');
              expect(res.body.data).to.have.property('arrays');
              expect(res.body.key).to.equal(_doc.dataKey);
              done();
            });
        });
      });

      describe('compare', function () {
        it('should reject requests w/o compare payload', function ( done ) {
          chai.request(app)
            .get('/api/vault/compare/123')
            .set('X-App-Authorization', _authorization)
            .then(function ( res ) {
              expect(res).to.have.status(400);
              expect(res.error.text.toLowerCase()).to.contain('comparisons').and.to.contain('payload');
              done();
            });
        });

        it('should 404 when no document is found', function ( done ) {
          chai.request(app)
            .get('/api/vault/compare/123notfound')
            .set('X-App-Authorization', _authorization)
            .send({
              payload: {
                test: 'data'
              }
            })
            .then(function ( res ) {
              expect(res).to.have.status(404);
              done();
            });
        });

        it('should return comparative data', function ( done ) {
          chai.request(app)
            .get('/api/vault/compare/' + _doc.dataKey)
            .set('X-App-Authorization', _authorization)
            .send({
              payload: {
                test: 'data',
                nested: {
                  test: 'wrong'
                },
                arrays: [ 'are', 'WRONG', 'too' ]
              }
            })
            .then(function ( res ) {
              expect(res).to.have.status(200);
              expect(res.body).to.have.property('test').and.to.equal(true);
              expect(res.body).to.have.property('nested').and.to.have.property('test').and.to.equal(false);
              expect(res.body).to.have.property('arrays').and.be.an('array');
              expect(res.body.arrays[0]).to.equal(true);
              expect(res.body.arrays[1]).to.equal(false);
              expect(res.body.arrays[2]).to.equal(true);

              done();
            });
        });

        // TODO: Test multiple types of comparative requests ->
        // - Encrypted booleans
        // - Undefined paths
      });
    });

    // TODO: Test PUT

    describe('DELETE', function () {
      it('should 404 requests w/o dataKey in url', function ( done ) {
        chai.request(app)
          .delete('/api/vault/')
          .set('X-App-Authorization', _authorization)
          .then(function ( res ) {
            expect(res).to.have.status(404);
            done();
          });
      });

      it('should 404 requests w/ not found data keys', function ( done ) {
        chai.request(app)
          .delete('/api/vault/123notfound')
          .set('X-App-Authorization', _authorization)
          .then(function ( res ) {
            expect(res).to.have.status(404);
            done();
          });
      });

      it('should delete vault documents', function ( done ) {
        var testDoc = new VaultDocument({
          dataKey: 'test123',
          app:     _plockityApp._id
        });

        testDoc.save(function ( err, doc ) {
          if( err ) throw err;

          chai.request(app)
            .delete('/api/vault/' + doc.dataKey)
            .set('X-App-Authorization', _authorization)
            .then(function ( res ) {
              expect(res).to.have.status(200);

              VaultDocument.findById(doc._id.toString(), function ( err, documentExists ) {
                if( err ) throw err;

                expect(!!documentExists).to.equal(false);
                done();
              });
            });
        });
      });
    });
  });
});
