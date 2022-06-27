import { LogLevel } from "@azure/msal-browser";
const tenantId = process.env.REACT_APP_TENANT_ID;
const clientId = process.env.REACT_APP_CLIENT_ID;
const redirectUri = process.env.REACT_APP_REDIRECT_URI || "http://localhost:3000/";
const multi_tenant_authority = process.env.REACT_APP_MULTI_TENANT_AUTHORITY === "true";
const authority = multi_tenant_authority ? "https://login.microsoftonline.com/common" : `https://login.microsoftonline.com/${tenantId}`;

const msalConfig = {
  auth: {
    clientId,
    authority,
    redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage", // This configures where your cache will be stored
    storeAuthStateInCookie: true, // Set this to "true" if you are having issues on IE11 or Edge
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) {
          return;
        }

        switch (level) {
          case LogLevel.Error:
            console.error(message);
            return;
          case LogLevel.Info:
            console.info(message);
            return;
          case LogLevel.Verbose:
            console.debug(message);
            return;
          case LogLevel.Warning:
            console.warn(message);
            return;
          /*eslint default-case: ["error", { "commentPattern": "^skip\\sdefault" }]*/
          // skip default case
        }
      }
    }
  }
};

const scopes = ["user.read", "mailboxsettings.read", "calendars.readwrite", "mail.read", "mail.send", "mail.readwrite"];

export {
  tenantId,
  clientId,
  redirectUri,
  scopes,
  msalConfig,
};
