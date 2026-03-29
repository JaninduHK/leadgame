import { useMemo } from 'react';

const RADIUS = 36;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function Timer({ timeLeft, totalTime, size = 90 }) {
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  const color = useMemo(() => {
    if (timeLeft <= 5) return '#F85A40';
    if (timeLeft <= 10) return '#FFC845';
    return '#037EF3';
  }, [timeLeft]);

  const isWarning = timeLeft <= 10;
  const isCritical = timeLeft <= 5;

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      animation: isCritical ? 'pulse 0.5s ease-in-out infinite' : undefined,
    }}>
      <svg width={size} height={size} viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
        {/* Background ring */}
        <circle
          cx="45" cy="45" r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        {/* Progress ring */}
        <circle
          cx="45" cy="45" r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke-dashoffset 0.8s linear, stroke 0.3s ease' }}
        />
        {/* Glow effect when warning */}
        {isWarning && (
          <circle
            cx="45" cy="45" r={RADIUS}
            fill="none"
            stroke={color}
            strokeWidth="12"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={dashOffset}
            opacity="0.2"
          />
        )}
      </svg>
      {/* Timer number */}
      <div style={{
        position: 'absolute',
        fontSize: size * 0.28,
        fontWeight: 900,
        color: color,
        fontFamily: 'Nunito, sans-serif',
        lineHeight: 1,
        animation: isCritical ? 'timer-warning 0.5s ease-in-out infinite' : undefined,
      }}>
        {timeLeft}
      </div>
    </div>
  );
}
