import React, { lazy, useEffect, useMemo, useState, Suspense, useCallback, useRef } from 'react';
import { Row, Col, Card, Button, Badge, ProgressBar } from 'react-bootstrap';
import GameModal from './recreation/GameModel';
import GamesGrid from './recreation/GamesGrid';
import { useRecreationStats } from '../contexts/RecreationStatsContext';

const TicTacToe = lazy(() => import('./recreation/TicTacToe'));
const Hangman = lazy(() => import('./recreation/Hangman'));

export default function Recreation() {
  const [active, setActive] = useState(null);
  const show = Boolean(active);

  // Wins
  const { getWins, listenWins, ready, uid } = useRecreationStats();
  const [tttWins, setTttWins] = useState(0);
  const [hangmanWins, setHangmanWins] = useState(0);
  const [winRate, setWinRate] = useState(0);


  const listenersRef = useRef([]);

  // Fetch initial wins once when ready and uid available
  useEffect(() => {
    if (!ready || !uid) return;

    let isMounted = true;

    async function fetchWins() {
      try {
        const ttt = await getWins('ticTacToe');
        const hm = await getWins('hangman');

        if (!isMounted) return;

        setTttWins(ttt);
        setHangmanWins(hm);

        const total = Math.max(ttt + hm, 1);
        setWinRate(Math.round(((ttt + hm) / (total + 10)) * 100));
      } catch (error) {
        if (isMounted) console.error('Error fetching wins:', error);
      }
    }

    fetchWins();

    return () => {
      isMounted = false;
    };
  }, [ready, uid, getWins]);

  // Setup listeners for wins, separate effect
  useEffect(() => {
    if (!ready || !uid) return;

    let isMounted = true;

    const offA = listenWins('ticTacToe', (wins) => {
      if (isMounted) setTttWins(wins);
    });
    const offB = listenWins('hangman', (wins) => {
      if (isMounted) setHangmanWins(wins);
    });

    if (offA) listenersRef.current.push(offA);
    if (offB) listenersRef.current.push(offB);

    return () => {
      isMounted = false;
      if (offA) offA();
      if (offB) offB();
      listenersRef.current = [];
    };
  }, [ready, uid, listenWins]);

  // Recalculate winRate when wins change
  useEffect(() => {
    const total = Math.max(tttWins + hangmanWins, 1);
    setWinRate(Math.round(((tttWins + hangmanWins) / (total + 10)) * 100));
  }, [tttWins, hangmanWins]);

  // Games list
  const games = useMemo(() => [
    { key: 'ticTacToe', title: 'Tic Tac Toe', subtitle: 'Play vs CPU or Local', status: 'Ready', badges: ['Strategy', 'Quick'] },
    { key: 'hangman', title: 'Hangman', subtitle: 'Word guessing', status: 'Ready', badges: ['Puzzle', 'Quick'] },
    { key: 'rockPaperScissors', title: 'Rock, Paper, Scissors', subtitle: 'Best of 5', status: 'Under Construction', badges: ['Coming Soon'] },
    { key: 'memory', title: 'Memory Match', subtitle: 'Card pairs', status: 'Under Construction', badges: ['Coming Soon'] },
    { key: 'snake', title: 'Snake Game', subtitle: 'Classic arcade', status: 'Under Construction', badges: ['Coming Soon', 'Arcade'] },
  ], []);

  // Render modal content based on active game
  const renderActive = useCallback(() => {
    if (!active) return null;
    switch (active.key) {
      case 'ticTacToe': return <TicTacToe />;
      case 'hangman': return <Hangman />;
      default: return null;
    }
  }, [active]);

  // Handlers
  const handlePlay = useCallback((game) => {
    if (game.status === 'Ready') {
      setActive({ key: game.key, title: game.title });
    }
  }, []);

  const handleModalHide = useCallback(() => {
    setActive(null);
  }, []);

  const handleQuickPlay = useCallback(() => {
    setActive({ key: 'ticTacToe', title: 'Tic Tac Toe' });
  }, []);



  return (
    <div className="recreation-container">
      <div className="recreation-content">
        {/* Header */}
        <div className="dashboard-header mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap">
            <div className="mb-2 mb-md-0">
              <h1 className="dashboard-title">Recreation Zone</h1>
              <p className="dashboard-subtitle text-muted mb-0">Take a break and recharge with quick games.</p>
            </div>
            <Button className="btn-primary" aria-label="View Achievements" 
            style={{ backgroundColor: '#ebb2ecff', color: '#4A154B', border: '1px solid #7C4D7D' }}
            >
              <i className="bi bi-trophy me-2" aria-hidden="true"></i>
              Achievements
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Row className="g-3 mb-4">
          <Col lg={3} sm={6}>
            <Card className="dashboard-stat-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number mb-1">{tttWins}</h3>
                    <p className="stat-label text-muted mb-1">TTT Wins</p>
                    <small className="text-success"><i className="bi bi-trophy me-1" aria-hidden="true"></i>Personal best</small>
                  </div>
                  <div className="stat-icon bg-success"><i className="bi bi-grid-3x3" aria-hidden="true"></i></div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} sm={6}>
            <Card className="dashboard-stat-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number mb-1">{hangmanWins}</h3>
                    <p className="stat-label text-muted mb-1">Hangman Wins</p>
                    <small className="text-info"><i className="bi bi-lightbulb me-1" aria-hidden="true"></i>Keep going</small>
                  </div>
                  <div className="stat-icon bg-info"><i className="bi bi-alphabet-uppercase" aria-hidden="true"></i></div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} sm={6}>
            <Card className="dashboard-stat-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number mb-1">{games.length}</h3>
                    <p className="stat-label text-muted mb-1">Games</p>
                    <small className="text-primary"><i className="bi bi-controller me-1" aria-hidden="true"></i>Total Games</small>
                  </div>
                  <div className="stat-icon bg-primary"><i className="bi bi-collection" aria-hidden="true"></i></div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={3} sm={6}>
            <Card className="dashboard-stat-card h-100">
              <Card.Body className="p-3">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="stat-number mb-1">{winRate}%</h3>
                    <p className="stat-label text-muted mb-1">Win Rate</p>
                    <small className="text-success"><i className="bi bi-arrow-up me-1" aria-hidden="true"></i>Improving</small>
                  </div>
                  <div className="stat-icon bg-warning"><i className="bi bi-graph-up" aria-hidden="true"></i></div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row className="g-4">
          {/* Games */}
          <Col lg={8}>
            <Card className="dashboard-card mb-4">
              <Card.Header className="dashboard-card-header">
                <h5 className="mb-0">Available Games</h5>
              </Card.Header>
              <Card.Body className="p-4">
                <GamesGrid games={games} pageSize={3} onPlay={handlePlay} theme="recreation" />
              </Card.Body>
            </Card>

            {/* Game Progress */}
            <Card className="dashboard-card">
              <Card.Header className="dashboard-card-header">
                <h5 className="mb-0">Game Progress</h5>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="project-list">
                  <div className="project-item p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="project-icon bg-success me-3"><i className="bi bi-grid-3x3" aria-hidden="true"></i></div>
                      <div>
                        <h6 className="mb-1">Tic Tac Toe Mastery</h6>
                        <small className="text-muted">Win 10 games</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <ProgressBar now={(tttWins / 10) * 100} className="me-3" style={{ width: '100px', height: '6px' }} aria-label="Tic Tac Toe progress" />
                      <Badge bg="success">{tttWins}/10</Badge>
                    </div>
                  </div>

                  <div className="project-item p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="project-icon bg-info me-3"><i className="bi bi-alphabet-uppercase" aria-hidden="true"></i></div>
                      <div>
                        <h6 className="mb-1">Hangman Pro</h6>
                        <small className="text-muted">Win 5 games</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <ProgressBar now={(hangmanWins / 5) * 100} className="me-3" style={{ width: '100px', height: '6px' }} aria-label="Hangman progress" />
                      <Badge bg="info">{hangmanWins}/5</Badge>
                    </div>
                  </div>

                  <div className="project-item p-3 d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="project-icon bg-warning me-3"><i className="bi bi-collection" aria-hidden="true"></i></div>
                      <div>
                        <h6 className="mb-1">Game Explorer</h6>
                        <small className="text-muted">Try all games</small>
                      </div>
                    </div>
                    <div className="d-flex align-items-center">
                      <ProgressBar now={20} className="me-3" style={{ width: '100px', height: '6px' }} aria-label="Game Explorer progress" />
                      <Badge bg="warning">1/5</Badge>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Sidebar */}
          <Col lg={4}>
            <Card className="dashboard-card mb-4">
              <Card.Header className="dashboard-card-header"><h5 className="mb-0">Quick Actions</h5></Card.Header>
              <Card.Body className="p-3">
                <div className="d-grid gap-2">
                  <Button
                    variant="outline-primary"
                    className="text-start py-2"
                    onClick={handleQuickPlay}
                    aria-label="Quick Play Tic Tac Toe"
                  >
                    <i className="bi bi-play-circle me-2" aria-hidden="true"></i>Quick Play
                  </Button>
                  <Button variant="outline-secondary" className="text-start py-2" aria-label="View Leaderboard">
                    <i className="bi bi-trophy me-2" aria-hidden="true"></i>Leaderboard
                  </Button>
                  <Button variant="outline-info" className="text-start py-2" aria-label="Game Settings">
                    <i className="bi bi-gear me-2" aria-hidden="true"></i>Settings
                  </Button>
                  <Button variant="outline-success" className="text-start py-2" aria-label="How to Play">
                    <i className="bi bi-question-circle me-2" aria-hidden="true"></i>How to Play
                  </Button>
                </div>
              </Card.Body>
            </Card>

            <Card className="dashboard-card mb-4">
              <Card.Header className="dashboard-card-header"><h5 className="mb-0">Categories</h5></Card.Header>
              <Card.Body className="p-3">
                <div className="activity-list">
                  <div className="activity-item mb-3">
                    <div className="activity-avatar bg-primary"><i className="bi bi-grid-3x3" aria-hidden="true"></i></div>
                    <div className="activity-content"><p className="mb-1"><strong>Strategy</strong></p><small className="text-muted">1 available</small></div>
                    <Badge bg="success">Ready</Badge>
                  </div>
                  <div className="activity-item mb-3">
                    <div className="activity-avatar bg-info"><i className="bi bi-hand-index" aria-hidden="true"></i></div>
                    <div className="activity-content"><p className="mb-1"><strong>Quick Games</strong></p><small className="text-muted">1 coming</small></div>
                    <Badge bg="warning">Development</Badge>
                  </div>
                  <div className="activity-item mb-3">
                    <div className="activity-avatar bg-success"><i className="bi bi-puzzle" aria-hidden="true"></i></div>
                    <div className="activity-content"><p className="mb-1"><strong>Puzzles</strong></p><small className="text-muted">2 coming</small></div>
                    <Badge bg="secondary">Soon</Badge>
                  </div>
                  <div className="activity-item">
                    <div className="activity-avatar bg-warning"><i className="bi bi-people" aria-hidden="true"></i></div>
                    <div className="activity-content"><p className="mb-1"><strong>Team Building</strong></p><small className="text-muted">1 coming</small></div>
                    <Badge bg="secondary">Soon</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card className="dashboard-card">
              <Card.Header className="dashboard-card-header"><h5 className="mb-0">Recent Activity</h5></Card.Header>
              <Card.Body className="p-3">
                <div className="deadline-list">
                  <div className="deadline-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div><h6 className="mb-1 fs-6">Tic Tac Toe Victory</h6><small className="text-muted">Beat CPU on Hard</small></div>
                    <Badge bg="success">Now</Badge>
                  </div>
                  <div className="deadline-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div><h6 className="mb-1 fs-6">Achievement Unlocked</h6><small className="text-muted">Strategy Master</small></div>
                    <Badge bg="warning">5m</Badge>
                  </div>
                  <div className="deadline-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div><h6 className="mb-1 fs-6">Game Session</h6><small className="text-muted">Break time started</small></div>
                    <Badge bg="info">15m</Badge>
                  </div>
                  <div className="deadline-item d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div><h6 className="mb-1 fs-6">Personal Best</h6><small className="text-muted">Fastest TTT win</small></div>
                    <Badge bg="secondary">1h</Badge>
                  </div>
                  <div className="deadline-item d-flex justify-content-between align-items-center py-2">
                    <div><h6 className="mb-1 fs-6">Challenge Done</h6><small className="text-muted">3 win streak</small></div>
                    <Badge bg="primary">2h</Badge>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Suspense for modal loading */}
        <Suspense fallback={
          <div className="text-center p-4">
            <div className="spinner-border text-primary mb-3" role="status"></div>
            <div>Loading game...</div>
          </div>
        }>
          <GameModal
            title={active?.title ?? ''}
            show={show}
            onHide={handleModalHide}
            onExited={() => setActive(null)}
          >
            {renderActive()}
          </GameModal>
        </Suspense>
      </div>
    </div>
  );
}
