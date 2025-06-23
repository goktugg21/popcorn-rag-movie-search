// src/App.jsx
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Navbar, Nav, Container } from 'react-bootstrap';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FavoritesPage from './pages/FavoritesPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';

function AppContent() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

  // Show navbar only on specific pages
  const showNavbar = false;

  return (
    <div className="App" style={{ minHeight: '100vh', width: '100%' }}>
      {/* Global CSS */}
      <style>{`
        body {
          margin: 0;
          padding: 0;
          width: 100vw;
          overflow-x: hidden;
        }
        .container-fluid {
          max-width: 100% !important;
          padding: 0;
        }
        .container {
          max-width: 1200px;
        }
      `}</style>

      {/* Navigation - Show only on specific pages */}
      {showNavbar && (
        <Navbar bg="dark" variant="dark" expand="lg" className="w-100">
          <Container fluid>
            <Navbar.Brand as={Link} to="/" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
               🍿PopcornNotIncluded
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/" style={{ fontSize: '1.1rem' }}>Home</Nav.Link>
                {isLoggedIn ? (
                  <>
                    <Nav.Link as={Link} to="/favorites" style={{ fontSize: '1.1rem' }}>Favorites</Nav.Link>
                    <Nav.Link onClick={() => setIsLoggedIn(false)} style={{ fontSize: '1.1rem', cursor: 'pointer' }}>
                      Logout
                    </Nav.Link>
                  </>
                ) : (
                  <>
                    <Nav.Link as={Link} to="/login" style={{ fontSize: '1.1rem' }}>Login</Nav.Link>
                    <Nav.Link as={Link} to="/register" style={{ fontSize: '1.1rem' }}>Register</Nav.Link>
                  </>
                )}
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      )}

      {/* Routes */}
      <div style={{ width: '100%' }}>
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} />} />
          <Route path="/login" element={<LoginPage setIsLoggedIn={setIsLoggedIn} />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/favorites" element={<FavoritesPage isLoggedIn={isLoggedIn} />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
        </Routes>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;