require("dotenv").config();
require('isomorphic-fetch');
const azure = require('@azure/identity');
const graph = require('@microsoft/microsoft-graph-client');
const authProviders = require('@microsoft/microsoft-graph-client/authProviders/azureTokenCredentials');
let _settings = undefined;

// Device Only Credential
let _deviceCodeCredential = undefined;
let _userClient = undefined;

//  App Only Credential 
let _clientSecretCredential = undefined;
let _appClient = undefined;

function initializeSettings(settings) {
  _settings = settings;
}
module.exports.initializeSettings = initializeSettings;

function initializeGraphForUserAuth(settings, deviceCodePrompt) {
  // Ensure settings isn't null
  if (!settings) {
    throw new Error('Settings cannot be undefined');
  }
  _settings = settings;

  if (!_deviceCodeCredential) {
    _deviceCodeCredential = new azure.DeviceCodeCredential({
      clientId: settings.clientId,
      tenantId: settings.authTenant,
      userPromptCallback: deviceCodePrompt
    });
  }

  const scopes = settings.graphUserScopes;
  const authProvider = new authProviders.TokenCredentialAuthenticationProvider(_deviceCodeCredential, { scopes });
  const clientOptions = {
    defaultVersion: 'v1.0',
    debugLogging: true,
    authProvider,
  };
  _userClient = graph.Client.initWithMiddleware(clientOptions);
}
module.exports.initializeGraphForUserAuth = initializeGraphForUserAuth;

async function getUserTokenAsync() {
  // Ensure credential isn't undefined
  if (!_deviceCodeCredential) {
    throw new Error('Graph has not been initialized for user auth');
  }

  // Ensure scopes isn't undefined
  if (!_settings?.graphUserScopes) {
    throw new Error('Setting "scopes" cannot be undefined');
  }

  // Request token with given scopes
  const response = await _deviceCodeCredential.getToken(_settings?.graphUserScopes);
  return response.token;
}
module.exports.getUserTokenAsync = getUserTokenAsync;

async function getUserAsync() {
  // Ensure client isn't undefined
  if (!_userClient) {
    throw new Error('Graph has not been initialized for user auth');
  }

  return _userClient.api('/me')
    // Only request specific properties
    .select(['displayName', 'mail', 'userPrincipalName'])
    .get();
}
module.exports.getUserAsync = getUserAsync;

async function getInboxAsync() {
  // Ensure client isn't undefined
  if (!_userClient) {
    throw new Error('Graph has not been initialized for user auth');
  }

  return _userClient.api('/me/mailFolders/inbox/messages')
    .select(['from', 'isRead', 'receivedDateTime', 'sentDateTime', 'subject', 'body', 'bodyPreview', 'hasAttachments'])
    .top(25)
    .orderby('receivedDateTime DESC')
    .get();
}
module.exports.getInboxAsync = getInboxAsync;

async function sendMailAsync(subject, body, recipient) {
  // Ensure client isn't undefined
  if (!_userClient) {
    throw new Error('Graph has not been initialized for user auth');
  }

  // Create a new message
  const message = {
    subject: subject,
    body: {
      content: body,
      contentType: 'text'
    },
    toRecipients: [
      {
        emailAddress: {
          address: recipient
        }
      }
    ]
  };

  // Send the message
  return _userClient.api('me/sendMail')
    .post({ message });
}
module.exports.sendMailAsync = sendMailAsync;

// ========================[ Client Secret Credential ]========================
// See link https://docs.microsoft.com/en-us/graph/sdks/choose-authentication-providers?tabs=Javascript#client-credentials-provider
// https://docs.microsoft.com/en-us/javascript/api/@azure/identity/?view=azure-node-latest
function ensureGraphForAppOnlyAuth() {
  // Ensure settings isn't null
  if (!_settings) {
    throw new Error('Settings cannot be undefined');
  }

  if (!_clientSecretCredential) {
    _clientSecretCredential = new azure.ClientSecretCredential(
      _settings.tenantId,
      _settings.clientId,
      _settings.clientSecret
    );
  }

  if (!_appClient) {
    const scopes = ['https://graph.microsoft.com/.default'];
    const authProvider = new authProviders.TokenCredentialAuthenticationProvider(_clientSecretCredential, { scopes });
    const clientOptions = {
      defaultVersion: 'v1.0',
      debugLogging: true,
      authProvider,
    };
    _appClient = graph.Client.initWithMiddleware(clientOptions);
  }
}

async function getUsersAsync() {
  ensureGraphForAppOnlyAuth();
  return _appClient?.api('/users')
    .select(['displayName', 'id', 'mail', 'givenName', 'mobilePhone', 'preferredLanguage', 'surname', 'userPrincipalName'])
    .top(25)
    .orderby('displayName')
    .get();
}
module.exports.getUsersAsync = getUsersAsync;

// This function serves as a playground for testing Graph snippets or other code
async function makeGraphCallAsync() {
  // Note: if using _appClient, be sure to call ensureGraphForAppOnlyAuth before using it.
  ensureGraphForAppOnlyAuth();

  const id = _settings.app_user_id;
  if (!id) {
    throw new Error('App user id cannot be undefined');
  }

  const apiEndpoint = `/users/${id}`;
  let response = await _appClient.api(apiEndpoint).get();

  console.log("response", response);
  return response;
}
module.exports.makeGraphCallAsync = makeGraphCallAsync;