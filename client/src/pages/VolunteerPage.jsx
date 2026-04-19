import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../context/QuizContext';
import { T, BigButton, Pill } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";
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
      minHeight: '100vh', background: T.bg, color: T.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '40px 24px', fontFamily: "'Inter', sans-serif",
    }}>
      <div style={{ maxWidth: 560, width: '100%', textAlign: 'center' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 180 }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ fontSize: 72, marginBottom: 24 }}
          >
            🌍
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          style={{
            background: T.navy, color: T.bg,
            border: `2px solid ${T.ink}`, borderRadius: 28,
            padding: '40px 32px', boxShadow: `6px 6px 0 ${T.ink}`,
          }}
        >
          <Pill bg={T.green} border={T.ink} style={{ marginBottom: 20, color: T.ink }}>
            Quiz complete! 🎉
          </Pill>

          <h2 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 28, lineHeight: 1.15, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Interested in volunteering abroad with AIESEC?
          </h2>
          <p style={{ fontSize: 15, opacity: 0.75, marginBottom: 28, lineHeight: 1.6 }}>
            Join thousands of young Malaysians who've transformed their lives through international experiences in 120+ countries.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 28 }}>
            {flags.map((flag, i) => (
              <motion.span key={flag} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }} style={{ fontSize: 26 }}>
                {flag}
              </motion.span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', marginBottom: 28, flexWrap: 'wrap' }}>
            {[{ v: '120+', l: 'Countries' }, { v: '6–8', l: 'Weeks' }, { v: '100K+', l: 'Youth/year' }].map(({ v, l }) => (
              <div key={l} style={{ border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 12, padding: '10px 18px', textAlign: 'center', minWidth: 80 }}>
                <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>{v}</div>
                <div style={{ fontSize: 12, opacity: 0.65, marginTop: 2 }}>{l}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <BigButton bg={T.green} color={T.ink} size="lg" arrow onClick={handleYes} style={{ width: '100%', justifyContent: 'center' }}>
              Yes, I'm in! Explore opportunities
            </BigButton>
            <button onClick={handleMaybeLater} style={{
              background: 'transparent', color: 'rgba(244,239,225,0.6)',
              border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: 999,
              padding: '14px', fontFamily: "'Inter', sans-serif",
              fontWeight: 600, fontSize: 14, cursor: 'pointer',
            }}>
              Maybe later — show me my results
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
