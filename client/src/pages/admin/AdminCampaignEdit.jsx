import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { T, BigButton } from '../../components/ui';

const DISP = "'Space Grotesk', sans-serif";

const DEFAULT_EMAIL = `Hi {{name}},

You just completed the {{campaign}} quiz!

Here are your results:
Score: {{score}} points
Rank: #{{rank}}
Accuracy: {{accuracy}}%

Stay connected with AIESEC Malaysia to explore opportunities abroad!`;

const DEFAULT_WHATSAPP = `Hi {{name}}! 👋 Great job completing the {{campaign}} quiz! You scored {{score}} pts and ranked #{{rank}}. Interested in volunteering abroad? Let's talk!`;

const DEFAULT_TELEGRAM = `Hey {{name}}! Your {{campaign}} quiz results are in 🎉 Score: {{score}} | Rank: #{{rank}} | Accuracy: {{accuracy}}%`;

function FieldGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <label style={{ display: 'block', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', opacity: 0.55, marginBottom: 7 }}>
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', background: '#fff', border: `2px solid ${T.ink}`,
  borderRadius: 10, padding: '10px 14px', color: T.ink,
  fontFamily: "'Inter', sans-serif", fontSize: 14, outline: 'none', boxSizing: 'border-box',
};

function QuestionEditor({ questions, onChange }) {
  const addQuestion = () => {
    onChange([...questions, {
      _id: `q_${Date.now()}`, text: '', options: [
        { label: '', value: 'A' }, { label: '', value: 'B' },
        { label: '', value: 'C' }, { label: '', value: 'D' },
      ], correctAnswer: 'A', timeLimit: 30, points: 100, order: questions.length + 1,
    }]);
  };

  const updateQ = (i, field, value) => {
    const updated = questions.map((q, idx) => idx === i ? { ...q, [field]: value } : q);
    onChange(updated);
  };

  const updateOption = (qi, oi, value) => {
    const updated = questions.map((q, idx) => {
      if (idx !== qi) return q;
      const opts = q.options.map((o, j) => j === oi ? { ...o, label: value } : o);
      return { ...q, options: opts };
    });
    onChange(updated);
  };

  const removeQ = (i) => onChange(questions.filter((_, idx) => idx !== i));

  return (
    <div>
      {questions.map((q, i) => (
        <div key={q._id || i} style={{ background: T.muted, border: `2px solid ${T.ink}`, borderRadius: 14, padding: '16px 18px', marginBottom: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 15 }}>Question {i + 1}</div>
            <button onClick={() => removeQ(i)} style={{ background: 'none', border: 'none', color: '#e53', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Remove</button>
          </div>
          <div style={{ marginBottom: 10 }}>
            <textarea
              value={q.text}
              onChange={e => updateQ(i, 'text', e.target.value)}
              placeholder="Question text"
              rows={2}
              style={{ ...inputStyle, resize: 'vertical' }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
            {['A', 'B', 'C', 'D'].map((letter, oi) => (
              <div key={letter} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: DISP, fontWeight: 700, fontSize: 14, width: 20, flexShrink: 0 }}>{letter}</span>
                <input
                  value={q.options[oi]?.label || ''}
                  onChange={e => updateOption(i, oi, e.target.value)}
                  placeholder={`Option ${letter}`}
                  style={inputStyle}
                />
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 140 }}>
              <label style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, display: 'block', marginBottom: 4 }}>Correct answer</label>
              <select value={q.correctAnswer} onChange={e => updateQ(i, 'correctAnswer', e.target.value)} style={inputStyle}>
                {['A', 'B', 'C', 'D'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, display: 'block', marginBottom: 4 }}>Time limit (s)</label>
              <input type="number" min={10} max={60} value={q.timeLimit} onChange={e => updateQ(i, 'timeLimit', parseInt(e.target.value))} style={inputStyle} />
            </div>
            <div style={{ flex: 1, minWidth: 120 }}>
              <label style={{ fontSize: 11, fontWeight: 600, opacity: 0.6, display: 'block', marginBottom: 4 }}>Points</label>
              <input type="number" min={50} max={300} step={50} value={q.points} onChange={e => updateQ(i, 'points', parseInt(e.target.value))} style={inputStyle} />
            </div>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        style={{ background: T.muted, border: `2px dashed ${T.ink}`, borderRadius: 12, padding: '12px 20px', width: '100%', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: T.ink, fontFamily: DISP }}
      >
        + Add question
      </button>
    </div>
  );
}

export default function AdminCampaignEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [form, setForm] = useState({
    title: '', description: '', location: '', videoUrl: '', videoTitle: '',
    startTime: '', endTime: '', isActive: true,
    emailTemplate: DEFAULT_EMAIL, whatsappTemplate: DEFAULT_WHATSAPP, telegramTemplate: DEFAULT_TELEGRAM,
    questions: [],
  });
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState('basic');

  useEffect(() => {
    if (!isNew) {
      api.get(`/campaigns/admin/${id}/full`)
        .then(({ data }) => {
          const c = data.campaign;
          setForm({
            title: c.title || '',
            description: c.description || '',
            location: c.location || '',
            videoUrl: c.videoUrl || '',
            videoTitle: c.videoTitle || '',
            startTime: c.startTime ? new Date(c.startTime).toISOString().slice(0, 16) : '',
            endTime: c.endTime ? new Date(c.endTime).toISOString().slice(0, 16) : '',
            isActive: c.isActive ?? true,
            emailTemplate: c.emailTemplate || DEFAULT_EMAIL,
            whatsappTemplate: c.whatsappTemplate || DEFAULT_WHATSAPP,
            telegramTemplate: c.telegramTemplate || DEFAULT_TELEGRAM,
            questions: c.questions || [],
          });
        })
        .catch(() => { toast.error('Campaign not found'); navigate('/admin/campaigns'); })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); setTab('basic'); return; }
    if (!form.videoUrl.trim()) { toast.error('Video URL is required'); setTab('basic'); return; }
    if (form.questions.length === 0) { toast.error('Add at least one question'); setTab('questions'); return; }
    const incomplete = form.questions.findIndex(q => !q.text.trim() || q.options.some(o => !o.label.trim()));
    if (incomplete !== -1) { toast.error(`Question ${incomplete + 1} is incomplete — fill in all option texts`); setTab('questions'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : null,
      };
      if (isNew) {
        await api.post('/campaigns', payload);
        toast.success('Campaign created!');
      } else {
        await api.put(`/campaigns/${id}`, payload);
        toast.success('Campaign saved!');
      }
      navigate('/admin/campaigns');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const TABS = [
    { id: 'basic', label: 'Details', warn: !form.title.trim() || !form.videoUrl.trim() },
    { id: 'questions', label: `Questions (${form.questions.length})`, warn: form.questions.length === 0 },
    { id: 'templates', label: 'Templates' },
  ];

  const tabStyle = (t) => ({
    padding: '8px 18px', borderRadius: 8, fontFamily: DISP, fontWeight: 700, fontSize: 14, cursor: 'pointer',
    border: `2px solid ${t.warn ? '#e53' : T.ink}`,
    background: tab === t.id ? T.ink : '#fff',
    color: tab === t.id ? T.bg : (t.warn ? '#e53' : T.ink),
    position: 'relative',
  });

  if (loading) return (
    <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="skeleton" style={{ width: 600, height: 400, borderRadius: 20 }} />
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.ink, fontFamily: "'Inter', sans-serif", padding: '32px 24px 80px' }}>
      <div style={{ maxWidth: 760, margin: '0 auto' }}>
        <button onClick={() => navigate('/admin/campaigns')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.ink, fontSize: 14, opacity: 0.55, marginBottom: 20, fontFamily: "'Inter', sans-serif", padding: 0 }}>
          ← Back to campaigns
        </button>

        <h1 style={{ fontFamily: DISP, fontWeight: 700, fontSize: 30, letterSpacing: '-0.02em', marginBottom: 24 }}>
          {isNew ? 'New campaign' : 'Edit campaign'}
        </h1>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
          {TABS.map(t => (
            <button key={t.id} style={tabStyle(t)} onClick={() => setTab(t.id)}>
              {t.warn ? '⚠ ' : ''}{t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSave}>
          <div style={{ background: '#fff', border: `2px solid ${T.ink}`, borderRadius: 20, padding: '28px 26px', boxShadow: `4px 4px 0 ${T.ink}`, marginBottom: 20 }}>

            {tab === 'basic' && (
              <>
                <FieldGroup label="Campaign title *">
                  <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="AIESEC UTM Campaign" style={inputStyle} />
                </FieldGroup>
                <FieldGroup label="Description">
                  <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Optional campaign description" style={{ ...inputStyle, resize: 'vertical' }} />
                </FieldGroup>
                <FieldGroup label="Location">
                  <input value={form.location} onChange={e => set('location', e.target.value)} placeholder="Johor Bahru, Malaysia" style={inputStyle} />
                </FieldGroup>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <FieldGroup label="Start time">
                    <input type="datetime-local" value={form.startTime} onChange={e => set('startTime', e.target.value)} style={inputStyle} />
                  </FieldGroup>
                  <FieldGroup label="End time">
                    <input type="datetime-local" value={form.endTime} onChange={e => set('endTime', e.target.value)} style={inputStyle} />
                  </FieldGroup>
                </div>
                <FieldGroup label="Video URL *">
                  <input value={form.videoUrl} onChange={e => set('videoUrl', e.target.value)} placeholder="https://youtu.be/..." style={{ ...inputStyle, borderColor: !form.videoUrl.trim() ? '#e53' : T.ink }} />
                </FieldGroup>
                <FieldGroup label="Video title">
                  <input value={form.videoTitle} onChange={e => set('videoTitle', e.target.value)} placeholder="Introduction to AIESEC" style={inputStyle} />
                </FieldGroup>
                <FieldGroup label="Status">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} style={{ width: 18, height: 18, accentColor: T.green }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>Campaign is active</span>
                  </label>
                </FieldGroup>
              </>
            )}

            {tab === 'questions' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
                  <div style={{ fontSize: 13, opacity: 0.6 }}>
                    Questions are required. Each question needs text and all 4 option labels filled in.
                  </div>
                  {form.questions.length === 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#e53', background: '#e5330011', border: '1.5px solid #e53', borderRadius: 6, padding: '2px 8px', whiteSpace: 'nowrap' }}>Required</span>
                  )}
                </div>
                <QuestionEditor questions={form.questions} onChange={qs => set('questions', qs)} />
              </>
            )}

            {tab === 'templates' && (
              <>
                <div style={{ fontSize: 13, opacity: 0.6, marginBottom: 18 }}>
                  Use <code style={{ background: T.muted, padding: '1px 5px', borderRadius: 4 }}>{'{{name}}'}</code>, <code style={{ background: T.muted, padding: '1px 5px', borderRadius: 4 }}>{'{{score}}'}</code>, <code style={{ background: T.muted, padding: '1px 5px', borderRadius: 4 }}>{'{{rank}}'}</code>, <code style={{ background: T.muted, padding: '1px 5px', borderRadius: 4 }}>{'{{accuracy}}'}</code>, <code style={{ background: T.muted, padding: '1px 5px', borderRadius: 4 }}>{'{{campaign}}'}</code> as variables.
                </div>
                <FieldGroup label="Email template">
                  <textarea value={form.emailTemplate} onChange={e => set('emailTemplate', e.target.value)} rows={8} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
                </FieldGroup>
                <FieldGroup label="WhatsApp message">
                  <textarea value={form.whatsappTemplate} onChange={e => set('whatsappTemplate', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
                </FieldGroup>
                <FieldGroup label="Telegram message">
                  <textarea value={form.telegramTemplate} onChange={e => set('telegramTemplate', e.target.value)} rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
                </FieldGroup>
              </>
            )}
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <BigButton type="button" bg={T.muted} color={T.ink} size="md" onClick={() => navigate('/admin/campaigns')}>
              Cancel
            </BigButton>
            <BigButton type="submit" bg={T.pink} color={T.ink} size="md" arrow disabled={saving}>
              {saving ? 'Saving…' : isNew ? 'Create campaign' : 'Save changes'}
            </BigButton>
          </div>
        </form>
      </div>
    </div>
  );
}
