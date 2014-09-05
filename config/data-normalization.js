/*
  Data Normalization Procedures
*/

exports.user = function (user) {
  if(user.login) {
    delete user.login.password;
  }
  
  return prefixType('user', user);
};

exports.app = function ( app ) {
  return prefixType('app', app);
};

exports.apps = function ( apps ) {
  return prefixType('app', apps);
};

exports.paymentMethod = function (paymentMethod) {
  return prefixType('paymentMethod', paymentMethod);
};

exports.paymentMethods = function (paymentMethods) {
  return prefixType('paymentMethod', paymentMethods);
};

/* Private */

function prefixType (type, data) {
  var o = {};

  o[type] = data;

  return o;
}
