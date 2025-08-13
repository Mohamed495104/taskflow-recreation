import React, { Suspense } from 'react';
import { Modal, Spinner } from 'react-bootstrap';

export default function GameModal({ title, show, onHide, children, theme = 'default', gameKey = '' }) {
  
  const modalClass = theme === 'recreation' 
    ? 'recreation-game-modal' 
    : '';

  const LoadingSpinner = () => (
    <div className="text-center p-4">
      {theme === 'recreation' ? (
        <div className="recreation-loading">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <div>Loading game...</div>
        </div>
      ) : (
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      )}
    </div>
  );

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="lg"
      className={modalClass}
    >
      <Modal.Header 
        closeButton 
        className={theme === 'recreation' ? 'recreation-modal-header' : ''}
      >
        <Modal.Title className="h5">
          {title}
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className={theme === 'recreation' ? 'recreation-modal-body' : ''}>
        <Suspense fallback={<LoadingSpinner />}>
          {children}
        </Suspense>
      </Modal.Body>
    </Modal>
  );
}