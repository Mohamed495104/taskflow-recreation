import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { Button, Form, Dropdown, ButtonGroup, Badge } from 'react-bootstrap';
import { useRecreationStats } from '../../contexts/RecreationStatsContext';
import { db, auth } from '../../firebaseConfig';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

export default function TicTacToe() {
  const { incrementWins } = useRecreationStats();

  // core state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [current, setCurrent] = useState('X');          
  const [winner, setWinner] = useState(null);            
  const [winningLine, setWinningLine] = useState(null);  
  const [isCpu, setIsCpu] = useState(true);
  const [isLocked, setIsLocked] = useState(false);       

  // enhancements
  const [difficulty, setDifficulty] = useState('normal');        
  const [startPlayer, setStartPlayer] = useState('X');          
  const [history, setHistory] = useState([Array(9).fill(null)]); 
  const [step, setStep] = useState(0);
  const [score, setScore] = useState({ x: 0, o: 0, draws: 0 });

  // local 2 player names
  const [xName, setXName] = useState('');
  const [oName, setOName] = useState('');
  const [namesLocked, setNamesLocked] = useState(false);

  
  const [ended, setEnded] = useState(false);
  const endedRef = useRef(false);

  // lines
  const lines = useMemo(
    () => [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6],
    ],
    []
  );

  // helpers
  const getWinningLine = useCallback((b) => {
    for (const [a, b2, c] of lines) {
      if (b[a] && b[a] === b[b2] && b[a] === b[c]) return [a, b2, c];
    }
    return null;
  }, [lines]);

  const checkWinner = useCallback((b) => {
    const wline = getWinningLine(b);
    if (wline) return b[wline[0]];
    return b.every(Boolean) ? 'draw' : null;
  }, [getWinningLine]);

  const emptyIndices = (b) => b.map((v, i) => (v ? null : i)).filter((x) => x !== null);

// cpu logic
  const cpuEasy = useCallback((b) => {
    const empties = emptyIndices(b);
    if (!empties.length) return null;
    return empties[Math.floor(Math.random() * empties.length)];
  }, []);

  const cpuNormal = useCallback((b) => {
    const me = 'O', you = 'X';
    const empties = emptyIndices(b);
    for (const i of empties) { const copy = b.slice(); copy[i] = me; if (checkWinner(copy) === me) return i; }
    for (const i of empties) { const copy = b.slice(); copy[i] = you; if (checkWinner(copy) === you) return i; }
    if (b[4] === null) return 4;
    const corners = [0,2,6,8].filter((i) => b[i] === null);
    if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
    const sides = [1,3,5,7].filter((i) => b[i] === null);
    if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
    return null;
  }, [checkWinner]);

  const cpuHard = useCallback((b) => {
    const scoreFor = (res, depth) => res === 'O' ? 10 - depth : res === 'X' ? depth - 10 : 0;
    const maxPlayer = (state, depth) => {
      const win = checkWinner(state);
      if (win) return { score: scoreFor(win, depth) };
      let best = { score: -Infinity, idx: null };
      for (const i of emptyIndices(state)) {
        const next = state.slice(); next[i] = 'O';
        const res = minPlayer(next, depth + 1);
        if (res.score > best.score) best = { score: res.score, idx: i };
      }
      return best;
    };
    const minPlayer = (state, depth) => {
      const win = checkWinner(state);
      if (win) return { score: scoreFor(win, depth) };
      let best = { score: Infinity, idx: null };
      for (const i of emptyIndices(state)) {
        const next = state.slice(); next[i] = 'X';
        const res = maxPlayer(next, depth + 1);
        if (res.score < best.score) best = { score: res.score, idx: i };
      }
      return best;
    };
    return maxPlayer(b, 0).idx ?? null;
  }, [checkWinner]);

  const cpuBestMove = useCallback((b) => {
    if (difficulty === 'easy') return cpuEasy(b);
    if (difficulty === 'hard') return cpuHard(b);
    return cpuNormal(b);
  }, [difficulty, cpuEasy, cpuNormal, cpuHard]);

  // Firestore log (2‑player only) 
  const logLocalMatch = useCallback(async (result) => {
    if (isCpu || !namesLocked) return;
    try {
      await addDoc(collection(db, 'tictactoeMatches'), {
        uid: auth.currentUser?.uid ?? null,
        xName: xName.trim() || 'Player X',
        oName: oName.trim() || 'Player O',
        winner: result,               
        finishedAt: serverTimestamp(),
        mode: 'local-2p',
      });
    } catch (e) {
      console.error('Failed to log match:', e);
    }
  }, [isCpu, namesLocked, xName, oName]);

  // single-run guard helper
  const guardOnce = () => {
    if (endedRef.current) return false;
    endedRef.current = true;
    setEnded(true);
    return true;
  };

  // Moves
  const finishRound = async (result, finalBoard) => {
    if (!guardOnce()) return; 

    setWinner(result);
    setWinningLine(result !== 'draw' ? getWinningLine(finalBoard) : null);

    if (result === 'X') setScore((s) => ({ ...s, x: s.x + 1 }));
    else if (result === 'O') setScore((s) => ({ ...s, o: s.o + 1 }));
    else setScore((s) => ({ ...s, draws: s.draws + 1 }));

    if (result !== 'draw') {
      try { await incrementWins('ticTacToe'); } catch { /* ignore */ }
    }

    await logLocalMatch(result);
  };

  const applyHumanMove = async (i) => {
    if (winner || ended || board[i] || (isCpu && isLocked)) return;

    const symbol = isCpu ? 'X' : current; 

    const next = board.slice(); next[i] = symbol;
    const w = checkWinner(next);

    setBoard(next);
    setHistory((h) => [...h.slice(0, step + 1), next]);
    setStep((s) => s + 1);

    if (w) {
      await finishRound(w, next);
      setCurrent(symbol);
      return;
    }

    if (isCpu) {
      setCurrent('O');
      triggerCpu(next); // pass the fresh board to avoid stale state
    } else {
      setCurrent(symbol === 'X' ? 'O' : 'X');
    }
  };

  const triggerCpu = (baseBoard) => {
    if (ended) return;
    setIsLocked(true);

    setTimeout(async () => {
      const b = baseBoard ?? board;           // use provided snapshot or latest
      const idx = cpuBestMove(b);
      if (idx === null) { setIsLocked(false); return; }

      const cpuNext = b.slice(); cpuNext[idx] = 'O';
      const w2 = checkWinner(cpuNext);

      setBoard(cpuNext);
      setHistory((h) => [...h.slice(0, step + 1), cpuNext]);
      setStep((s) => s + 1);

      if (w2) {
        await finishRound(w2, cpuNext);
        setCurrent('O');
      } else {
        setCurrent('X');
      }

      setIsLocked(false);
    }, 280);
  };

  const handleCellClick = async (i) => {
    await applyHumanMove(i);
  };

  const reset = () => {
    const empty = Array(9).fill(null);
    setBoard(empty);
    setHistory([empty]);
    setStep(0);
    setWinner(null);
    setWinningLine(null);
    setCurrent(startPlayer);
    setIsLocked(false);
    setEnded(false);
    endedRef.current = false; // reset strict-mode guard too
  };

  const restartMatch = () => {
    setScore({ x: 0, o: 0, draws: 0 });
    setNamesLocked(false);
    reset();
  };

  const jumpTo = (moveIndex) => {
    const snap = history[moveIndex];
    const w = checkWinner(snap);
    setBoard(snap);
    setStep(moveIndex);
    setWinner(w);
    setWinningLine(w ? getWinningLine(snap) : null);

    const xCount = snap.filter((v) => v === 'X').length;
    const oCount = snap.filter((v) => v === 'O').length;
    const nextTurn = xCount === oCount ? 'X' : 'O';
    setCurrent(nextTurn);
    setIsLocked(false);
    setEnded(Boolean(w));
    endedRef.current = Boolean(w);

    if (!w && isCpu && nextTurn === 'O') triggerCpu(snap);
  };

  useEffect(() => {
    if (!isCpu || winner || ended) return;
    if (current === 'O' && !isLocked && step === 0) triggerCpu(board);
  }, [isCpu, current, winner, isLocked, step, ended]);

  const nameLabelX = isCpu ? 'You (X)' : (xName?.trim() || 'Player X');
  const nameLabelO = isCpu ? 'CPU (O)' : (oName?.trim() || 'Player O');

  const statusText = winner
    ? winner === 'draw'
      ? 'Draw!'
      : winner === 'X'
        ? `${nameLabelX} wins!`
        : `${nameLabelO} wins!`
    : isCpu
      ? (isLocked || current === 'O') ? 'CPU is thinking…' : 'Your turn'
      : `${current === 'X' ? nameLabelX : nameLabelO}'s turn`;

  return (
    <div className="game-modal-body">
      <style>{`
        .tic-topbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; gap:12px; flex-wrap:wrap; }
        .tic-grid { display:grid; grid-template-columns: repeat(3, 88px); gap:12px; justify-content:center; padding:6px 0 2px; }
        @media (min-width: 768px) { .tic-grid { grid-template-columns: repeat(3, 96px); } }
        .tic-cell { width:88px; height:88px; border-radius:12px; border:2px solid #d0d7de; background:#fff; font-weight:800; font-size:32px; line-height:1; display:flex; align-items:center; justify-content:center; box-shadow:0 2px 6px rgba(16,24,40,.08); transition: transform .08s, background .2s, border-color .2s, box-shadow .2s; user-select:none; }
        @media (min-width: 768px) { .tic-cell { width:96px; height:96px; font-size:36px; } }
        .tic-cell:hover:not(:disabled) { transform: translateY(-2px); }
        .tic-cell:disabled { cursor:default; }
        .tic-cell.x { color:#0d6efd; }
        .tic-cell.o { color:#dc3545; }
        .tic-cell.win { border-color:#198754; background:#e8f5ec; box-shadow:0 4px 10px rgba(25,135,84,.2); }
        .panel { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
        .mini { font-size:12px; }
        .history { max-height: 160px; overflow:auto; border:1px solid #e5e7eb; border-radius:8px; padding:8px; }
        .history button { width:100%; text-align:left; margin-bottom:6px; }
        .names { display:flex; gap:8px; align-items:end; flex-wrap:wrap; }
      `}</style>

      {/* Top bar */}
      <div className="tic-topbar">
        <div className="fw-semibold" aria-live="polite">{statusText}</div>

        <div className="panel">
          <Form.Check
            type="switch"
            id="cpu-toggle"
            label="CPU"
            checked={isCpu}
            onChange={(e) => {
              setIsCpu(e.target.checked);
              if (e.target.checked) setNamesLocked(true);
              if (e.target.checked && current === 'O' && step === 0) setTimeout(() => triggerCpu(board), 0);
            }}
          />

          <Dropdown as={ButtonGroup} size="sm">
            <Button variant="outline-secondary" className="mini">Difficulty: {difficulty}</Button>
            <Dropdown.Toggle split variant="outline-secondary" id="dd-diff" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setDifficulty('easy')}>Easy</Dropdown.Item>
              <Dropdown.Item onClick={() => setDifficulty('normal')}>Normal</Dropdown.Item>
              <Dropdown.Item onClick={() => setDifficulty('hard')}>Hard</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Dropdown as={ButtonGroup} size="sm">
            <Button variant="outline-secondary" className="mini">Start: {startPlayer}</Button>
            <Dropdown.Toggle split variant="outline-secondary" id="dd-start" />
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => { setStartPlayer('X'); setCurrent('X'); reset(); }}>X</Dropdown.Item>
              <Dropdown.Item onClick={() => { setStartPlayer('O'); setCurrent('O'); reset(); }}>{isCpu ? 'CPU (O)' : 'O'}</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>

          <Button size="sm" variant="outline-secondary" onClick={reset}>New Round</Button>
          <Button size="sm" variant="outline-danger" onClick={restartMatch}>Restart Match</Button>

          <Badge bg="primary">{isCpu ? 'You (X)' : (xName?.trim() || 'Player X')}: {score.x}</Badge>
          <Badge bg="danger">{isCpu ? 'CPU (O)' : (oName?.trim() || 'Player O')}: {score.o}</Badge>
          <Badge bg="secondary">Draws: {score.draws}</Badge>
        </div>
      </div>

      {/* 2‑player names */}
      {!isCpu && !namesLocked && (
        <div className="names mb-2">
          <Form.Group controlId="xName">
            <Form.Label className="mb-1">Player X Name</Form.Label>
            <Form.Control size="sm" type="text" placeholder="Enter name" value={xName} onChange={(e) => setXName(e.target.value)} />
          </Form.Group>
          <Form.Group controlId="oName">
            <Form.Label className="mb-1">Player O Name</Form.Label>
            <Form.Control size="sm" type="text" placeholder="Enter name" value={oName} onChange={(e) => setOName(e.target.value)} />
          </Form.Group>
          <Button
            size="sm"
            className="align-self-end"
            onClick={() => { setNamesLocked(true); reset(); }}
            disabled={!xName.trim() || !oName.trim()}
          >
            Start
          </Button>
        </div>
      )}

      {/* Board */}
      <div className="tic-grid mb-3">
        {board.map((val, idx) => {
          const isWin = winningLine?.includes(idx);
          const cls = ['tic-cell', val === 'X' ? 'x' : val === 'O' ? 'o' : '', isWin ? 'win' : ''].join(' ').trim();
          return (
            <button
              key={idx}
              className={cls}
              onClick={() => handleCellClick(idx)}
              disabled={!!winner || ended || !!val || (isCpu && isLocked) || (!isCpu && !namesLocked)}
              aria-label={`Cell ${idx + 1}, ${val ?? 'empty'}`}
            >
              {val}
            </button>
          );
        })}
      </div>

      {/* History */}
      <div className="history">
        {history.map((_, mv) => {
          const name = mv === 0 ? 'Go to start' : `Go to move #${mv}`;
          const active = mv === step;
          return (
            <Button key={mv} size="sm" variant={active ? 'primary' : 'outline-secondary'} onClick={() => jumpTo(mv)}>
              {name}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
