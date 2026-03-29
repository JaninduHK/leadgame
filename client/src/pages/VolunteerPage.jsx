import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Mascot from '../components/Mascot';
import { useQuiz } from '../context/QuizContext';

const flags = ['🇩🇪', '🇯🇵', '🇧🇷', '🇮🇳', '🇿🇦', '🇪🇸', '🇦🇺', '🇺🇸', '🇹🇷', '🇵🇹'];

export default function VolunteerPage() {
  const navigate = useNavigate();
  const { setVolunteerInterest } = useQuiz();

  const handleYes = () => {
    setVolunteerInterest(true);
    window.open('https://aiesec.org/malaysia/opportunities', '_blank');
    navigate('/results');
  };

  const handleMaybeLater = () => {
    setVolunteerInterest(false);
    navigate('/results');
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A1628',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,177,75,0.12) 0%, transparent 70%)', top: '-150px', left: '-150px', animation: 'orb-move-1 14s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,69,0.08) 0%, transparent 70%)', bottom: '-100px', right: '-100px', animation: 'orb-move-2 18s ease-in-out infinite' }} />
      </div>

      <div style={{ maxWidth: 600, width: '100%', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        {/* Mascot celebrating */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
          style={{ marginBottom: 24 }}
        >
          <Mascot
            pose="celebrating"
            size={160}
            speechBubble="Amazing work! 🎉 Now let's find your perfect opportunity!"
          />
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
          style={{ padding: '40px 32px' }}
        >
          {/* Globe emoji */}
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: 56, marginBottom: 20 }}
          >
            🌍
          </motion.div>

          <h2 style={{ fontWeight: 900, fontSize: 26, marginBottom: 12, lineHeight: 1.3 }}>
            Interested in volunteering abroad with AIESEC?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginBottom: 28, lineHeight: 1.6 }}>
            Join thousands of young Malaysians who've transformed their lives through
            international experiences in 120+ countries.
          </p>

          {/* Flags */}
          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: 8,
            justifyContent: 'center', marginBottom: 32,
          }}>
            {flags.map((flag, i) => (
              <motion.span
                key={flag}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.06 }}
                style={{ fontSize: 28, cursor: 'default' }}
              >
                {flag}
              </motion.span>
            ))}
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', gap: 16, marginBottom: 32,
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {[
              { value: '120+', label: 'Countries' },
              { value: '6-8', label: 'Weeks' },
              { value: '100K+', label: 'Youth/year' },
            ].map(({ value, label }) => (
              <div key={label} style={{
                background: 'rgba(13,177,75,0.1)', border: '1px solid rgba(13,177,75,0.2)',
                borderRadius: 12, padding: '12px 20px', minWidth: 90, textAlign: 'center',
              }}>
                <div style={{ color: '#0DB14B', fontWeight: 900, fontSize: 22 }}>{value}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 700 }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <motion.button
              whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(13,177,75,0.4)' }}
              whileTap={{ scale: 0.97 }}
              onClick={handleYes}
              style={{
                background: 'linear-gradient(135deg, #0DB14B, #037EF3)',
                color: 'white', border: 'none', borderRadius: 14,
                padding: '18px', fontFamily: 'Nunito, sans-serif',
                fontWeight: 900, fontSize: 18, cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(13,177,75,0.3)',
              }}
            >
              Yes, I'm In! 🚀 Let me explore opportunities!
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMaybeLater}
              style={{
                background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 14, padding: '14px',
                fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 15,
                cursor: 'pointer',
              }}
            >
              Maybe Later — Show me my results first
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
