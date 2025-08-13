import React, { useMemo, useState } from 'react';
import { Row, Col, Pagination } from 'react-bootstrap';
import GameCard from './GameCard';

export default function GamesGrid({ games = [], pageSize = 3, onPlay, theme = 'default' }) {
  const [page, setPage] = useState(1);
  
  const totalPages = Math.max(1, Math.ceil(games.length / pageSize));

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return games.slice(start, start + pageSize);
  }, [games, page, pageSize]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const paginationClass = theme === 'recreation' 
    ? 'recreation-pagination' 
    : '';

  return (
    <div className="games-grid">
      <Row className="g-3">
        {pageItems.map((game) => (
          <Col key={game.key} md={6} lg={4}>
            <GameCard 
              key={game.key}
              title={game.title}
              subtitle={game.subtitle}
              status={game.status}
              badges={game.badges}
              onPlay={() => onPlay?.(game)}
              theme={theme}
            />
          </Col>
        ))}
      </Row>

      {games.length > pageSize && (
        <div className="d-flex justify-content-center mt-4">
          <Pagination size="sm" className={paginationClass}>
            <Pagination.Prev 
              disabled={page === 1}
              onClick={() => page > 1 && handlePageChange(page - 1)}
            />
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Pagination.Item 
                key={n} 
                active={n === page} 
                onClick={() => handlePageChange(n)}
                className={theme === 'recreation' ? 'recreation-page-item' : ''}
              >
                {n}
              </Pagination.Item>
            ))}
            
            <Pagination.Next 
              disabled={page === totalPages}
              onClick={() => page < totalPages && handlePageChange(page + 1)}
            />
          </Pagination>
        </div>
      )}

      {games.length === 0 && (
        <div className="text-center text-muted py-4">
          <i className="bi bi-controller display-4 mb-3 d-block opacity-50"></i>
          <p>No games available</p>
        </div>
      )}
    </div>
  );
}