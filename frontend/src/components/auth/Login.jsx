import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Header */}
      <div className="auth-header">
        <Container>
          <div className="d-flex justify-content-between align-items-center py-3">
            <Link to="/" className="auth-logo">
              <h4 className="mb-0 fw-bold">TaskFlow</h4>
            </Link>
            <div className="auth-nav-links">
              <span className="text-muted me-3">New to TaskFlow?</span>
              <Link to="/signup" className="btn btn-outline-primary">Create an account</Link>
            </div>
          </div>
        </Container>
      </div>

      {/* Main Content */}
      <div className="auth-main">
        <Container>
          <Row className="justify-content-center">
            <Col md={6} lg={5} xl={4}>
              <div className="auth-form-container">
                <div className="text-center mb-4">
                  <h1 className="auth-title">Sign in to TaskFlow</h1>
                  <p className="auth-subtitle">
                    Welcome back! Please sign in to your account.
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="auth-alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Form.Group className="auth-form-group" controlId="email">
                    <Form.Label className="auth-label">Work Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="auth-input"
                      autoComplete="email"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid email address.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="auth-form-group" controlId="password">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Form.Label className="auth-label mb-0">Password</Form.Label>
                      <Link to="/forgot-password" className="auth-link-small">
                        Forgot password?
                      </Link>
                    </div>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="auth-input"
                      autoComplete="current-password"
                    />
                    <Form.Control.Feedback type="invalid">
                      Password must be at least 6 characters long.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Button 
                    disabled={loading} 
                    className="auth-btn-primary w-100" 
                    type="submit"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Signing you in...
                      </>
                    ) : (
                      'Sign In with Email'
                    )}
                  </Button>
                </Form>

                <div className="auth-divider">
                  <span>OR</span>
                </div>

                <Button variant="outline-secondary" className="w-100 auth-btn-secondary" size="lg">
                  <i className="bi bi-google me-2"></i>
                  Continue with Google
                </Button>

                <div className="auth-footer-text">
                  <p className="text-muted text-center mb-0">
                    New to TaskFlow?{' '}
                    <Link to="/signup" className="auth-link">
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <div className="auth-page-footer">
        <Container>
          <div className="d-flex justify-content-center align-items-center py-4">
            <div className="auth-footer-links">
              <a href="#" className="auth-footer-link">Privacy</a>
              <a href="#" className="auth-footer-link">Terms</a>
              <a href="#" className="auth-footer-link">Contact us</a>
              <a href="#" className="auth-footer-link">
                <i className="bi bi-globe me-1"></i>
                Change region
              </a>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default Login;