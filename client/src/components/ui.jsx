// Shared Lesa-style UI atoms

export const T = {
  bg: '#F4EFE1',
  ink: '#14142B',
  navy: '#2F2E8B',
  pink: '#FD64B6',
  green: '#3FDA7C',
  yellow: '#FFDF49',
  muted: '#E8E4D4',
};

export function LGStar({ size = 24, color = '#FD64B6', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0, ...style }}>
      <path d="M12 0c.8 4.5 4.7 8.5 9 9-4.3.5-8.2 4.5-9 9-.8-4.5-4.7-8.5-9-9 4.3-.5 8.2-4.5 9-9z" fill={color} />
    </svg>
  );
}

export function LGDiamond({ size = 20, color = '#FFDF49', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0, ...style }}>
      <rect x="10" y="0" width="14" height="14" fill={color} transform="rotate(45 10 10) translate(-2 -4)" />
    </svg>
  );
}

export function LGCross({ size = 20, color = '#2F2E8B', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" style={{ flexShrink: 0, ...style }}>
      <path d="M8 2h4v6h6v4h-6v6H8v-6H2V8h6z" fill={color} />
    </svg>
  );
}

export function LGSpark({ size = 28, color = '#FD64B6', style = {} }) {
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" style={{ flexShrink: 0, ...style }}>
      <path d="M14 0c1 7 6 12 13 13-7 1-12 6-13 13-1-7-6-12-13-13 7-1 12-6 13-13z" fill={color} />
    </svg>
  );
}

export function FloatShape({ top, left, right, bottom, children, delay = 0, duration = 4 }) {
  return (
    <div style={{
      position: 'absolute', top, left, right, bottom,
      animation: `lg-bounce ${duration}s ease-in-out ${delay}s infinite`,
      pointerEvents: 'none',
    }}>
      {children}
    </div>
  );
}

export function Marquee({ items, bg = '#FD64B6', color = '#14142B', speed = 30, fontFamily = "'Space Grotesk', sans-serif" }) {
  const content = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 40, paddingRight: 40, flexShrink: 0 }}>
      {items.map((t, i) => (
        <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 18, fontWeight: 600, fontFamily }}>{t}</span>
          <span style={{ fontSize: 20 }}>✺</span>
        </span>
      ))}
    </div>
  );
  return (
    <div style={{
      background: bg, color,
      padding: '12px 0', overflow: 'hidden',
      borderTop: '2px solid #14142B', borderBottom: '2px solid #14142B',
    }}>
      <div style={{
        display: 'flex', width: 'max-content',
        animation: `lg-marquee ${speed}s linear infinite`,
      }}>
        {content}{content}{content}
      </div>
    </div>
  );
}

export function BigButton({
  children, bg = '#14142B', color = '#F4EFE1', size = 'lg',
  style = {}, arrow = false, onClick, disabled = false, type = 'button',
}) {
  const sizes = {
    lg: { pad: '16px 28px', fs: 17, br: 999 },
    md: { pad: '11px 22px', fs: 15, br: 999 },
    sm: { pad: '7px 16px', fs: 13, br: 999 },
  };
  const s = sizes[size] || sizes.lg;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        background: disabled ? '#ccc' : bg,
        color: disabled ? '#888' : color,
        padding: s.pad, fontSize: s.fs,
        borderRadius: s.br, border: '2px solid #14142B',
        fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer',
        display: 'inline-flex', alignItems: 'center', gap: 8,
        boxShadow: disabled ? 'none' : '4px 4px 0 #14142B',
        transition: 'transform 0.15s, box-shadow 0.15s',
        fontFamily: "'Inter', sans-serif",
        ...style,
      }}
      onMouseEnter={e => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translate(-2px,-2px)';
          e.currentTarget.style.boxShadow = '6px 6px 0 #14142B';
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = disabled ? 'none' : '4px 4px 0 #14142B';
      }}
    >
      {children}
      {arrow && <span style={{ fontSize: s.fs + 2 }}>↗</span>}
    </button>
  );
}

export function Pill({ children, bg = 'transparent', border = '#14142B', color = '#14142B', style = {} }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 13px', borderRadius: 999,
      border: `1.5px solid ${border}`,
      background: bg, color,
      fontSize: 12, fontWeight: 600,
      fontFamily: "'Inter', sans-serif",
      ...style,
    }}>
      {children}
    </span>
  );
}
