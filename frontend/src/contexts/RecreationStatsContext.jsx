import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment as fbIncrement,
  serverTimestamp,
} from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';

const RecreationStatsContext = createContext(null);

export function RecreationStatsProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [winsCache, setWinsCache] = useState({}); 
  const [ready, setReady] = useState(false);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
      setWinsCache({});
      setReady(true);
    });
    return () => unsub();
  }, []);

  
  const userGameDocRef = useCallback(
    (gameKey) => (uid ? doc(db, 'users', uid, 'recreationStats', gameKey) : null),
    [uid]
  );

  // Ensure the per-game doc exists
  const ensureDoc = useCallback(
    async (gameKey) => {
      const ref = userGameDocRef(gameKey);
      if (!ref) throw new Error('User not authenticated');
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        await setDoc(ref, { wins: 0, lastUpdated: serverTimestamp() }, { merge: true });
        return { wins: 0 };
      }
      return snap.data();
    },
    [userGameDocRef]
  );

  // Read wins 
  const getWins = useCallback(
    async (gameKey) => {
      if (!uid) return 0;
      if (winsCache[gameKey] !== undefined) return winsCache[gameKey];
      try {
        const data = await ensureDoc(gameKey);
        const wins = Number(data?.wins ?? 0);
        setWinsCache((prev) => ({ ...prev, [gameKey]: wins }));
        return wins;
      } catch (err) {
        console.error('getWins error:', err);
        return 0;
      }
    },
    [uid, winsCache, ensureDoc]
  );

  // Increment wins
  const incrementWins = useCallback(
    async (gameKey) => {
      if (!uid) return;
      const ref = userGameDocRef(gameKey);
      if (!ref) return;
      try {
        await ensureDoc(gameKey); // create if missing
        await updateDoc(ref, { wins: fbIncrement(1), lastUpdated: serverTimestamp() });
        setWinsCache((prev) => ({
          ...prev,
          [gameKey]: Number(prev[gameKey] ?? 0) + 1,
        }));
      } catch (err) {
        console.error('incrementWins error:', err);
      }
    },
    [uid, userGameDocRef, ensureDoc]
  );

  // Realtime wins listener
  const listenWins = useCallback(
    (gameKey, cb) => {
      const ref = userGameDocRef(gameKey);
      if (!ref) return () => {};
      
      ensureDoc(gameKey).catch(() => {});
      const unsub = onSnapshot(
        ref,
        (snap) => {
          const wins = Number(snap.data()?.wins ?? 0);
          setWinsCache((prev) => ({ ...prev, [gameKey]: wins }));
          if (typeof cb === 'function') cb(wins);
        },
        (err) => console.error('listenWins error:', err)
      );
      return unsub;
    },
    [userGameDocRef, ensureDoc]
  );

  const value = useMemo(
    () => ({ ready, uid, getWins, incrementWins, listenWins }),
    [ready, uid, getWins, incrementWins, listenWins]
  );

  return (
    <RecreationStatsContext.Provider value={value}>
      {children}
    </RecreationStatsContext.Provider>
  );
}

export function useRecreationStats() {
  const ctx = useContext(RecreationStatsContext);
  if (!ctx) throw new Error('useRecreationStats must be used within RecreationStatsProvider');
  return ctx;
}
