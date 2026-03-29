import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

export function useSocket(event, callback) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    socketRef.current = io('/', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current.on('connect', () => setIsConnected(true));
    socketRef.current.on('disconnect', () => setIsConnected(false));

    if (event && callback) {
      socketRef.current.on(event, callback);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Update callback reference without reconnecting
  useEffect(() => {
    if (!socketRef.current || !event || !callback) return;
    socketRef.current.off(event);
    socketRef.current.on(event, callback);
    return () => {
      if (socketRef.current) socketRef.current.off(event);
    };
  }, [event, callback]);

  return { socket: socketRef.current, isConnected };
}
