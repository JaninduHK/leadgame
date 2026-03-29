import { motion } from 'framer-motion';

export default function ProgressBar({ current, total, color = '#037EF3' }) {
  const percent = total > 0 ? (current / total) * 100 : 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 6, fontSize: 13, fontWeight: 700,
        color: 'rgba(255,255,255,0.6)',
      }}>
        <span>Question {current} of {total}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div style={{
        height: 8, background: 'rgba(255,255,255,0.1)',
        borderRadius: 50, overflow: 'hidden',
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}, #0DB14B)`,
            borderRadius: 50,
          }}
        />
      </div>
    </div>
  );
}
