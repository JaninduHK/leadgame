import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Mascot from '../components/Mascot';
import { useQuiz } from '../context/QuizContext';
import api from '../utils/api';

const steps = ['Register', 'Watch', 'Quiz', 'Results'];

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setSessionId } = useQuiz();
  const [form, setForm] = useState({ name: '', email: '', phone: '', consent: true });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim() || form.phone.length < 8) errs.phone = 'Valid phone required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    try {
      const { data } = await api.post('/quiz/register', form);
      setUser({ userName: form.name, userEmail: form.email, userPhone: form.phone });
      setSessionId(data.sessionId);
      toast.success(`Welcome, ${form.name}! 🎉`);
      navigate('/video');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: `1px solid ${errors[field] ? '#F85A40' : 'rgba(255,255,255,0.15)'}`,
    borderRadius: 12, padding: '14px 16px',
    color: 'white', fontFamily: 'Nunito, sans-serif',
    fontWeight: 700, fontSize: 15, outline: 'none',
    transition: 'border-color 0.2s',
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', display: 'flex', alignItems: 'center' }}>
      {/* Background orbs */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,126,243,0.12) 0%, transparent 70%)', top: '-100px', right: '-100px' }} />
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,177,75,0.1) 0%, transparent 70%)', bottom: '-100px', left: '-50px' }} />
      </div>

      <div style={{
        display: 'flex', gap: 0, maxWidth: 1000, margin: '80px auto',
        padding: '0 24px', width: '100%', position: 'relative', zIndex: 1,
      }}>
        {/* Left — Journey steps */}
        <div className="desktop-only" style={{
          flex: '0 0 340px', padding: '40px 32px',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 32,
        }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 32, marginBottom: 8 }}>Your Journey</h1>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, lineHeight: 1.6 }}>
              4 simple steps to discover your global leadership potential.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {steps.map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 900, fontSize: 14,
                  background: i === 0
                    ? 'linear-gradient(135deg, #037EF3, #0DB14B)'
                    : 'rgba(255,255,255,0.08)',
                  color: i === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                  border: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.1)',
                }}>
                  {i === 0 ? '✓' : i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', left: 59, width: 2, height: 16, background: 'rgba(255,255,255,0.1)', marginTop: 40 }} />
                )}
                <div>
                  <div style={{
                    fontWeight: 800, fontSize: 15,
                    color: i === 0 ? 'white' : 'rgba(255,255,255,0.4)',
                  }}>
                    {['Register ←', 'Watch Video', 'Take Quiz', 'Get Results'][i]}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{
            background: 'rgba(3,126,243,0.1)', borderRadius: 16, padding: '20px',
            border: '1px solid rgba(3,126,243,0.2)',
          }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 8, color: '#037EF3' }}>💡 Did you know?</div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>
              AIESEC operates in 120+ countries and has empowered over 1 million young people through international experiences.
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card"
          style={{ flex: 1, padding: '40px 36px', position: 'relative' }}
        >
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
            {steps.map((s, i) => (
              <div key={s} style={{
                height: 8, borderRadius: 4, transition: 'all 0.3s',
                flex: i === 0 ? 2 : 1,
                background: i === 0 ? 'linear-gradient(90deg, #037EF3, #0DB14B)' : 'rgba(255,255,255,0.1)',
              }} />
            ))}
          </div>

          <h2 style={{ fontWeight: 900, fontSize: 26, marginBottom: 6 }}>Create Your Profile 👤</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 28 }}>
            We'll send your personalised results to your email!
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {/* Name */}
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>
                  Full Name *
                </label>
                <input
                  style={inputStyle('name')}
                  placeholder="e.g. Ahmad Fariz"
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <div style={{ color: '#F85A40', fontSize: 12, marginTop: 4 }}>{errors.name}</div>}
              </div>

              {/* Email */}
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>
                  Email Address *
                </label>
                <input
                  style={inputStyle('email')}
                  type="email"
                  placeholder="e.g. fariz@um.edu.my"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <div style={{ color: '#F85A40', fontSize: 12, marginTop: 4 }}>{errors.email}</div>}
              </div>

              {/* Phone */}
              <div>
                <label style={{ display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 6, color: 'rgba(255,255,255,0.7)' }}>
                  Phone Number *
                </label>
                <input
                  style={inputStyle('phone')}
                  placeholder="e.g. 0123456789"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <div style={{ color: '#F85A40', fontSize: 12, marginTop: 4 }}>{errors.phone}</div>}
              </div>

              {/* Consent */}
              <label style={{ display: 'flex', gap: 12, alignItems: 'flex-start', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => setForm({ ...form, consent: e.target.checked })}
                  style={{ width: 18, height: 18, marginTop: 2, accentColor: '#037EF3' }}
                />
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                  I agree to be contacted by AIESEC Malaysia about opportunities abroad and leadership programmes.
                </span>
              </label>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.02 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
                style={{
                  width: '100%',
                  background: loading ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #037EF3, #0DB14B)',
                  color: 'white', border: 'none', borderRadius: 14,
                  padding: '16px', fontFamily: 'Nunito, sans-serif',
                  fontWeight: 900, fontSize: 17, cursor: loading ? 'not-allowed' : 'pointer',
                  marginTop: 8,
                }}
              >
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                    <span className="anim-spin" style={{ display: 'inline-block', width: 18, height: 18, border: '3px solid rgba(255,255,255,0.3)', borderTop: '3px solid white', borderRadius: '50%' }} />
                    Registering...
                  </span>
                ) : 'Let\'s Go! 🚀'}
              </motion.button>
            </div>
          </form>

          {/* Mascot in corner */}
          <div style={{ position: 'absolute', bottom: -10, right: -10 }} className="desktop-only">
            <Mascot pose="reading" size={90} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}
