import React from 'react';
import { Navbar, Nav, Button, Container } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const NavigationBar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/dashboard">
          Task Management App
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          {currentUser && (
            <>
              <Nav className="me-auto">
                <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                <Nav.Link as={Link} to="/tasks">Tasks</Nav.Link>
                <Nav.Link as={Link} to="/recreation">Recreation</Nav.Link>
              </Nav>
              <Nav>
                <Navbar.Text className="me-3">
                  Welcome, {currentUser.email}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>
                  Logout
                </Button>
              </Nav>
            </>
          )}
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavigationBar;