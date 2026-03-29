import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import Mascot from '../components/Mascot';
import { useQuiz } from '../context/QuizContext';
import api from '../utils/api';

const MAX_VIEWS = 2;

export default function VideoPage() {
  const navigate = useNavigate();
  const { videoViews, incrementVideoView, setVideoCompleted, videoCompleted, userName } = useQuiz();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const viewsLeft = MAX_VIEWS - videoViews;

  useEffect(() => {
    api.get('/quiz/video')
      .then(({ data }) => setVideo(data))
      .catch(() => toast.error('Could not load video.'))
      .finally(() => setLoading(false));
  }, []);

  const handleEnded = () => {
    setWatched(true);
    setVideoCompleted();
    if (videoViews < MAX_VIEWS) {
      incrementVideoView();
      toast.success('Great! You can now start the quiz 🎉');
    }
  };

  const handleWatchAgain = () => {
    if (viewsLeft <= 0) {
      toast.error('No more views available!');
      return;
    }
    setPlaying(false);
    setProgress(0);
    if (playerRef.current) playerRef.current.seekTo(0);
    setTimeout(() => setPlaying(true), 300);
  };

  const handleStartQuiz = () => {
    navigate('/quiz');
  };

  const handleProgress = ({ played }) => {
    setProgress(played * 100);
    // Auto-mark as watched if 90% through
    if (played >= 0.9 && !watched) {
      setWatched(true);
      setVideoCompleted();
      if (videoViews < MAX_VIEWS) incrementVideoView();
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A1628',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="anim-spin" style={{
            width: 48, height: 48, border: '4px solid rgba(255,255,255,0.1)',
            borderTop: '4px solid #037EF3', borderRadius: '50%', margin: '0 auto 16px',
          }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Loading video...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '24px' }}>
      {/* Background orb */}
      <div style={{
        position: 'fixed', width: 600, height: 600, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(3,126,243,0.1) 0%, transparent 70%)',
        top: '-200px', right: '-200px', pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 800, margin: '0 auto', paddingTop: 20, position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ marginBottom: 28, textAlign: 'center' }}
        >
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(255,200,69,0.15)', border: '1px solid rgba(255,200,69,0.3)',
            borderRadius: 50, padding: '6px 16px', marginBottom: 12,
          }}>
            <span>Step 2 of 4</span>
            <span style={{ color: '#FFC845', fontWeight: 800 }}>Watch Video</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: 28, marginBottom: 8 }}>
            Hey {userName}! 👋 Watch This First
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 15 }}>
            Quiz questions will be based on this video. Watch it carefully!
          </p>
        </motion.div>

        {/* Video Player Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
          style={{ overflow: 'hidden' }}
        >
          {/* Player */}
          <div style={{ position: 'relative', paddingTop: '56.25%', background: '#000' }}>
            {video ? (
              <ReactPlayer
                ref={playerRef}
                url={video.url}
                width="100%"
                height="100%"
                style={{ position: 'absolute', top: 0, left: 0 }}
                playing={playing}
                controls
                onEnded={handleEnded}
                onProgress={handleProgress}
                onDuration={setDuration}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />
            ) : (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.5)',
              }}>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: 700 }}>
                  No video configured
                </div>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: 'linear-gradient(90deg, #037EF3, #0DB14B)',
              transition: 'width 0.5s linear',
            }} />
          </div>

          {/* Controls row */}
          <div style={{
            padding: '16px 20px',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            flexWrap: 'wrap', gap: 12,
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={{ fontWeight: 800, fontSize: 15 }}>
                {video?.title || 'AIESEC Introduction'}
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 600,
              }}>
                <span>👁️ {viewsLeft} view{viewsLeft !== 1 ? 's' : ''} remaining</span>
                {watched && <span style={{ color: '#0DB14B' }}>✅ Watched</span>}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={handleWatchAgain}
                disabled={viewsLeft <= 0}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  color: viewsLeft > 0 ? 'white' : 'rgba(255,255,255,0.3)',
                  borderRadius: 10, padding: '8px 16px',
                  fontFamily: 'Nunito, sans-serif', fontWeight: 700, fontSize: 13,
                  cursor: viewsLeft > 0 ? 'pointer' : 'not-allowed',
                }}
              >
                {viewsLeft <= 0 ? '0 views left' : '🔄 Watch Again'}
              </button>

              {(watched || videoCompleted) && (
                <motion.button
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStartQuiz}
                  style={{
                    background: 'linear-gradient(135deg, #037EF3, #0DB14B)',
                    color: 'white', border: 'none', borderRadius: 10,
                    padding: '8px 20px',
                    fontFamily: 'Nunito, sans-serif', fontWeight: 800, fontSize: 15,
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(3,126,243,0.4)',
                  }}
                >
                  I'm Ready! 🧠
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Mascot tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 20,
            marginTop: 28, padding: '20px',
            background: 'rgba(255,200,69,0.08)',
            border: '1px solid rgba(255,200,69,0.2)', borderRadius: 16,
          }}
        >
          <Mascot pose="thinking" size={80} />
          <div style={{ paddingTop: 10 }}>
            <div style={{ fontWeight: 800, fontSize: 16, color: '#FFC845', marginBottom: 6 }}>
              Aiko's Tips 💡
            </div>
            <div style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 1.6 }}>
              Watch carefully! The quiz questions will be about AIESEC's mission, programs, and global impact.
              Pay attention to names, numbers, and key facts. You've got this! 👀
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
