import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.admin);
      toast.success(`Welcome back, ${data.admin.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: '#0A1628',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
    }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,126,243,0.1) 0%, transparent 70%)', top: '-100px', right: '-100px' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ width: '100%', maxWidth: 420, padding: '48px 36px' }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
            borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 12px',
          }}>⚙️</div>
          <h1 style={{ fontWeight: 900, fontSize: 24, marginBottom: 4 }}>Admin Login</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>AIESEC Malaysia Quiz Platform</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="admin@aiesec.org.my"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '12px 16px',
                  color: 'white', fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700, fontSize: 15, outline: 'none',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>
                Password
              </label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 12, padding: '12px 16px',
                  color: 'white', fontFamily: 'Nunito, sans-serif',
                  fontWeight: 700, fontSize: 15, outline: 'none',
                }}
              />
            </div>
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              style={{
                background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #037EF3, #0DB14B)',
                color: 'white', border: 'none', borderRadius: 12,
                padding: '14px', fontFamily: 'Nunito, sans-serif',
                fontWeight: 800, fontSize: 16, cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: 8,
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </div>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>
          Default: admin@aiesec.org.my / Admin@123456
        </p>
      </motion.div>
    </div>
  );
}
