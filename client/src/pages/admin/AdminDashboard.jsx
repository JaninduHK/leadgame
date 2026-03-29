import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { formatTime } from '../../utils/scoring';

function StatCard({ icon, value, label, color, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-card"
      style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: 16 }}
    >
      <div style={{
        width: 56, height: 56, borderRadius: 16,
        background: `${color}22`,
        border: `1px solid ${color}44`,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
        flexShrink: 0,
      }}>{icon}</div>
      <div>
        <div style={{ fontWeight: 900, fontSize: 28, color: 'white', lineHeight: 1 }}>{value}</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 700, marginTop: 4 }}>{label}</div>
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { adminInfo } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontWeight: 900, fontSize: 28, marginBottom: 4 }}>
            📊 Admin Dashboard
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 15 }}>
            Welcome back, {adminInfo?.name}! Here's your platform overview.
          </p>
        </motion.div>

        {/* Stat cards */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 20 }} />)}
          </div>
        ) : stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
            <StatCard icon="👥" value={stats.totalPlayers.toLocaleString()} label="Total Players" color="#037EF3" delay={0} />
            <StatCard icon="⭐" value={stats.avgScore.toLocaleString()} label="Average Score" color="#FFC845" delay={0.1} />
            <StatCard icon="🌍" value={`${stats.volunteerPercent}%`} label="Volunteer Interest" color="#0DB14B" delay={0.2} />
            <StatCard icon="🏫" value={stats.universityCount} label="Universities" color="#F85A40" delay={0.3} />
          </div>
        )}

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 32 }}>
          {[
            { icon: '📋', label: 'View All Attempts', path: '/admin/attempts', color: '#037EF3' },
            { icon: '❓', label: 'Manage Questions', path: '/admin/questions', color: '#0DB14B' },
            { icon: '🎬', label: 'Update Video', path: '/admin/video', color: '#FFC845' },
          ].map(({ icon, label, path, color }) => (
            <motion.button
              key={path}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(path)}
              style={{
                background: `${color}15`, border: `1px solid ${color}30`,
                borderRadius: 14, padding: '18px',
                fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15,
                color: 'white', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 10,
              }}
            >
              <span style={{ fontSize: 22 }}>{icon}</span>
              {label}
            </motion.button>
          ))}
        </div>

        {/* Recent attempts table */}
        {stats?.recentAttempts?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-card"
            style={{ padding: '24px', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h2 style={{ fontWeight: 900, fontSize: 18 }}>Recent Attempts</h2>
              <button
                onClick={() => navigate('/admin/attempts')}
                style={{
                  background: 'none', border: '1px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.6)', borderRadius: 8,
                  padding: '6px 14px', fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                }}
              >
                View All →
              </button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px' }}>
                <thead>
                  <tr>
                    {['Name', 'Email', 'Score', 'Time', 'Correct', 'Volunteer', 'Date'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '8px 12px',
                        color: 'rgba(255,255,255,0.4)', fontWeight: 800, fontSize: 12,
                        textTransform: 'uppercase', letterSpacing: '0.5px',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stats.recentAttempts.map((attempt, i) => (
                    <tr key={attempt._id || i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 14 }}>{attempt.name}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{attempt.email}</td>
                      <td style={{ padding: '10px 12px', color: '#FFC845', fontWeight: 800 }}>{attempt.score}</td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{formatTime(attempt.timeTaken)}</td>
                      <td style={{ padding: '10px 12px', fontSize: 13 }}>{attempt.correctAnswers}/{attempt.totalQuestions}</td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          background: attempt.volunteerInterest ? 'rgba(13,177,75,0.2)' : 'rgba(255,255,255,0.05)',
                          color: attempt.volunteerInterest ? '#0DB14B' : 'rgba(255,255,255,0.3)',
                          borderRadius: 6, padding: '2px 8px', fontSize: 12, fontWeight: 700,
                        }}>
                          {attempt.volunteerInterest ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        {new Date(attempt.createdAt).toLocaleDateString()}
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
