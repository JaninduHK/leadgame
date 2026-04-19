import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { T, BigButton } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";

const inputStyle = {
  width: '100%', background: '#fff', border: `2px solid ${T.ink}`,
  borderRadius: 10, padding: '10px 14px', color: T.ink,
  fontFamily: "'Inter', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

const emptyForm = { name: '', email: '', password: '', lcName: '', location: '', role: 'lc' };

export default function AdminAdmins() {
  const { adminInfo } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/auth/admins')
      .then(({ data }) => setAdmins(data.admins || []))
      .catch(() => toast.error('Failed to load admins'))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };
  const openEdit = (admin) => { setEditing(admin); setForm({ name: admin.name, email: admin.email, password: '', lcName: admin.lcName || '', location: admin.location || '', role: admin.role }); setShowForm(true); };
  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email) { toast.error('Name and email are required'); return; }
    if (!editing && form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/auth/admins/${editing._id}`, form);
        setAdmins(prev => prev.map(a => a._id === editing._id ? data.admin : a));
        toast.success('Admin updated');
      } else {
        const { data } = await api.post('/auth/admins', form);
        setAdmins(prev => [data.admin, ...prev]);
        toast.success('Admin created');
      }
      setShowForm(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (admin) => {
    if (admin._id === adminInfo?.id) { toast.error("You can't delete yourself"); return; }
    if (!confirm(`Delete admin "${admin.name}"?`)) return;
    try {
      await api.delete(`/auth/admins/${admin._id}`);
      setAdmins(prev => prev.filter(a => a._id !== admin._id));
      toast.success('Admin deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 32, letterSpacing: '-0.02em', marginBottom: 4 }}>LC Admins</h1>
            <div style={{ opacity: 0.5, fontSize: 14 }}>{admins.length} admins total</div>
          </div>
          <BigButton bg={T.pink} color={T.ink} size="md" arrow onClick={openCreate}>
            Add admin
          </BigButton>
        </div>

        {/* Form modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(20,20,43,0.6)', zIndex: 100,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
            }}
            onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
          >
            <div style={{ background: T.bg, border: `2px solid ${T.ink}`, borderRadius: 20, padding: '32px 28px', boxShadow: `6px 6px 0 ${T.ink}`, width: '100%', maxWidth: 480 }}>
              <h2 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, marginBottom: 24 }}>
                {editing ? 'Edit admin' : 'New LC admin'}
              </h2>
              <form onSubmit={handleSave}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { field: 'name', label: 'Full name *', placeholder: 'Ahmad Rafiq', type: 'text' },
                    { field: 'email', label: 'Email *', placeholder: 'rafiq@aiesec.org.my', type: 'email' },
                    { field: 'password', label: editing ? 'New password (leave blank to keep)' : 'Password *', placeholder: editing ? '••••••••' : 'Min 6 characters', type: 'password' },
                    { field: 'lcName', label: 'LC Name', placeholder: 'AIESEC UTM', type: 'text' },
                    { field: 'location', label: 'Location', placeholder: 'Johor Bahru', type: 'text' },
                  ].map(({ field, label, placeholder, type }) => (
                    <div key={field}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.5, marginBottom: 6 }}>{label}</label>
                      <input type={type} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={placeholder} style={inputStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.5, marginBottom: 6 }}>Role</label>
                    <select value={form.role} onChange={e => set('role', e.target.value)} style={inputStyle}>
                      <option value="lc">LC Admin</option>
                      <option value="superAdmin">Super Admin</option>
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 22 }}>
                  <BigButton type="button" bg={T.muted} color={T.ink} size="md" onClick={() => setShowForm(false)}>Cancel</BigButton>
                  <BigButton type="submit" bg={T.pink} color={T.ink} size="md" arrow disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create admin'}</BigButton>
                </div>
              </form>
            </div>
          </motion.div>
        )}

        {/* Table */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 14 }} />)}
          </div>
        ) : (
          <div style={{ background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 18, overflow: 'hidden', boxShadow: `4px 4px 0 ${T.ink}` }}>
            {admins.length === 0 ? (
              <div style={{ padding: 40, textAlign: 'center', opacity: 0.4, fontWeight: 600 }}>No admins yet.</div>
            ) : admins.map((admin, i) => (
              <motion.div
                key={admin._id || i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', borderBottom: i < admins.length - 1 ? `1px solid ${T.muted}` : 'none' }}
              >
                <div style={{ width: 42, height: 42, borderRadius: 12, background: admin.role === 'superAdmin' ? T.navy : T.green, border: `2px solid ${T.ink}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: T.bg, fontFamily: DISP, fontWeight: 700, fontSize: 16, flexShrink: 0 }}>
                  {(admin.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {admin.name}
                    {admin._id === adminInfo?.id && <span style={{ fontSize: 11, opacity: 0.5 }}>(you)</span>}
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 5, background: admin.role === 'superAdmin' ? T.navy + '22' : T.green + '22', color: admin.role === 'superAdmin' ? T.navy : T.green }}>
                      {admin.role === 'superAdmin' ? 'Super Admin' : 'LC Admin'}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, opacity: 0.55 }}>
                    {admin.email} {admin.lcName && `· ${admin.lcName}`} {admin.location && `· ${admin.location}`}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  <button onClick={() => openEdit(admin)} style={{ background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 8, padding: '5px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: DISP }}>
                    Edit
                  </button>
                  {admin._id !== adminInfo?.id && (
                    <button onClick={() => handleDelete(admin)} style={{ background: 'none', color: '#e53', border: `1.5px solid #e53`, borderRadius: 8, padding: '5px 12px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: DISP }}>
                      Delete
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
