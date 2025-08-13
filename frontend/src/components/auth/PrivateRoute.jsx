import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Spinner, Container } from 'react-bootstrap';

const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();

  if (currentUser === undefined) {
    return (
      <Container className="loading-container d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center text-white">
          <Spinner animation="border" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <h5 className="mt-3">Loading your experience...</h5>
        </div>
      </Container>
    );
  }

  return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;