const session = require('express-session');

const session_auth_object = {
  name:'session-auth-srch',
  secret: ['w6X9VxSxmqYPvPKtZXsb6VB1230jjxzXrQeQ65kZbqbsgUQkfR6Qhw'],
  saveUninitialized: false,
  resave: false,
  cookie: {}
  }

  if(process.env.NODE_ENV==="production"){
    session_auth_object.cookie.secure=true
    session_auth_object.cookie.httpOnly=true
    session_auth_object.cookie.sameSite=true
  }

  const session_auth= session(session_auth_object)

module.exports = {
session_auth:session_auth
}
