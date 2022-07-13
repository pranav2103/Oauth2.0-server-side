var clientId = '57715563-eca4-4b59-8cc6-26158b1ba6c7';
var clientSecret = '1zl8Q~vLgUd1.WiqZPTKm7UoG.9KrcJ9CsLUPbAx';
var redirectUri = 'http://localhost:3000';



var scopes = [
  'openid',
  'offline_access',
  'https://outlook.office.com/calendars.read'
];

var credentials = {
  clientID: clientId,
  clientSecret: clientSecret,
  site: 'https://login.microsoftonline.com/beeddf5d-ddc7-4673-bf57-f78a327a3636',
  authorizationPath: '/oauth2/v2.0/authorize',
  tokenPath: '/oauth2/v2.0/token'
}
var oauth2 = require('simple-oauth2')(credentials)

module.exports = {
  getAuthUrl: function() {
    var returnVal = oauth2.authCode.authorizeURL({
      redirect_uri: redirectUri,
      scope: scopes.join(' ')
    });
    console.log('');
    console.log('Generated auth url: ' + returnVal);
    return returnVal;
  },

  getTokenFromCode: function(auth_code, callback, request, response) { 
    console.log('test');
    oauth2.authCode.getToken({
      code: auth_code,
      redirect_uri: redirectUri,
      scope: scopes.join(' ')
      }, function (error, result) {
        if (error) {
          console.log('Access token error: ', error.message);
          callback(request ,response, error, null);
        }
        else {
          var token = oauth2.accessToken.create(result);
          console.log('');
          console.log('Token created: ', token.token);
          callback(request, response, null, token);
        }
      });
  },

  getEmailFromIdToken: function(id_token) {
    // JWT is in three parts, separated by a '.'
    var token_parts = id_token.split('.');

    // Token content is in the second part, in urlsafe base64
    var encoded_token = new Buffer(token_parts[1].replace('-', '+').replace('_', '/'), 'base64');

    var decoded_token = encoded_token.toString();

    var jwt = JSON.parse(decoded_token);

    // Email is in the preferred_username field
    return jwt.preferred_username
  },

  getTokenFromRefreshToken: function(refresh_token, callback, request, response) {
    var token = oauth2.accessToken.create({ refresh_token: refresh_token, expires_in: 0});
    token.refresh(function(error, result) {
      if (error) {
        console.log('Refresh token error: ', error.message);
        callback(request, response, error, null);
      }
      else {
        console.log('New token: ', result.token);
        callback(request, response, null, result);
      }
    });
  }
};