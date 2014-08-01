/*
  Data Normalization Procedures
*/

exports.user = function (user) {
  if(user.login) {
    delete user.login.password;
  }
  
  return {
    user: user
  };
}

exports.app = function (app) {
  return {
    app: app
  };
}

exports.apps = function (apps) {
  apps = apps.map(function (app) {
    app.plan.id = app.plan._id;
    delete app.plan._id;
    delete app.plan.__v;
    return app;
  });
  return {
    apps: apps
  };
}