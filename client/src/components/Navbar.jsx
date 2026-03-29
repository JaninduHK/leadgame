import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useAuth();

  const isAdmin = location.pathname.startsWith('/admin');
  const isQuizFlow = ['/video', '/quiz', '/volunteer', '/results'].includes(location.pathname);

  // Hide navbar in quiz flow pages
  if (isQuizFlow) return null;

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="desktop-only" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: 'rgba(10,22,40,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px',
        height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
            borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, fontSize: 14, color: 'white',
          }}>A</div>
          <div>
            <div style={{ color: 'white', fontWeight: 900, fontSize: 16, lineHeight: 1 }}>AIESEC Malaysia</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>Quiz Platform</div>
          </div>
        </Link>

        {/* Nav links */}
        {!isAdmin ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Link to="/leaderboard" style={{
              color: 'rgba(255,255,255,0.8)', textDecoration: 'none',
              fontWeight: 700, fontSize: 15, padding: '8px 16px',
              borderRadius: 10, transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
              onMouseLeave={e => e.target.style.background = 'transparent'}
            >
              🏆 Leaderboard
            </Link>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
                color: 'white', border: 'none', borderRadius: 50,
                padding: '10px 24px', fontFamily: 'Nunito, sans-serif',
                fontWeight: 800, fontSize: 15, cursor: 'pointer',
              }}
            >
              Play Now 🚀
            </motion.button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {[
              { path: '/admin/dashboard', label: 'Dashboard' },
              { path: '/admin/attempts', label: 'Attempts' },
              { path: '/admin/questions', label: 'Questions' },
              { path: '/admin/video', label: 'Video' },
            ].map(({ path, label }) => (
              <Link
                key={path}
                to={path}
                style={{
                  color: location.pathname === path ? '#037EF3' : 'rgba(255,255,255,0.7)',
                  textDecoration: 'none', fontWeight: 700, fontSize: 14,
                  padding: '6px 12px', borderRadius: 8,
                  background: location.pathname === path ? 'rgba(3,126,243,0.15)' : 'transparent',
                  transition: 'all 0.2s',
                }}
              >
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              style={{
                background: 'rgba(248,90,64,0.2)', color: '#F85A40',
                border: '1px solid rgba(248,90,64,0.4)',
                borderRadius: 8, padding: '6px 16px',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                fontSize: 13, cursor: 'pointer',
              }}
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* Mobile Bottom Nav (non-admin pages) */}
      {!isAdmin && (
        <nav className="mobile-only" style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
          background: 'rgba(10,22,40,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255,255,255,0.1)',
          display: 'flex', justifyContent: 'space-around', alignItems: 'center',
          padding: '8px 0 20px',
          height: 72,
        }}>
          <Link to="/" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: location.pathname === '/' ? '#037EF3' : 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ fontSize: 20 }}>🏠</span>
            Home
          </Link>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
              color: 'white', border: 'none', borderRadius: 50,
              width: 56, height: 56, fontSize: 24, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginTop: -20, boxShadow: '0 4px 20px rgba(3,126,243,0.5)',
            }}
          >
            🚀
          </motion.button>
          <Link to="/leaderboard" style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: location.pathname === '/leaderboard' ? '#FFC845' : 'rgba(255,255,255,0.5)',
            textDecoration: 'none', fontSize: 11, fontWeight: 700,
          }}>
            <span style={{ fontSize: 20 }}>🏆</span>
            Scores
          </Link>
        </nav>
      )}

      {/* Spacer for fixed navbar */}
      {!isQuizFlow && <div style={{ height: 64 }} className="desktop-only" />}
    </>
  );
}
