import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { T, BigButton } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";

function ActionButtons({ entry }) {
  const sendWA = () => {
    const phone = (entry.phone || '').replace(/\D/g, '');
    const msg = `Hi ${entry.name}! You scored ${entry.score} pts on the AIESEC quiz. Interested in volunteering abroad? Let's connect!`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const sendTG = () => {
    const phone = (entry.phone || '').replace(/\D/g, '');
    window.open(`https://t.me/+${phone}`, '_blank');
  };

  const sendEmail = () => {
    const subject = `Your AIESEC Quiz Results`;
    const body = `Hi ${entry.name},\n\nYou scored ${entry.score} points on the AIESEC Malaysia Quiz!\n\nRank: #${entry.rank}\nAccuracy: ${entry.totalQuestions > 0 ? Math.round((entry.correctAnswers / entry.totalQuestions) * 100) : 0}%\n\nInterested in going abroad with AIESEC? Let's talk!`;
    window.open(`mailto:${entry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', gap: 5 }}>
      <button onClick={sendWA} title="WhatsApp" style={{ background: '#25D366', border: `1.5px solid ${T.ink}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>WA</button>
      <button onClick={sendTG} title="Telegram" style={{ background: '#229ED9', color: '#fff', border: `1.5px solid ${T.ink}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>TG</button>
      <button onClick={sendEmail} title="Email" style={{ background: T.yellow, border: `1.5px solid ${T.ink}`, borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer', fontWeight: 700 }}>✉</button>
    </div>
  );
}

const inputStyle = {
  background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 10,
  padding: '8px 12px', color: T.ink,
  fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, outline: 'none',
};

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [campaigns, setCampaigns] = useState([]);

  const [filters, setFilters] = useState({
    sortBy: 'createdAt', sortOrder: 'desc',
    volunteerInterest: 'all', startDate: '', endDate: '', campaignId: '',
  });

  const loadAttempts = async (p = page, f = filters) => {
    setLoading(true);
    try {
      const params = { page: p, limit: 20, sortBy: f.sortBy, sortOrder: f.sortOrder };
      if (f.volunteerInterest !== 'all') params.volunteerInterest = f.volunteerInterest;
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate) params.endDate = f.endDate;
      if (f.campaignId) params.campaignId = f.campaignId;

      const { data } = await api.get('/admin/attempts', { params });
      setAttempts(data.attempts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttempts();
    api.get('/campaigns/admin/mine').then(({ data }) => setCampaigns(data.campaigns || [])).catch(() => {});
  }, []);

  const handleFilterChange = (key, val) => {
    const f = { ...filters, [key]: val };
    setFilters(f);
    setPage(1);
    loadAttempts(1, f);
  };

  const handleExport = async () => {
    try {
      const params = filters.campaignId ? { campaignId: filters.campaignId } : {};
      const response = await api.get('/admin/attempts/export', { responseType: 'blob', params });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'attempts.csv'; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch { toast.error('Export failed'); }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', marginBottom: 4 }}>All Attempts</h1>
            <div style={{ opacity: 0.5, fontSize: 14 }}>{total} total submissions</div>
          </div>
          <BigButton bg={T.green + '44'} color={T.ink} size="sm" onClick={handleExport}>Export CSV</BigButton>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 14, padding: '14px 18px', marginBottom: 18, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', boxShadow: `3px 3px 0 ${T.ink}` }}>
          {[
            { key: 'sortBy', label: 'Sort by', options: [['createdAt', 'Date'], ['score', 'Score'], ['timeTaken', 'Time']] },
            { key: 'sortOrder', label: 'Order', options: [['desc', 'Desc'], ['asc', 'Asc']] },
            { key: 'volunteerInterest', label: 'Volunteer', options: [['all', 'All'], ['true', 'Yes'], ['false', 'No']] },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.5, marginBottom: 4 }}>{label}</label>
              <select value={filters[key]} onChange={e => handleFilterChange(key, e.target.value)} style={inputStyle}>
                {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          ))}
          {campaigns.length > 0 && (
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.5, marginBottom: 4 }}>Campaign</label>
              <select value={filters.campaignId} onChange={e => handleFilterChange('campaignId', e.target.value)} style={inputStyle}>
                <option value="">All campaigns</option>
                {campaigns.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.5, marginBottom: 4 }}>From date</label>
            <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.5, marginBottom: 4 }}>To date</label>
            <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Table */}
        <div style={{ background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 18, overflow: 'hidden', boxShadow: `4px 4px 0 ${T.ink}` }}>
          {loading ? (
            <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10 }} />)}
            </div>
          ) : attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, opacity: 0.4, fontWeight: 600 }}>No attempts found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                <thead>
                  <tr style={{ background: T.muted }}>
                    {['#', 'Name', 'Email', 'Phone', 'Campaign', 'Score', 'Correct', 'Volunteer', 'Date', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '11px 13px', textAlign: 'left', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.55, borderBottom: `2px solid ${T.ink}`, whiteSpace: 'nowrap' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a, i) => (
                    <motion.tr
                      key={a._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: `1px solid ${T.muted}` }}
                    >
                      <td style={{ padding: '10px 13px', opacity: 0.4, fontFamily: DISP, fontWeight: 700 }}>{(page - 1) * 20 + i + 1}</td>
                      <td style={{ padding: '10px 13px', fontWeight: 600 }}>{a.name}</td>
                      <td style={{ padding: '10px 13px', opacity: 0.6, fontSize: 13 }}>{a.email}</td>
                      <td style={{ padding: '10px 13px', opacity: 0.6, fontSize: 13 }}>{a.phone}</td>
                      <td style={{ padding: '10px 13px', fontSize: 13, opacity: 0.65 }}>{a.campaign?.title || '—'}</td>
                      <td style={{ padding: '10px 13px', fontFamily: DISP, fontWeight: 700, color: T.navy }}>{a.score}</td>
                      <td style={{ padding: '10px 13px', fontSize: 13 }}>{a.correctAnswers}/{a.totalQuestions}</td>
                      <td style={{ padding: '10px 13px' }}>
                        <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: a.volunteerInterest ? T.green + '22' : T.muted, color: a.volunteerInterest ? T.green : T.ink }}>
                          {a.volunteerInterest ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 13px', fontSize: 12, opacity: 0.45, whiteSpace: 'nowrap' }}>
                        {new Date(a.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 13px' }}>
                        <ActionButtons entry={a} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: '14px', borderTop: `2px solid ${T.muted}` }}>
              <button disabled={page <= 1} onClick={() => { setPage(p => p - 1); loadAttempts(page - 1); }} style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: page <= 1 ? 'default' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}>←</button>
              <span style={{ fontSize: 14, fontWeight: 600 }}>Page {page} of {totalPages}</span>
              <button disabled={page >= totalPages} onClick={() => { setPage(p => p + 1); loadAttempts(page + 1); }} style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '5px 14px', fontWeight: 700, cursor: page >= totalPages ? 'default' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}>→</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
