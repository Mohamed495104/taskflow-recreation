import React from 'react';
import { Card, Badge, Button, Col } from 'react-bootstrap';

const TaskItem = ({ task, index, onEdit, onDelete, viewMode = 'table' }) => {
  const getStatusVariant = (status) => {
    switch(status) {
      case 'Completed': return { bg: '#dcfce7', color: '#166534', text: 'Completed' };
      case 'In Progress': return { bg: '#dbeafe', color: '#1d4ed8', text: 'In Progress' };
      default: return { bg: '#f3f4f6', color: '#374151', text: 'Pending' };
    }
  };

  const getPriorityVariant = (priority) => {
    switch(priority) {
      case 'High': return { bg: '#fee2e2', color: '#dc2626', text: 'High' };
      case 'Medium': return { bg: '#fef3c7', color: '#d97706', text: 'Medium' };
      default: return { bg: '#e0f2fe', color: '#0369a1', text: 'Low' };
    }
  };

  if (viewMode === 'card') {
    return (
      <Col md={6} lg={4}>
        <Card className="h-100" style={{ 
          border: '1px solid #e5e7eb', 
          borderRadius: '8px',
          boxShadow: 'none'
        }}>
          <Card.Body>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <span style={{
                ...getStatusVariant(task.status),
                backgroundColor: getStatusVariant(task.status).bg,
                color: getStatusVariant(task.status).color,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {getStatusVariant(task.status).text}
              </span>
              <span style={{
                ...getPriorityVariant(task.priority),
                backgroundColor: getPriorityVariant(task.priority).bg,
                color: getPriorityVariant(task.priority).color,
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: '500'
              }}>
                {getPriorityVariant(task.priority).text}
              </span>
            </div>
            <h6 className="mb-2" style={{ fontWeight: '600', color: '#1f2937' }}>{task.title}</h6>
            <p className="text-muted small mb-3" style={{ color: '#6b7280', fontSize: '13px' }}>
              {task.description}
            </p>
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center text-muted small" style={{ color: '#6b7280', fontSize: '12px' }}>
                <i className="bi bi-calendar3 me-2"></i>
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
              <div className="d-flex gap-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => onEdit(task)}
                  title="Edit task"
                  style={{ 
                    borderColor: '#d1d5db', 
                    color: '#6b7280',
                    padding: '4px 8px'
                  }}
                >
                  <i className="bi bi-pencil" style={{ fontSize: '12px' }}></i>
                </Button>
                <Button
                  variant="outline-danger"
                  size="sm"
                  onClick={() => onDelete(task.id)}
                  title="Delete task"
                  style={{ 
                    borderColor: '#d1d5db', 
                    color: '#6b7280',
                    padding: '4px 8px'
                  }}
                >
                  <i className="bi bi-trash" style={{ fontSize: '12px' }}></i>
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Col>
    );
  }

  // Table row view
  return (
    <tr style={{ 
      borderBottom: '1px solid #f3f4f6',
      transition: 'background-color 0.2s ease'
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <td className="border-0 py-3 ps-4" style={{ 
        color: '#6b7280', 
        fontWeight: '500',
        fontSize: '14px'
      }}>
        {index}
      </td>
      <td className="border-0 py-3">
        <div>
          <div style={{ 
            fontWeight: '500', 
            color: '#7c4d7d',
            fontSize: '14px',
            marginBottom: '2px'
          }}>
            {task.title}
          </div>
          <div style={{ 
            color: '#6b7280', 
            fontSize: '12px'
          }}>
            {task.description}
          </div>
        </div>
      </td>
      <td className="border-0 py-3">
        <span style={{
          ...getStatusVariant(task.status),
          backgroundColor: getStatusVariant(task.status).bg,
          color: getStatusVariant(task.status).color,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          ● {getStatusVariant(task.status).text}
        </span>
      </td>
      <td className="border-0 py-3">
        <span style={{
          ...getPriorityVariant(task.priority),
          backgroundColor: getPriorityVariant(task.priority).bg,
          color: getPriorityVariant(task.priority).color,
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '11px',
          fontWeight: '500'
        }}>
          {getPriorityVariant(task.priority).text}
        </span>
      </td>
      <td className="border-0 py-3">
        <div style={{ 
          color: '#6b7280', 
          fontSize: '13px'
        }}>
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      </td>
      <td className="border-0 py-3 pe-4">
        <div className="d-flex gap-2">
          <Button
            variant="link"
            size="sm"
            onClick={() => onEdit(task)}
            title="Edit task"
            style={{ 
              color: '#6b7280',
              padding: '4px 8px',
              border: 'none',
              background: 'none'
            }}
          >
            <i className="bi bi-pencil" style={{ fontSize: '14px' }}></i>
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => onDelete(task.id)}
            title="Delete task"
            style={{ 
              color: '#6b7280',
              padding: '4px 8px',
              border: 'none',
              background: 'none'
            }}
          >
            <i className="bi bi-trash" style={{ fontSize: '14px' }}></i>
          </Button>
        </div>
      </td>
    </tr>
  );
};

export default TaskItem;