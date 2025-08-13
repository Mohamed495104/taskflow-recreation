import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, Button, Badge, Row, Col } from 'react-bootstrap';
import { useRecreationStats } from '../../contexts/RecreationStatsContext';
import { db, auth } from '../../firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

const WORDS_WITH_HINTS = [
  { word: 'REACT', hint: 'Popular JavaScript library for building user interfaces', category: 'Technology' },
  { word: 'JAVASCRIPT', hint: 'Programming language that runs in web browsers', category: 'Technology' },
  { word: 'HANGMAN', hint: 'Classic word guessing game you are playing right now', category: 'Games' },
  { word: 'CODING', hint: 'The process of writing computer programs', category: 'Technology' },
  { word: 'PUZZLE', hint: 'A problem or game that challenges your thinking', category: 'Games' },
  { word: 'GAME', hint: 'An activity done for entertainment or fun', category: 'Entertainment' },
  { word: 'DEVELOPER', hint: 'A person who creates software applications', category: 'Careers' },
  { word: 'PROGRAMMING', hint: 'The art of instructing computers what to do', category: 'Technology' },
];

const MAX_WRONG = 6;
const TIME_LIMIT = 180; // 3 minutes in seconds

const Hangman = () => {
  const { incrementWins, uid, ready } = useRecreationStats();
  
  // Core game state
  const [currentWordData, setCurrentWordData] = useState(WORDS_WITH_HINTS[0]);
  const [guessed, setGuessed] = useState(new Set());
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [gameActive, setGameActive] = useState(true);
  
  // Game session tracking
  const [sessionId] = useState(() => Date.now().toString());
  const [gameStartTime, setGameStartTime] = useState(null);
  const [ended, setEnded] = useState(false);
  const endedRef = useRef(false);

  // Calculate score based on performance
  const calculateScore = useCallback((result) => {
    if (result !== 'won') return 0;
    
    let baseScore = 100;
    baseScore += (MAX_WRONG - wrongGuesses) * 10;
    baseScore += Math.floor(timeLeft / 10);
    if (showHint) baseScore = Math.floor(baseScore * 0.7);
    baseScore += currentWordData.word.length * 5;
    
    return Math.max(baseScore, 10);
  }, [wrongGuesses, timeLeft, showHint, currentWordData.word.length]);

  // Determine difficulty based on word length
  const getDifficulty = useCallback(() => {
    const wordLength = currentWordData.word.length;
    if (wordLength <= 5) return 'easy';
    if (wordLength <= 8) return 'medium';
    return 'hard';
  }, [currentWordData.word.length]);

  // Single-run guard helper for StrictMode
  const guardOnce = () => {
    if (endedRef.current) {
      return false;
    }
    endedRef.current = true;
    setEnded(true);
    return true;
  };

  const resetGame = useCallback(() => {
    const randomWordData = WORDS_WITH_HINTS[Math.floor(Math.random() * WORDS_WITH_HINTS.length)];
    setCurrentWordData(randomWordData);
    setGuessed(new Set());
    setWrongGuesses(0);
    setGameOver(false);
    setWon(false);
    setShowHint(false);
    setTimeLeft(TIME_LIMIT);
    setGameActive(true);
    setEnded(false);
    endedRef.current = false;
    setGameStartTime(Date.now());
  }, []);

  useEffect(() => {
    resetGame();
  }, [resetGame]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (gameActive && timeLeft > 0 && !gameOver) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setGameOver(true);
            setGameActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameActive, timeLeft, gameOver]);

  // Log game to Firestore
  const logHangmanGame = useCallback(async (gameResult) => {
    // Check prerequisites
    if (!ready || !uid || !auth.currentUser || !db) {
      return;
    }

    try {
      const gameData = {
        uid: uid,
        authUid: auth.currentUser.uid,
        sessionId: sessionId,
        word: currentWordData.word,
        category: currentWordData.category,
        hint: currentWordData.hint,
        result: gameResult, 
        hintUsed: showHint,
        wrongGuesses: wrongGuesses,
        totalGuesses: guessed.size,
        timeElapsed: gameStartTime ? Math.round((Date.now() - gameStartTime) / 1000) : 0,
        timeRemaining: timeLeft,
        score: calculateScore(gameResult),
        difficulty: getDifficulty(),
        finishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'hangmanGames'), gameData);
      
    } catch (error) {
      console.error('Firestore save error:', error);
    }
  }, [ready, uid, sessionId, currentWordData.word, currentWordData.category, currentWordData.hint, showHint, wrongGuesses, guessed.size, gameStartTime, timeLeft, calculateScore, getDifficulty]);

  const finishGame = useCallback(async (result) => {
    if (!guardOnce()) return;

    setGameOver(true);
    setGameActive(false);
    
    const gameResult = result === 'timeout' ? 'timeout' : 
                      result === 'won' ? 'won' : 'lost';
    
    // Log to Firestore
    await logHangmanGame(gameResult);
    
    // Increment wins in RecreationStats context if won
    if (gameResult === 'won' && ready && uid) {
      try {
        await incrementWins('hangman');
      } catch (error) {
        console.error('Error incrementing hangman wins:', error);
      }
    }
  }, [logHangmanGame, ready, uid, incrementWins]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGuess = async (letter) => {
    if (gameOver || ended || guessed.has(letter)) return;

    const newGuessed = new Set(guessed).add(letter);
    setGuessed(newGuessed);

    if (!currentWordData.word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);
      
      if (newWrongGuesses >= MAX_WRONG) {
        setWon(false);
        await finishGame('lost');
      }
    } else {
      const wordLetters = new Set(currentWordData.word.split(''));
      const allGuessed = [...wordLetters].every((l) => newGuessed.has(l));
      
      if (allGuessed) {
        setWon(true);
        await finishGame('won');
      }
    }
  };

  // Handle timeout
  useEffect(() => {
    if (timeLeft <= 0 && gameActive && !gameOver && !ended) {
      finishGame('timeout');
    }
  }, [timeLeft, gameActive, gameOver, ended, finishGame]);

  const renderWord = () => {
    return currentWordData.word.split('').map((letter, idx) => (
      <span key={idx} className="word-letter mx-2" style={{ fontSize: '2rem', fontWeight: 'bold' }}>
        {guessed.has(letter) ? letter : '_'}
      </span>
    ));
  };

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <Card className="p-4" style={{ maxWidth: '700px', margin: 'auto', background: 'rgba(255, 255, 255, 0.95)' }}>
      <Card.Body>
        <Card.Title className="text-center mb-4">Hangman Game</Card.Title>
        
        {/* Game Controls */}
        <div className="text-center mb-4">
          <Badge bg="info" className="me-2">Time Left: {formatTime(timeLeft)}</Badge>
          <Badge bg="secondary" className="me-2">Difficulty: {getDifficulty()}</Badge>
          <Button
            variant="warning"
            size="sm"
            onClick={() => setShowHint(true)}
            disabled={showHint || gameOver}
          >
         Show Hint
          </Button>
        </div>
        
        {/* Hint Display */}
        {showHint && (
          <div className="text-center mb-4">
            <Badge bg="warning" style={{ fontStyle: 'italic', padding: '10px', fontSize: '14px' }}>
             {currentWordData.hint}
            </Badge>
          </div>
        )}
        
        {/* Word Display */}
        <div className="text-center mb-4" style={{ minHeight: '60px' }}>
          {renderWord()}
        </div>
        
        {/* Progress Indicator */}
        <div className="text-center mb-4">
          <Badge bg="secondary">Guesses Left: {MAX_WRONG - wrongGuesses}</Badge>
          <Badge bg="info" className="ms-2">Category: {currentWordData.category}</Badge>
        </div>
        
        {/* Game Over Message */}
        {gameOver && (
          <div className="text-center mb-4">
            <Badge 
              bg={won ? 'success' : 'danger'} 
              style={{ padding: '10px', fontSize: '16px' }}
            >
              {won 
                ? ` You Won! Score: ${calculateScore('won')}` 
                : timeLeft <= 0 
                  ? ' Time\'s Up!' 
                  : ` Game Over! The word was: ${currentWordData.word}`
              }
            </Badge>
          </div>
        )}
        
        {/* Alphabet Grid */}
        <Row className="g-2 mb-4" style={{ justifyContent: 'center' }}>
          {alphabet.map((letter) => {
            const isGuessed = guessed.has(letter);
            const isCorrect = isGuessed && currentWordData.word.includes(letter);
            const isIncorrect = isGuessed && !currentWordData.word.includes(letter);
            return (
              <Col xs="auto" key={letter}>
                <Button
                  variant={isCorrect ? 'success' : isIncorrect ? 'danger' : 'outline-primary'}
                  size="sm"
                  onClick={() => handleGuess(letter)}
                  disabled={gameOver || ended || isGuessed}
                  style={{ width: '40px', height: '40px', fontSize: '1rem' }}
                >
                  {letter}
                </Button>
              </Col>
            );
          })}
        </Row>
        
        {/* Game Controls */}
        <div className="text-center">
          <Button variant="primary" onClick={resetGame}>
            {gameOver ? ' Play Again' : ' New Game'}
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default Hangman;