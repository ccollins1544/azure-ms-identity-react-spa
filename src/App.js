import React, { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import ErrorMessage from './components/ErrorMessage';
import NavBar from './components/NavBar';
import Welcome from './components/Welcome';
import Calendar from './components/Calendar';
import NewEvent from './components/NewEvent';
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
        </Routes>
      </Container>
    </Router>
  );
}
