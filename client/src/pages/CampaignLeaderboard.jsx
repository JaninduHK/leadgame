import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useQuiz } from '../context/QuizContext';
import { T, BigButton, Pill, LGStar, FloatShape } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";
const MEDAL = { 1: '🥇', 2: '🥈', 3: '🥉' };
const PODIUM_BG = { 1: T.yellow, 2: T.muted, 3: '#d4a76a' };

export default function CampaignLeaderboard() {
  const { campaignId } = useParams();
  const navigate = useNavigate();
  const { sessionId, setCampaign } = useQuiz();
  const [campaign, setCampaignData] = useState(null);
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/campaigns/${campaignId}`),
      api.get(`/campaigns/${campaignId}/leaderboard`),
    ])
      .then(([{ data: cd }, { data: ld }]) => {
        setCampaignData(cd.campaign);
        setEntries(ld.leaderboard || []);
        setTotal(ld.total || 0);
      })
      .catch(() => navigate('/leaderboard'))
      .finally(() => setLoading(false));
  }, [campaignId]);

  const filtered = !search.trim() ? entries : entries.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const top3 = entries.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  const handlePlay = () => {
    if (campaign) {
      setCampaign(campaign._id, campaign.title);
      navigate('/register');
    }
  };

  const isActive = campaign?.isActive && (!campaign?.endTime || new Date(campaign?.endTime) > new Date());

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '40px 24px 100px', overflowX: 'hidden' }}>
      <FloatShape top={80} right={40} delay={0} duration={5}><LGStar size={38} color={T.pink} /></FloatShape>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Back */}
        <button
          onClick={() => navigate('/leaderboard')}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, fontSize: 14, opacity: 0.55, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24, fontFamily: "'Inter', sans-serif", padding: 0 }}
        >
          ← All campaigns
        </button>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 64, borderRadius: 14 }} />
            ))}
          </div>
        ) : (
          <>
            {/* Campaign header */}
            <div style={{ marginBottom: 32 }}>
              <Pill bg={isActive ? T.green : T.muted} border={T.ink} style={{ marginBottom: 14 }}>
                {isActive ? 'Live now' : 'Ended'}
              </Pill>
              <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 'clamp(28px, 5vw, 46px)', letterSpacing: '-0.03em', marginBottom: 8 }}>
                {campaign?.title}
              </h1>
              <div style={{ fontSize: 14, opacity: 0.6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {campaign?.admin?.lcName && <span>{campaign.admin.lcName}</span>}
                {campaign?.location && <span>· {campaign.location}</span>}
                <span>· {total} players</span>
              </div>
            </div>

            {/* Podium */}
            {top3.length >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-end', gap: 10, marginBottom: 36, paddingTop: 16 }}
              >
                {podiumOrder.map((entry, di) => {
                  const rank = di === 0 ? 2 : di === 1 ? 1 : 3;
                  const ht = { 1: 120, 2: 88, 3: 68 };
                  return (
                    <div key={entry?._id || di} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ textAlign: 'center', marginBottom: 4 }}>
                        <div style={{ fontSize: 24 }}>{MEDAL[rank]}</div>
                        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 12, color: T.ink, maxWidth: 88, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry?.name || '–'}
                        </div>
                        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14, color: T.navy }}>
                          {entry?.score?.toLocaleString() || '–'}
                        </div>
                      </div>
                      <div style={{
                        width: rank === 1 ? 110 : 88, height: ht[rank],
                        background: PODIUM_BG[rank],
                        border: `2px solid ${T.ink}`, borderRadius: '12px 12px 0 0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: DISP, fontWeight: 700, fontSize: 24, color: T.ink,
                      }}>
                        {rank}
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {/* Search */}
            <div style={{ marginBottom: 14 }}>
              <input
                placeholder="Search by name…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%', background: '#fff',
                  border: `2px solid ${T.ink}`, borderRadius: 12,
                  padding: '12px 16px', color: T.ink,
                  fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 14, outline: 'none',
                  boxShadow: `3px 3px 0 ${T.ink}`, boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Entries */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              style={{ border: `2px solid ${T.ink}`, borderRadius: 20, overflow: 'hidden', background: '#fff', boxShadow: `4px 4px 0 ${T.ink}`, marginBottom: 28 }}
            >
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 48, opacity: 0.4, fontWeight: 600 }}>
                  {search ? 'No players found.' : 'No scores yet — be the first!'}
                </div>
              ) : (
                <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {filtered.map((entry, i) => {
                    const isMe = entry?.sessionId === sessionId;
                    return (
                      <motion.div
                        key={entry._id || i}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '12px 14px', borderRadius: 12,
                          background: isMe ? T.pink : T.muted,
                          border: `2px solid ${T.ink}`,
                          boxShadow: isMe ? `3px 3px 0 ${T.ink}` : 'none',
                        }}
                      >
                        <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 18, width: 34, flexShrink: 0, letterSpacing: '-0.02em' }}>
                          {String(entry.rank || i + 1).padStart(2, '0')}
                        </span>
                        <div style={{ width: 32, height: 32, borderRadius: 999, background: T.ink, color: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, flexShrink: 0 }}>
                          {(entry.name || '?')[0].toUpperCase()}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {entry.name || 'Anonymous'}{isMe && ' (You)'}
                          </div>
                          <div style={{ fontSize: 11, opacity: 0.5 }}>
                            {entry.correctAnswers}/{entry.totalQuestions} correct
                          </div>
                        </div>
                        <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17, letterSpacing: '-0.02em', flexShrink: 0 }}>
                          {(entry.score || 0).toLocaleString()}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
              {isActive ? (
                <BigButton bg={T.pink} color={T.ink} size="lg" arrow onClick={handlePlay}>
                  Play this campaign now
                </BigButton>
              ) : (
                <BigButton bg={T.muted} color={T.ink} size="md" onClick={() => navigate('/register')}>
                  Play global quiz instead
                </BigButton>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
