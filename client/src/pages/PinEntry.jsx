import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuiz } from '../context/QuizContext';
import api from '../utils/api';
import { T, LGStar, LGDiamond, FloatShape, BigButton, Pill } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";

export default function PinEntry() {
  const navigate = useNavigate();
  const { pin: paramPin } = useParams();
  const { setCampaign } = useQuiz();
  const [pin, setPin] = useState((paramPin || '').toUpperCase());
  const [loading, setLoading] = useState(false);
  const [campaign, setCampaignInfo] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (paramPin) {
      validatePin(paramPin.toUpperCase());
    } else {
      inputRef.current?.focus();
    }
  }, []);

  const validatePin = async (value) => {
    const p = (value || pin).toUpperCase().trim();
    if (!p || p.length < 4) return;
    setLoading(true);
    try {
      const { data } = await api.post('/campaigns/validate-pin', { pin: p });
      setCampaignInfo(data.campaign);
    } catch (err) {
      const msg = err.response?.data?.error || 'Invalid PIN';
      toast.error(msg);
      setCampaignInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePinChange = (e) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    setPin(val);
    setCampaignInfo(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (campaign) {
      setCampaign(campaign._id, campaign.title);
      navigate('/register');
    } else {
      await validatePin(pin);
    }
  };

  const handleContinue = () => {
    setCampaign(campaign._id, campaign.title);
    navigate('/register');
  };

  return (
    <div style={{ background: T.bg, color: T.ink, minHeight: '100vh', overflowX: 'hidden', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative' }}>

      <FloatShape top={60} left={40} delay={0} duration={4}><LGStar size={44} color={T.pink} /></FloatShape>
      <FloatShape bottom={80} right={60} delay={1.5} duration={5}><LGDiamond size={36} color={T.green} /></FloatShape>

      <div style={{ width: '100%', maxWidth: 480 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Pill bg={T.yellow} border={T.ink} style={{ marginBottom: 16 }}>Enter Campaign PIN</Pill>
            <h1 style={{
              fontFamily: DISP, fontWeight: 700,
              fontSize: 'clamp(30px, 5vw, 48px)',
              lineHeight: 0.95, letterSpacing: '-0.03em', marginBottom: 16,
            }}>
              Got a{' '}
              <span style={{ color: T.navy, fontStyle: 'italic' }}>PIN?</span>
            </h1>
            <p style={{ fontSize: 15, opacity: 0.65, lineHeight: 1.5 }}>
              Your LC admin shared a 6-character PIN.<br />Enter it below to join their campaign.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{
              background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 20,
              padding: '32px 28px', boxShadow: `6px 6px 0 ${T.ink}`, marginBottom: 16,
            }}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10, opacity: 0.6 }}>
                  Campaign PIN
                </label>
                <input
                  ref={inputRef}
                  value={pin}
                  onChange={handlePinChange}
                  placeholder="ABC123"
                  maxLength={6}
                  style={{
                    width: '100%', textAlign: 'center',
                    fontFamily: DISP, fontSize: 36, fontWeight: 700, letterSpacing: '0.2em',
                    background: T.muted, border: `2px solid ${T.ink}`, borderRadius: 14,
                    padding: '16px 20px', color: T.ink, outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {campaign && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    background: T.green + '22', border: `2px solid ${T.green}`,
                    borderRadius: 14, padding: '16px 18px', marginBottom: 16,
                  }}
                >
                  <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                    {campaign.title}
                  </div>
                  {campaign.admin?.lcName && (
                    <div style={{ fontSize: 13, opacity: 0.7 }}>
                      {campaign.admin.lcName} · {campaign.location || campaign.admin?.location || ''}
                    </div>
                  )}
                  {campaign.endTime && (
                    <div style={{ fontSize: 12, marginTop: 6, opacity: 0.6 }}>
                      Ends {new Date(campaign.endTime).toLocaleDateString()}
                    </div>
                  )}
                </motion.div>
              )}

              {campaign ? (
                <BigButton bg={T.green} color={T.ink} size="lg" arrow onClick={handleContinue} style={{ width: '100%', justifyContent: 'center' }}>
                  Join campaign
                </BigButton>
              ) : (
                <BigButton type="submit" bg={T.navy} color={T.bg} size="lg" disabled={loading || pin.length < 4} style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Checking…' : 'Verify PIN'}
                </BigButton>
              )}
            </div>
          </form>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => navigate('/register')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, fontSize: 14, opacity: 0.55, textDecoration: 'underline', fontFamily: "'Inter', sans-serif" }}
            >
              Skip — play without a campaign
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
