var cwd     = process.cwd(),
    chai    = require('chai'),
    expect  = chai.expect,
    winston = require('winston'),
    chalk   = require('chalk');

var os = require('os');

describe('Encryption Caculations', function () {
  it('100 Round Test', function ( done ) {
    this.timeout( 100000 );

    var testVars = {
      workFactor: 12,
      rounds: 100,
      str: 'testStr123456ASF#!R!#$!@#!@R@#F'
    };

    var calc = require(cwd + '/lib/test-helpers/encryption-calculations');

    calc( testVars.workFactor, testVars.str, testVars.rounds ).then(function ( avgCalc ) {
      var calcsPSec      = Math.floor( 1 / ( avgCalc / 1000 ) ),
          calcsPSecCores = os.cpus().length * calcsPSec;

      console.log( '\n' + chalk.underline('Calculation Performance Results') );
      console.log( '\n' + 'Average Calc:', avgCalc + 'ms' );
      console.log( 'Calcs/Time:  ', calcsPSec + '/sec', '(', (calcsPSec * 60) + '/min' , ')' );
      console.log( 'Work Factor: ', testVars.workFactor );
      console.log( 'Rounds:      ', testVars.rounds );
      console.log( 'Byte Size:   ', Buffer.byteLength( testVars.str, 'utf8' ) );
      console.log(
        chalk.green(
          '\n' +
          'This machine could handle (SYNCHRONOUSLY)',
          calcsPSecCores + '/sec',
          '(', ( calcsPSecCores * 60 ) + '/min', ')'
        )
      );
      expect( avgCalc ).to.be.below( 100000 );
      done();
    });
  });
});
