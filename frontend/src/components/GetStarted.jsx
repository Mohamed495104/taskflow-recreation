import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const GetStarted = () => {
  return (
    <div className="landing-container">
      {/* Navigation */}
      <nav className="landing-nav">
        <Container>
          <div className="d-flex justify-content-between align-items-center py-3">
            <div className="landing-logo">
              <h3 className="mb-0 fw-bold text-white">TaskFlow</h3>
            </div>
            <div className="landing-nav-links">
              <Link to="/login" className="btn btn-outline-light me-3">Sign In</Link>
              <Link to="/signup" className="btn btn-light fw-semibold">Get Started</Link>
            </div>
          </div>
        </Container>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <Container>
          <Row className="align-items-center min-vh-100 py-5">
            <Col lg={6}>
              <div className="hero-content">
                <h1 className="hero-title">
                  Made for people.
                  <br />
                  <span className="text-primary">Built for productivity.</span>
                </h1>
                <p className="hero-subtitle">
                  Connect your team, organize your work, and get things done faster with TaskFlow's 
                  intuitive project management platform.
                </p>
                <div className="hero-buttons">
                  <Link to="/signup" className="btn btn-primary btn-lg me-3 px-4">
                    Try For Free
                  </Link>
                  <Link to="/login" className="btn btn-outline-primary btn-lg px-4">
                    Sign In
                  </Link>
                </div>
              </div>
            </Col>
            <Col lg={6}>
              <div className="hero-image">
                <div className="mockup-container">
                  <div className="mockup-screen">
                    <div className="mockup-header">
                      <div className="mockup-dots">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                    <div className="mockup-content">
                      <div className="mockup-sidebar">
                        <div className="mockup-item active"></div>
                        <div className="mockup-item"></div>
                        <div className="mockup-item"></div>
                        <div className="mockup-item"></div>
                      </div>
                      <div className="mockup-main">
                        <div className="mockup-card"></div>
                        <div className="mockup-card"></div>
                        <div className="mockup-card small"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <Container>
          <Row>
            <Col lg={12} className="text-center mb-5">
              <h2 className="section-title">Everything you need to stay organized</h2>
              <p className="section-subtitle">
                Powerful features designed to help teams collaborate seamlessly
              </p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-kanban fs-1 text-primary"></i>
                  </div>
                  <h5 className="feature-title">Project Management</h5>
                  <p className="feature-description">
                    Organize tasks, set deadlines, and track progress with intuitive kanban boards.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-people fs-1 text-primary"></i>
                  </div>
                  <h5 className="feature-title">Team Collaboration</h5>
                  <p className="feature-description">
                    Real-time messaging, file sharing, and seamless team communication.
                  </p>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="feature-card h-100">
                <Card.Body className="text-center p-4">
                  <div className="feature-icon mb-3">
                    <i className="bi bi-graph-up fs-1 text-primary"></i>
                  </div>
                  <h5 className="feature-title">Analytics & Reports</h5>
                  <p className="feature-description">
                    Get insights into team performance and project progress with detailed analytics.
                  </p>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <Container>
          <Row>
            <Col lg={8} className="mx-auto text-center">
              <h2 className="cta-title">Ready to transform how your team works?</h2>
              <p className="cta-subtitle">
                Join thousands of teams already using TaskFlow to boost their productivity
              </p>
              <div className="cta-buttons">
                <Link to="/signup" className="btn btn-primary btn-lg me-3 px-5">
                  Start Free Trial
                </Link>
                <Link to="/login" className="btn btn-outline-primary btn-lg px-5">
                  Sign In
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <Container>
          <Row>
            <Col md={6}>
              <div className="footer-brand">
                <h5 className="text-white mb-3">TaskFlow</h5>
                <p className="text-light opacity-75">
                  The modern way to manage projects and collaborate with your team.
                </p>
              </div>
            </Col>
            <Col md={6}>
              <Row>
                <Col sm={6}>
                  <h6 className="text-white mb-3">Product</h6>
                  <ul className="footer-links">
                    <li><a href="#" className="text-light opacity-75">Features</a></li>
                    <li><a href="#" className="text-light opacity-75">Pricing</a></li>
                    <li><a href="#" className="text-light opacity-75">Security</a></li>
                  </ul>
                </Col>
                <Col sm={6}>
                  <h6 className="text-white mb-3">Company</h6>
                  <ul className="footer-links">
                    <li><a href="#" className="text-light opacity-75">About</a></li>
                    <li><a href="#" className="text-light opacity-75">Contact</a></li>
                    <li><a href="#" className="text-light opacity-75">Support</a></li>
                  </ul>
                </Col>
              </Row>
            </Col>
          </Row>
          <hr className="my-4 opacity-25" />
          <Row>
            <Col md={6}>
              <p className="text-light opacity-75 mb-0">
                © 2025 TaskFlow - Developed by Ijas-Swedha-Greeshma-Mary. All rights reserved.
              </p>
            </Col>
            <Col md={6} className="text-md-end">
              <div className="social-links">
                <a href="#" className="text-light opacity-75 me-3">
                  <i className="bi bi-twitter"></i>
                </a>
                <a href="#" className="text-light opacity-75 me-3">
                  <i className="bi bi-linkedin"></i>
                </a>
                <a href="#" className="text-light opacity-75">
                  <i className="bi bi-github"></i>
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default GetStarted;