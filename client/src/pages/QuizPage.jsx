import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Mascot from '../components/Mascot';
import Timer from '../components/Timer';
import ProgressBar from '../components/ProgressBar';
import { useQuiz } from '../context/QuizContext';
import { useTimer } from '../hooks/useTimer';
import { calculateScore } from '../utils/scoring';
import api from '../utils/api';

const OPTION_COLORS = {
  A: { bg: 'rgba(3,126,243,0.2)', border: 'rgba(3,126,243,0.5)', active: 'rgba(3,126,243,0.4)', label: '#037EF3' },
  B: { bg: 'rgba(13,177,75,0.2)', border: 'rgba(13,177,75,0.5)', active: 'rgba(13,177,75,0.4)', label: '#0DB14B' },
  C: { bg: 'rgba(248,90,64,0.2)', border: 'rgba(248,90,64,0.5)', active: 'rgba(248,90,64,0.4)', label: '#F85A40' },
  D: { bg: 'rgba(255,200,69,0.2)', border: 'rgba(255,200,69,0.5)', active: 'rgba(255,200,69,0.4)', label: '#FFC845' },
};

export default function QuizPage() {
  const navigate = useNavigate();
  const { sessionId, setAnswers } = useQuiz();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [scoreFloat, setScoreFloat] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [mascotPose, setMascotPose] = useState('waving');
  const [allAnswers, setAllAnswers] = useState([]);
  const [quizStartTime, setQuizStartTime] = useState(null);
  const questionStartTimeRef = useRef(Date.now());

  const currentQuestion = questions[current];

  const handleTimerEnd = useCallback(() => {
    if (!answered && currentQuestion) {
      handleAnswer(null); // timeout = no answer
    }
  }, [answered, currentQuestion]);

  const { timeLeft, start: startTimer, reset: resetTimer } = useTimer(
    currentQuestion?.timeLimit || 30,
    handleTimerEnd
  );

  useEffect(() => {
    api.get('/quiz/questions')
      .then(({ data }) => {
        setQuestions(data);
        setQuizStartTime(Date.now());
        questionStartTimeRef.current = Date.now();
      })
      .catch(() => toast.error('Failed to load questions'))
      .finally(() => setLoading(false));
  }, []);

  // Start timer when question changes
  useEffect(() => {
    if (questions.length > 0 && !loading) {
      resetTimer(currentQuestion?.timeLimit || 30);
      questionStartTimeRef.current = Date.now();
      setTimeout(() => startTimer(), 300);
      setSelected(null);
      setAnswered(false);
      setMascotPose('thinking');
    }
  }, [current, questions.length, loading]);

  const handleAnswer = useCallback((value) => {
    if (answered) return;
    setAnswered(true);

    const timeTaken = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const isCorrect = value !== null && value === currentQuestion?.correctAnswer;

    // Compute points earned for this question
    let pointsEarned = 0;
    if (isCorrect) {
      const basePoints = currentQuestion.points || 100;
      const timeLimit = currentQuestion.timeLimit || 30;
      const speedMultiplier = Math.max(0.5, (timeLimit - timeTaken) / timeLimit);
      pointsEarned = Math.round(basePoints * (1 + speedMultiplier));
      setTotalScore(prev => prev + pointsEarned);
      setMascotPose('celebrating');
      setScoreFloat(`+${pointsEarned}`);
      setTimeout(() => setScoreFloat(null), 1500);
    } else {
      setMascotPose('sad');
    }

    const answer = {
      questionId: currentQuestion._id,
      selectedOption: value,
      isCorrect,
      timeTaken,
    };

    setSelected(value);

    setTimeout(() => {
      const updatedAnswers = [...allAnswers, answer];
      setAllAnswers(updatedAnswers);

      if (current < questions.length - 1) {
        setCurrent(prev => prev + 1);
      } else {
        // Quiz complete
        setAnswers(updatedAnswers);
        navigate('/volunteer');
      }
    }, isCorrect ? 1200 : 1500);
  }, [answered, currentQuestion, allAnswers, current, questions.length]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0A1628',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16,
      }}>
        <div className="anim-spin" style={{
          width: 56, height: 56, border: '4px solid rgba(255,255,255,0.1)',
          borderTop: '4px solid #037EF3', borderRadius: '50%',
        }} />
        <div style={{ fontWeight: 700, color: 'rgba(255,255,255,0.6)', fontSize: 16 }}>Loading quiz...</div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', padding: '16px 16px 100px' }}>
      {/* Background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(3,126,243,0.1) 0%, transparent 70%)', top: '-100px', right: '-100px' }} />
        <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,177,75,0.08) 0%, transparent 70%)', bottom: '-50px', left: '-50px' }} />
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Top bar */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <ProgressBar current={current + 1} total={questions.length} />
          </div>
          <Timer
            timeLeft={timeLeft}
            totalTime={currentQuestion.timeLimit || 30}
            size={72}
          />
          <div style={{
            background: 'rgba(255,200,69,0.15)', border: '1px solid rgba(255,200,69,0.3)',
            borderRadius: 12, padding: '8px 16px', textAlign: 'center', minWidth: 80,
          }}>
            <div style={{ color: '#FFC845', fontWeight: 900, fontSize: 20 }}>{totalScore}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 700 }}>PTS</div>
          </div>
        </div>

        {/* Mascot + speech */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <Mascot pose={mascotPose} size={80} />
        </div>

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="glass-card" style={{ padding: '28px 24px', marginBottom: 20, position: 'relative' }}>
              {/* Score float animation */}
              {scoreFloat && (
                <motion.div
                  initial={{ opacity: 1, y: 0, scale: 1 }}
                  animate={{ opacity: 0, y: -60, scale: 1.4 }}
                  transition={{ duration: 1.2 }}
                  style={{
                    position: 'absolute', top: 20, right: 20,
                    color: '#0DB14B', fontWeight: 900, fontSize: 28,
                    pointerEvents: 'none', zIndex: 10,
                  }}
                >
                  {scoreFloat}
                </motion.div>
              )}

              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
                Question {current + 1} · {currentQuestion.points} pts base
              </div>
              <h2 style={{ fontWeight: 800, fontSize: 'clamp(17px, 3vw, 22px)', lineHeight: 1.4 }}>
                {currentQuestion.text}
              </h2>
            </div>

            {/* Answer grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 12,
            }}>
              {currentQuestion.options.map((option) => {
                const value = option.value;
                const colors = OPTION_COLORS[value];
                const isSelected = selected === value;
                const isCorrect = answered && value === currentQuestion.correctAnswer;
                const isWrong = answered && isSelected && !isCorrect;

                let bg = colors.bg;
                let border = `2px solid ${colors.border}`;
                let textColor = 'white';
                let animation = undefined;

                if (isCorrect && answered) {
                  bg = 'rgba(13,177,75,0.35)';
                  border = '2px solid #0DB14B';
                  animation = 'correct-flash 0.4s ease';
                } else if (isWrong) {
                  bg = 'rgba(248,90,64,0.35)';
                  border = '2px solid #F85A40';
                  animation = 'wrong-flash 0.4s ease';
                }

                return (
                  <motion.button
                    key={value}
                    whileHover={!answered ? { scale: 1.02, background: colors.active } : {}}
                    whileTap={!answered ? { scale: 0.98 } : {}}
                    onClick={() => !answered && handleAnswer(value)}
                    disabled={answered}
                    style={{
                      background: bg,
                      border,
                      borderRadius: 16,
                      padding: '18px 20px',
                      cursor: answered ? 'default' : 'pointer',
                      textAlign: 'left',
                      display: 'flex', alignItems: 'center', gap: 14,
                      transition: 'all 0.2s',
                      animation,
                      minHeight: 68,
                      fontFamily: 'Nunito, sans-serif',
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                      background: isCorrect && answered ? '#0DB14B' : isWrong ? '#F85A40' : colors.active,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 900, fontSize: 15, color: 'white',
                    }}>
                      {isCorrect && answered ? '✓' : isWrong ? '✗' : value}
                    </div>
                    <span style={{
                      fontWeight: 700, fontSize: 15, color: textColor,
                      lineHeight: 1.4, flex: 1,
                    }}>
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            {/* Timeout message */}
            {answered && selected === null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                style={{
                  marginTop: 16, textAlign: 'center', padding: '12px',
                  background: 'rgba(248,90,64,0.15)', borderRadius: 12,
                  color: '#F85A40', fontWeight: 700, fontSize: 14,
                }}
              >
                ⏰ Time's up! The correct answer was {currentQuestion.correctAnswer}.
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
