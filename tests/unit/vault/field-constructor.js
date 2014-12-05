var cwd     = process.cwd(),
    chai    = require('chai'),
    expect  = chai.expect,
    winston = require('winston'),
    chalk   = require('chalk');

var fieldConstructor = require(cwd + '/lib/vault/field-constructor');

describe('Vault :: Field Object Constructor', function () {

  it('should handle basic objects with no options', function ( done ) {
    fieldConstructor.construct({
      test:  'data',
      test2: 'otherdata'
    }).then(function ( fields ) {
      expect( fields ).to.be.an('array');

      expect( fields[0].path ).to.equal('test');
      expect( fields[1].path ).to.equal('test2');
      expect( fields[0].encrypt ).to.equal(true);
      expect( fields[1].encrypt ).to.equal(true);
      expect( fields[0].value ).to.equal('data');
      expect( fields[1].value ).to.equal('otherdata');

      done();
    });
  });

  it('should handle basic objects with options', function ( done ) {
    var options = {
      disableEncryption: [ 'test2' ]
    };

    fieldConstructor.construct({
      test:  'data',
      test2: 'otherdata'
    }, options).then(function ( fields ) {
      expect( fields ).to.be.an('array');

      expect( fields[0].path ).to.equal('test');
      expect( fields[1].path ).to.equal('test2');
      expect( fields[0].encrypt ).to.equal(true);
      expect( fields[1].encrypt ).to.equal(false);
      expect( fields[0].value ).to.equal('data');
      expect( fields[1].value ).to.equal('otherdata');

      done();
    });
  });

  it('should handle multi-level objects with no options', function ( done ) {
    fieldConstructor.construct({
      test:  'data',
      nested: {
        data: 'here',
        evenmore: {
          nested: 'inside',
          yet: {
            again: 'huh?'
          }
        }
      },
      shallow: {
        test: 'data'
      }
    }).then(function ( fields ) {
      expect( fields ).to.be.an('array').and.to.have.length(5);

      expect( fields[0].path ).to.equal('test');
      expect( fields[0].value ).to.equal('data');

      expect( fields[1].path ).to.equal('nested.data');
      expect( fields[1].value ).to.equal('here');
      expect( fields[2].path ).to.equal('nested.evenmore.nested');
      expect( fields[2].value ).to.equal('inside');
      expect( fields[3].path ).to.equal('nested.evenmore.yet.again');
      expect( fields[3].value ).to.equal('huh?');

      done();
    });
  });

  it('should handle multi-level objects with options', function ( done ) {
    var options = {
      disableEncryption: [ 'test', 'nested.data', 'nested.evenmore.array' ]
    };

    fieldConstructor.construct({
      test:  'data',
      nested: {
        data: 'here',
        evenmore: {
          nested: 'inside',
          array: [ 'test', 'test2', 'test3' ]
        }
      },
      shallow: {
        test: 'data'
      }
    }, options).then(function ( fields ) {
      expect( fields ).to.be.an('array').and.to.have.length(7);

      expect( fields[0].path ).to.equal('test');
      expect( fields[0].encrypt ).to.equal(false);
      expect( fields[0].value ).to.equal('data');

      expect( fields[1].path ).to.equal('nested.data');
      expect( fields[1].encrypt ).to.equal(false);
      expect( fields[1].value ).to.equal('here');
      expect( fields[2].path ).to.equal('nested.evenmore.nested');
      expect( fields[2].encrypt ).to.equal(true);
      expect( fields[2].value ).to.equal('inside');
      expect( fields[3].path ).to.equal('nested.evenmore.array.0');
      expect( fields[3].encrypt ).to.equal(false);
      expect( fields[3].value ).to.equal('test');

      done();
    });
  });

  it('should rehydrate returned structure', function ( done ) {
    fieldConstructor.construct({
      test: 'data',
      test2: {
        test: 'data2'
      }
    }).then(function ( fields ) {
      var ret = fieldConstructor.hydrate( fields );

      expect(ret).to.be.an('object');
      expect(ret.test).to.equal('data');
      expect(ret.test2.test).to.equal('data2');

      done();
    });
  });
});
