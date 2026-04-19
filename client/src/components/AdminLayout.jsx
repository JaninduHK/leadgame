import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { T } from './ui';

const DISP = "'Space Grotesk', sans-serif";
const W = 240;

const NAV = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: '◈' },
  { path: '/admin/campaigns', label: 'Campaigns', icon: '⬡' },
  { path: '/admin/attempts', label: 'Attempts', icon: '◉' },
];
const SUPER_NAV = [
  { path: '/admin/admins', label: 'LC Admins', icon: '◎' },
];

function NavItem({ path, label, icon, active }) {
  return (
    <Link
      to={path}
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 16px', borderRadius: 10, textDecoration: 'none',
        background: active ? T.ink : 'transparent',
        color: active ? T.bg : T.ink,
        fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
        transition: 'background 0.12s',
        border: active ? `2px solid ${T.ink}` : '2px solid transparent',
      }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.muted; }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
    >
      <span style={{ fontFamily: DISP, fontSize: 18, lineHeight: 1, opacity: active ? 1 : 0.5 }}>{icon}</span>
      {label}
    </Link>
  );
}

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { adminInfo, isSuperAdmin, logout } = useAuth();

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: T.bg }}>
      {/* ── SIDEBAR ── */}
      <aside style={{
        position: 'fixed', top: 0, left: 0, bottom: 0, width: W,
        background: T.bg, borderRight: `2px solid ${T.ink}`,
        display: 'flex', flexDirection: 'column',
        zIndex: 200, overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px 20px', borderBottom: `2px solid ${T.ink}` }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, color: T.ink, letterSpacing: '-0.02em', lineHeight: 1.1 }}>LEAD GAME</div>
            <div style={{ fontSize: 10, color: T.ink, opacity: 0.4, fontFamily: "'Inter', sans-serif" }}>Admin Panel</div>
          </Link>
        </div>

        {/* Admin info */}
        <div style={{ padding: '16px 20px', borderBottom: `2px solid ${T.ink}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, flexShrink: 0,
              background: isSuperAdmin ? T.navy : T.green,
              border: `2px solid ${T.ink}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: DISP, fontWeight: 700, fontSize: 15, color: T.bg,
            }}>
              {(adminInfo?.name || 'A')[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {adminInfo?.name}
              </div>
              <div style={{ fontSize: 11, opacity: 0.5, fontFamily: "'Inter', sans-serif" }}>
                {isSuperAdmin ? 'Super Admin' : adminInfo?.lcName || 'LC Admin'}
              </div>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '14px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.35, padding: '0 6px', marginBottom: 6, fontFamily: "'Inter', sans-serif" }}>
            Menu
          </div>
          {NAV.map(({ path, label, icon }) => (
            <NavItem key={path} path={path} label={label} icon={icon} active={location.pathname.startsWith(path)} />
          ))}
          {isSuperAdmin && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', opacity: 0.35, padding: '10px 6px 4px', fontFamily: "'Inter', sans-serif" }}>
                Super Admin
              </div>
              {SUPER_NAV.map(({ path, label, icon }) => (
                <NavItem key={path} path={path} label={label} icon={icon} active={location.pathname.startsWith(path)} />
              ))}
            </>
          )}
        </nav>

        {/* Logout */}
        <div style={{ padding: '14px 12px', borderTop: `2px solid ${T.ink}` }}>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 16px', borderRadius: 10, border: `2px solid #e53`,
              background: 'transparent', color: '#e53',
              fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 14,
              cursor: 'pointer', transition: 'background 0.12s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#e5330011'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{ fontSize: 16 }}>↩</span>
            Logout
          </button>
        </div>
      </aside>

      {/* ── CONTENT ── */}
      <main style={{ marginLeft: W, flex: 1, minWidth: 0 }}>
        {children}
      </main>
    </div>
  );
}
