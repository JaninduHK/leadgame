import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactPlayer from 'react-player';
import toast from 'react-hot-toast';
import { useQuiz } from '../context/QuizContext';
import api from '../utils/api';

const MAX_VIEWS = 2;

export default function VideoPage() {
  const navigate = useNavigate();
  const { videoViews, incrementVideoView, setVideoCompleted, videoCompleted, userName, campaignId } = useQuiz();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const playerRef = useRef(null);
  const viewsLeft = MAX_VIEWS - videoViews;

  useEffect(() => {
    if (!campaignId) { navigate('/play'); return; }
    api.get(`/quiz/video?campaignId=${campaignId}`)
      .then(({ data }) => setVideo(data))
      .catch(() => { toast.error('Could not load video.'); navigate('/play'); })
      .finally(() => setLoading(false));
  }, [campaignId]);

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
        minHeight: '100vh', background: '#F4EFE1',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div className="anim-spin" style={{
            width: 48, height: 48, border: '4px solid rgba(20,20,43,0.12)',
            borderTop: '4px solid #037EF3', borderRadius: '50%', margin: '0 auto 16px',
          }} />
          <div style={{ color: 'rgba(20,20,43,0.6)', fontWeight: 600 }}>Loading video…</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F4EFE1', padding: '24px' }}>
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
            background: '#FFDF49', border: '2px solid #14142B',
            borderRadius: 50, padding: '6px 16px', marginBottom: 12,
          }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: '#14142B' }}>Step 2 of 4 · Watch Video</span>
          </div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em', marginBottom: 8, color: '#14142B' }}>
            Hey {userName}! Watch this first
          </h1>
          <p style={{ color: 'rgba(20,20,43,0.55)', fontSize: 15 }}>
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
          <div style={{ height: 4, background: 'rgba(20,20,43,0.12)' }}>
            <div style={{
              height: '100%', width: `${progress}%`,
              background: '#3FDA7C',
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
                color: 'rgba(20,20,43,0.55)', fontSize: 13, fontWeight: 600,
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
                  background: 'rgba(20,20,43,0.06)',
                  border: '2px solid rgba(20,20,43,0.25)',
                  color: viewsLeft > 0 ? '#14142B' : 'rgba(20,20,43,0.35)',
                  borderRadius: 10, padding: '8px 16px',
                  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
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
                    background: '#14142B',
                    color: '#F4EFE1', border: '2px solid #14142B', borderRadius: 999,
                    padding: '8px 20px',
                    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '3px 3px 0 #14142B',
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
            background: '#FFDF49',
            border: '2px solid #14142B', borderRadius: 16,
          }}
        >
          <div style={{ fontSize: 32 }}>💡</div>
          <div>
            <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 15, marginBottom: 6, color: '#14142B' }}>
              Tip
            </div>
            <div style={{ color: 'rgba(20,20,43,0.75)', fontSize: 14, lineHeight: 1.6 }}>
              Watch carefully! The quiz questions will be about AIESEC's mission, programs, and global impact. You've got this! 👀
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
