import { Client, GraphRequestOptions, PageCollection, PageIterator } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { endOfWeek, startOfWeek } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { User, Event, Message } from 'microsoft-graph';

let graphClient: Client | undefined = undefined;

function ensureClient(authProvider: AuthCodeMSALBrowserAuthenticationProvider) {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
  }

  return graphClient;
}

export async function getUser(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<User> {
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  return await graphClient!.api('/me')
    // Only retrieve the specific fields needed
    // .select('displayName,mail,mailboxSettings,userPrincipalName')
    .get();
}

export async function getProfilePhoto(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<string> {
  ensureClient(authProvider);
  let avatarBlob = await graphClient!.api('/me/photo/$value').get();
  const url = window.URL || window.webkitURL;
  return url.createObjectURL(avatarBlob);
}

export async function getUserWeekCalendar(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  timeZone: string): Promise<Event[]> {
  ensureClient(authProvider);

  // Generate startDateTime and endDateTime query params
  // to display a 7-day window
  const now = new Date();
  const startDateTime = zonedTimeToUtc(startOfWeek(now), timeZone).toISOString();
  const endDateTime = zonedTimeToUtc(endOfWeek(now), timeZone).toISOString();

  // GET /me/calendarview?startDateTime=''&endDateTime=''
  // &$select=subject,organizer,start,end
  // &$orderby=start/dateTime
  // &$top=50
  var response: PageCollection = await graphClient!
    .api('/me/calendarview')
    .header('Prefer', `outlook.timezone="${timeZone}"`)
    .query({ startDateTime: startDateTime, endDateTime: endDateTime })
    // .select('subject,organizer,start,end')
    .orderby('start/dateTime')
    .top(25)
    .get();

  if (response["@odata.nextLink"]) {
    // Presence of the nextLink property indicates more results are available
    // Use a page iterator to get all results
    var events: Event[] = [];

    // Must include the time zone header in page
    // requests too
    var options: GraphRequestOptions = {
      headers: { 'Prefer': `outlook.timezone="${timeZone}"` }
    };

    var pageIterator = new PageIterator(graphClient!, response, (event) => {
      events.push(event);
      return true;
    }, options);

    await pageIterator.iterate();

    return events;
  } else {

    return response.value;
  }
}

export async function createEvent(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  newEvent: Event): Promise<User> {
  ensureClient(authProvider);

  // POST /me/events
  // JSON representation of the new event is sent in the
  // request body
  return await graphClient!
    .api('/me/events')
    .post(newEvent);
}

export async function getUsers(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<Event[]> {
  ensureClient(authProvider);

  // GET /me/users?$select=displayName,id,mail
  let userPage = await graphClient!
    .api('/users')
    .select(['displayName', 'id', 'mail'])
    .get();

  const moreAvailable = userPage['@odata.nextLink'] !== undefined;
  console.log(`More users available? ${moreAvailable}`);

  let users = userPage.value;
  return users;
}

export async function getUserEmails(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<Message[]> {
  ensureClient(authProvider);

  // GET /me/messages?$select=sender,subject
  let messages = await graphClient!
    .api('/me/messages')
    .select(['from', 'sender', 'isRead', 'isDraft', 'toRecipients', 'ccRecipients', 'bccRecipients', 'replyTo', 'flag', 'receivedDateTime', 'sentDateTime', 'categories', 'subject', 'body', 'bodyPreview', 'hasAttachments', 'importance', 'webLink'])
    .top(10)
    .orderby('receivedDateTime DESC')
    .get();

  const moreAvailable = messages['@odata.nextLink'] !== undefined;
  console.log(`More messages available? ${moreAvailable}`);

  return messages.value;
}

// See Link https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
export async function sendMail(authProvider: AuthCodeMSALBrowserAuthenticationProvider,
  message: Message): Promise<Message> {
  ensureClient(authProvider);

  // Create a new message
  const sendMail = {
    saveToSentItems: 'false',
    message,
  };

  // Send the message
  return await graphClient!
    .api('/me/sendMail')
    .post(sendMail);
}