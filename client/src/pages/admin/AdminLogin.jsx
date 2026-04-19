import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';
import { T, LGStar, LGDiamond, FloatShape, BigButton } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";

export default function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.admin);
      toast.success(`Welcome back, ${data.admin.name}!`);
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', background: T.bg, color: T.ink,
      display: 'flex', fontFamily: "'Inter', sans-serif",
      position: 'relative', overflowX: 'hidden',
    }}>
      {/* Floating shapes */}
      <FloatShape top={80} left={60} delay={0} duration={4}><LGStar size={44} color={T.pink} /></FloatShape>
      <FloatShape bottom={100} right={80} delay={1.2} duration={5}><LGDiamond size={32} color={T.green} /></FloatShape>
      <FloatShape top="40%" left="30%" delay={0.6} duration={3.5}><LGStar size={20} color={T.yellow} /></FloatShape>

      {/* Left brand panel */}
      <div style={{
        width: '44%', background: T.navy, borderRight: `2px solid ${T.ink}`,
        display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px 56px', position: 'relative', overflow: 'hidden',
      }} className="admin-login-brand">
        {/* Big decorative number */}
        <div style={{
          position: 'absolute', right: -20, top: '50%', transform: 'translateY(-50%)',
          fontFamily: DISP, fontWeight: 700, fontSize: 220, lineHeight: 1,
          color: 'rgba(255,255,255,0.04)', userSelect: 'none', pointerEvents: 'none',
          letterSpacing: '-0.05em',
        }}>LG</div>

        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* Logo mark */}
          <div style={{ marginBottom: 64 }}>
            <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 20, color: T.bg, letterSpacing: '-0.02em' }}>LEAD GAME</span>
          </div>

          <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 'clamp(32px, 3vw, 48px)', color: T.bg, lineHeight: 1.0, letterSpacing: '-0.03em', marginBottom: 20 }}>
            Admin<br />
            <span style={{ color: T.yellow }}>Portal.</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, maxWidth: 320, marginBottom: 48 }}>
            Manage campaigns, track entries, and connect with players across Malaysia.
          </p>

          {/* Stats strip */}
          <div style={{ display: 'flex', gap: 32 }}>
            {[['Campaigns', 'running live'], ['Entries', 'this season'], ['LCs', 'connected']].map(([v, l]) => (
              <div key={l}>
                <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 22, color: T.bg, letterSpacing: '-0.02em' }}>—</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px',
      }} className="admin-login-form">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <div style={{ marginBottom: 36 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', marginBottom: 6 }}>
              Sign in
            </div>
            <div style={{ fontSize: 14, opacity: 0.5 }}>Access the AIESEC Malaysia admin panel.</div>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { field: 'email', label: 'Email address', type: 'email', placeholder: 'admin@aiesec.org.my' },
                { field: 'password', label: 'Password', type: 'password', placeholder: '••••••••' },
              ].map(({ field, label, type, placeholder }) => (
                <div key={field}>
                  <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', opacity: 0.5, marginBottom: 8 }}>
                    {label}
                  </label>
                  <input
                    type={type}
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    autoComplete={field}
                    style={{
                      width: '100%', background: '#fff',
                      border: `2px solid ${T.ink}`, borderRadius: 12,
                      padding: '13px 16px', color: T.ink,
                      fontFamily: "'Inter', sans-serif", fontWeight: 500, fontSize: 15,
                      outline: 'none', boxSizing: 'border-box',
                      boxShadow: `3px 3px 0 ${T.ink}`,
                      transition: 'box-shadow 0.12s, transform 0.12s',
                    }}
                    onFocus={e => { e.target.style.boxShadow = `4px 4px 0 ${T.navy}`; e.target.style.borderColor = T.navy; }}
                    onBlur={e => { e.target.style.boxShadow = `3px 3px 0 ${T.ink}`; e.target.style.borderColor = T.ink; }}
                  />
                </div>
              ))}

              <BigButton
                type="submit"
                bg={T.navy}
                color={T.bg}
                size="lg"
                arrow
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </BigButton>
            </div>
          </form>

          <div style={{ marginTop: 24, padding: '14px 16px', background: T.muted, border: `1.5px solid ${T.ink}`, borderRadius: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.45, marginBottom: 4 }}>Default credentials</div>
            <div style={{ fontSize: 12, opacity: 0.6, fontFamily: 'monospace' }}>admin@aiesec.org.my · Admin@123456</div>
          </div>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 700px) {
          .admin-login-brand { display: none !important; }
          .admin-login-form { padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}
