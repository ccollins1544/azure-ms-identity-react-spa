import { useEffect, useState } from 'react';
import { Button, Container } from 'react-bootstrap';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useAppContext } from '../AppContext';
import { getUsers } from '../GraphService';
import Debug from "./Debug";
const multi_tenant_authority = process.env.REACT_APP_MULTI_TENANT_AUTHORITY === "true";

const Welcome = (props) => {
  const app = useAppContext();
  const [users, setUsers] = useState();

  useEffect(() => {
    const loadUsers = async () => {
      if (app.user && !users) {
        try {
          const users = await getUsers(app.authProvider);
          setUsers(users);
        } catch (err) {
          app.displayError(err.message);
        }
      }
    };

    multi_tenant_authority && loadUsers();
  });

  return (
    <div className="mb-4 bg-light rounded-3" {...props}>
      <Container fluid>
        <h1>React Graph Tutorial</h1>
        <p className="lead">
          This sample app shows how to use the Microsoft Graph API to access a user's data from React
        </p>
        <AuthenticatedTemplate>
          <div>
            <h4>Welcome {app.user?.displayName || ''}!</h4>
            <p>Use the navigation bar at the top of the page to get started.</p>
          </div>
        </AuthenticatedTemplate>
        <UnauthenticatedTemplate>
          <Button color="primary" onClick={app.signIn}>Click here to sign in</Button>
        </UnauthenticatedTemplate>

        <Debug debugValue={app.user} debugLabel="user" />
        <Debug debugLabel="All Users" debugValue={users} />
      </Container>
    </div>
  );
};

export default Welcome;