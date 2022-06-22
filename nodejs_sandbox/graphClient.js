const readline = require('readline-sync');
const graphHelper = require('./utils/graphHelper');
const settings = {
  clientId: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  tenantId: process.env.AZURE_TENANT_ID,
  authTenant: process.env.AZURE_AUTH_TENANT || 'common',
  graphUserScopes: [
    'user.read.all',
    'mail.read',
    'mail.send'
  ],
  interactive: process.env.AZURE_APP_INTERACTIVE === "true" || process.env.AZURE_APP_INTERACTIVE === undefined,
  app_user_id: process.env.AZURE_APP_USER_ID,
};

async function main() {
  console.log(`JavaScript Graph Tutorial - Azure AD Graph API [interactive: ${settings.interactive}]`);

  if (settings.interactive) {
    // Initialize Graph  
    await initializeGraph(settings);

    // Greet the user by name
    await greetUserAsync();
  } else {
    graphHelper.initializeSettings(settings);
  }

  const choices = [
    'Display access token',
    'List my inbox',
    'Send mail',
    'List users (requires app-only)',
    'Make a Graph call'
  ];

  let choice = 0;
  while (choice != -1) {
    choice = readline.keyInSelect(choices, 'Select an option', { cancel: 'Exit' });

    switch (choice) {
      case -1:
        // Exit
        console.log('Goodbye...');
        break;
      case 0:
        // Display access token
        await displayAccessTokenAsync();
        break;
      case 1:
        // List emails from user's inbox
        await listInboxAsync();
        break;
      case 2:
        // Send an email message
        await sendMailAsync();
        break;
      case 3:
        // List users
        await listUsersAsync();
        break;
      case 4:
        // Run any Graph code
        await makeGraphCallAsync();
        break;
      default:
        console.log('Invalid choice! Please try again.');
    }
  }
}

main();

// Main Functions 
async function initializeGraph(settings) {
  graphHelper.initializeGraphForUserAuth(settings, (info) => {
    // Display the device code message to
    // the user. This tells them
    // where to go to sign in and provides the
    // code to use.
    console.log(info.message);
  });
}

async function greetUserAsync() {
  try {
    const user = await graphHelper.getUserAsync();
    console.log(`Hello, ${user?.displayName}!`);
    // For Work/school accounts, email is in mail property
    // Personal accounts, email is in userPrincipalName
    console.log(`Email: ${user?.mail ?? user?.userPrincipalName ?? ''}`);
  } catch (err) {
    console.log(`Error getting user: ${err}`);
  }
}

async function displayAccessTokenAsync() {
  try {
    const userToken = await graphHelper.getUserTokenAsync();
    console.log(`User token: ${userToken}`);
  } catch (err) {
    console.log(`Error getting user access token: ${err}`);
  }
}

async function listInboxAsync() {
  try {
    const messagePage = await graphHelper.getInboxAsync();
    const messages = messagePage.value;

    // Output each message's details
    for (const message of messages) {
      console.log(`Message: ${message.subject ?? 'NO SUBJECT'}`);
      console.log(`  From: ${message.from?.emailAddress?.name ?? 'UNKNOWN'}`);
      console.log(`  Status: ${message.isRead ? 'Read' : 'Unread'}`);
      console.log(`  Received: ${message.receivedDateTime}`);

      console.log(message);
    }

    // If @odata.nextLink is not undefined, there are more messages
    // available on the server
    const moreAvailable = messagePage['@odata.nextLink'] != undefined;
    console.log(`\nMore messages available? ${moreAvailable}`);
  } catch (err) {
    console.log(`Error getting user's inbox: ${err}`);
  }
}

async function sendMailAsync() {
  try {
    // Send mail to the signed-in user
    // Get the user for their email address
    const user = await graphHelper.getUserAsync();
    const userEmail = user?.mail ?? user?.userPrincipalName;

    if (!userEmail) {
      console.log('Couldn\'t get your email address, canceling...');
      return;
    }

    await graphHelper.sendMailAsync('Testing Microsoft Graph',
      'Hello world!', userEmail);
    console.log('Mail sent.');
  } catch (err) {
    console.log(`Error sending mail: ${err}`);
  }
}

async function listUsersAsync() {
  try {
    const userPage = await graphHelper.getUsersAsync();
    const users = userPage.value;
    console.log("Users:", users);

    // Output each user's details
    for (const user of users) {
      console.log(`User: ${user.displayName ?? 'NO NAME'}`);
      console.log(`ID: ${user.id}`);
      console.log(`Email: ${user.mail ?? 'NO EMAIL'}`);
    }

    // If @odata.nextLink is not undefined, there are more users
    // available on the server
    const moreAvailable = userPage['@odata.nextLink'] != undefined;
    console.log(`\nMore users available? ${moreAvailable}`);
  } catch (err) {
    console.log(`Error getting users: ${err}`);
  }
}

async function makeGraphCallAsync() {
  try {
    await graphHelper.makeGraphCallAsync();
  } catch (err) {
    console.log(`Error making Graph call: ${err}`);
  }
}