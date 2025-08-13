import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Form, Modal, ProgressBar } from 'react-bootstrap';
import { request, gql } from 'graphql-request';
import TaskList from './TaskList';

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

const ADD_TASK = gql`
  mutation AddTask($title: String!, $description: String, $status: String!, $dueDate: String!, $priority: String!) {
    addTask(title: $title, description: $description, status: $status, dueDate: $dueDate, priority: $priority) {
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

const UPDATE_TASK = gql`
  mutation UpdateTask($id: ID!, $title: String!, $description: String, $status: String!, $dueDate: String!, $priority: String!) {
    updateTask(id: $id, title: $title, description: $description, status: $status, dueDate: $dueDate, priority: $priority) {
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

const DELETE_TASK = gql`
  mutation DeleteTask($id: ID!) {
    deleteTask(id: $id) {
      id
    }
  }
`;

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    status: 'Pending',
    dueDate: '',
    priority: 'Medium',
  });
  const [editTask, setEditTask] = useState({
    id: null,
    title: '',
    description: '',
    status: 'Pending',
    dueDate: '',
    priority: 'Medium',
  });
  const [viewMode, setViewMode] = useState('table');
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tasks on mount and when filters change
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const variables = { status: filterStatus, searchTerm: searchTerm || undefined };
        if (filterStatus === 'All') delete variables.status;
        const data = await request(endpoint, GET_TASKS, variables);
        setTasks(data.tasks || []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        if (error.message !== 'No tasks found') {
          alert('Failed to fetch tasks: ' + error.message);
        }
      }
    };
    fetchTasks();
  }, [filterStatus, searchTerm]);

  // Validation function
  const validateForm = (taskData) => {
    const errors = {};

    if (!taskData.title || taskData.title.trim() === '') {
      errors.title = 'Title is required';
    } else if (taskData.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!taskData.dueDate) {
      errors.dueDate = 'Due date is required';
    } else {
      const today = new Date().toISOString().split('T')[0];
      if (taskData.dueDate < today) {
        errors.dueDate = 'Due date cannot be in the past';
      }
    }

    return errors;
  };

  const handleAddTask = () => {
    setNewTask({ title: '', description: '', status: 'Pending', dueDate: '', priority: 'Medium' });
    setFormErrors({});
    setShowAddModal(true);
  };

  const handleNewTaskChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();

    const errors = validateForm(newTask);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await request(endpoint, ADD_TASK, newTask);
      setTasks([...tasks, data.addTask]);
      setShowAddModal(false);
      setNewTask({ title: '', description: '', status: 'Pending', dueDate: '', priority: 'Medium' });
      setFormErrors({});
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Failed to add task: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTask = (task) => {
    setEditTask({
      id: task.id,
      title: task.title,
      description: task.description || '',
      status: task.status,
      dueDate: task.dueDate,
      priority: task.priority,
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditTaskChange = (e) => {
    const { name, value } = e.target;
    setEditTask((prevTask) => ({
      ...prevTask,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prevErrors) => ({
        ...prevErrors,
        [name]: '',
      }));
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();

    const errors = validateForm(editTask);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await request(endpoint, UPDATE_TASK, editTask);
      setTasks(tasks.map((task) => (task.id === data.updateTask.id ? data.updateTask : task)));
      setShowEditModal(false);
      setEditTask({ id: null, title: '', description: '', status: 'Pending', dueDate: '', priority: 'Medium' });
      setFormErrors({});
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await request(endpoint, DELETE_TASK, { id });
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task: ' + error.message);
    }
  };

  const completedTasks = tasks.filter((task) => task.status === 'Completed').length;
  const progressPercentage = (completedTasks / tasks.length) * 100 || 0;

  return (
    <>
      <Container fluid className="px-4 py-3">
        <div className="dashboard-header mb-4">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="dashboard-title">Task Management</h1>
              <p className="dashboard-subtitle text-muted">
                Organize and track your projects efficiently
              </p>
            </div>
            <Button
              style={{ backgroundColor: '#ebb2ecff', color: '#4A154B', border: '1px solid #7C4D7D' }}
              onClick={handleAddTask}
            >
              <i className="bi bi-plus-lg me-2"></i>
              Create Task
            </Button>
          </div>
        </div>

        <Row className="g-4">
          {/* Quick Stats */}
          <Col lg={3} md={6}>
            <Card className="dashboard-stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number">{tasks.length}</h3>
                    <p className="stat-label text-muted">Total Tasks</p>
                    <small className="text-success">
                      <i className="bi bi-arrow-up me-1"></i>
                      All tasks
                    </small>
                  </div>
                  <div className="stat-icon bg-primary">
                    <i className="bi bi-list-task"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="dashboard-stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number">{tasks.filter((t) => t.status === 'In Progress').length}</h3>
                    <p className="stat-label text-muted">In Progress</p>
                    <small style={{ color: '#4A154B' }}>
                      <i className="bi bi-arrow-right me-1" style={{ color: '#4A154B' }}></i>
                      Currently working
                    </small>
                  </div>
                  <div className="stat-icon" style={{ backgroundColor: '#4A154B' }}>
                    <i className="bi bi-clock-history" style={{ color: 'white' }}></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="dashboard-stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number">{completedTasks}</h3>
                    <p className="stat-label text-muted">Completed</p>
                    <small className="text-success">
                      <i className="bi bi-check-circle me-1"></i>
                      Tasks done
                    </small>
                  </div>
                  <div className="stat-icon bg-success">
                    <i className="bi bi-check-circle"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} md={6}>
            <Card className="dashboard-stat-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number">{Math.round(progressPercentage)}%</h3>
                    <p className="stat-label text-muted">Progress Rate</p>
                    <small className="text-warning">
                      <i className="bi bi-graph-up me-1"></i>
                      Overall completion
                    </small>
                  </div>
                  <div className="stat-icon bg-warning">
                    <i className="bi bi-graph-up"></i>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4 mt-2">
          <Col lg={12}>
            <TaskList
              tasks={tasks}
              onEdit={handleEditTask}
              onDelete={handleDeleteTask}
              onAdd={handleAddTask}
              viewMode={viewMode}
              setViewMode={setViewMode}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
            />
          </Col>
        </Row>

        <Row className="g-4 mt-2">
          <Col lg={12}>
            <Card className="dashboard-card">
              <Card.Header className="dashboard-card-header">
                <h5 className="mb-0">Task Progress</h5>
              </Card.Header>
              <Card.Body>
                <div className="mb-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span>Overall Task Progress</span>
                    <span>{Math.round(progressPercentage)}%</span>
                  </div>
                  <ProgressBar
                    now={progressPercentage}
                    style={{ backgroundColor: '#e9ecef' }}
                    className="custom-progress-bar"
                  >
                    <ProgressBar now={progressPercentage} style={{ backgroundColor: '#4A154B' }} />
                  </ProgressBar>
                </div>
                <div className="progress-stats">
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div className="d-flex align-items-center">
                      <div className="bg-success rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span>Completed</span>
                    </div>
                    <Badge bg="success">{completedTasks}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div className="d-flex align-items-center">
                      <div className="bg-primary rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span>In Progress</span>
                    </div>
                    <Badge bg="primary">{tasks.filter((t) => t.status === 'In Progress').length}</Badge>
                  </div>
                  <div className="d-flex justify-content-between align-items-center py-2">
                    <div className="d-flex align-items-center">
                      <div className="bg-secondary rounded me-2" style={{ width: '12px', height: '12px' }}></div>
                      <span>Pending</span>
                    </div>
                    <Badge bg="secondary">{tasks.filter((t) => t.status === 'Pending').length}</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Add Task Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveTask}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Task Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={newTask.title}
                    onChange={handleNewTaskChange}
                    placeholder="Enter task title"
                    isInvalid={!!formErrors.title}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={newTask.description}
                    onChange={handleNewTaskChange}
                    placeholder="Enter task description"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={newTask.status} onChange={handleNewTaskChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select name="priority" value={newTask.priority} onChange={handleNewTaskChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={newTask.dueDate}
                    onChange={handleNewTaskChange}
                    isInvalid={!!formErrors.dueDate}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.dueDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: '#ebb2ecff', color: '#4A154B', border: '1px solid #7C4D7D' }}
              disabled={isSubmitting}
            >
              <i className="bi bi-plus-lg me-2"></i>
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Edit Task Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Task</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdateTask}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Task Title *</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editTask.title}
                    onChange={handleEditTaskChange}
                    placeholder="Enter task title"
                    isInvalid={!!formErrors.title}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.title}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={12}>
                <Form.Group>
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="description"
                    value={editTask.description}
                    onChange={handleEditTaskChange}
                    placeholder="Enter task description"
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Status</Form.Label>
                  <Form.Select name="status" value={editTask.status} onChange={handleEditTaskChange}>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Priority</Form.Label>
                  <Form.Select name="priority" value={editTask.priority} onChange={handleEditTaskChange}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Due Date *</Form.Label>
                  <Form.Control
                    type="date"
                    name="dueDate"
                    value={editTask.dueDate}
                    onChange={handleEditTaskChange}
                    isInvalid={!!formErrors.dueDate}
                    required
                  />
                  <Form.Control.Feedback type="invalid">{formErrors.dueDate}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              style={{ backgroundColor: '#ebb2ecff', color: '#4A154B', border: '1px solid #7C4D7D' }}
              disabled={isSubmitting}
            >
              <i className="bi bi-check2 me-2"></i>
              {isSubmitting ? 'Updating...' : 'Update Task'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  );
};

export default Tasks;