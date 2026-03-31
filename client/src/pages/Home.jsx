import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Mascot from '../components/Mascot';
import Leaderboard from '../components/Leaderboard';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/api';

export default function Home() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({ totalPlayers: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);

  const handleLeaderboardUpdate = useCallback((data) => {
    if (Array.isArray(data)) setLeaderboard(data.slice(0, 5));
  }, []);

  const { isConnected } = useSocket('leaderboard:update', handleLeaderboardUpdate);

  useEffect(() => {
    const load = async () => {
      try {
        const [lb, statsRes] = await Promise.all([
          api.get('/leaderboard'),
          api.get('/leaderboard/stats'),
        ]);
        setLeaderboard(lb.data.leaderboard?.slice(0, 5) || []);
        setStats({
          totalPlayers: statsRes.data?.totalPlayers ?? 0,
          avgScore: statsRes.data?.avgScore ?? 0,
        });
      } catch {}
      finally { setLoading(false); }
    };
    load();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', overflowX: 'hidden' }}>
      {/* Animated gradient orbs */}
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{
          position: 'absolute', width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(3,126,243,0.15) 0%, transparent 70%)',
          top: '-200px', left: '-150px', animation: 'orb-move-1 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(13,177,75,0.12) 0%, transparent 70%)',
          top: '10%', right: '-100px', animation: 'orb-move-2 18s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', width: 400, height: 400, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,200,69,0.08) 0%, transparent 70%)',
          bottom: '20%', left: '30%', animation: 'orb-move-3 12s ease-in-out infinite',
        }} />
      </div>

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Hero Section */}
        <section style={{
          minHeight: '90vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '80px 24px 40px', textAlign: 'center',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(3,126,243,0.15)', border: '1px solid rgba(3,126,243,0.3)',
              borderRadius: 50, padding: '8px 18px', marginBottom: 24,
            }}>
              <span style={{ fontSize: 16 }}>🌍</span>
              <span style={{ color: '#037EF3', fontWeight: 800, fontSize: 13 }}>
                AIESEC Malaysia · Global Leadership Quiz
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontSize: 'clamp(36px, 7vw, 72px)',
              fontWeight: 900,
              lineHeight: 1.1,
              marginBottom: 20,
              background: 'linear-gradient(135deg, #ffffff 30%, #037EF3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Test Your<br />Global Mindset 🚀
            </h1>

            <p style={{
              fontSize: 'clamp(16px, 2.5vw, 20px)',
              color: 'rgba(255,255,255,0.65)',
              maxWidth: 540, margin: '0 auto 40px',
              lineHeight: 1.6, fontWeight: 600,
            }}>
              Discover AIESEC opportunities, compete on the leaderboard,
              and unlock your potential for global leadership.
            </p>

            {/* Mascot */}
            <div style={{ marginBottom: 40 }}>
              <Mascot
                pose="waving"
                size={140}
                speechBubble="Ready to test your global mindset? 🌍"
              />
            </div>

            {/* CTA Button */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 12px 40px rgba(3,126,243,0.5)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/register')}
              style={{
                background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
                color: 'white', border: 'none', borderRadius: 50,
                padding: '18px 48px', fontFamily: 'Nunito, sans-serif',
                fontWeight: 900, fontSize: 20, cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(3,126,243,0.35)',
                animation: 'pulse 2.5s ease-in-out infinite',
              }}
            >
              Start the Quiz 🚀
            </motion.button>

            {/* Stats ticker */}
            <div style={{
              display: 'flex', gap: 32, justifyContent: 'center',
              marginTop: 48, flexWrap: 'wrap',
            }}>
              {[
                { icon: '👥', value: (stats?.totalPlayers ?? 0).toLocaleString(), label: 'Players' },
                { icon: '⭐', value: (stats?.avgScore ?? 0).toLocaleString(), label: 'Avg Score' },
                { icon: '🏫', value: '50+', label: 'Universities' },
              ].map(({ icon, value, label }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  style={{ textAlign: 'center' }}
                >
                  <div style={{ fontSize: 28 }}>{icon}</div>
                  <div style={{ color: 'white', fontWeight: 900, fontSize: 28, lineHeight: 1 }}>{value}</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginTop: 2 }}>{label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </section>

        {/* Live Leaderboard Preview */}
        <section style={{ padding: '0 24px 80px', maxWidth: 600, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="glass-card"
            style={{ padding: '28px 24px' }}
          >
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <h2 style={{ fontWeight: 900, fontSize: 20 }}>🏆 Top Players</h2>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {isConnected && (
                  <span className="live-badge">
                    <span className="live-dot" />
                    Live
                  </span>
                )}
                <button
                  onClick={() => navigate('/leaderboard')}
                  style={{
                    background: 'none', border: '1px solid rgba(255,255,255,0.2)',
                    color: 'rgba(255,255,255,0.7)', borderRadius: 8,
                    padding: '4px 12px', fontFamily: 'Nunito, sans-serif',
                    fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  }}
                >
                  View All →
                </button>
              </div>
            </div>
            <Leaderboard entries={leaderboard} compact loading={loading} />
          </motion.div>
        </section>

        {/* How it works */}
        <section style={{ padding: '0 24px 80px', maxWidth: 900, margin: '0 auto' }}>
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            style={{ textAlign: 'center', fontWeight: 900, fontSize: 28, marginBottom: 32 }}
          >
            How It Works
          </motion.h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20 }}>
            {[
              { step: '01', icon: '📝', title: 'Register', desc: 'Enter your name, email and phone to get started.' },
              { step: '02', icon: '🎬', title: 'Watch Video', desc: 'Watch a short AIESEC introduction video.' },
              { step: '03', icon: '🧠', title: 'Take Quiz', desc: 'Answer 8 timed questions. Speed earns bonus points!' },
              { step: '04', icon: '🏆', title: 'Win & Explore', desc: 'See your rank and discover AIESEC opportunities.' },
            ].map(({ step, icon, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card"
                style={{ padding: '24px', textAlign: 'center' }}
              >
                <div style={{
                  width: 56, height: 56, borderRadius: 16,
                  background: 'linear-gradient(135deg, rgba(3,126,243,0.3), rgba(13,177,75,0.3))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 28, margin: '0 auto 12px',
                }}>{icon}</div>
                <div style={{ color: '#037EF3', fontWeight: 900, fontSize: 12, marginBottom: 6 }}>STEP {step}</div>
                <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 8 }}>{title}</div>
                <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 1.5 }}>{desc}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '24px',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.3)',
          fontSize: 13, fontWeight: 600,
        }}>
          © 2024 AIESEC in Malaysia. Activating Leadership. Impacting Communities.
        </footer>
      </div>
    </div>
  );
}
