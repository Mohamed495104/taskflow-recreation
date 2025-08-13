import React, { useState, useEffect } from 'react';
import { Nav, Badge, Button } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
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

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch tasks on mount - for badge counts
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };


  // active if current path equals or starts with the link path
  // For /dashboard exactly active only on exact match
  const isRouteActive = (path) => {
    if (path === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    // For nested routes, active if location starts with path (e.g., /dashboard/tasks/*)
    return location.pathname.startsWith(path);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="sidebar-section">
            <div className="sidebar-header">
              <div className="workspace-info">
                <div className="workspace-name">My Workspace</div>
              </div>
            </div>
          </div>

          <Nav className="sidebar-nav">
            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/dashboard"
                className={`sidebar-nav-link ${isRouteActive('/dashboard') ? 'active' : ''}`}
              >
                <i className="bi bi-house-door me-2"></i>
                Home
              </Nav.Link>
            </Nav.Item>

              <Nav.Item>
              <Nav.Link
                as={Link}
                to="/dashboard/tasks"
                className={`sidebar-nav-link ${isRouteActive('/dashboard/tasks') ? 'active' : ''}`}
              >
                <i className="bi bi-check-circle me-2"></i>
                Tasks
                <Badge bg="primary" className="ms-auto">{tasks.length}</Badge>
              </Nav.Link>
            </Nav.Item>

            <Nav.Item>
              <Nav.Link
                as={Link}
                to="/dashboard/recreation"
                className={`sidebar-nav-link ${isRouteActive('/dashboard/recreation') ? 'active' : ''}`}
              >
                <i className="bi bi-controller me-2"></i>
                Recreation
              </Nav.Link>
            </Nav.Item>

          </Nav>

          <div className="sidebar-section mt-4">
            <div className="sidebar-section-header d-flex justify-content-between align-items-center">
              <span>Channels</span>
              <Button variant="link" size="sm" className="text-muted p-0" aria-label="Add Channel">
                <i className="bi bi-plus-lg"></i>
              </Button>
            </div>
            <Nav className="sidebar-nav">
              <Nav.Item>
                <Nav.Link className="sidebar-nav-link">
                  <span className="channel-hash">#</span>
                  general
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="sidebar-nav-link">
                  <span className="channel-hash">#</span>
                  development
                  <Badge bg="success" className="ms-auto">2</Badge>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link className="sidebar-nav-link">
                  <span className="channel-hash">#</span>
                  design
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </div>

          <div className="sidebar-section mt-auto">
            <div className="sidebar-logout">
              <Button
                variant="link"
                className="sidebar-logout-btn w-100 text-start"
                onClick={handleLogout}
                aria-label="Sign out"
              >
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign out
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="dashboard-main">
          <div className="dashboard-content">
            {/* Always render Outlet for nested routes */}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
