import Confetti from 'react-confetti';
import { useState, useEffect } from 'react';

export default function ConfettiEffect({ duration = 5000, pieces = 250 }) {
  const [show, setShow] = useState(true);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  if (!show) return null;

  return (
    <Confetti
      width={windowSize.width}
      height={windowSize.height}
      numberOfPieces={pieces}
      colors={['#037EF3', '#0DB14B', '#F85A40', '#FFC845', '#ffffff']}
      gravity={0.25}
      recycle={false}
      style={{ position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none' }}
    />
  );
}
