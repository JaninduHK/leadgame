import { useState, useEffect, useRef, useCallback } from 'react';

export function useTimer(initialSeconds, onComplete) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setIsRunning(false);
    clearInterval(intervalRef.current);
  }, [initialSeconds]);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setIsRunning(false);
          onCompleteRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback((seconds) => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setTimeLeft(seconds ?? initialSeconds);
  }, [initialSeconds]);

  const elapsedSeconds = initialSeconds - timeLeft;

  return { timeLeft, isRunning, start, pause, reset, elapsedSeconds };
}
