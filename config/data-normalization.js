/*
  Data Normalization Procedures
*/

exports.user = function (user) {
  if(user.login) {
    delete user.login.password;
  }
  
  return prefixType('user', user);
};

exports.app = function (app) {
  return prefixType('app', app);
};

exports.apps = function (apps) {
  apps = apps.map(function (app) {
    app.plan.id = app.plan._id;
    delete app.plan._id;
    delete app.plan.__v;
    return app;
  });

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
