import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [validated, setValidated] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!agreeToTerms) {
      return setError('Please agree to the Terms of Service and Privacy Policy');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
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
              <span className="text-muted me-3">Already using TaskFlow?</span>
              <Link to="/login" className="btn btn-outline-primary">Sign in</Link>
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
                  <h1 className="auth-title">Create your TaskFlow account</h1>
                  <p className="auth-subtitle">
                    Get started - it's free. No credit card needed.
                  </p>
                </div>

                {error && (
                  <Alert variant="danger" className="auth-alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                  </Alert>
                )}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Col sm={6}>
                      <Form.Group className="auth-form-group" controlId="firstName">
                        <Form.Label className="auth-label">First Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="First name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          required
                          className="auth-input"
                          autoComplete="given-name"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter your first name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col sm={6}>
                      <Form.Group className="auth-form-group" controlId="lastName">
                        <Form.Label className="auth-label">Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Last name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          required
                          className="auth-input"
                          autoComplete="family-name"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter your last name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>

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
                      Please enter a valid work email address.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="auth-form-group" controlId="password">
                    <Form.Label className="auth-label">Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Create a password (6+ characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="auth-input"
                      autoComplete="new-password"
                    />
                    <Form.Control.Feedback type="invalid">
                      Password must be at least 6 characters long.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="auth-form-group" controlId="confirmPassword">
                    <Form.Label className="auth-label">Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Confirm your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="auth-input"
                      autoComplete="new-password"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please confirm your password.
                    </Form.Control.Feedback>
                  </Form.Group>

                  <Form.Group className="auth-form-group">
                    <Form.Check
                      type="checkbox"
                      id="agreeToTerms"
                      label={
                        <span>
                          I agree to TaskFlow's{' '}
                          <Link to="/terms" className="auth-link">Terms of Service</Link>
                          {' '}and{' '}
                          <Link to="/privacy" className="auth-link">Privacy Policy</Link>
                        </span>
                      }
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
                      className="auth-checkbox"
                    />
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
                        Creating your account...
                      </>
                    ) : (
                      'Create Account'
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
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                      Sign in
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

export default Signup;