import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuiz } from '../context/QuizContext';
import api from '../utils/api';
import { T, LGStar, LGSpark, FloatShape, Marquee, BigButton, Pill } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";

export default function Register() {
  const navigate = useNavigate();
  const { setUser, setSessionId, campaignId, campaignTitle } = useQuiz();
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
      const payload = { ...form };
      if (campaignId) payload.campaignId = campaignId;
      const { data } = await api.post('/quiz/register', payload);
      setUser({ userName: form.name, userEmail: form.email, userPhone: form.phone });
      setSessionId(data.sessionId);
      toast.success(`Welcome, ${form.name}!`);
      navigate('/video');
    } catch (err) {
      const msg = err.response?.data?.error || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fieldStyle = (field) => ({
    width: '100%',
    background: 'rgba(255,255,255,0.1)',
    border: `1.5px solid ${errors[field] ? T.pink : 'rgba(255,255,255,0.25)'}`,
    borderRadius: 12, padding: '12px 14px',
    color: T.bg, fontFamily: "'Inter', sans-serif",
    fontWeight: 500, fontSize: 14, outline: 'none',
  });

  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif" }}>

      {/* ── URGENCY MARQUEE ── */}
      <div style={{ paddingTop: 0 }}>
        <Marquee
          items={['Claim your slot', 'Season 03 open', 'Abroad in 2025', "Don't sleep on this"]}
          bg={T.pink} color={T.ink} speed={22}
        />
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: 48, padding: '60px 60px 60px', alignItems: 'center',
        maxWidth: 1100, margin: '0 auto',
      }} className="register-grid">

        {/* ── LEFT: Headline ── */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} style={{ position: 'relative' }}>
          <Pill bg={T.yellow} border={T.ink} style={{ marginBottom: 20 }}>Save my seat</Pill>
          <h1 style={{
            fontFamily: DISP, fontWeight: 700,
            fontSize: 'clamp(36px, 5vw, 72px)',
            lineHeight: 0.92, letterSpacing: '-0.03em', marginBottom: 24,
          }}>
            Get your{' '}
            <span style={{ color: T.navy, fontStyle: 'italic' }}>archetype</span>
            <br />in the inbox.
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.5, maxWidth: 420, opacity: 0.8, marginBottom: 36 }}>
            We'll send your result, a breakdown of your leadership profile, and next steps for the volunteer abroad shortlist.
          </p>

          {/* Social proof */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}>
            <div style={{ display: 'flex' }}>
              {[T.pink, T.green, T.yellow, T.navy].map((c, i) => (
                <div key={i} style={{
                  width: 32, height: 32, borderRadius: 999, background: c,
                  border: `2px solid ${T.ink}`, marginLeft: i === 0 ? 0 : -8,
                }} />
              ))}
            </div>
            <div><strong>2,481+ players</strong> joined this season</div>
          </div>

          <FloatShape bottom={20} left={-10} delay={0.5} duration={3.5}><LGStar size={32} color={T.pink} /></FloatShape>
          <FloatShape top={20} right={20} delay={1} duration={4}><LGSpark size={26} color={T.green} /></FloatShape>
        </motion.div>

        {/* ── RIGHT: Form card ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            background: T.navy, color: T.bg,
            border: `2px solid ${T.ink}`, borderRadius: 28,
            padding: '36px 32px', boxShadow: `8px 8px 0 ${T.ink}`,
            position: 'relative',
          }}
        >
          <div style={{ fontFamily: DISP, fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 4 }}>
            Create your profile
          </div>
          <div style={{ fontSize: 13, opacity: 0.7, marginBottom: campaignTitle ? 10 : 28 }}>
            We'll email your personalised results.
          </div>
          {campaignTitle && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.green + '33', border: `1.5px solid ${T.green}`, borderRadius: 8, padding: '4px 10px', fontSize: 12, fontWeight: 600, marginBottom: 18, color: T.bg }}>
              Campaign: {campaignTitle}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { field: 'name', label: 'Full name', placeholder: 'Ahmad Fariz', type: 'text' },
                { field: 'email', label: 'Email address', placeholder: 'fariz@um.edu.my', type: 'email' },
                { field: 'phone', label: 'Phone number', placeholder: '012 345 6789', type: 'tel' },
              ].map(({ field, label, placeholder, type }) => (
                <div key={field}>
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6, fontWeight: 500 }}>{label} *</div>
                  <input
                    type={type}
                    style={fieldStyle(field)}
                    placeholder={placeholder}
                    value={form[field]}
                    onChange={e => setForm({ ...form, [field]: e.target.value })}
                  />
                  {errors[field] && (
                    <div style={{ color: T.yellow, fontSize: 12, marginTop: 4 }}>{errors[field]}</div>
                  )}
                </div>
              ))}

              <label style={{ display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', marginTop: 4 }}>
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={e => setForm({ ...form, consent: e.target.checked })}
                  style={{ width: 16, height: 16, marginTop: 3, accentColor: T.green, flexShrink: 0 }}
                />
                <span style={{ fontSize: 12, opacity: 0.75, lineHeight: 1.5 }}>
                  I agree to be contacted by AIESEC Malaysia about opportunities abroad and leadership programmes.
                </span>
              </label>

              <BigButton
                type="submit"
                bg={T.yellow}
                color={T.ink}
                size="lg"
                arrow
                disabled={loading}
                style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
              >
                {loading ? 'Registering…' : "Let's go"}
              </BigButton>
            </div>
          </form>
        </motion.div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .register-grid { grid-template-columns: 1fr !important; padding: 32px 24px !important; }
        }
      `}</style>
    </div>
  );
}
