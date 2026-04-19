import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { T, BigButton } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";

function renderTemplate(template, vars) {
  return (template || '')
    .replace(/\{\{name\}\}/g, vars.name || '')
    .replace(/\{\{score\}\}/g, vars.score ?? '')
    .replace(/\{\{rank\}\}/g, vars.rank ?? '')
    .replace(/\{\{accuracy\}\}/g, vars.accuracy ?? '')
    .replace(/\{\{campaign\}\}/g, vars.campaign || '');
}

function ActionButtons({ entry, campaign }) {
  const accuracy = entry.totalQuestions > 0 ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100) : 0;
  const vars = { name: entry.name, score: entry.score, rank: entry.rank, accuracy, campaign: campaign?.title || '' };

  const sendWA = () => {
    const phone = (entry.phone || '').replace(/\D/g, '');
    const msg = renderTemplate(campaign?.whatsappTemplate, vars) || `Hi ${entry.name}! Your score: ${entry.score} pts, rank #${entry.rank}.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendTG = () => {
    const phone = (entry.phone || '').replace(/\D/g, '');
    window.open(`https://t.me/+${phone}`, '_blank');
  };

  const sendEmail = () => {
    const subject = `Your ${campaign?.title || 'AIESEC'} Quiz Results`;
    const body = renderTemplate(campaign?.emailTemplate, vars) || `Hi ${entry.name}, you scored ${entry.score} pts (rank #${entry.rank}).`;
    window.open(`mailto:${entry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: 6 }}>
      <button onClick={sendWA} title="WhatsApp" style={{ background: '#25D366', border: `1.5px solid ${T.ink}`, borderRadius: 7, padding: '5px 10px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
        WA
      </button>
      <button onClick={sendTG} title="Telegram" style={{ background: '#229ED9', color: '#fff', border: `1.5px solid ${T.ink}`, borderRadius: 7, padding: '5px 10px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
        TG
      </button>
      <button onClick={sendEmail} title="Email" style={{ background: T.yellow, border: `1.5px solid ${T.ink}`, borderRadius: 7, padding: '5px 10px', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}>
        ✉
      </button>
    </div>
  );
}

export default function AdminCampaignEntries() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState(null);
  const [entries, setEntries] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      api.get(`/campaigns/admin/${id}/full`),
      api.get(`/campaigns/${id}/entries?page=${page}&limit=50`),
    ])
      .then(([{ data: cd }, { data: ed }]) => {
        setCampaign(cd.campaign);
        setEntries(ed.entries || []);
        setTotal(ed.total || 0);
        setTotalPages(ed.totalPages || 1);
      })
      .catch(() => { toast.error('Failed to load'); navigate('/admin/campaigns'); })
      .finally(() => setLoading(false));
  }, [id, page]);

  const filtered = !search.trim() ? entries : entries.filter(e =>
    (e.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (e.email || '').toLowerCase().includes(search.toLowerCase())
  );

  const exportCSV = async () => {
    try {
      const { data } = await api.get('/admin/attempts/export', { responseType: 'blob', params: { campaignId: id } });
      const url = URL.createObjectURL(new Blob([data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${campaign?.title || 'campaign'}-entries.csv`;
      a.click();
    } catch {
      toast.error('Export failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <button onClick={() => navigate('/admin/campaigns')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, fontSize: 14, opacity: 0.55, marginBottom: 20, fontFamily: "'Inter', sans-serif", padding: 0 }}>
          ← Back to campaigns
        </button>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {campaign?.title || 'Campaign'} Entries
            </h1>
            <div style={{ opacity: 0.5, fontSize: 14 }}>{total} total entries</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <BigButton bg={T.muted} color={T.ink} size="sm" onClick={exportCSV}>Export CSV</BigButton>
            <BigButton bg={T.navy} color={T.bg} size="sm" onClick={() => navigate(`/admin/campaigns/${id}`)}>Edit campaign</BigButton>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: '100%', background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 12,
              padding: '10px 16px', color: T.ink, fontFamily: "'Inter', sans-serif",
              fontSize: 14, outline: 'none', boxShadow: `3px 3px 0 ${T.ink}`, boxSizing: 'border-box',
            }}
          />
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Array.from({ length: 8 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 58, borderRadius: 12 }} />)}
          </div>
        ) : (
          <div style={{ background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 18, overflow: 'hidden', boxShadow: `4px 4px 0 ${T.ink}` }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: T.muted }}>
                    {['#', 'Name', 'Email', 'Phone', 'Score', 'Correct', 'Time', 'Volunteer', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.6, whiteSpace: 'nowrap', borderBottom: `2px solid ${T.ink}` }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ padding: 40, textAlign: 'center', opacity: 0.4, fontWeight: 600 }}>
                        {search ? 'No entries match.' : 'No entries yet.'}
                      </td>
                    </tr>
                  ) : filtered.map((entry, i) => (
                    <motion.tr
                      key={entry._id || i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: `1px solid ${T.muted}` }}
                    >
                      <td style={{ padding: '11px 14px', fontFamily: DISP, fontWeight: 700, opacity: 0.5 }}>{entry.rank || i + 1}</td>
                      <td style={{ padding: '11px 14px', fontWeight: 600 }}>{entry.name}</td>
                      <td style={{ padding: '11px 14px', opacity: 0.65, fontSize: 13 }}>{entry.email}</td>
                      <td style={{ padding: '11px 14px', opacity: 0.65, fontSize: 13 }}>{entry.phone}</td>
                      <td style={{ padding: '11px 14px', fontFamily: DISP, fontWeight: 700, color: T.navy }}>{entry.score}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13 }}>{entry.correctAnswers}/{entry.totalQuestions}</td>
                      <td style={{ padding: '11px 14px', fontSize: 13, opacity: 0.6 }}>{entry.timeTaken}s</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                          background: entry.volunteerInterest ? T.green + '22' : T.muted,
                          color: entry.volunteerInterest ? T.green : T.ink,
                        }}>
                          {entry.volunteerInterest ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px', fontSize: 12, opacity: 0.5, whiteSpace: 'nowrap' }}>
                        {new Date(entry.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <ActionButtons entry={entry} campaign={campaign} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: '14px', borderTop: `2px solid ${T.muted}` }}>
                <button disabled={page === 1} onClick={() => setPage(p => p - 1)} style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', opacity: page === 1 ? 0.4 : 1 }}>
                  ←
                </button>
                <span style={{ fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center' }}>Page {page} of {totalPages}</span>
                <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)} style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: 'pointer', opacity: page === totalPages ? 0.4 : 1 }}>
                  →
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
