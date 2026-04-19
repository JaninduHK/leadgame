import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { T, BigButton, Pill, LGStar, FloatShape } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";

function Countdown({ endTime }) {
  const [left, setLeft] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = new Date(endTime) - Date.now();
      if (diff <= 0) { setLeft('Ended'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (h > 48) {
        const d = Math.floor(h / 24);
        setLeft(`${d}d ${h % 24}h`);
      } else {
        setLeft(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
      }
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endTime]);

  return <span>{left}</span>;
}

function CampaignCard({ campaign, index }) {
  const navigate = useNavigate();
  const isActive = campaign.isActive && (!campaign.endTime || new Date(campaign.endTime) > new Date());

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07 }}
      onClick={() => navigate(`/leaderboard/${campaign._id}`)}
      style={{
        background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 18,
        padding: '20px 22px', boxShadow: `4px 4px 0 ${T.ink}`,
        cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s',
        display: 'flex', alignItems: 'center', gap: 16,
      }}
      whileHover={{ y: -2, boxShadow: `6px 6px 0 ${T.ink}` }}
      whileTap={{ scale: 0.98 }}
    >
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: isActive ? T.green : T.muted,
        border: `2px solid ${T.ink}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: DISP, fontWeight: 700, fontSize: 20, color: T.ink,
      }}>
        {campaign.title[0]}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', marginBottom: 3 }}>
          {campaign.title}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {campaign.admin?.lcName && <span>{campaign.admin.lcName}</span>}
          {campaign.location && <span>· {campaign.location}</span>}
        </div>
      </div>

      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {isActive && campaign.endTime ? (
          <div style={{
            fontFamily: DISP, fontWeight: 700, fontSize: 14,
            background: T.yellow, border: `1.5px solid ${T.ink}`,
            borderRadius: 8, padding: '4px 10px', marginBottom: 4,
          }}>
            <Countdown endTime={campaign.endTime} />
          </div>
        ) : isActive ? (
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, color: T.green, marginBottom: 4 }}>
            Open
          </div>
        ) : (
          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 13, opacity: 0.4, marginBottom: 4 }}>
            Ended
          </div>
        )}
        <div style={{ fontSize: 12, opacity: 0.5 }}>
          {campaign.entryCount != null ? `${campaign.entryCount} players` : 'View'}
        </div>
      </div>

      <div style={{ color: T.ink, opacity: 0.4, fontSize: 20, flexShrink: 0 }}>›</div>
    </motion.div>
  );
}

export default function LeaderboardPage() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns')
      .then(({ data }) => setCampaigns(data.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '40px 24px 100px', position: 'relative', overflowX: 'hidden' }}>
      <FloatShape top={100} right={40} delay={0} duration={5}><LGStar size={40} color={T.pink} /></FloatShape>

      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Pill bg={T.yellow} border={T.ink} style={{ marginBottom: 16 }}>Active Campaigns</Pill>
          <h1 style={{
            fontFamily: DISP, fontWeight: 700,
            fontSize: 'clamp(32px, 5vw, 52px)',
            letterSpacing: '-0.03em', marginBottom: 12,
          }}>
            Pick your{' '}
            <span style={{ color: T.navy, fontStyle: 'italic' }}>campaign</span>
          </h1>
          <p style={{ fontSize: 15, opacity: 0.6, maxWidth: 400, margin: '0 auto' }}>
            Each LC runs their own leaderboard. Click a campaign to see rankings and start playing.
          </p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 90, borderRadius: 18 }} />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{
            textAlign: 'center', background: '#fff',
            border: `2px solid ${T.ink}`, borderRadius: 20,
            padding: '48px', boxShadow: `4px 4px 0 ${T.ink}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏕</div>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No active campaigns yet</div>
            <div style={{ opacity: 0.5, fontSize: 14 }}>Check back soon or play the global quiz!</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaigns.map((c, i) => <CampaignCard key={c._id} campaign={c} index={i} />)}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 40, display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <BigButton bg={T.ink} color={T.bg} size="md" arrow onClick={() => navigate('/play')}>
            Have a PIN? Enter it here
          </BigButton>
          <BigButton bg={T.muted} color={T.ink} size="md" onClick={() => navigate('/register')}>
            Play global quiz
          </BigButton>
        </div>
      </div>
    </div>
  );
}
