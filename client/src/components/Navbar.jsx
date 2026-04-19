import { Link, useLocation, useNavigate } from 'react-router-dom';
import { T } from './ui';
import { useState, useEffect, useRef } from 'react';

const DISP = "'Space Grotesk', sans-serif";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const overlayRef = useRef(null);

  const isAdmin = location.pathname.startsWith('/admin');
  const isQuizFlow = ['/video', '/quiz', '/volunteer', '/results'].includes(location.pathname);

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  if (isQuizFlow || isAdmin) return null;

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) setMenuOpen(false);
  };

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: T.bg, borderBottom: `2px solid ${T.ink}`,
        padding: '0 28px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: "'Inter', sans-serif",
      }}>
        {/* Logo — text only, no badge */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, color: T.ink, letterSpacing: '-0.03em' }}>
            LEAD GAME
          </span>
          <span style={{ fontSize: 11, color: T.ink, opacity: 0.4 }}>by AIESEC Malaysia</span>
        </Link>

        {/* Desktop nav */}
        <div className="nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Link to="/leaderboard" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '6px 14px', borderRadius: 999,
            border: `1.5px solid ${T.ink}`, color: T.ink,
            textDecoration: 'none', fontSize: 13, fontWeight: 500,
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.background = T.muted}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            🏆 Leaderboard
          </Link>
          <button
            onClick={() => navigate('/play')}
            style={{
              background: T.pink, color: T.ink, border: `2px solid ${T.ink}`,
              borderRadius: 999, padding: '8px 20px',
              fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: 'pointer', boxShadow: `3px 3px 0 ${T.ink}`,
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-1px,-1px)'; e.currentTarget.style.boxShadow = `4px 4px 0 ${T.ink}`; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = `3px 3px 0 ${T.ink}`; }}
          >
            Play now
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-mobile-btn"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          style={{
            display: 'none', background: 'none', border: `2px solid ${T.ink}`,
            borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
            flexDirection: 'column', gap: 4, alignItems: 'center', justifyContent: 'center',
          }}
        >
          <span style={{ display: 'block', width: 18, height: 2, background: T.ink, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: T.ink, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 18, height: 2, background: T.ink, borderRadius: 2 }} />
        </button>
      </nav>

      {/* Mobile overlay */}
      {menuOpen && (
        <div
          ref={overlayRef}
          onClick={handleOverlayClick}
          style={{
            position: 'fixed', inset: 0, zIndex: 2000,
            background: 'rgba(20,20,43,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <div style={{
            background: T.bg, border: `2px solid ${T.ink}`, borderRadius: 24,
            padding: '32px 28px', boxShadow: `6px 6px 0 ${T.ink}`,
            width: 'calc(100vw - 48px)', maxWidth: 320,
            display: 'flex', flexDirection: 'column', gap: 14,
            position: 'relative',
          }}>
            {/* Close X */}
            <button
              onClick={() => setMenuOpen(false)}
              style={{
                position: 'absolute', top: 14, right: 14,
                background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8,
                width: 32, height: 32, cursor: 'pointer',
                fontFamily: DISP, fontWeight: 700, fontSize: 16, color: T.ink,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >×</button>

            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em', marginBottom: 4 }}>
              Menu
            </div>

            <Link
              to="/leaderboard"
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', borderRadius: 14,
                border: `2px solid ${T.ink}`, textDecoration: 'none', color: T.ink,
                fontWeight: 600, fontSize: 15, background: T.muted,
                boxShadow: `3px 3px 0 ${T.ink}`,
              }}
            >
              <span style={{ fontSize: 20 }}>🏆</span>
              Leaderboard
            </Link>

            <button
              onClick={() => { setMenuOpen(false); navigate('/play'); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '14px 18px', borderRadius: 14,
                border: `2px solid ${T.ink}`, color: T.ink,
                fontWeight: 700, fontSize: 15, background: T.pink,
                boxShadow: `3px 3px 0 ${T.ink}`,
                cursor: 'pointer', fontFamily: "'Inter', sans-serif",
              }}
            >
              <span style={{ fontSize: 20 }}>▶</span>
              Play now
            </button>
          </div>
        </div>
      )}

      <div style={{ height: 64 }} />

      <style>{`
        @media (max-width: 600px) {
          .nav-desktop { display: none !important; }
          .nav-mobile-btn { display: flex !important; }
        }
      `}</style>
    </>
  );
}
