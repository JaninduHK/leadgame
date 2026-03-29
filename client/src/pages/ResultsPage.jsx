import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Mascot from '../components/Mascot';
import ConfettiEffect from '../components/ConfettiEffect';
import { useQuiz } from '../context/QuizContext';
import { calcAccuracy, getScoreGrade, formatTime } from '../utils/scoring';
import api from '../utils/api';

export default function ResultsPage() {
  const navigate = useNavigate();
  const {
    sessionId, answers, volunteerInterest, userName,
    results, setResults, resetQuiz,
  } = useQuiz();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current || !sessionId || !answers?.length) return;
    hasSubmitted.current = true;
    submitQuiz();
  }, []);

  // Animate score count-up
  useEffect(() => {
    if (!results?.score) return;
    const target = results.score;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + increment, target);
      setDisplayScore(Math.round(current));
      if (current >= target) clearInterval(interval);
    }, duration / steps);
    return () => clearInterval(interval);
  }, [results?.score]);

  const submitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const totalTimeTaken = answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
      const { data } = await api.post('/quiz/submit', {
        sessionId,
        answers,
        volunteerInterest: volunteerInterest || false,
        totalTimeTaken,
      });
      setResults(data);
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit quiz.';
      toast.error(msg);
      // Use local calculation as fallback
      const localScore = answers.reduce((sum, a) => sum + (a.isCorrect ? 100 : 0), 0);
      setResults({
        score: localScore,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        totalQuestions: answers.length,
        timeTaken: answers.reduce((s, a) => s + (a.timeTaken || 0), 0),
        rank: 0,
        totalPlayers: 0,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (!submitted || !results) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A1628',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div className="anim-spin" style={{
          width: 56, height: 56, border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid #037EF3', borderRadius: '50%',
        }} />
        <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)' }}>
          Calculating your results...
        </div>
      </div>
    );
  }

  const accuracy = calcAccuracy(results.correctAnswers, results.totalQuestions);
  const grade = getScoreGrade(accuracy);
  const scorePct = Math.min(results.score / (results.totalQuestions * 200), 1);
  const RADIUS = 80;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

  const handleShareScore = async () => {
    const text = `I scored ${results.score} pts and ranked #${results.rank} on the AIESEC Malaysia Quiz! 🏆 Can you beat me? Try it now: ${window.location.origin}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'AIESEC Malaysia Quiz', text });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success('Score copied to clipboard!');
      }
    } catch {}
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px 24px 80px' }}>
      <ConfettiEffect duration={6000} pieces={300} />

      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,200,69,0.1) 0%, transparent 70%)', top: '-200px', right: '-200px' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,177,75,0.1) 0%, transparent 70%)', bottom: '-100px', left: '-100px' }} />
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Mascot dancing */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          style={{ textAlign: 'center', marginBottom: 16 }}
        >
          <Mascot pose="celebrating" size={140} speechBubble={`${grade.label} You scored ${results.score} pts! 🎉`} />
        </motion.div>

        {/* Score Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
          style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}
        >
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            <svg width={200} height={200} viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" />
              <motion.circle
                cx="100" cy="100" r={RADIUS}
                fill="none"
                stroke={grade.color}
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                initial={{ strokeDashoffset: CIRCUMFERENCE }}
                animate={{ strokeDashoffset: CIRCUMFERENCE * (1 - scorePct) }}
                transition={{ duration: 1.5, delay: 0.5, ease: 'easeOut' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 36, lineHeight: 1 }}>
                {displayScore}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700 }}>POINTS</div>
            </div>
          </div>
        </motion.div>

        {/* Rank reveal */}
        {results.rank > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1, type: 'spring' }}
            style={{
              textAlign: 'center', marginBottom: 24,
              background: 'rgba(255,200,69,0.1)', border: '1px solid rgba(255,200,69,0.3)',
              borderRadius: 16, padding: '16px',
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 4 }}>🏆</div>
            <div style={{ fontWeight: 900, fontSize: 24, color: '#FFC845' }}>
              You Ranked #{results.rank}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginTop: 4 }}>
              out of {results.totalPlayers} players
            </div>
          </motion.div>
        )}

        {/* Stats cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
          {[
            { icon: '✅', value: `${results.correctAnswers}/${results.totalQuestions}`, label: 'Correct' },
            { icon: '⏱️', value: formatTime(results.timeTaken), label: 'Time Taken' },
            { icon: '🎯', value: `${accuracy}%`, label: 'Accuracy' },
          ].map(({ icon, value, label }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="glass-card"
              style={{ padding: '16px 12px', textAlign: 'center' }}
            >
              <div style={{ fontSize: 24, marginBottom: 4 }}>{icon}</div>
              <div style={{ fontWeight: 900, fontSize: 20, color: 'white' }}>{value}</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, fontWeight: 700, marginTop: 2 }}>{label}</div>
            </motion.div>
          ))}
        </div>

        {/* Email notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          style={{
            background: 'rgba(3,126,243,0.1)', border: '1px solid rgba(3,126,243,0.2)',
            borderRadius: 14, padding: '14px 18px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 12,
          }}
        >
          <span style={{ fontSize: 24 }}>📬</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Check your inbox!</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>
              We sent your personalised AIESEC opportunities to your email.
            </div>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
        >
          <button
            onClick={() => navigate('/leaderboard')}
            style={{
              background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
              color: 'white', border: 'none', borderRadius: 14,
              padding: '16px', fontFamily: 'Nunito, sans-serif',
              fontWeight: 900, fontSize: 17, cursor: 'pointer',
            }}
          >
            🏆 View Full Leaderboard
          </button>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <button
              onClick={handleShareScore}
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'white', border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 14, padding: '14px',
                fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              }}
            >
              📤 Share Score
            </button>
            <button
              onClick={() => window.open('https://aiesec.org/malaysia', '_blank')}
              style={{
                background: 'rgba(13,177,75,0.15)',
                color: '#0DB14B', border: '1px solid rgba(13,177,75,0.3)',
                borderRadius: 14, padding: '14px',
                fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer',
              }}
            >
              🌍 Explore AIESEC
            </button>
          </div>

          <button
            onClick={() => { resetQuiz(); navigate('/'); }}
            style={{
              background: 'none', color: 'rgba(255,255,255,0.4)',
              border: 'none', padding: '12px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 14,
              cursor: 'pointer', textDecoration: 'underline',
            }}
          >
            Play Again
          </button>
        </motion.div>
      </div>
    </div>
  );
}
