const express = require('express');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const postgraphql = require('postgraphql').postgraphql;
const db = require('./db');
const config = require("../config");
const passport = require('./passport');

const app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// TODO: Configure session in pg and set max age
app.use(require('express-session')(
  { secret: config.sessionSecret, resave: false, saveUninitialized: false }
));

app.use(postgraphql(db, config.graphQl ));

// Configure view engine to render EJS templates.
// TODO: Disable views!!
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());

// Passport routes
// Local auth
app.get('/login',
  function(req, res) {
    res.render('login');
  });  
app.post('/login', 
  passport.authenticate('local', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/web/home');
  });  
app.get('/logout',
  function(req, res){
    req.logout();
    res.redirect('/');
  });
// Google OAuth2
app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile email'] }));
app.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/web/home');
});
// Facebook OAuth2
app.get('/auth/facebook',
  passport.authenticate('facebook', { scope : 'email' }));
app.get('/auth/facebook/callback', 
  passport.authenticate('facebook', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/web/home');
});
// LinkedIn OAuth2
app.get('/auth/linkedin',
  passport.authenticate('linkedin', { scope: ['r_basicprofile', 'r_emailaddress'] }));
app.get('/auth/linkedin/callback', 
  passport.authenticate('linkedin', { failureRedirect: '/' }),
  function(req, res) {
    res.redirect('/web/home');
});
  
// JWT Token release
const jwt = require('jsonwebtoken');
app.get('/token',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    const token = jwt.sign(
      { "role": req.user.role,
      "user_id": req.user.user_id,
      "aud": "postgraphql",
      "iss": "postgraphql"
    }, config.graphQl.jwtSecret, { expiresIn : '60s' });
    res.json({ token : token });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error', {e: err.message});
});

module.exports = app;
