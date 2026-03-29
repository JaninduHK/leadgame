import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import api from '../../utils/api';

export default function AdminVideo() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', url: '', maxViews: 2 });
  const [editId, setEditId] = useState(null);
  const [preview, setPreview] = useState('');

  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/video');
      setVideos(data);
      if (data.length > 0) {
        const active = data.find(v => v.isActive) || data[0];
        setForm({ title: active.title, url: active.url, maxViews: active.maxViews });
        setEditId(active._id);
        setPreview(active.url);
      }
    } catch { toast.error('Failed to load videos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadVideos(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.url.trim()) {
      toast.error('Title and URL are required');
      return;
    }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/video/${editId}`, form);
        toast.success('Video updated!');
      } else {
        await api.post('/admin/video', form);
        toast.success('Video created!');
      }
      setPreview(form.url);
      loadVideos();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save video');
    } finally {
      setSaving(false);
    }
  };

  const handleAddNew = () => {
    setForm({ title: '', url: '', maxViews: 2 });
    setEditId(null);
    setPreview('');
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
    padding: '12px 14px', color: 'white', fontFamily: 'Nunito, sans-serif',
    fontWeight: 700, fontSize: 15, outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 26 }}>🎬 Video Management</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Set the video students watch before the quiz</p>
          </div>
          <button
            onClick={handleAddNew}
            style={{
              background: 'rgba(255,200,69,0.2)', border: '1px solid rgba(255,200,69,0.4)',
              color: '#FFC845', borderRadius: 10, padding: '10px 20px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}
          >+ Add New</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card"
            style={{ padding: '28px' }}
          >
            <h2 style={{ fontWeight: 900, fontSize: 18, marginBottom: 20 }}>
              {editId ? '✏️ Edit Video' : '➕ Add Video'}
            </h2>
            <form onSubmit={handleSave}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>VIDEO TITLE</label>
                  <input
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    placeholder="AIESEC Introduction Video"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>VIDEO URL</label>
                  <input
                    value={form.url}
                    onChange={e => {
                      setForm({ ...form, url: e.target.value });
                      setPreview(e.target.value);
                    }}
                    placeholder="https://www.youtube.com/watch?v=..."
                    style={inputStyle}
                  />
                  <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>
                    Supports YouTube, Vimeo, and direct video URLs
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>
                    MAX VIEWS PER USER (1–10)
                  </label>
                  <input
                    type="number" min="1" max="10"
                    value={form.maxViews}
                    onChange={e => setForm({ ...form, maxViews: parseInt(e.target.value) })}
                    style={inputStyle}
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: saving ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #037EF3, #0DB14B)',
                    color: 'white', border: 'none', borderRadius: 10, padding: '14px',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15,
                    cursor: saving ? 'not-allowed' : 'pointer', marginTop: 8,
                  }}
                >
                  {saving ? 'Saving...' : editId ? '💾 Update Video' : '✅ Set as Active Video'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card" style={{ padding: '20px', marginBottom: 16 }}>
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14 }}>📺 Preview</h2>
              {preview && ReactPlayer.canPlay(preview) ? (
                <div style={{ position: 'relative', paddingTop: '56.25%', borderRadius: 12, overflow: 'hidden', background: '#000' }}>
                  <ReactPlayer
                    url={preview}
                    width="100%" height="100%"
                    style={{ position: 'absolute', top: 0, left: 0 }}
                    controls
                  />
                </div>
              ) : (
                <div style={{
                  height: 160, borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                  border: '1px dashed rgba(255,255,255,0.15)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexDirection: 'column', gap: 8, color: 'rgba(255,255,255,0.3)',
                }}>
                  <div style={{ fontSize: 36 }}>🎬</div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>Enter a URL to preview</div>
                </div>
              )}
            </div>

            {/* Video list */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={{ fontWeight: 900, fontSize: 16, marginBottom: 14 }}>All Videos</h2>
              {loading ? (
                <div className="skeleton" style={{ height: 60, borderRadius: 10 }} />
              ) : videos.length === 0 ? (
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, fontWeight: 700 }}>No videos configured</div>
              ) : videos.map(v => (
                <div key={v._id} style={{
                  padding: '12px', borderRadius: 10, marginBottom: 8,
                  background: v.isActive ? 'rgba(3,126,243,0.1)' : 'rgba(255,255,255,0.04)',
                  border: v.isActive ? '1px solid rgba(3,126,243,0.3)' : '1px solid transparent',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer',
                }} onClick={() => {
                  setForm({ title: v.title, url: v.url, maxViews: v.maxViews });
                  setEditId(v._id);
                  setPreview(v.url);
                }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{v.title}</div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>Max views: {v.maxViews}</div>
                  </div>
                  <span style={{
                    background: v.isActive ? 'rgba(13,177,75,0.2)' : 'rgba(255,255,255,0.05)',
                    color: v.isActive ? '#0DB14B' : 'rgba(255,255,255,0.3)',
                    borderRadius: 6, padding: '3px 8px', fontSize: 11, fontWeight: 800,
                  }}>
                    {v.isActive ? '● Active' : 'Inactive'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
