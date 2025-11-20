import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { request, gql } from 'graphql-request';
import { auth } from '../firebaseConfig';
import { API_ENDPOINT } from '../config';

// GraphQL queries and mutations
const GET_RECREATION_STATS = gql`
  query GetRecreationStats($userId: String!, $gameKey: String!) {
    recreationStats(userId: $userId, gameKey: $gameKey) {
      id
      userId
      gameKey
      wins
      lastUpdated
    }
  }
`;

const INCREMENT_WINS = gql`
  mutation IncrementWins($userId: String!, $gameKey: String!) {
    incrementWins(userId: $userId, gameKey: $gameKey) {
      id
      userId
      gameKey
      wins
      lastUpdated
    }
  }
`;

const RecreationStatsContext = createContext(null);

export function RecreationStatsProvider({ children }) {
  const [uid, setUid] = useState(null);
  const [winsCache, setWinsCache] = useState({});
  const [ready, setReady] = useState(false);

  // Auth state listener
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user ? user.uid : null);
      setWinsCache({});
      setReady(true);
    });
    return () => unsub();
  }, []);

  // Fetch wins
  const getWins = useCallback(
    async (gameKey) => {
      if (!uid) return 0;
      if (winsCache[gameKey] !== undefined) return winsCache[gameKey];

      try {
        const data = await request(API_ENDPOINT, GET_RECREATION_STATS, {
          userId: uid,
          gameKey,
        });

        const wins = Number(data?.recreationStats?.wins ?? 0);
        setWinsCache((prev) => ({ ...prev, [gameKey]: wins }));
        return wins;
      } catch (err) {
        console.error('getWins error:', err);
        return 0;
      }
    },
    [uid, winsCache]
  );

  // Increment wins
  const incrementWins = useCallback(
    async (gameKey) => {
      if (!uid) return;

      try {
        const data = await request(API_ENDPOINT, INCREMENT_WINS, {
          userId: uid,
          gameKey,
        });

        const wins = Number(data?.incrementWins?.wins ?? 0);

        setWinsCache((prev) => ({
          ...prev,
          [gameKey]: wins,
        }));
      } catch (err) {
        console.error('incrementWins error:', err);
      }
    },
    [uid]
  );

  // Polling listener
  const listenWins = useCallback(
    (gameKey, cb) => {
      if (!uid) return () => {};

      const poll = setInterval(async () => {
        try {
          const data = await request(API_ENDPOINT, GET_RECREATION_STATS, {
            userId: uid,
            gameKey,
          });

          const wins = Number(data?.recreationStats?.wins ?? 0);

          setWinsCache((prev) => ({ ...prev, [gameKey]: wins }));
          if (typeof cb === 'function') cb(wins);
        } catch (err) {
          console.error('listenWins error:', err);
        }
      }, 10000);

      // Initial fetch
      getWins(gameKey).then((wins) => {
        if (typeof cb === 'function') cb(wins);
      });

      return () => clearInterval(poll);
    },
    [uid, getWins]
  );

  const value = useMemo(
    () => ({
      ready,
      uid,
      getWins,
      incrementWins,
      listenWins,
    }),
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
