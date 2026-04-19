import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../../utils/api';
import { T, BigButton, Pill } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";
const BASE_URL = window.location.origin;

function CampaignRow({ campaign, onDelete }) {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const playUrl = `${BASE_URL}/play/${campaign.pin}`;
  const isActive = campaign.isActive && (!campaign.endTime || new Date(campaign.endTime) > new Date());

  const handleDelete = async () => {
    if (!confirm(`Delete "${campaign.title}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/campaigns/${campaign._id}`);
      toast.success('Campaign deleted');
      onDelete(campaign._id);
    } catch {
      toast.error('Failed to delete campaign');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 16,
        padding: '18px 20px', boxShadow: `3px 3px 0 ${T.ink}`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 17 }}>{campaign.title}</div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
              background: isActive ? T.green + '22' : T.muted,
              border: `1.5px solid ${isActive ? T.green : T.ink + '33'}`,
              color: isActive ? T.green : T.ink,
            }}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div style={{ fontSize: 13, opacity: 0.6, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {campaign.location && <span>📍 {campaign.location}</span>}
            <span>👥 {campaign.entryCount ?? '—'} entries</span>
            {campaign.startTime && <span>📅 {new Date(campaign.startTime).toLocaleDateString()}</span>}
          </div>
          {/* PIN */}
          <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              fontFamily: DISP, fontWeight: 700, fontSize: 20, letterSpacing: '0.18em',
              background: T.yellow, border: `2px solid ${T.ink}`, borderRadius: 8,
              padding: '4px 12px', color: T.ink,
            }}>
              {campaign.pin}
            </div>
            <button
              onClick={() => { navigator.clipboard.writeText(playUrl); toast.success('Link copied!'); }}
              style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            >
              Copy link
            </button>
            <button
              onClick={() => setShowQR(!showQR)}
              style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}
            >
              {showQR ? 'Hide QR' : 'QR code'}
            </button>
          </div>
          {showQR && (
            <div style={{ marginTop: 12, display: 'inline-block', background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 12, padding: 10 }}>
              <QRCodeCanvas value={playUrl} size={120} />
              <div style={{ fontSize: 10, textAlign: 'center', marginTop: 6, opacity: 0.5, fontFamily: "'Inter', sans-serif" }}>{playUrl}</div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate(`/admin/campaigns/${campaign._id}/entries`)}
            style={{ background: T.navy, color: T.bg, border: `2px solid ${T.ink}`, borderRadius: 10, padding: '7px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: DISP }}
          >
            Entries
          </button>
          <button
            onClick={() => navigate(`/admin/campaigns/${campaign._id}`)}
            style={{ background: T.muted, color: T.ink, border: `2px solid ${T.ink}`, borderRadius: 10, padding: '7px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: DISP }}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{ background: 'none', color: '#e53', border: `2px solid #e53`, borderRadius: 10, padding: '7px 14px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: DISP }}
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function AdminCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/campaigns/admin/mine')
      .then(({ data }) => setCampaigns(data.campaigns || []))
      .catch(() => toast.error('Failed to load campaigns'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = (id) => setCampaigns(prev => prev.filter(c => c._id !== id));

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>Campaigns</h1>
            <div style={{ opacity: 0.5, fontSize: 14 }}>{campaigns.length} campaigns total</div>
          </div>
          <BigButton bg={T.pink} color={T.ink} size="md" arrow onClick={() => navigate('/admin/campaigns/new')}>
            New campaign
          </BigButton>
        </div>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 120, borderRadius: 16 }} />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div style={{
            textAlign: 'center', background: '#fff', border: `2px solid ${T.ink}`,
            borderRadius: 20, padding: 48, boxShadow: `4px 4px 0 ${T.ink}`,
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🏕</div>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No campaigns yet</div>
            <div style={{ opacity: 0.5, fontSize: 14, marginBottom: 24 }}>Create your first campaign to get started.</div>
            <BigButton bg={T.pink} color={T.ink} size="md" arrow onClick={() => navigate('/admin/campaigns/new')}>
              Create campaign
            </BigButton>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {campaigns.map(c => <CampaignRow key={c._id} campaign={c} onDelete={handleDelete} />)}
          </div>
        )}
      </div>
    </div>
  );
}
