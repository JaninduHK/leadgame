import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ConfettiEffect from '../components/ConfettiEffect';
import { useQuiz } from '../context/QuizContext';
import { calcAccuracy, getScoreGrade, formatTime } from '../utils/scoring';
import api from '../utils/api';
import { T, LGStar, FloatShape, BigButton, Pill } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";

// Derive an archetype label from accuracy
function getArchetype(accuracy) {
  if (accuracy >= 90) return { name: 'The Visionary', desc: 'You see the full picture before anyone else. Strategic, decisive, and always three moves ahead.' };
  if (accuracy >= 75) return { name: 'The Catalyst', desc: 'You lead by unlocking others. You read a room fast, delegate by strength, and turn stuck teams into moving ones.' };
  if (accuracy >= 60) return { name: 'The Builder', desc: 'You make things happen. Practical, driven, and relentless about turning ideas into outcomes.' };
  return { name: 'The Explorer', desc: 'Curious and open. You ask the right questions and bring fresh energy to every challenge.' };
}

function LeaderboardRow({ entry, rank, you = false }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px', borderRadius: 14,
      background: you ? T.pink : '#fff',
      border: `2px solid ${T.ink}`,
      boxShadow: you ? `3px 3px 0 ${T.ink}` : 'none',
    }}>
      <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, width: 36, flexShrink: 0, letterSpacing: '-0.03em' }}>
        {String(rank).padStart(2, '0')}
      </span>
      <div style={{
        width: 32, height: 32, borderRadius: 999, background: T.ink,
        color: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 12, flexShrink: 0,
      }}>
        {(entry.name || entry.userName || '?')[0].toUpperCase()}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.name || entry.userName}
        </div>
        <div style={{ fontSize: 11, opacity: 0.55 }}>{entry.campus || ''}</div>
      </div>
      <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, letterSpacing: '-0.03em', flexShrink: 0 }}>
        {(entry.score || 0).toLocaleString()}
      </span>
    </div>
  );
}

export default function ResultsPage() {
  const navigate = useNavigate();
  const { sessionId, answers, volunteerInterest, userName, results, setResults, resetQuiz, campaignId } = useQuiz();

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (hasSubmitted.current || !sessionId || !answers?.length) return;
    hasSubmitted.current = true;
    submitQuiz();
  }, []);

  // Count-up animation
  useEffect(() => {
    if (!results?.score) return;
    const target = results.score;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current = Math.min(current + increment, target);
      setDisplayScore(Math.round(current));
      if (current >= target) clearInterval(interval);
    }, 1500 / steps);
    return () => clearInterval(interval);
  }, [results?.score]);

  // Load leaderboard — campaign-scoped if available
  useEffect(() => {
    const endpoint = campaignId ? `/campaigns/${campaignId}/leaderboard` : '/leaderboard';
    api.get(endpoint)
      .then(({ data }) => setLeaderboard(data.leaderboard?.slice(0, 5) || []))
      .catch(() => {});
  }, [campaignId]);

  const submitQuiz = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const totalTimeTaken = answers.reduce((sum, a) => sum + (a.timeTaken || 0), 0);
      const { data } = await api.post('/quiz/submit', {
        sessionId, answers,
        volunteerInterest: volunteerInterest || false,
        totalTimeTaken,
      });
      setResults(data);
      setSubmitted(true);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to submit quiz.';
      toast.error(msg);
      const localScore = answers.reduce((sum, a) => sum + (a.isCorrect ? 100 : 0), 0);
      setResults({
        score: localScore,
        correctAnswers: answers.filter(a => a.isCorrect).length,
        totalQuestions: answers.length,
        timeTaken: answers.reduce((s, a) => s + (a.timeTaken || 0), 0),
        rank: 0, totalPlayers: 0,
      });
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const [showShare, setShowShare] = useState(false);

  const shareText = `I scored ${results?.score} pts and ranked #${results?.rank} on the LEAD GAME by AIESEC Malaysia! 🏆 Can you beat me?`;
  const shareUrl = window.location.origin;

  const shareOptions = [
    {
      label: 'WhatsApp',
      bg: '#25D366', color: '#fff',
      href: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      label: 'Facebook',
      bg: '#1877F2', color: '#fff',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`,
    },
    {
      label: 'Twitter / X',
      bg: '#000', color: '#fff',
      href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    },
    {
      label: 'Telegram',
      bg: '#229ED9', color: '#fff',
      href: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    },
    {
      label: 'Copy link',
      bg: '#fff', color: T.ink,
      onClick: async () => { await navigator.clipboard.writeText(`${shareText} ${shareUrl}`); toast.success('Copied!'); setShowShare(false); },
    },
  ];

  if (!submitted || !results) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="anim-spin" style={{ width: 48, height: 48, border: `4px solid ${T.muted}`, borderTop: `4px solid ${T.ink}`, borderRadius: '50%' }} />
        <div style={{ fontFamily: DISP, fontWeight: 600, opacity: 0.6 }}>Calculating your results…</div>
      </div>
    );
  }

  const accuracy = calcAccuracy(results.correctAnswers, results.totalQuestions);
  const grade = getScoreGrade(accuracy);
  const archetype = getArchetype(accuracy);

  // Find user's position in leaderboard for highlighting
  const userRankIdx = results.rank > 0 ? results.rank - 1 : -1;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif" }}>
      <ConfettiEffect duration={5000} pieces={250} />

      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', minHeight: '100vh' }} className="results-grid">

        {/* ── LEFT: Result card ── */}
        <div style={{ padding: '48px 40px 48px 60px', borderRight: `2px solid ${T.ink}`, position: 'relative', overflowY: 'auto' }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Pill bg={T.green} border={T.ink} style={{ marginBottom: 16 }}>Your result</Pill>

            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.5, marginTop: 8 }}>
              Leadership archetype
            </div>
            <h1 style={{
              fontFamily: DISP, fontWeight: 700,
              fontSize: 'clamp(42px, 5vw, 76px)',
              lineHeight: 0.92, letterSpacing: '-0.03em', margin: '8px 0 0',
            }}>
              <span style={{ color: T.pink, fontStyle: 'italic' }}>{archetype.name}</span>
            </h1>
            <p style={{ fontSize: 16, lineHeight: 1.5, maxWidth: 440, marginTop: 18, opacity: 0.8 }}>
              {archetype.desc}
            </p>

            {/* Score big number */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              style={{ marginTop: 28, display: 'inline-block' }}
            >
              <div style={{
                border: `2px solid ${T.ink}`, borderRadius: 20, padding: '20px 28px',
                background: T.yellow, boxShadow: `4px 4px 0 ${T.ink}`, display: 'inline-block',
              }}>
                <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  {displayScore.toLocaleString()}
                </div>
                <div style={{ fontSize: 12, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.12em', marginTop: 4 }}>points</div>
              </div>
              {results.rank > 0 && (
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  marginLeft: 16, border: `2px solid ${T.ink}`, borderRadius: 20,
                  padding: '20px 24px', background: T.navy, color: T.bg,
                  boxShadow: `4px 4px 0 ${T.ink}`,
                }}>
                  <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 42, letterSpacing: '-0.03em', lineHeight: 1 }}>
                    #{results.rank}
                  </div>
                  <div style={{ fontSize: 12, opacity: 0.7, textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>rank</div>
                </div>
              )}
            </motion.div>

            {/* Skill breakdown */}
            <div style={{ marginTop: 28, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[
                { l: 'Correct', v: `${results.correctAnswers}/${results.totalQuestions}`, c: T.green },
                { l: 'Accuracy', v: `${accuracy}%`, c: T.yellow },
                { l: 'Time', v: formatTime(results.timeTaken), c: T.pink },
              ].map((s, i) => (
                <motion.div
                  key={s.l}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  style={{
                    border: `2px solid ${T.ink}`, borderRadius: 16,
                    padding: '14px 16px', background: T.muted,
                  }}
                >
                  <div style={{ fontSize: 11, opacity: 0.65, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.l}</div>
                  <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 26, letterSpacing: '-0.02em', lineHeight: 1.1, marginTop: 4 }}>{s.v}</div>
                  <div style={{ height: 5, background: T.bg, borderRadius: 999, overflow: 'hidden', border: `1.5px solid ${T.ink}`, marginTop: 8 }}>
                    <div style={{ height: '100%', width: `${accuracy}%`, background: s.c, transition: 'width 1s ease' }} />
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Email notice */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{
                marginTop: 20, padding: '14px 18px',
                border: `2px dashed ${T.ink}`, borderRadius: 14, fontSize: 13,
              }}
            >
              📬 <strong>Check your inbox</strong> — we sent your results and AIESEC opportunities to your email.
            </motion.div>

            {/* CTA buttons */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}
            >
              <BigButton bg={T.pink} color={T.ink} size="md" arrow onClick={() => window.open('https://aiesec.org/malaysia', '_blank')}>
                Claim your slot
              </BigButton>
              <div style={{ position: 'relative' }}>
                <BigButton bg="transparent" color={T.ink} size="md" onClick={() => setShowShare(v => !v)}>
                  Share result
                </BigButton>
                {showShare && (
                  <div style={{
                    position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 100,
                    background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 14,
                    boxShadow: `4px 4px 0 ${T.ink}`, padding: 8, minWidth: 180,
                    display: 'flex', flexDirection: 'column', gap: 4,
                  }}>
                    {shareOptions.map(({ label, bg, color, href, onClick }) => (
                      <a
                        key={label}
                        href={href || undefined}
                        target={href ? '_blank' : undefined}
                        rel="noreferrer"
                        onClick={onClick || (() => setShowShare(false))}
                        style={{
                          display: 'block', padding: '9px 14px', borderRadius: 9,
                          background: bg, color, fontWeight: 700, fontSize: 13,
                          border: `1.5px solid ${T.ink}`, textDecoration: 'none',
                          cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                        }}
                      >
                        {label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
            <button
              onClick={() => { resetQuiz(); navigate('/'); }}
              style={{
                background: 'none', color: T.ink, border: 'none', padding: '12px 0',
                fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 13,
                cursor: 'pointer', opacity: 0.5, textDecoration: 'underline', marginTop: 4, display: 'block',
              }}
            >
              Play again
            </button>
          </motion.div>

          <FloatShape bottom={60} left={40} delay={0.4} duration={3}><LGStar size={28} color={T.yellow} /></FloatShape>
          <FloatShape top={40} right={40} delay={0.8} duration={4}>
            <svg width={52} height={52} viewBox="0 0 40 40">
              <path d="M20 1c5 0 10 4 13 8s5 9 3 14-8 8-13 10-10 2-14-1-6-8-6-14 4-11 8-14 5-3 9-3z" fill={T.green} opacity={0.4} />
            </svg>
          </FloatShape>
        </div>

        {/* ── RIGHT: Leaderboard ── */}
        <div style={{ padding: '48px 60px 48px 40px', background: T.muted, overflowY: 'auto' }}>
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 20 }}>
              <div>
                <Pill bg={T.yellow} border={T.ink} style={{ marginBottom: 10 }}>🏆 {(() => { const m = new Date().getMonth(); return (m >= 1 && m <= 6) ? 'Summer' : 'Winter'; })()} Season leaderboard</Pill>
                <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em' }}>Top 5 this week</div>
              </div>
              <button
                onClick={() => navigate('/leaderboard')}
                style={{
                  background: 'transparent', border: `1.5px solid ${T.ink}`, color: T.ink,
                  borderRadius: 8, padding: '6px 14px', fontFamily: "'Inter', sans-serif",
                  fontWeight: 600, fontSize: 12, cursor: 'pointer',
                }}
              >View all →</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {leaderboard.length === 0 ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="skeleton" style={{ height: 58 }} />
                ))
              ) : (
                leaderboard.map((entry, i) => (
                  <motion.div
                    key={entry._id || i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.07 }}
                  >
                    <LeaderboardRow entry={entry} rank={i + 1} you={results.rank === i + 1} />
                  </motion.div>
                ))
              )}
            </div>

            {results.rank > 0 && (
              <div style={{
                marginTop: 20, padding: '16px 18px',
                border: `2px dashed ${T.ink}`, borderRadius: 16, fontSize: 13, lineHeight: 1.5,
              }}>
                <strong>Top players</strong> this season receive{' '}
                <strong>discounted volunteer opportunities</strong> abroad with AIESEC.
                {results.rank <= 20 ? " You're currently in. 🎉" : ` You're #${results.rank} — keep playing!`}
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .results-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
