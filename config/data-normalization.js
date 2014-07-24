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