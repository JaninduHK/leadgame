import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { formatTime } from '../../utils/scoring';

export default function AdminAttempts() {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [filters, setFilters] = useState({
    sortBy: 'createdAt',
    sortOrder: 'desc',
    volunteerInterest: 'all',
    startDate: '',
    endDate: '',
  });

  const loadAttempts = async (p = page, f = filters) => {
    setLoading(true);
    try {
      const params = {
        page: p, limit: 20,
        sortBy: f.sortBy, sortOrder: f.sortOrder,
      };
      if (f.volunteerInterest !== 'all') params.volunteerInterest = f.volunteerInterest;
      if (f.startDate) params.startDate = f.startDate;
      if (f.endDate) params.endDate = f.endDate;

      const { data } = await api.get('/admin/attempts', { params });
      setAttempts(data.attempts);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      toast.error('Failed to load attempts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAttempts(); }, []);

  const handleExport = async () => {
    try {
      const response = await api.get('/admin/attempts/export', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'aiesec_quiz_attempts.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported!');
    } catch {
      toast.error('Export failed');
    }
  };

  const handleFilterChange = (key, val) => {
    const newFilters = { ...filters, [key]: val };
    setFilters(newFilters);
    setPage(1);
    loadAttempts(1, newFilters);
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: 8, padding: '8px 12px', color: 'white',
    fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13, outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h1 style={{ fontWeight: 900, fontSize: 26 }}>📋 Attempts</h1>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>{total} total submissions</p>
          </div>
          <button
            onClick={handleExport}
            style={{
              background: 'rgba(13,177,75,0.2)', border: '1px solid rgba(13,177,75,0.4)',
              color: '#0DB14B', borderRadius: 10, padding: '10px 20px',
              fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 14, cursor: 'pointer',
            }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>SORT BY</label>
            <select
              value={filters.sortBy}
              onChange={e => handleFilterChange('sortBy', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}
            >
              <option value="createdAt">Date</option>
              <option value="score">Score</option>
              <option value="timeTaken">Time</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>ORDER</label>
            <select
              value={filters.sortOrder}
              onChange={e => handleFilterChange('sortOrder', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>VOLUNTEER</label>
            <select
              value={filters.volunteerInterest}
              onChange={e => handleFilterChange('volunteerInterest', e.target.value)}
              style={{ ...inputStyle, appearance: 'none' }}
            >
              <option value="all">All</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>FROM DATE</label>
            <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', marginBottom: 4 }}>TO DATE</label>
            <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Table */}
        <div className="glass-card" style={{ padding: '20px', overflowX: 'auto' }}>
          {loading ? (
            <div>{[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: 52, borderRadius: 10, marginBottom: 8 }} />)}</div>
          ) : attempts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
              No attempts found with current filters.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 6px', minWidth: 800 }}>
              <thead>
                <tr>
                  {['#', 'Name', 'Email', 'Phone', 'Score', 'Time', 'Correct', 'Volunteer', 'Date'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 12px',
                      color: 'rgba(255,255,255,0.4)', fontWeight: 800,
                      fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={a._id} style={{ background: 'rgba(255,255,255,0.03)' }}>
                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.3)', fontSize: 13, fontWeight: 700 }}>
                      {(page - 1) * 20 + i + 1}
                    </td>
                    <td style={{ padding: '10px 12px', fontWeight: 700, fontSize: 14 }}>{a.name}</td>
                    <td style={{ padding: '10px 12px', color: '#037EF3', fontSize: 13 }}>{a.email}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{a.phone}</td>
                    <td style={{ padding: '10px 12px', color: '#FFC845', fontWeight: 900, fontSize: 16 }}>{a.score}</td>
                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>{formatTime(a.timeTaken)}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13 }}>{a.correctAnswers}/{a.totalQuestions}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        background: a.volunteerInterest ? 'rgba(13,177,75,0.2)' : 'rgba(255,255,255,0.05)',
                        color: a.volunteerInterest ? '#0DB14B' : 'rgba(255,255,255,0.3)',
                        borderRadius: 6, padding: '3px 8px', fontSize: 12, fontWeight: 700,
                      }}>
                        {a.volunteerInterest ? '✓ Yes' : '✗ No'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                      {new Date(a.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 20 }}>
              <button
                onClick={() => { setPage(p => p - 1); loadAttempts(page - 1); }}
                disabled={page <= 1}
                style={{
                  background: page > 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: 'none', color: page > 1 ? 'white' : 'rgba(255,255,255,0.2)',
                  borderRadius: 8, padding: '8px 16px', cursor: page > 1 ? 'pointer' : 'default',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                }}
              >← Prev</button>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, fontWeight: 700 }}>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => { setPage(p => p + 1); loadAttempts(page + 1); }}
                disabled={page >= totalPages}
                style={{
                  background: page < totalPages ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.03)',
                  border: 'none', color: page < totalPages ? 'white' : 'rgba(255,255,255,0.2)',
                  borderRadius: 8, padding: '8px 16px', cursor: page < totalPages ? 'pointer' : 'default',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700,
                }}
              >Next →</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
