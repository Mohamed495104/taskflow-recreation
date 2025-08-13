import React from 'react';
import { Card, Table, Row, Button, InputGroup, Form, Dropdown } from 'react-bootstrap';
import TaskItem from './TaskItem';

const TaskList = ({ 
  tasks, 
  onEdit, 
  onDelete, 
  onAdd,
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}) => {
  return (
    <div style={{ background: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: 'none', border: '1px solid #e5e7eb' }}>
      {/* Header Section */}
      <div style={{ 
        padding: '20px 24px', 
        borderBottom: '1px solid #f3f4f6',
        background: '#fafafb'
      }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="mb-0" style={{ fontWeight: '600', color: '#1f2937' }}>Your Tasks</h5>
          <div className="d-flex gap-2 align-items-center">
            <div className="btn-group" role="group">
              <Button 
                variant={viewMode === 'table' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setViewMode('table')}
                style={viewMode === 'table' ? { backgroundColor: '#7c4d7d', borderColor: '#7c4d7d' } : {}}
              >
                <i className="bi bi-table"></i>
              </Button>
              <Button 
                variant={viewMode === 'card' ? 'primary' : 'outline-secondary'}
                size="sm"
                onClick={() => setViewMode('card')}
                style={viewMode === 'card' ? { backgroundColor: '#7c4d7d', borderColor: '#7c4d7d' } : {}}
              >
                <i className="bi bi-grid-3x3-gap"></i>
              </Button>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2 align-items-center">
          <InputGroup style={{ width: '250px' }}>
            <InputGroup.Text style={{ background: 'white', border: '1px solid #d1d5db' }}>
              <i className="bi bi-search" style={{ color: '#6b7280' }}></i>
            </InputGroup.Text>
            <Form.Control 
              placeholder="Search by name or description..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ 
                border: '1px solid #d1d5db', 
                borderLeft: 'none',
                fontSize: '14px'
              }}
            />
          </InputGroup>
          
          <Dropdown>
            <Dropdown.Toggle 
              variant="outline-secondary" 
              style={{ 
                border: '1px solid #d1d5db', 
                color: '#6b7280',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              <i className="bi bi-funnel me-2"></i>
              {filterStatus}
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setFilterStatus('All')}>All Tasks</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('Pending')}>Pending</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('In Progress')}>In Progress</Dropdown.Item>
              <Dropdown.Item onClick={() => setFilterStatus('Completed')}>Completed</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>

     
      <div style={{ background: 'white' }}>
        {tasks.length === 0 ? (
          <div className="text-center py-5">
            <div className="mb-4">
              <i className="bi bi-clipboard-x display-1 text-muted opacity-50"></i>
            </div>
            <h5 className="text-muted">No tasks found</h5>
            <p className="text-muted">
              {searchTerm || filterStatus !== 'All' 
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first task to get started with your productivity journey!'
              }
            </p>
            {!searchTerm && filterStatus === 'All' && (
              <Button 
                onClick={onAdd} 
                className="px-4"
                style={{ 
                  backgroundColor: '#7c4d7d', 
                  borderColor: '#7c4d7d',
                  color: 'white'
                }}
              >
                <i className="bi bi-plus-lg me-2"></i>
                Create First Task
              </Button>
            )}
          </div>
        ) : viewMode === 'table' ? (
          <div>
            <Table className="mb-0" style={{ fontSize: '14px' }}>
              <thead>
                <tr style={{ 
                  background: '#f9fafb',
                  borderBottom: '1px solid #e5e7eb'
                }}>
                  <th className="border-0 py-3 ps-4" style={{ 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    #
                  </th>
                  <th className="border-0 py-3" style={{ 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Name
                  </th>
                  <th className="border-0 py-3" style={{ 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Status
                  </th>
                  <th className="border-0 py-3" style={{ 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Priority
                  </th>
                  <th className="border-0 py-3" style={{ 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Due Date
                  </th>
                  <th className="border-0 py-3 pe-4" style={{ 
                    fontWeight: '500', 
                    fontSize: '12px', 
                    color: '#6b7280', 
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task, index) => (
                  <TaskItem 
                    key={task.id}
                    task={task}
                    index={index + 1}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    viewMode="table"
                  />
                ))}
              </tbody>
            </Table>
            <div style={{ 
              padding: '16px 24px', 
              borderTop: '1px solid #e5e7eb',
              background: '#fafafb',
              fontSize: '13px',
              color: '#6b7280',
              textAlign: 'center'
            }}>
              Now viewing: 1-{tasks.length} of {tasks.length}
            </div>
          </div>
        ) : (
          <div className="p-3">
            <Row className="g-3">
              {tasks.map(task => (
                <TaskItem 
                  key={task.id}
                  task={task}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  viewMode="card"
                />
              ))}
            </Row>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskList;