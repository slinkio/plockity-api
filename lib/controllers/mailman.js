var winston = require('winston').loggers.get('default'),
    chalk   = require('chalk'),
    Promise = require('bluebird'), // jshint ignore:line
    fs      = require('fs-extra'),
    _       = require('lodash');

var path           = require('path'),
    defTransport   = require(process.cwd() + '/config/mail'),
    emailTemplates = require('email-templates'),
    nodemailer     = require('nodemailer'),
    templatesDir   = path.resolve(process.cwd(), 'mail-templates'),
    partialsDir    = path.resolve(process.cwd(), 'mail-templates', '_partials');

module.exports = Mailman;

/**
 * Mailman Constructor
 * @param {Object} options
 */
function Mailman ( options ) {
  options = options || {};

  this.sender = {
    from: ( options.sender && options.sender.name && options.sender.email ) ? options.sender.name + ' <' + options.sender.email + '>' : 'Plockity <notifications@plockity.org>'
  };

  this.sender.replyTo = options.replyTo || this.sender.from;
  this.__templatesDir = options.templatesDir || templatesDir;
  this.__transportConfig = options.transport || defTransport;
  this.__partials = {};

  var partials = fs.readdirSync( partialsDir ),
      self = this;

  partials.forEach(function ( filename ) {
    var template = fs.readFileSync(path.resolve(partialsDir, filename), 'utf8'),
        name     = filename.split('.')[0];

    self.__partials[ name ] = template;
  });

  return this;
}

/**
 * Mailman Send
 * @param  {String} to
 * @param  {String} subject
 * @param  {String} templateName
 * @param  {Object} vars         Template Locals
 * @return {Promise}             Resolves to Mailer Response
 */
Mailman.prototype.send = function ( to, subject, templateName, vars ) {
  var self = this;

  return new Promise(function ( resolve, reject ) {
    winston.log('debug', chalk.dim('Mailman :: Rendering content for email with template:', templateName));

    return self.__render(templateName, vars).then(function ( rendered ) {
      winston.log('debug', chalk.dim('Mailman :: Rendered content. Sending mail...'));

      var postalService = nodemailer.createTransport( self.__transportConfig );

      postalService.on('log', function ( msg ) {
        if( process.env.debug === true ) {
          winston.log('debug', msg);
        }
      });

      postalService.sendMail({
        from: self.sender.from,
        to: to,
        subject: subject,
        html: rendered.html,
        text: rendered.text
      }, function ( err, res ) {
        if( err ) {
          return reject( err );
        }

        winston.log('debug', chalk.dim('Mailman :: Sent mail!'));

        return resolve( res );
      });
    });
  });
};

/**
 * Mailman __getTemplates
 *
 * @private
 * 
 * @return {Object} email-templates template class
 */
Mailman.prototype.__getTemplates = function () {
  var self = this;

  return new Promise(function ( resolve, reject ) {
    if( self.__templates ) {
      return resolve( self.__templates );
    }

    emailTemplates(self.__templatesDir, {
      partials: self.__partials
    }, function ( err, templates ) {
      if( err ) {
        return reject( err );
      }

      self.__templates = templates;
      return resolve( templates );
    });
  });
};

/**
 * Mailman __render
 *
 * @private
 * 
 * @param  {String} templateName
 * @param  {Object} vars         Template Locals
 * @return {Object}              Containing rendered html & text
 */
Mailman.prototype.__render = function ( templateName, vars ) {
  var self = this;

  return new Promise(function ( resolve, reject ) {
    return self.__getTemplates().then(function ( templates ) {
      templates(templateName, vars, function ( err, html, text ) {
        if( err ) {
          return reject( err );
        }

        resolve({
          html: html,
          text: text
        });
      });
    });
  });
};
