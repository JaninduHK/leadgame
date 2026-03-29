import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import api from '../../utils/api';

const emptyForm = {
  text: '', options: [
    { label: '', value: 'A' },
    { label: '', value: 'B' },
    { label: '', value: 'C' },
    { label: '', value: 'D' },
  ],
  correctAnswer: 'A', timeLimit: 30, points: 100, isActive: true,
};

function SortableQuestion({ question, onEdit, onDelete, onToggle }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: question._id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={{
      ...style,
      padding: '16px 20px', marginBottom: 8,
      display: 'flex', alignItems: 'center', gap: 12,
      opacity: question.isActive ? 1 : 0.5,
      background: 'rgba(255,255,255,0.06)',
      backdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '20px',
    }}>
      {/* Drag handle */}
      <div {...attributes} {...listeners} style={{
        cursor: 'grab', color: 'rgba(255,255,255,0.3)', fontSize: 20,
        userSelect: 'none', flexShrink: 0,
      }}>⠿</div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {question.text}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>⏱ {question.timeLimit}s</span>
          <span style={{ fontSize: 12, color: '#FFC845' }}>⭐ {question.points} pts</span>
          <span style={{ fontSize: 12, color: '#0DB14B' }}>✓ {question.correctAnswer}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => onToggle(question)}
          style={{
            background: question.isActive ? 'rgba(13,177,75,0.2)' : 'rgba(255,255,255,0.05)',
            border: 'none', borderRadius: 8, padding: '6px 12px',
            color: question.isActive ? '#0DB14B' : 'rgba(255,255,255,0.3)',
            fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer',
          }}
        >{question.isActive ? 'Active' : 'Inactive'}</button>
        <button
          onClick={() => onEdit(question)}
          style={{ background: 'rgba(3,126,243,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#037EF3', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >Edit</button>
        <button
          onClick={() => onDelete(question._id)}
          style={{ background: 'rgba(248,90,64,0.2)', border: 'none', borderRadius: 8, padding: '6px 12px', color: '#F85A40', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
        >Delete</button>
      </div>
    </div>
  );
}

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/questions');
      setQuestions(data);
    } catch { toast.error('Failed to load questions'); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadQuestions(); }, []);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = questions.findIndex(q => q._id === active.id);
    const newIndex = questions.findIndex(q => q._id === over.id);
    const reordered = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reordered);
    try {
      await api.put('/admin/questions/reorder', {
        orders: reordered.map((q, i) => ({ id: q._id, order: i + 1 })),
      });
    } catch { toast.error('Failed to save order'); }
  };

  const handleEdit = (q) => {
    setForm({
      text: q.text, options: q.options,
      correctAnswer: q.correctAnswer, timeLimit: q.timeLimit,
      points: q.points, isActive: q.isActive,
    });
    setEditId(q._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this question?')) return;
    try {
      await api.delete(`/admin/questions/${id}`);
      toast.success('Question deleted');
      loadQuestions();
    } catch { toast.error('Failed to delete'); }
  };

  const handleToggle = async (q) => {
    try {
      await api.put(`/admin/questions/${q._id}`, { isActive: !q.isActive });
      loadQuestions();
    } catch { toast.error('Failed to update'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.text.trim()) { toast.error('Question text required'); return; }
    if (form.options.some(o => !o.label.trim())) { toast.error('All 4 options required'); return; }
    setSaving(true);
    try {
      if (editId) {
        await api.put(`/admin/questions/${editId}`, form);
        toast.success('Question updated!');
      } else {
        await api.post('/admin/questions', form);
        toast.success('Question created!');
      }
      setShowForm(false);
      setEditId(null);
      setForm(emptyForm);
      loadQuestions();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save question');
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    width: '100%', background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.12)', borderRadius: 10,
    padding: '10px 14px', color: 'white', fontFamily: 'Nunito, sans-serif',
    fontWeight: 700, fontSize: 14, outline: 'none',
  };

  const optionColors = { A: '#037EF3', B: '#0DB14B', C: '#F85A40', D: '#FFC845' };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 26 }}>❓ Questions</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{questions.length} questions · Drag to reorder</p>
          </div>
          <button
            onClick={() => { setForm(emptyForm); setEditId(null); setShowForm(true); }}
            style={{
              background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
              color: 'white', border: 'none', borderRadius: 10, padding: '10px 20px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}
          >+ Add Question</button>
        </div>

        {/* Question Form Modal */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
                zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '24px', overflowY: 'auto',
              }}
              onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: 640, padding: '32px', maxHeight: '90vh', overflowY: 'auto' }}
              >
                <h2 style={{ fontWeight: 900, fontSize: 22, marginBottom: 24 }}>
                  {editId ? '✏️ Edit Question' : '➕ Add Question'}
                </h2>
                <form onSubmit={handleSave}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>QUESTION TEXT</label>
                      <textarea
                        value={form.text}
                        onChange={e => setForm({ ...form, text: e.target.value })}
                        placeholder="Enter your question..."
                        rows={3}
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>OPTIONS (A/B/C/D)</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {form.options.map((opt, i) => (
                          <div key={opt.value} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{
                              width: 36, height: 36, borderRadius: 8, flexShrink: 0,
                              background: `${optionColors[opt.value]}30`,
                              border: `1px solid ${optionColors[opt.value]}60`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 900, fontSize: 14, color: optionColors[opt.value],
                            }}>{opt.value}</div>
                            <input
                              value={opt.label}
                              onChange={e => {
                                const newOpts = [...form.options];
                                newOpts[i] = { ...newOpts[i], label: e.target.value };
                                setForm({ ...form, options: newOpts });
                              }}
                              placeholder={`Option ${opt.value}`}
                              style={inputStyle}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>CORRECT ANSWER</label>
                        <select
                          value={form.correctAnswer}
                          onChange={e => setForm({ ...form, correctAnswer: e.target.value })}
                          style={{ ...inputStyle, appearance: 'none' }}
                        >
                          {['A', 'B', 'C', 'D'].map(v => (
                            <option key={v} value={v}>{v} — {form.options.find(o => o.value === v)?.label?.slice(0, 20) || ''}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>TIME LIMIT (s)</label>
                        <input type="number" min="10" max="60" value={form.timeLimit}
                          onChange={e => setForm({ ...form, timeLimit: parseInt(e.target.value) })}
                          style={inputStyle}
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: 'rgba(255,255,255,0.5)', marginBottom: 6 }}>BASE POINTS</label>
                        <input type="number" min="50" max="200" step="10" value={form.points}
                          onChange={e => setForm({ ...form, points: parseInt(e.target.value) })}
                          style={inputStyle}
                        />
                      </div>
                    </div>

                    <label style={{ display: 'flex', gap: 10, alignItems: 'center', cursor: 'pointer' }}>
                      <input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} style={{ accentColor: '#037EF3', width: 16, height: 16 }} />
                      <span style={{ fontWeight: 700, fontSize: 14 }}>Active (visible in quiz)</span>
                    </label>

                    <div style={{ display: 'flex', gap: 10 }}>
                      <button type="submit" disabled={saving} style={{
                        flex: 1, background: 'linear-gradient(135deg, #037EF3, #0DB14B)', color: 'white', border: 'none',
                        borderRadius: 10, padding: '12px', fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15, cursor: 'pointer',
                      }}>{saving ? 'Saving...' : editId ? 'Update Question' : 'Create Question'}</button>
                      <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm); }} style={{
                        background: 'rgba(255,255,255,0.08)', color: 'white', border: 'none',
                        borderRadius: 10, padding: '12px 20px', fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                      }}>Cancel</button>
                    </div>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Questions list with DnD */}
        {loading ? (
          <div>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 72, borderRadius: 16, marginBottom: 8 }} />)}</div>
        ) : questions.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
            No questions yet. Add your first question!
          </div>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={questions.map(q => q._id)} strategy={verticalListSortingStrategy}>
              {questions.map(q => (
                <SortableQuestion
                  key={q._id}
                  question={q}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  );
}
