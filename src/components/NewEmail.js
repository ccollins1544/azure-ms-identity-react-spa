import { useEffect, useState } from 'react';
import { NavLink as RouterNavLink, Navigate } from 'react-router-dom';
import { Button, Form } from 'react-bootstrap';
import { sendMail } from '../GraphService';
import { useAppContext } from '../AppContext';

export default function NewEmail(props) {
  const app = useAppContext();

  const [subject, setSubject] = useState('');
  const [recipients, setRecipients] = useState('');
  const [body, setBody] = useState('');

  const [formDisabled, setFormDisabled] = useState(true);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    setFormDisabled(subject.length === 0 || recipients.length === 0 || body.length === 0);
  }, [subject, recipients, body]);

  const sendIt = async () => {
    const recipientEmails = recipients.split(';');
    const toRecipients = [];

    recipientEmails.forEach((email) => {
      if (email.length > 0) {
        toRecipients.push({
          emailAddress: {
            address: email
          }
        });
      }
    });

    const NewEmail = {
      subject,

      // Only add if there are recipients
      toRecipients: toRecipients.length > 0 ? toRecipients : undefined,

      // Only add if a body was given
      body: body.length > 0 ? {
        contentType: 'text',
        content: body
      } : undefined
    };

    try {
      await sendMail(app.authProvider, NewEmail);
      setRedirect(true);
    } catch (err) {
      app.displayError('Error sending email', JSON.stringify(err));
    }
  };

  if (redirect) {
    return <Navigate to="/email" />
  }

  return (
    <Form>
      <Form.Group>
        <Form.Label>Subject</Form.Label>
        <Form.Control type="text"
          name="subject"
          id="subject"
          className="mb-2"
          value={subject}
          onChange={(ev) => setSubject(ev.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Recipients</Form.Label>
        <Form.Control type="text"
          name="recipients"
          id="recipients"
          className="mb-2"
          placeholder="Enter a list of email addresses, separated by a semi-colon"
          value={recipients}
          onChange={(ev) => setRecipients(ev.target.value)} />
      </Form.Group>
      <Form.Group>
        <Form.Label>Body</Form.Label>
        <Form.Control as="textarea"
          name="body"
          id="body"
          className="mb-3"
          style={{ height: '10em' }}
          value={body}
          onChange={(ev) => setBody(ev.target.value)} />
      </Form.Group>
      <Button color="primary" className="me-2" disabled={formDisabled} onClick={() => sendIt()}>Send</Button>
      <RouterNavLink to="/email" className="btn btn-secondary" exact>Cancel</RouterNavLink>
    </Form>
  );
}
