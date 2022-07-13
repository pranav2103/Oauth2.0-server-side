var express = require('express');
var app = express();
var cors= require('cors');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var moment = require('moment');
var querystring = require('querystring');
var Tokens= require('./tokens');
// Very basic HTML templates
var pages = require('./pages');
var authHelper = require('./authHelper');

// Configure express
// Set up rendering of static files
app.use(express.static('static'));
// Need JSON body parser for most API responses
app.use(bodyParser.json());
// Set up cookies and sessions to save tokens
app.use(cookieParser());
app.use(session(
  { secret: '0dc529ba-5051-4cd6-8b67-c9a901bb8bdf',
    resave: false,
    saveUninitialized: false 
  }));

app.use(cors());

// Home page
app.get('/testing', function(req, res) {
  console.log('connected to home page');
  //res.send(pages.loginPage(authHelper.getAuthUrl()));
   res.send('test');
});



app.get('/authorize', function(req, res) {
  // req.query.code="0.AXIAXd_tvsfdc0a_V_eKMno2Nt4jXHd5iYVDqZNjtqdgqb1yAAY.AgABAAIAAAD--DLA3VO7QrddgJg7WevrAgDs_wQA9P_wIh1lJutx2BF0sYw2arPwBdS0wHnRTOSynHXZZrasCZv0hIkEqGnBVZNgwiPXY5enEeVxpeMiXQZLR9PuLpf3aY_KPBAvvQyeIQ36svT4XtLQsmbV0j_WJJlTyTK0cfp7oiOQrqLoGKbmiNFpihAgeWI9W1TiyroNfQsSvDIaUOelZlWKWKYKFyG5B06Pd8itv6cxpiv1XgZs31RCKWb9uE8-Zb6F4M7xrCxkq5Wtl1dUNQffIh0cIBOR7x_yiDBfdjNCw3MGNWUefDNm8GP_uajBre-c9nbOUlUoUO9bBikjDytfAC1RAbBYOQ1ThYXnLQ3gcNDnNQ3oWnNx9OgsNzCiXfIRRQlU9x3nmApHras18LfcUu104nwdvuKLcGqrhq5rkyto6auHlcTfxlC7tViWO7ZKq7GR0gHPt6jUQWTdhEta8ngDd3eBXlgpTS7_lid2iSCpZpSS_SjqDlN1sTECanH8ALKgV1TgmOBWqXAXIQPqGuG41Cvf6FuXikw3tqDPxud5k0bk1OYbOeHbVyaQVBM9QGLgZ_snig4Se83JNKqmuF12eD5xTBMJegEiG_5oUZOsFBUoOsjU3a3_3lOj6cmCrMVa9SlIgojy6L_iCgyjvrzmCOB6ag0MFDc9qB8Q1CCfLoTTIcmQd6wY88BdVVH1FAXxK6V14aYxzwpqA21PnvytDSZvrlzsfepQDyo3TFE8rlIAPdK74TRLCNKHkCgXky21VTckEJG6aOZxVurJ-A"
  var authCode = req.query.code;
  console.log('hello');
  if (authCode) {
    console.log('');
    console.log('Retrieved auth code in /authorize: ' + authCode);
    //we need authcode in react app - code will paramater to the get-token-from-code
    authHelper.getTokenFromCode(authCode, tokenReceived, req, res);
  }
  else {
    // redirect to home
    console.log('/authorize called without a code parameter, redirecting to login');
    res.redirect('/');
  }
});

function tokenReceived(req, res, error, token) {
  if (error) {
    console.log('ERROR getting token:'  + error);
    res.send('ERROR getting token: ' + error);
  }
  else {
    // save tokens in session
    
    req.session.access_token = token.token.access_token;
    req.session.refresh_token = token.token.refresh_token;
    req.session.email = authHelper.getEmailFromIdToken(token.token.id_token);
    var tokens=new Tokens(token.token.access_token,token.token.refresh_token,token.token.expires_in);
    return res. json(tokens);
    //res.redirect('/logincomplete');
  }
}

app.get('/logincomplete', function(req, res) {
  var access_token = req.session.access_token;
  var refresh_token = req.session.access_token;
  var email = req.session.email;
  
  if (access_token === undefined || refresh_token === undefined) {
    console.log('/logincomplete called while not logged in');
    res.redirect('/');
    return;
  }
  
  res.send(pages.loginCompletePage(email));s
});

app.get('/refreshtokens', function(req, res) {
  var refresh_token = req.query.refresh_token;
  if (refresh_token === undefined) {
    console.log('no refresh token in session');
    res.redirect('/');
  }
  else {
    authHelper.getTokenFromRefreshToken(refresh_token, tokenReceived, req, res);
  }
});

app.get('/logout', function(req, res) {
  req.session.destroy();
  res.redirect('/');
});

// Start the server
var server = app.listen(11151, function() {
  var host = server.address().address;
  var port = server.address().port;
  
  console.log('Example app listening at http://%s:%s', host, port);
});