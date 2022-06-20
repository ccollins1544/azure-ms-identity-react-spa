import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { AuthenticatedTemplate } from '@azure/msal-react';

import { getUserEmails } from '../GraphService';
import { useAppContext } from '../AppContext';
// import Debug from "./Debug";

const Email = (props) => {
  const app = useAppContext();
  const [emails, setEmails] = useState();

  useEffect(() => {
    const loadEmails = async () => {
      if (app.user && !emails) {
        try {
          const emails = await getUserEmails(app.authProvider);
          setEmails(emails);
        } catch (err) {
          app.displayError(err.message);
        }
      }
    };

    loadEmails();
  });

  return (
    <AuthenticatedTemplate>
      <div className="mb-3">
        <h1 className="mb-3">Emails</h1>
        <RouterNavLink to="/newemail" className="btn btn-dark btn-sm" exact>New email</RouterNavLink>
      </div>
      <div className="calendar-week">
        <div className="table-responsive">
          {Array.isArray(emails) && emails.length > 0 && <Table size="sm">
            <thead>
              <tr>
                <th>Read</th>
                <th>From</th>
                <th>Subject</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              {emails.map(email => <tr key={email.id}>
                <td>{email.isRead ? "true" : "false"}</td>
                <td>{email.from.emailAddress.name}</td>
                <td>{email.subject}</td>
                <td>{email.bodyPreview ? email.bodyPreview : <div dangerouslySetInnerHTML={{ __html: email.body.content }}></div>}</td>
              </tr>)}
            </tbody>
          </Table>}
        </div>
      </div>

      {/* <Debug debugLabel="Emails" debugValue={emails} /> */}
    </AuthenticatedTemplate>
  );
}

export default Email;