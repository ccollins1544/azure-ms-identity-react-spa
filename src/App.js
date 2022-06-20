import React, { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ErrorMessage from './components/ErrorMessage';
import NavBar from './components/NavBar';
import Welcome from './components/Welcome';
import Calendar from './components/Calendar';
import Email from './components/Email';
import NewEvent from './components/NewEvent';
import NewEmail from './components/NewEmail';
import 'bootstrap/dist/css/bootstrap.css';
import "./styles/App.css";

export default function App() {
  return (
    <Router>
      <NavBar />
      <Container style={{ marginTop: "64px" }}>
        <ErrorMessage />
        <Routes>
          <Route exact path="/" element={<Welcome />} />
          <Route exact path="/calendar" element={<Calendar />} />
          <Route exact path="/newevent" element={<NewEvent />} />
          <Route exact path="/email" element={<Email />} />
          <Route exact path="/newemail" element={<NewEmail />} />
        </Routes>
      </Container>
    </Router>
  );
}
