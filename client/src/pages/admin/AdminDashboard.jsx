import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { T, BigButton } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";

function StatCard({ icon, value, label, bg, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      style={{
        background: bg || '#fff', border: `2px solid ${T.ink}`,
        borderRadius: 16, padding: '20px 22px',
        boxShadow: `4px 4px 0 ${T.ink}`,
        display: 'flex', alignItems: 'center', gap: 14,
      }}
    >
      <div style={{ fontSize: 32 }}>{icon}</div>
      <div>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 28, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</div>
        <div style={{ fontSize: 12, opacity: 0.55, fontWeight: 600, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
      </div>
    </motion.div>
  );
}

function QuickLink({ icon, label, path, bg }) {
  const navigate = useNavigate();
  return (
    <motion.button
      whileHover={{ y: -2, boxShadow: `5px 5px 0 ${T.ink}` }}
      whileTap={{ scale: 0.97 }}
      onClick={() => navigate(path)}
      style={{
        background: bg || T.muted, border: `2px solid ${T.ink}`, borderRadius: 14,
        padding: '16px 18px', fontFamily: DISP, fontWeight: 700, fontSize: 14,
        color: T.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: `3px 3px 0 ${T.ink}`, transition: 'box-shadow 0.15s, transform 0.15s',
        textAlign: 'left',
      }}
    >
      <span style={{ fontSize: 22 }}>{icon}</span>
      {label}
    </motion.button>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminInfo, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 13, opacity: 0.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
            {isSuperAdmin ? 'Super Admin' : adminInfo?.lcName || 'LC Admin'} Dashboard
          </div>
          <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 'clamp(26px, 4vw, 38px)', letterSpacing: '-0.02em', marginBottom: 0 }}>
            Welcome back, {adminInfo?.name?.split(' ')[0]}!
          </h1>
        </motion.div>

        {/* Stat cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 90, borderRadius: 16 }} />)}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
            <StatCard icon="👥" value={(stats.totalPlayers || 0).toLocaleString()} label="Total Players" bg={T.yellow} delay={0} />
            <StatCard icon="⭐" value={(stats.avgScore || 0).toLocaleString()} label="Avg Score" delay={0.05} />
            <StatCard icon="🌍" value={`${stats.volunteerPercent || 0}%`} label="Volunteer Interest" bg={T.green + '44'} delay={0.1} />
            <StatCard icon="🏫" value={stats.universityCount || 0} label="Universities" delay={0.15} />
            <StatCard icon="🏕" value={stats.campaignCount || 0} label="Campaigns" bg={T.pink + '44'} delay={0.2} />
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 10, marginBottom: 32 }}>
          <QuickLink icon="🏕" label="Campaigns" path="/admin/campaigns" bg={T.pink + '33'} />
          <QuickLink icon="📋" label="All Attempts" path="/admin/attempts" bg={T.yellow + '55'} />
          <QuickLink icon="❓" label="Questions" path="/admin/questions" />
          <QuickLink icon="🎬" label="Video" path="/admin/video" />
          {isSuperAdmin && <QuickLink icon="👤" label="LC Admins" path="/admin/admins" bg={T.navy + '22'} />}
        </div>

        {/* Recent attempts */}
        {stats?.recentAttempts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            style={{ background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 18, overflow: 'hidden', boxShadow: `4px 4px 0 ${T.ink}` }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', borderBottom: `2px solid ${T.muted}` }}>
              <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17 }}>Recent Attempts</div>
              <button
                onClick={() => navigate('/admin/attempts')}
                style={{ background: T.muted, border: `1.5px solid ${T.ink}`, color: T.ink, borderRadius: 8, padding: '5px 14px', fontFamily: DISP, fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
              >
                View all →
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Campaign', 'Score', 'Correct', 'Volunteer', 'Date'].map(h => (
                      <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.5, background: T.muted, borderBottom: `1px solid ${T.ink + '22'}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map((a, i) => (
                    <tr key={a._id || i} style={{ borderBottom: `1px solid ${T.muted}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600 }}>{a.name}</td>
                      <td style={{ padding: '10px 14px', opacity: 0.55, fontSize: 13 }}>{a.email}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13, opacity: 0.65 }}>{a.campaign?.title || '—'}</td>
                      <td style={{ padding: '10px 14px', fontFamily: DISP, fontWeight: 700, color: T.navy }}>{a.score}</td>
                      <td style={{ padding: '10px 14px', fontSize: 13 }}>{a.correctAnswers}/{a.totalQuestions}</td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: a.volunteerInterest ? T.green + '22' : T.muted, color: a.volunteerInterest ? T.green : T.ink }}>
                          {a.volunteerInterest ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', fontSize: 12, opacity: 0.45 }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
