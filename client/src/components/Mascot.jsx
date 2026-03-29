import { useEffect, useRef } from 'react';

const poses = {
  waving: {
    bodyRotate: '0deg',
    leftArmPath: 'M 38 78 Q 22 88 18 100',
    rightArmPath: 'M 82 75 Q 94 60 98 45',
    rightHandCx: 98,
    rightHandCy: 42,
    expressionPath: 'M 48 50 Q 60 60 72 50',
    eyeLeft: { cx: 48, cy: 38, r: 7 },
    eyeRight: { cx: 72, cy: 38, r: 7 },
    eyebrowLeft: 'M 42 30 Q 48 27 54 30',
    eyebrowRight: 'M 66 30 Q 72 27 78 30',
    animClass: 'anim-wave',
  },
  thinking: {
    bodyRotate: '0deg',
    leftArmPath: 'M 38 78 Q 22 90 20 105',
    rightArmPath: 'M 82 75 Q 90 72 88 62',
    rightHandCx: 88,
    rightHandCy: 58,
    expressionPath: 'M 50 50 Q 58 55 70 50',
    eyeLeft: { cx: 48, cy: 38, r: 7 },
    eyeRight: { cx: 72, cy: 38, r: 7 },
    eyebrowLeft: 'M 42 30 Q 48 26 54 30',
    eyebrowRight: 'M 66 27 Q 72 24 78 28',
    animClass: 'anim-float',
  },
  celebrating: {
    bodyRotate: '0deg',
    leftArmPath: 'M 38 78 Q 22 60 20 42',
    rightArmPath: 'M 82 78 Q 98 60 100 42',
    rightHandCx: 100,
    rightHandCy: 39,
    expressionPath: 'M 46 50 Q 60 65 74 50',
    eyeLeft: { cx: 48, cy: 38, r: 7 },
    eyeRight: { cx: 72, cy: 38, r: 7 },
    eyebrowLeft: 'M 42 28 Q 48 24 54 28',
    eyebrowRight: 'M 66 28 Q 72 24 78 28',
    animClass: 'anim-celebrate',
  },
  reading: {
    bodyRotate: '0deg',
    leftArmPath: 'M 38 82 Q 26 95 22 108',
    rightArmPath: 'M 82 82 Q 94 95 98 108',
    rightHandCx: 98,
    rightHandCy: 105,
    expressionPath: 'M 50 50 Q 60 58 70 50',
    eyeLeft: { cx: 48, cy: 40, r: 6 },
    eyeRight: { cx: 72, cy: 40, r: 6 },
    eyebrowLeft: 'M 43 33 Q 48 30 53 33',
    eyebrowRight: 'M 67 33 Q 72 30 77 33',
    animClass: 'anim-float',
  },
  sad: {
    bodyRotate: '0deg',
    leftArmPath: 'M 38 82 Q 24 95 20 108',
    rightArmPath: 'M 82 82 Q 96 95 100 108',
    rightHandCx: 100,
    rightHandCy: 105,
    expressionPath: 'M 48 56 Q 60 48 72 56',
    eyeLeft: { cx: 48, cy: 40, r: 7 },
    eyeRight: { cx: 72, cy: 40, r: 7 },
    eyebrowLeft: 'M 42 34 Q 48 38 54 34',
    eyebrowRight: 'M 66 34 Q 72 38 78 34',
    animClass: 'anim-sad',
  },
};

export default function Mascot({ pose = 'waving', size = 120, speechBubble = '', style = {} }) {
  const config = poses[pose] || poses.waving;
  const scale = size / 120;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, ...style }}>
      {speechBubble && (
        <div style={{
          background: 'white',
          color: '#0A1628',
          borderRadius: '16px 16px 4px 16px',
          padding: '10px 14px',
          fontSize: `${Math.round(12 * scale)}px`,
          fontWeight: 700,
          maxWidth: `${size * 2}px`,
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
          position: 'relative',
          animation: 'fade-in-up 0.4s ease',
          lineHeight: 1.4,
        }}>
          {speechBubble}
        </div>
      )}

      <svg
        width={size}
        height={size * 1.4}
        viewBox="0 0 120 168"
        xmlns="http://www.w3.org/2000/svg"
        className={config.animClass}
        style={{ cursor: 'default', filter: 'drop-shadow(0 8px 16px rgba(3,126,243,0.3))' }}
      >
        {/* Shadow */}
        <ellipse cx="60" cy="162" rx="30" ry="5" fill="rgba(0,0,0,0.2)" />

        {/* Left leg */}
        <rect x="36" y="118" width="18" height="30" rx="8" fill="#1a2a4a" />
        {/* Left shoe */}
        <ellipse cx="45" cy="150" rx="13" ry="6" fill="#111827" />

        {/* Right leg */}
        <rect x="66" y="118" width="18" height="30" rx="8" fill="#1a2a4a" />
        {/* Right shoe */}
        <ellipse cx="75" cy="150" rx="13" ry="6" fill="#111827" />

        {/* Body — AIESEC Blue Hoodie */}
        <rect x="28" y="66" width="64" height="60" rx="14" fill="#037EF3" />

        {/* Hoodie pocket */}
        <rect x="44" y="105" width="32" height="16" rx="6" fill="rgba(255,255,255,0.15)" />

        {/* AIESEC text on hoodie */}
        <text x="60" y="90" textAnchor="middle" fill="white" fontSize="7" fontWeight="900" fontFamily="Nunito,sans-serif" letterSpacing="0.5">
          AIESEC
        </text>

        {/* Left arm */}
        <path
          d={config.leftArmPath}
          stroke="#037EF3"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Left hand */}
        <circle cx="18" cy="103" r="8" fill="#FDBCB4" />

        {/* Right arm */}
        <path
          d={config.rightArmPath}
          stroke="#037EF3"
          strokeWidth="14"
          strokeLinecap="round"
          fill="none"
        />
        {/* Right hand */}
        <circle cx={config.rightHandCx} cy={config.rightHandCy} r="8" fill="#FDBCB4" />

        {/* Reading pose: book in hands */}
        {pose === 'reading' && (
          <g>
            <rect x="26" y="106" width="48" height="30" rx="4" fill="#FFC845" />
            <rect x="26" y="106" width="24" height="30" rx="4 0 0 4" fill="#f5b800" />
            <line x1="50" y1="106" x2="50" y2="136" stroke="#0A1628" strokeWidth="1" />
            <line x1="30" y1="115" x2="46" y2="115" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="30" y1="121" x2="46" y2="121" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="54" y1="115" x2="70" y2="115" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
            <line x1="54" y1="121" x2="70" y2="121" stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" />
          </g>
        )}

        {/* Celebrating: confetti stars */}
        {pose === 'celebrating' && (
          <g>
            <text x="14" y="45" fontSize="10">⭐</text>
            <text x="95" y="42" fontSize="8">✨</text>
            <text x="8" y="68" fontSize="8">🎉</text>
            <text x="96" y="70" fontSize="10">🌟</text>
          </g>
        )}

        {/* Neck */}
        <rect x="52" y="60" width="16" height="12" rx="6" fill="#FDBCB4" />

        {/* Head */}
        <circle cx="60" cy="40" r="30" fill="#FDBCB4" />

        {/* Hair */}
        <path d="M 32 32 Q 38 10 60 12 Q 82 10 88 32 Q 82 18 60 20 Q 38 18 32 32Z" fill="#2C1810" />
        {/* Hair sides */}
        <ellipse cx="32" cy="40" rx="6" ry="10" fill="#2C1810" />
        <ellipse cx="88" cy="40" rx="6" ry="10" fill="#2C1810" />

        {/* Ears */}
        <ellipse cx="30" cy="42" rx="5" ry="7" fill="#FDBCB4" />
        <ellipse cx="90" cy="42" rx="5" ry="7" fill="#FDBCB4" />

        {/* White of eyes */}
        <circle cx={config.eyeLeft.cx} cy={config.eyeLeft.cy} r={config.eyeLeft.r + 2} fill="white" />
        <circle cx={config.eyeRight.cx} cy={config.eyeRight.cy} r={config.eyeRight.r + 2} fill="white" />

        {/* Iris */}
        <circle cx={config.eyeLeft.cx} cy={config.eyeLeft.cy} r={config.eyeLeft.r} fill="#037EF3" />
        <circle cx={config.eyeRight.cx} cy={config.eyeRight.cy} r={config.eyeRight.r} fill="#037EF3" />

        {/* Pupil */}
        <circle cx={config.eyeLeft.cx + 1} cy={config.eyeLeft.cy + 1} r={config.eyeLeft.r - 3} fill="#1A1A2E" />
        <circle cx={config.eyeRight.cx + 1} cy={config.eyeRight.cy + 1} r={config.eyeRight.r - 3} fill="#1A1A2E" />

        {/* Eye shine */}
        <circle cx={config.eyeLeft.cx - 1} cy={config.eyeLeft.cy - 2} r="2" fill="white" />
        <circle cx={config.eyeRight.cx - 1} cy={config.eyeRight.cy - 2} r="2" fill="white" />

        {/* Eyebrows */}
        <path d={config.eyebrowLeft} stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d={config.eyebrowRight} stroke="#2C1810" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Nose */}
        <circle cx="60" cy="47" r="2.5" fill="#e8a090" />

        {/* Mouth / expression */}
        <path
          d={config.expressionPath}
          stroke={pose === 'sad' ? '#c06050' : '#c06050'}
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
        />

        {/* Thinking: thought bubble */}
        {pose === 'thinking' && (
          <g>
            <circle cx="88" cy="56" r="3" fill="rgba(255,255,255,0.6)" />
            <circle cx="96" cy="48" r="4.5" fill="rgba(255,255,255,0.6)" />
            <circle cx="106" cy="38" r="7" fill="rgba(255,255,255,0.6)" />
            <text x="103" y="41" fontSize="6" textAnchor="middle">💡</text>
          </g>
        )}

        {/* Waving: motion lines */}
        {pose === 'waving' && (
          <g stroke="rgba(255,200,69,0.6)" strokeWidth="2" strokeLinecap="round">
            <line x1="104" y1="36" x2="112" y2="30" />
            <line x1="106" y1="44" x2="114" y2="42" />
            <line x1="102" y1="52" x2="110" y2="54" />
          </g>
        )}
      </svg>
    </div>
  );
}
