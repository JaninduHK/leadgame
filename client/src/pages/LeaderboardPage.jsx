import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Leaderboard from '../components/Leaderboard';
import { useSocket } from '../hooks/useSocket';
import { useQuiz } from '../context/QuizContext';
import api from '../utils/api';
import { formatTime } from '../utils/scoring';

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const { sessionId } = useQuiz();
  const [allEntries, setAllEntries] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState({ total: 0 });

  const handleLeaderboardUpdate = useCallback((data) => {
    if (Array.isArray(data)) {
      setAllEntries(data);
      setFiltered(search ? data.filter(e => e.name.toLowerCase().includes(search.toLowerCase())) : data);
    }
  }, [search]);

  useSocket('leaderboard:update', handleLeaderboardUpdate);

  useEffect(() => {
    api.get('/leaderboard')
      .then(({ data }) => {
        setAllEntries(data.leaderboard || []);
        setFiltered(data.leaderboard || []);
        setStats({ total: data.total || 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(allEntries);
    } else {
      setFiltered(allEntries.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase())
      ));
    }
  }, [search, allEntries]);

  const top3 = allEntries.slice(0, 3);
  const rest = filtered.slice(3);

  const podiumOrder = top3.length >= 3
    ? [top3[1], top3[0], top3[2]]
    : top3;

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px 24px 100px' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,69,0.08) 0%, transparent 70%)', top: '-100px', left: '20%' }} />
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontWeight: 900, fontSize: 'clamp(28px, 5vw, 42px)', marginBottom: 8 }}
          >
            🏆 Leaderboard
          </motion.h1>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
              {stats.total} total players
            </span>
            <span className="live-badge">
              <span className="live-dot" />
              Auto-refresh
            </span>
          </div>
        </div>

        {/* Olympic Podium — top 3 */}
        {!loading && top3.length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'flex-end',
              gap: 8, marginBottom: 40, paddingTop: 20,
            }}
          >
            {podiumOrder.map((entry, displayIdx) => {
              const podiumRank = displayIdx === 0 ? 2 : displayIdx === 1 ? 1 : 3;
              const heights = { 1: 120, 2: 90, 3: 70 };
              const emojis = { 1: '🥇', 2: '🥈', 3: '🥉' };
              const colors = {
                1: 'linear-gradient(135deg, #FFC845, #f5a800)',
                2: 'linear-gradient(135deg, #adb5bd, #6c757d)',
                3: 'linear-gradient(135deg, #cd7f32, #a0522d)',
              };
              const isMe = entry?.sessionId === sessionId;

              return (
                <div key={entry?._id || displayIdx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  {/* Name & score above podium */}
                  <div style={{ textAlign: 'center', marginBottom: 4 }}>
                    <div style={{ fontSize: 28 }}>{emojis[podiumRank]}</div>
                    <div style={{
                      fontWeight: 800, fontSize: 13,
                      color: isMe ? '#037EF3' : 'white',
                      maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {entry?.name || '–'}
                      {isMe && <span style={{ color: '#037EF3' }}> (You)</span>}
                    </div>
                    <div style={{ color: '#FFC845', fontWeight: 900, fontSize: 16 }}>
                      {entry?.score?.toLocaleString() || '–'}
                    </div>
                  </div>
                  {/* Podium block */}
                  <div style={{
                    width: podiumRank === 1 ? 110 : 90,
                    height: heights[podiumRank],
                    background: colors[podiumRank],
                    borderRadius: '12px 12px 0 0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 900, color: 'white',
                  }}>
                    {podiumRank}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Search */}
        <div style={{ marginBottom: 20 }}>
          <input
            placeholder="🔍 Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '12px 16px',
              color: 'white', fontFamily: 'Nunito, sans-serif',
              fontWeight: 700, fontSize: 15, outline: 'none',
            }}
          />
        </div>

        {/* Full leaderboard */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: '24px' }}
        >
          {loading ? (
            <div>{[...Array(8)].map((_, i) => <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12, marginBottom: 8 }} />)}</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              {search ? 'No players found matching your search.' : 'No scores yet! Be the first!'}
            </div>
          ) : (
            <Leaderboard
              entries={filtered}
              currentUserSessionId={sessionId}
              loading={false}
            />
          )}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{ textAlign: 'center', marginTop: 32 }}
        >
          <button
            onClick={() => navigate('/register')}
            style={{
              background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
              color: 'white', border: 'none', borderRadius: 50,
              padding: '14px 32px', fontFamily: 'Nunito, sans-serif',
              fontWeight: 800, fontSize: 16, cursor: 'pointer',
            }}
          >
            Play & Claim Your Spot 🚀
          </button>
        </motion.div>
      </div>
    </div>
  );
}
