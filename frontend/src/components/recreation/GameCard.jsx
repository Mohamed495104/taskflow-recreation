import React from 'react';
import { Card, Button, Badge } from 'react-bootstrap';

export default function GameCard({ title, subtitle, status = 'Ready', onPlay, badges = [], theme = 'default' }) {
  const isReady = status === 'Ready';
  
  // Theme-aware classes
  const cardClass = theme === 'recreation' 
    ? 'recreation-game-card h-100' 
    : 'dashboard-card h-100';
    
  const buttonVariant = theme === 'recreation'
    ? (isReady ? 'recreation-primary' : 'recreation-secondary')
    : (isReady ? 'primary' : 'secondary');

  // Status-based styling
  const getStatusColor = () => {
    if (theme === 'recreation') {
      switch (status) {
        case 'Ready': return 'recreation-success';
        case 'Under Construction': return 'recreation-warning';
        default: return 'recreation-info';
      }
    }
    
    switch (status) {
      case 'Ready': return 'success';
      case 'Under Construction': return 'warning';
      default: return 'info';
    }
  };

  return (
    <Card className={cardClass}>      
      <Card.Body className="d-flex flex-column p-3">
        {/* Status Badge */}
        <div className="mb-2">
          <Badge bg={getStatusColor()} className="recreation-status-badge">
            {status}
          </Badge>
        </div>

        <Card.Title className={theme === 'recreation' ? 'recreation-game-title mb-2' : 'mb-2'}>
          {title}
        </Card.Title>
        
        <Card.Subtitle className={`mb-3 ${theme === 'recreation' ? 'recreation-game-subtitle' : 'text-muted'}`}>
          {subtitle}
        </Card.Subtitle>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="mb-3">
            {badges.map((badge, index) => (
              <Badge 
                key={index} 
                bg={theme === 'recreation' ? 'recreation-badge' : 'secondary'} 
                className={`me-1 mb-1 ${theme === 'recreation' ? 'recreation-feature-badge' : ''}`}
              >
                {badge}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto">
          <Button
            variant={buttonVariant}
            disabled={!isReady}
            onClick={isReady ? onPlay : undefined}
            className={`w-100 ${theme === 'recreation' ? 'recreation-play-btn' : ''}`}
            size="sm"
          >
            {isReady ? 'Play' : 'Coming Soon'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}