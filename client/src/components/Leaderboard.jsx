import { motion } from 'framer-motion';
import { formatTime } from '../utils/scoring';

const medals = ['🥇', '🥈', '🥉'];

export default function Leaderboard({ entries = [], currentUserSessionId, compact = false, loading = false }) {
  if (loading) {
    return (
      <div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 56, borderRadius: 12, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.4)' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
        <div style={{ fontSize: 16, fontWeight: 700 }}>No scores yet. Be the first!</div>
      </div>
    );
  }

  const displayEntries = compact ? entries.slice(0, 5) : entries;

  return (
    <div>
      {displayEntries.map((entry, index) => {
        const rank = entry.rank || index + 1;
        const isMe = entry.sessionId === currentUserSessionId;
        const isMedal = rank <= 3;

        return (
          <motion.div
            key={entry._id || index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: compact ? '10px 14px' : '14px 18px',
              borderRadius: 14,
              marginBottom: 8,
              background: isMe
                ? 'rgba(3,126,243,0.2)'
                : isMedal
                ? 'rgba(255,255,255,0.08)'
                : 'rgba(255,255,255,0.04)',
              border: isMe
                ? '1px solid rgba(3,126,243,0.5)'
                : isMedal
                ? '1px solid rgba(255,255,255,0.12)'
                : '1px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            {/* Rank */}
            <div style={{
              width: 36, height: 36, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
              background: isMedal ? 'transparent' : 'rgba(255,255,255,0.08)',
              fontSize: isMedal ? 22 : 14,
              fontWeight: 900,
              color: isMedal ? 'inherit' : 'rgba(255,255,255,0.5)',
            }}>
              {isMedal ? medals[rank - 1] : rank}
            </div>

            {/* Name */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: 800, fontSize: compact ? 14 : 16,
                color: isMe ? '#037EF3' : 'white',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {entry.name}
                {isMe && <span style={{ color: '#037EF3', fontSize: 11, marginLeft: 6 }}>(You)</span>}
              </div>
              {!compact && (
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                  {entry.correctAnswers}/{entry.totalQuestions} correct · {formatTime(entry.timeTaken)}
                </div>
              )}
            </div>

            {/* Score */}
            <div style={{
              textAlign: 'right', flexShrink: 0,
            }}>
              <div style={{
                color: '#FFC845', fontWeight: 900,
                fontSize: compact ? 16 : 20,
              }}>
                {entry.score.toLocaleString()}
              </div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>pts</div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
