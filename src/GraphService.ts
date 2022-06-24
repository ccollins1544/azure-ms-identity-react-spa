import { Client, GraphRequestOptions, PageCollection, PageIterator } from '@microsoft/microsoft-graph-client';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { endOfWeek, startOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { User, Event, Message } from 'microsoft-graph';

let graphClient: Client | undefined = undefined;

// Types 
type calendarParams = {
  timeZone: string | undefined;
  startDate: string | Date | number | undefined;
  endDate: string | Date | number | undefined;
  selectParams?: Array<string>,
  limitParam?: number,
  orderByParams?: string,
  assignedUserIdList?: number,
};

type userParams = {
  selectParams?: Array<string>,
};

type getEmailParams = {
  selectParams?: Array<string>,
  limit?: number,
  offset?: number,
  orderByParams?: string,
  sortField?: string,
  sortOrder?: string,
};

type sendEmailParams = {
  saveToSentItems: string | boolean | undefined;
};

// =========================[ A. Helper Functions ]==============================
function ensureClient(authProvider: AuthCodeMSALBrowserAuthenticationProvider) {
  if (!graphClient) {
    graphClient = Client.initWithMiddleware({
      authProvider: authProvider
    });
  }

  return graphClient;
}

// =========================[ B. Main Functions ]==============================
export async function getUser(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<User> {
  ensureClient(authProvider);

  // Return the /me API endpoint result as a User object
  return await graphClient!.api('/me').get();
};

export async function getUsers(authProvider: AuthCodeMSALBrowserAuthenticationProvider, params: userParams): Promise<Event[]> {
  ensureClient(authProvider);

  let { selectParams } = params || {};
  if (!Array.isArray(selectParams)) {
    selectParams = ['displayName', 'id', 'mail'];
  }

  // GET /me/users?$select=displayName,id,mail
  let userPage = await graphClient!
    .api('/users')
    .select(selectParams)
    .get();

  const moreAvailable = userPage['@odata.nextLink'] !== undefined;
  (moreAvailable) && console.log("More users available");

  let users = userPage.value;
  return users;
};

export async function getProfilePhoto(authProvider: AuthCodeMSALBrowserAuthenticationProvider): Promise<string> {
  ensureClient(authProvider);

  let avatarBlob = await graphClient!.api('/me/photo/$value').get();
  const url = window.URL || window.webkitURL;
  return url.createObjectURL(avatarBlob);
};

export async function getUserWeekCalendar(authProvider: AuthCodeMSALBrowserAuthenticationProvider, params: calendarParams, formatTheData: boolean = true): Promise<Event[]> {
  ensureClient(authProvider);

  let { timeZone, selectParams, orderByParams, limitParam, assignedUserIdList } = params || {};
  if (!timeZone) {
    timeZone = "Etc/UTC";
  }
  if (!Array.isArray(selectParams)) {
    selectParams = ['id', 'isAllDay', 'isOrganizer', 'isCancelled', 'responseRequested', 'showAs', 'webLink', 'isDraft', 'hideAttendees', 'subject', 'organizer', 'attendees', 'start', 'end', 'bodyPreview', 'body', 'importance', 'sensitivity'];
  }
  if (!orderByParams || typeof orderByParams !== 'string') {
    orderByParams = 'start/dateTime ASC';
  }
  if (!limitParam || typeof limitParam !== 'number') {
    limitParam = 50;
  }

  // Generate startDateTime and endDateTime query params to display a 7-day window
  const now = new Date();
  const startDateTime = zonedTimeToUtc(startOfWeek(now), timeZone).toISOString();
  const endDateTime = zonedTimeToUtc(endOfWeek(now), timeZone).toISOString();
  const queryParams = { startDateTime, endDateTime };

  // GET /me/calendarview?startDateTime=''&endDateTime=''
  // &$select=subject,organizer,start,end
  // &$orderby=start/dateTime
  // &$top=50
  let response: PageCollection = await graphClient!
    .api('/me/calendarview')
    .header('Prefer', `outlook.timezone="${timeZone}"`)
    .query(queryParams)
    .select(selectParams)
    .orderby(orderByParams)
    .top(limitParam)
    .get();

  let data;
  if (response["@odata.nextLink"]) {
    // Presence of the nextLink property indicates more results are available
    // Use a page iterator to get all results
    let events: Event[] = [];

    // Must include the time zone header in page requests too
    let options: GraphRequestOptions = {
      headers: { 'Prefer': `outlook.timezone="${timeZone}"` }
    };

    let pageIterator = new PageIterator(graphClient!, response, (event) => {
      events.push(event);
      return true;
    }, options);

    await pageIterator.iterate();

    data = events;
  } else {
    data = response.value;
  }

  if (formatTheData && Array.isArray(data) && data.length) {
    data = data.map((event_raw) => {
      let first_name = '', last_name = '';
      if (event_raw?.organizer?.emailAddress?.name) {
        first_name = event_raw.organizer.emailAddress.name.split(' ')[0];
        last_name = event_raw.organizer.emailAddress.name.split(' ')[1];
      }

      let task_status_id = 1; // Created
      let assigned_user_id = Number(assignedUserIdList);
      let start_timestamp = parseISO(event_raw.start?.dateTime);
      let end_timestamp = parseISO(event_raw.end?.dateTime);

      let event_formatted = {
        task_status_id,
        ...(assigned_user_id && { assigned_user_id }),
        start_timestamp,
        end_timestamp,
        assigned_user: {
          first_name,
          last_name,
        },
        task_status: {
          status: "Created"
        },
        title: event_raw?.subject,
        allDay: event_raw?.isAllDay,
        start: new Date(start_timestamp),
        end: new Date(end_timestamp),
        id: event_raw?.id, // This is not an integer btw.
        description: event_raw?.bodyPreview || event_raw?.body?.content || '',
        styles: { backgroundColor: "#396799" }
      };
      return event_formatted;
    })
  }

  return data;
};

export async function getUserCalendar(authProvider: AuthCodeMSALBrowserAuthenticationProvider, params: calendarParams, formatTheData: boolean = true): Promise<Event[]> {
  ensureClient(authProvider);

  let { timeZone, startDate, endDate, selectParams, orderByParams, limitParam, assignedUserIdList } = params || {};
  if (!timeZone) {
    timeZone = "Etc/UTC";
  }
  if (!Array.isArray(selectParams)) {
    selectParams = ['id', 'isAllDay', 'isOrganizer', 'isCancelled', 'responseRequested', 'showAs', 'webLink', 'isDraft', 'hideAttendees', 'subject', 'organizer', 'attendees', 'start', 'end', 'bodyPreview', 'body', 'importance', 'sensitivity'];
  }
  if (!orderByParams || typeof orderByParams !== 'string') {
    orderByParams = 'start/dateTime ASC';
  }
  if (!limitParam || typeof limitParam !== 'number') {
    limitParam = 100;
  }

  // Formate Date Fields to be strings 
  if (startDate && typeof startDate !== 'string') {
    if (startDate instanceof Date) {
      startDate = zonedTimeToUtc(startDate, timeZone).toISOString();
    } else if (typeof startDate === 'number') {
      startDate = zonedTimeToUtc(new Date(startDate), timeZone).toISOString();
    }
  } else if (!startDate) {
    startDate = zonedTimeToUtc(startOfMonth(new Date()), timeZone).toISOString();
  }

  if (endDate && typeof endDate !== 'string') {
    if (endDate instanceof Date) {
      endDate = zonedTimeToUtc(endDate, timeZone).toISOString();
    } else if (typeof endDate === 'number') {
      endDate = zonedTimeToUtc(new Date(endDate), timeZone).toISOString();
    }
  } else if (!endDate) {
    endDate = zonedTimeToUtc(endOfMonth(new Date()), timeZone).toISOString();
  }

  const queryParams = { startDateTime: startDate, endDateTime: endDate };
  // GET /me/calendarview?startDateTime=''&endDateTime=''
  // &$select=subject,organizer,start,end
  // &$orderby=start/dateTime
  // &$top=100
  let response: PageCollection = await graphClient!
    .api('/me/calendarview')
    .header('Prefer', `outlook.timezone="${timeZone}"`)
    .query(queryParams)
    .select(selectParams)
    .orderby(orderByParams)
    .top(limitParam)
    .get();

  let data;
  if (response["@odata.nextLink"]) {
    // Presence of the nextLink property indicates more results are available
    // Use a page iterator to get all results
    let events: Event[] = [];

    // Must include the time zone header in page requests too
    let options: GraphRequestOptions = {
      headers: { 'Prefer': `outlook.timezone="${timeZone}"` }
    };

    let pageIterator = new PageIterator(graphClient!, response, (event) => {
      events.push(event);
      return true;
    }, options);

    await pageIterator.iterate();

    data = events;
  } else {
    data = response.value;
  }

  if (formatTheData && Array.isArray(data) && data.length) {
    data = data.map((event_raw) => {
      let first_name = '', last_name = '';
      if (event_raw?.organizer?.emailAddress?.name) {
        first_name = event_raw.organizer.emailAddress.name.split(' ')[0];
        last_name = event_raw.organizer.emailAddress.name.split(' ')[1];
      }

      let task_status_id = 1; // Created
      let assigned_user_id = Number(assignedUserIdList);
      let start_timestamp = parseISO(event_raw.start?.dateTime);
      let end_timestamp = parseISO(event_raw.end?.dateTime);

      let event_formatted = {
        task_status_id,
        ...(assigned_user_id && { assigned_user_id }),
        start_timestamp,
        end_timestamp,
        assigned_user: {
          first_name,
          last_name,
        },
        task_status: {
          status: "Created"
        },
        title: event_raw?.subject,
        allDay: event_raw?.isAllDay,
        start: new Date(start_timestamp),
        end: new Date(end_timestamp),
        id: event_raw?.id, // This is not an integer btw.
        description: event_raw?.bodyPreview || event_raw?.body?.content || '',
        styles: { backgroundColor: "#396799" }
      };
      return event_formatted;
    })
  }

  return data;
};

export async function createEvent(authProvider: AuthCodeMSALBrowserAuthenticationProvider, newEvent: Event): Promise<User> {
  ensureClient(authProvider);

  // POST /me/events
  // JSON representation of the new event is sent in the request body
  return await graphClient!
    .api('/me/events')
    .post(newEvent);
};

export async function getUserEmails(authProvider: AuthCodeMSALBrowserAuthenticationProvider, params: getEmailParams): Promise<Message[]> {
  ensureClient(authProvider);

  let { selectParams, orderByParams, limit, offset, sortField, sortOrder } = params || {};
  if (!Array.isArray(selectParams)) {
    selectParams = ['from', 'sender', 'isRead', 'isDraft', 'toRecipients', 'ccRecipients', 'bccRecipients', 'replyTo', 'flag', 'receivedDateTime', 'sentDateTime', 'categories', 'subject', 'body', 'bodyPreview', 'hasAttachments', 'importance', 'webLink'];
  }
  if (!sortOrder || typeof sortOrder !== 'string') {
    sortOrder = 'DESC';
  }
  if (!sortField || typeof sortField !== 'string') {
    sortField = 'receivedDateTime';
  }
  if (!orderByParams || typeof orderByParams !== 'string') {
    orderByParams = `${sortField} ${sortOrder}`;
  }
  if (!limit || typeof limit !== 'number') {
    limit = 50;
  }
  if (!offset || typeof offset !== 'number') {
    offset = 0;
  }

  // GET /me/messages?$select=sender,subject
  let messages = await graphClient!
    .api('/me/messages')
    .select(selectParams)
    .top(limit)
    .orderby(orderByParams)
    .get();

  const moreAvailable = messages['@odata.nextLink'] !== undefined;
  (moreAvailable) && console.log("More messages available");
  return messages.value;
};

// See Link https://docs.microsoft.com/en-us/graph/api/user-sendmail?view=graph-rest-1.0&tabs=javascript
export async function sendMail(authProvider: AuthCodeMSALBrowserAuthenticationProvider, message: Message, params: sendEmailParams): Promise<Message> {
  ensureClient(authProvider);

  let { saveToSentItems } = params || {};
  if (typeof saveToSentItems !== 'string') {
    if (typeof saveToSentItems === 'boolean') {
      saveToSentItems = `${saveToSentItems}`;
    } else {
      saveToSentItems = 'false';
    }
  }

  // Create a new message
  const sendMail = {
    saveToSentItems, // string 
    message,
  };

  // Send the message
  return await graphClient!
    .api('/me/sendMail')
    .post(sendMail);
};