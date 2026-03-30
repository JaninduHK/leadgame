import { useEffect, useRef } from 'react';
import api from '../utils/api';

// Polls the leaderboard endpoint at a set interval.
// Mirrors the old useSocket(event, callback) signature so callers need minimal changes.
export function useSocket(event, callback) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    if (event !== 'leaderboard:update' || !callbackRef.current) return;

    const id = setInterval(async () => {
      try {
        const { data } = await api.get('/leaderboard');
        if (data.leaderboard) callbackRef.current(data.leaderboard);
      } catch {}
    }, 15000); // poll every 15 seconds

    return () => clearInterval(id);
  }, [event]);

  // isConnected is always true — polling is always active
  return { socket: null, isConnected: true };
}
