import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T } from './ui';
import { useState } from 'react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isSuperAdmin } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAdmin = location.pathname.startsWith('/admin');
  const isQuizFlow = ['/video', '/quiz', '/volunteer', '/results'].includes(location.pathname);

  if (isQuizFlow) return null;

  return (
    <>
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: T.bg, borderBottom: `2px solid ${T.ink}`,
        padding: '0 40px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: "'Inter', sans-serif",
      }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: T.navy, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14, color: T.bg,
          }}>L</div>
          <span style={{
            fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700,
            fontSize: 18, color: T.ink, letterSpacing: '-0.03em',
          }}>LEAD GAME</span>
          <span style={{ fontSize: 11, color: T.ink, opacity: 0.45, marginLeft: 4 }}>by AIESEC Malaysia</span>
        </Link>

        {!isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
              onClick={() => navigate('/register')}
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
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            {[
              { path: '/admin/dashboard', label: 'Dashboard' },
              { path: '/admin/campaigns', label: 'Campaigns' },
              { path: '/admin/attempts', label: 'Attempts' },
              { path: '/admin/questions', label: 'Questions' },
              { path: '/admin/video', label: 'Video' },
              ...(isSuperAdmin ? [{ path: '/admin/admins', label: 'Admins' }] : []),
            ].map(({ path, label }) => (
              <Link key={path} to={path} style={{
                color: location.pathname.startsWith(path) ? T.navy : T.ink,
                textDecoration: 'none', fontWeight: 600, fontSize: 13,
                padding: '5px 10px', borderRadius: 8,
                background: location.pathname.startsWith(path) ? 'rgba(47,46,139,0.12)' : 'transparent',
              }}>{label}</Link>
            ))}
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              style={{
                background: 'transparent', color: '#c0392b',
                border: '2px solid #c0392b', borderRadius: 8, padding: '5px 14px',
                fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: 'pointer',
              }}
            >Logout</button>
          </div>
        )}
      </nav>
      <div style={{ height: 64 }} />
    </>
  );
}
