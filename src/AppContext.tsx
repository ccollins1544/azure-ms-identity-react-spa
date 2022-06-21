import React, {
  useContext,
  createContext,
  useState,
  MouseEventHandler,
  useEffect
} from 'react';

import { scopes } from './azureConfig';
import { AuthCodeMSALBrowserAuthenticationProvider } from '@microsoft/microsoft-graph-client/authProviders/authCodeMsalBrowser';
import { InteractionType, PublicClientApplication } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { getUser, getProfilePhoto } from './GraphService';

export interface AppUser {
  ageGroup?: string,
  businessPhones?: Array<string>,
  displayName?: string,
  givenName?: string,
  id?: string,
  jobTitle?: string,
  mobilePhone?: string,
  officeLocation?: string,
  preferredLanguage?: string,
  surname?: string,
  email?: string,
  avatar?: string,
  timeFormat?: string,
  timeZone?: string,
};

export interface AppError {
  message: string,
  debug?: string
};

type AppContext = {
  user?: AppUser;
  error?: AppError;
  signIn?: MouseEventHandler<HTMLElement>;
  signOut?: MouseEventHandler<HTMLElement>;
  displayError?: Function;
  clearError?: Function;
  authProvider?: AuthCodeMSALBrowserAuthenticationProvider;
}

const appContext = createContext<AppContext>({
  user: undefined,
  error: undefined,
  signIn: undefined,
  signOut: undefined,
  displayError: undefined,
  clearError: undefined,
  authProvider: undefined
});

function useAppContext(): AppContext {
  return useContext(appContext);
}

interface ProvideAppContextProps {
  children: React.ReactNode;
}

function ProvideAppContext({ children }: ProvideAppContextProps) {
  const auth = useProvideAppContext();
  return (
    <appContext.Provider value={auth}>
      {children}
    </appContext.Provider>
  );
}

export { useAppContext };
export default ProvideAppContext;

function useProvideAppContext() {
  const [user, setUser] = useState<AppUser | undefined>(undefined);
  const [error, setError] = useState<AppError | undefined>(undefined);

  const msal = useMsal();

  const displayError = (message: string, debug?: string) => {
    setError({ message, debug });
  }

  const clearError = () => {
    setError(undefined);
  }

  // Used by the Graph SDK to authenticate API calls
  const authProvider = new AuthCodeMSALBrowserAuthenticationProvider(
    msal.instance as PublicClientApplication,
    {
      account: msal.instance.getActiveAccount()!,
      scopes,
      interactionType: InteractionType.Popup
    }
  );

  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          // Check if user is already signed in
          const account = msal.instance.getActiveAccount();
          if (account) {

            // Get the user from Microsoft Graph
            const user = await getUser(authProvider);
            const email = user?.mail || user?.userPrincipalName || '';
            const timeFormat = user?.mailboxSettings?.timeFormat || 'h:mm a';
            const timeZone = user?.mailboxSettings?.timeZone || 'UTC';

            // Get the user's profile photo
            const avatar = await getProfilePhoto(authProvider);

            setUser({
              ageGroup: user.ageGroup || '',
              businessPhones: user.businessPhones || [''],
              displayName: user.displayName || '',
              givenName: user.givenName || '',
              id: user.id || '',
              jobTitle: user.jobTitle || '',
              mobilePhone: user.mobilePhone || '',
              officeLocation: user.officeLocation || '',
              preferredLanguage: user.preferredLanguage || '',
              surname: user.surname || '',
              email,
              avatar,
              timeFormat,
              timeZone
            });
          }
        } catch (err: any) {
          displayError(err.message);
        }
      }
    };
    checkUser();
  });

  const signIn = async () => {
    await msal.instance.loginPopup({
      scopes,
      prompt: 'select_account'
    }).catch(e => {
      console.log("signIn Error", e);
    })
    // .then((response) => {
    //   console.log("signIn popup response", response);
    // });

    // Get the user from Microsoft Graph
    const user = await getUser(authProvider);

    setUser({
      displayName: user.displayName || '',
      email: user.mail || user.userPrincipalName || '',
      timeFormat: user.mailboxSettings?.timeFormat || '',
      timeZone: user.mailboxSettings?.timeZone || 'UTC'
    });
  };

  const signOut = async () => {
    await msal.instance.logoutPopup({
      postLogoutRedirectUri: "/",
      mainWindowRedirectUri: "/"
    });
    setUser(undefined);
  };

  return {
    user,
    error,
    signIn,
    signOut,
    displayError,
    clearError,
    authProvider
  };
}
