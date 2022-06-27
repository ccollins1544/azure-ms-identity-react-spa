import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { Table } from 'react-bootstrap';
import { AuthenticatedTemplate } from '@azure/msal-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { solid } from '@fortawesome/fontawesome-svg-core/import.macro';
import moment from 'moment';
import { getUserEmails, deleteEmail, updateEmail } from '../GraphService';
import { useAppContext } from '../AppContext';
import Debug from "./Debug";

const Email = (props) => {
  const { user, authProvider, displayError } = useAppContext();
  const [emails, setEmails] = useState();
  const [invokeUpdate, setInvokeUpdate] = useState(false);

  const deleteMessage = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    let clickedElement = event?.target || {};
    let { dataset, tagName, parentElement } = clickedElement || {};

    // Go up one level in the DOM 
    if (tagName !== "svg" && parentElement?.tagName === "svg") {
      clickedElement = parentElement;
      parentElement = clickedElement.parentElement;
      dataset = { ...dataset, ...clickedElement?.dataset };
      tagName = clickedElement?.tagName;
    }

    let { id: emailId } = dataset || {};
    try {
      if (!emailId || /\D/.test(emailId) === false) {
        throw new Error(`Invalid ID ${emailId}`);
      }
      await deleteEmail(authProvider, emailId);
      setInvokeUpdate((prev) => !prev);
    } catch (err) {
      displayError(err.message);
    }
    return;
  };

  const flagMessage = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    let clickedElement = event?.target || {};
    let { dataset, tagName, parentElement } = clickedElement || {};

    // Go up one level in the DOM 
    if (tagName !== "svg" && parentElement?.tagName === "svg") {
      clickedElement = parentElement;
      parentElement = clickedElement.parentElement;
      dataset = { ...dataset, ...clickedElement?.dataset };
      tagName = clickedElement?.tagName;
    }

    let { id: emailId, flag_status } = dataset || {};

    /**
     * Flag Status Flow:
     * flagged -> complete
     * notFlagged -> Flagged
     * complete -> notFlagged
     */
    let flagStatus = "notFlagged";
    if (flag_status === "flagged") {
      flagStatus = "complete";
    } else if (flag_status === "notFlagged") {
      flagStatus = "flagged";
    }
    let updatedEmail = {
      flag: {
        flagStatus,
      }
    };

    try {
      if (!emailId || /\D/.test(emailId) === false) {
        throw new Error(`Invalid ID ${emailId}`);
      }
      await updateEmail(authProvider, emailId, updatedEmail);
      setInvokeUpdate((prev) => !prev);
    } catch (err) {
      displayError(err.message);
    }
    return;
  };

  useEffect(() => {
    const loadEmails = async () => {
      if (user) {
        try {
          const emails = await getUserEmails(authProvider, { limit: 15 });
          setEmails(emails);
        } catch (err) {
          displayError(err.message);
        }
      }
    };

    loadEmails();
  }, [invokeUpdate]);

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
                <th>Flag</th>
                <th>Read</th>
                <th>From</th>
                <th>Received</th>
                <th>Subject</th>
                <th>Body</th>
              </tr>
            </thead>
            <tbody>
              {emails.map(email => <tr key={email.id}>
                <td><FontAwesomeIcon icon={email.flag?.flagStatus === "flagged" ? solid('flag') : (email.flag?.flagStatus === "complete" ? solid('flag-checkered') : solid('font-awesome'))} data-id={email.id} data-flag_status={email.flag?.flagStatus} onClick={flagMessage} /></td>
                <td><FontAwesomeIcon icon={email.isRead ? solid('trash') : solid('trash-can')} data-id={email.id} onClick={deleteMessage} /></td>
                <td>{email.from.emailAddress.name}</td>
                <td>{email.receivedDateTime ? moment(email.receivedDateTime).format('MM/DD/YYYY hh:mm A') : ''}</td>
                <td>{email.subject}</td>
                <td>{email.bodyPreview ? email.bodyPreview : <div dangerouslySetInnerHTML={{ __html: email.body.content }}></div>}</td>
              </tr>)}
            </tbody>
          </Table>}
        </div>
      </div>

      <Debug debugLabel="Emails" debugValue={emails} />
    </AuthenticatedTemplate>
  );
}

export default Email;