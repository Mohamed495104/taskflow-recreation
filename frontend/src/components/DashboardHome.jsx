import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { request, gql } from 'graphql-request';

const endpoint = 'http://localhost:5000/graphql';

const GET_TASKS = gql`
  query Tasks($status: String, $searchTerm: String) {
    tasks(status: $status, searchTerm: $searchTerm) {
      id
      title
      description
      status
      dueDate
      priority
      createdAt
      updatedAt
    }
  }
`;

const DashboardHome = () => {
  const { currentUser } = useAuth();
  const [tasks, setTasks] = useState([]);

  // Fetch tasks on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await request(endpoint, GET_TASKS, { status: 'All' });
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.message !== 'No tasks found') {
          alert('Failed to fetch tasks: ' + error.message);
        }
      }
    };
    fetchTasks();
  }, []);

  // Map task status to progress percentage and badge variant
  const getTaskProgress = (status) => {
    switch (status) {
      case 'Completed':
        return 100;
      case 'In Progress':
        return 50;
      case 'Pending':
      default:
        return 0;
    }
  };

  const getBadgeVariant = (status) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'In Progress':
        return 'primary';
      case 'Pending':
      default:
        return 'secondary';
    }
  };

  // Compute task status counts and percentages for Task Status Breakdown
  const completed = tasks.filter((t) => t.status === 'Completed').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const total = tasks.length;
  const completedPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  const inProgressPercentage = total > 0 ? Math.round((inProgress / total) * 100) : 0;
  const pendingPercentage = total > 0 ? Math.round((pending / total) * 100) : 0;

  // Compute recent tasks
  const recentTasks = [...tasks]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 3);

  // Compute upcoming deadlines
  const today = new Date();
  const sevenDaysFromNow = new Date(today);
  sevenDaysFromNow.setDate(today.getDate() + 7);

  const upcomingTasks = [...tasks]
    .filter((task) => {
      const dueDate = new Date(task.dueDate);
      return (
        dueDate >= today &&
        dueDate <= sevenDaysFromNow &&
        (task.status === 'In Progress' || task.status === 'Pending')
      );
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 4);

  // Calculate badge text and variant for deadlines
  const getDeadlineBadge = (dueDate) => {
    const due = new Date(dueDate);
    const diffDays = Math.floor((due - today) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return { text: 'Today', variant: 'danger' };
    if (diffDays === 1) return { text: 'Tomorrow', variant: 'warning' };
    if (diffDays <= 3) return { text: `${diffDays} days`, variant: 'info' };
    return { text: `${diffDays} days`, variant: 'secondary' };
  };

  return (
    <Container fluid className="px-4 py-3">
      {/* Header Section */}
      <div className="dashboard-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="dashboard-title mb-2">
              Good morning, {currentUser?.email?.split('@')[0]}!
            </h1>
            <p className="dashboard-subtitle text-muted mb-0">
              Here's what's happening with your projects today.
            </p>
          </div>
          <Button as={Link} to="/dashboard/tasks" className="btn-primary"
          style={{ backgroundColor: '#ebb2ecff', color: '#4A154B', border: '1px solid #7C4D7D' }}
          >
            <i className="bi bi-plus-lg me-2"></i>
            New Task
          </Button>
        </div>
      </div>

      {/* Stats Cards Row */}
      <Row className="g-3 mb-4">
        <Col xl={3} md={6} sm={6}>
          <Link to="/dashboard/tasks" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="dashboard-stat-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number mb-1">{inProgress + pending}</h3>
                    <p className="stat-label text-muted mb-2">Active Tasks</p>
                    <small className="text-success">
                      <i className="bi bi-arrow-up me-1"></i>
                      12% from last week
                    </small>
                  </div>
                  <div className="stat-icon bg-primary">
                    <i className="bi bi-check-circle"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col xl={3} md={6} sm={6}>
          <Link to="/dashboard/recreation" style={{ textDecoration: 'none', color: 'inherit' }}>
            <Card className="dashboard-stat-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number mb-1">5</h3>
                    <p className="stat-label text-muted mb-2">Recreation</p>
                    <small className="text-info">
                      <i className="bi bi-arrow-right me-1"></i>
                      Thinking of relaxing?
                    </small>
                  </div>
                  <div className="stat-icon bg-info">
                    <i className="bi bi-controller"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        <Col xl={3} md={6} sm={6}>
          <Card className="dashboard-stat-card h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h3 className="stat-number mb-1">{completedPercentage}%</h3>
                  <p className="stat-label text-muted mb-2">Completion Rate</p>
                  <small className="text-success">
                    <i className="bi bi-arrow-up me-1"></i>
                    5% improvement than last week
                  </small>
                </div>
                <div className="stat-icon bg-success">
                  <i className="bi bi-graph-up"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} md={6} sm={6}>
          <Card className="dashboard-stat-card h-100">
            <Card.Body className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <h3 className="stat-number mb-1">156</h3>
                  <p className="stat-label text-muted mb-2">Messages</p>
                  <small className="text-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    3 unread
                  </small>
                </div>
                <div className="stat-icon bg-warning">
                  <i className="bi bi-chat-dots"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content Row */}
      <Row className="g-3 mb-4">
        <Col lg={8}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header border-bottom">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Recent Tasks</h5>
                <Button variant="link" size="sm" as={Link} to="/dashboard/tasks" className="text-decoration-none">
                  View all
                </Button>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="project-list">
                {recentTasks.length > 0 ? (
                  recentTasks.map((task) => (
                    <div className="project-item border-bottom" key={task.id}>
                      <div className="d-flex align-items-center justify-content-between p-3">
                        <div className="d-flex align-items-center">
                          <div className={`project-icon bg-${getBadgeVariant(task.status)} me-3`}>
                            <i className="bi bi-check-circle"></i>
                          </div>
                          <div>
                            <h6 className="mb-1">{task.title}</h6>
                            <small className="text-muted">
                              Added {new Date(task.createdAt).toLocaleTimeString()}
                            </small>
                          </div>
                        </div>
                        <div className="d-flex align-items-center">
                          <ProgressBar
                            now={getTaskProgress(task.status)}
                            className="me-3"
                            style={{ width: '100px', height: '6px', backgroundColor: '#e9ecef' }}
                          >
                            <ProgressBar
                              now={getTaskProgress(task.status)}
                              style={{ backgroundColor: '#4A154B' }}
                            />
                          </ProgressBar>
                          <Badge bg={getBadgeVariant(task.status)}>{task.status}</Badge>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-center text-muted">
                    <i className="bi bi-inbox display-4 mb-3 d-block text-muted opacity-50"></i>
                    No tasks available
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={4}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header border-bottom">
              <h5 className="mb-0">Task Status</h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Completed ({completed})</span>
                  <span className="text-muted">{completedPercentage}%</span>
                </div>
                <ProgressBar variant="success" now={completedPercentage} className="mb-3" style={{ height: '8px' }} />

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">In Progress ({inProgress})</span>
                  <span className="text-muted">{inProgressPercentage}%</span>
                </div>
                <ProgressBar variant="primary" now={inProgressPercentage} className="mb-3" style={{ height: '8px' }} />

                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="fw-medium">Pending ({pending})</span>
                  <span className="text-muted">{pendingPercentage}%</span>
                </div>
                <ProgressBar variant="secondary" now={pendingPercentage} style={{ height: '8px' }} />
              </div>
              
              <div className="text-center">
                <div className="h4 text-primary mb-1">{total}</div>
                <small className="text-muted">Total Tasks</small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bottom Row */}
      <Row className="g-3">
        <Col lg={6}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header border-bottom">
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="d-grid gap-2">
                <Button variant="outline-primary" className="text-start d-flex align-items-center" as={Link} to="/dashboard/tasks">
                  <i className="bi bi-plus-circle me-2"></i>
                  Create New Task
                </Button>
                <Button variant="outline-secondary" className="text-start d-flex align-items-center">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Schedule Meeting
                </Button>
                <Button variant="outline-info" className="text-start d-flex align-items-center">
                  <i className="bi bi-upload me-2"></i>
                  Upload Document
                </Button>
                <Button variant="outline-success" className="text-start d-flex align-items-center">
                  <i className="bi bi-people me-2"></i>
                  Invite Team Member
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="dashboard-card h-100">
            <Card.Header className="dashboard-card-header border-bottom">
              <h5 className="mb-0">Upcoming Deadlines</h5>
            </Card.Header>
            <Card.Body className="p-3">
              <div className="deadline-list">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((task) => {
                    const { text, variant } = getDeadlineBadge(task.dueDate);
                    return (
                      <div
                        className="deadline-item d-flex justify-content-between align-items-center py-2 border-bottom"
                        key={task.id}
                      >
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{task.title}</h6>
                          <small className="text-muted">{task.status}</small>
                        </div>
                        <Badge bg={variant}>{text}</Badge>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-calendar-check display-4 mb-3 d-block text-muted opacity-50"></i>
                    No upcoming deadlines
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default DashboardHome;