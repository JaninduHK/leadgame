import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { T, LGStar, LGDiamond, LGCross, LGSpark, FloatShape, Marquee, BigButton, Pill } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";

function getSeason() {
  const m = new Date().getMonth();
  return (m >= 1 && m <= 6) ? 'Summer' : 'Winter';
}

export default function Home() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalPlayers: 0 });

  useEffect(() => {
    api.get('/leaderboard/stats')
      .then(({ data }) => setStats({ totalPlayers: data?.totalPlayers ?? 0 }))
      .catch(() => {});
  }, []);

  const HOW_STEPS = [
    { n: '01', t: 'Enter your campaign PIN', d: 'Get the PIN from your AIESEC LC or scan their QR code.', bg: T.pink },
    { n: '02', t: 'Tell us about you', d: 'Name, email, phone. 30 seconds, tops.', bg: T.green },
    { n: '03', t: 'Play the quiz', d: 'Scenario questions. Pick fast — speed scores.', bg: T.yellow },
    { n: '04', t: 'Get your results', d: 'See your score + your shot at a volunteer slot abroad.', bg: T.navy, fg: T.bg },
  ];

  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── HERO ── */}
      <section style={{ padding: '64px 40px 0', maxWidth: 1200, margin: '0 auto', position: 'relative', minHeight: '88vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>

        {/* Floating shapes */}
        <FloatShape top={60} left="55%" delay={0} duration={3}><LGStar size={36} color={T.pink} /></FloatShape>
        <FloatShape top={200} left="52%" delay={0.7} duration={4}><LGDiamond size={22} color={T.green} /></FloatShape>
        <FloatShape top={340} left="48%" delay={1.4} duration={3.5}><LGCross size={20} color={T.navy} /></FloatShape>
        <FloatShape top={100} right={60} delay={0.3} duration={4}><LGSpark size={30} color={T.yellow} /></FloatShape>

        <div style={{ maxWidth: 760, position: 'relative', zIndex: 1 }}>
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Pill bg={T.green} border={T.ink} style={{ marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, background: T.ink, borderRadius: 999 }} />
              {getSeason()} Season · now open
            </Pill>

            <h1 style={{
              fontFamily: DISP, fontWeight: 700, fontSize: 'clamp(48px, 7vw, 88px)',
              lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: 28,
            }}>
              Leadership is{' '}
              <span style={{ color: T.navy, fontStyle: 'italic' }}>a game.</span>
              <br />Start playing.
            </h1>

            <p style={{ fontSize: 18, lineHeight: 1.5, maxWidth: 520, marginBottom: 36, opacity: 0.8 }}>
              Play a 4-minute quiz, discover your leadership archetype, and top scorers win a fully-funded volunteer placement abroad with AIESEC.
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 52 }}>
              <BigButton bg={T.ink} color={T.bg} size="lg" arrow onClick={() => navigate('/play')}>
                Start the game
              </BigButton>
              <BigButton bg="transparent" color={T.ink} size="lg" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
                How it works
              </BigButton>
            </div>

            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              {[
                { v: (stats.totalPlayers || 0).toLocaleString(), l: 'players this season' },
                { v: '120+', l: 'destinations' },
                { v: '4 min', l: 'to play' },
              ].map(({ v, l }) => (
                <div key={l}>
                  <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 28, letterSpacing: '-0.03em', lineHeight: 1 }}>{v}</div>
                  <div style={{ fontSize: 13, opacity: 0.55, marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── UNIVERSITY MARQUEE ── */}
      <div style={{ marginTop: 60 }}>
        <Marquee
          items={['🇮🇳 India', '🇷🇴 Romania', '🇧🇷 Brazil', '🇨🇿 Czech Republic', '🇪🇬 Egypt', 'Project Aquatica', 'Project Heartbeat', 'Project Global Classroom', '🇨🇴 Colombia', '🇹🇷 Turkey']}
          bg={T.navy} color={T.bg} speed={28}
        />
      </div>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" style={{ padding: '80px 40px 60px', maxWidth: 1200, margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <Pill bg={T.yellow} border={T.ink} style={{ marginBottom: 20 }}>How it works</Pill>
          <h2 style={{
            fontFamily: DISP, fontWeight: 700, fontSize: 'clamp(36px, 5vw, 60px)',
            lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: 40, maxWidth: 700,
          }}>
            Four steps. <span style={{ color: T.pink, fontStyle: 'italic' }}>One</span> shot at going abroad.
          </h2>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {HOW_STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: s.bg, color: s.fg || T.ink,
                border: `2px solid ${T.ink}`, borderRadius: 24,
                padding: '24px 22px', minHeight: 240,
                position: 'relative', overflow: 'hidden',
                boxShadow: `5px 5px 0 ${T.ink}`,
              }}
            >
              <div style={{ fontFamily: DISP, fontSize: 44, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>{s.n}</div>
              <div style={{ marginTop: 64, fontFamily: DISP, fontSize: 20, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em' }}>{s.t}</div>
              <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85, lineHeight: 1.5 }}>{s.d}</div>
            </motion.div>
          ))}
        </div>

        {/* Did you know */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          style={{
            marginTop: 24, background: T.muted,
            border: `2px solid ${T.ink}`, borderRadius: 24,
            padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap',
          }}
        >
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontFamily: DISP, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.14em', opacity: 0.55, marginBottom: 6 }}>Did you know?</div>
            <div style={{ fontFamily: DISP, fontSize: 20, fontWeight: 700, maxWidth: 560, letterSpacing: '-0.02em' }}>
              AIESEC operates in 120+ countries and has empowered over 1 million young leaders worldwide.
            </div>
          </div>
          <BigButton bg={T.ink} color={T.bg} size="md" arrow onClick={() => navigate('/play')}>
            I'm in
          </BigButton>
        </motion.div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `2px solid ${T.ink}`, padding: '24px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, background: T.navy, borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: DISP, fontWeight: 700, fontSize: 12, color: T.bg,
          }}>L</div>
          <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15, letterSpacing: '-0.02em' }}>LEAD GAME</span>
        </div>
        <div style={{ fontSize: 12, opacity: 0.45 }}>© 2025 AIESEC Malaysia · Activating Leadership. Impacting Communities.</div>
      </footer>
    </div>
  );
}
