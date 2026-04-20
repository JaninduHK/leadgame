import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuiz } from '../context/QuizContext';
import { useTimer } from '../hooks/useTimer';
import api from '../utils/api';
import { T, LGStar, LGSpark, FloatShape, BigButton, Pill } from '../components/ui';

const DISP = "'Space Grotesk', sans-serif";
const OPTION_BG = { A: T.pink, B: T.yellow, C: T.green, D: T.navy };
const OPTION_COLOR = { A: T.ink, B: T.ink, C: T.ink, D: T.bg };

export default function QuizPage() {
  const navigate = useNavigate();
  const { sessionId, setAnswers, campaignId } = useQuiz();

  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [scoreFloat, setScoreFloat] = useState(null);
  const [totalScore, setTotalScore] = useState(0);
  const [allAnswers, setAllAnswers] = useState([]);
  const questionStartTimeRef = useRef(Date.now());

  const currentQuestion = questions[current];

  const handleTimerEnd = useCallback(() => {
    if (!answered && currentQuestion) handleAnswer(null);
  }, [answered, currentQuestion]);

  const { timeLeft, start: startTimer, reset: resetTimer } = useTimer(
    currentQuestion?.timeLimit || 30,
    handleTimerEnd,
  );

  useEffect(() => {
    if (!campaignId) { navigate('/play', { replace: true }); return; }
    api.get(`/quiz/questions?campaignId=${campaignId}`)
      .then(({ data }) => {
        setQuestions(data);
        questionStartTimeRef.current = Date.now();
      })
      .catch(() => { toast.error('Failed to load questions'); navigate('/play', { replace: true }); })
      .finally(() => setLoading(false));
  }, [campaignId]);

  useEffect(() => {
    if (questions.length > 0 && !loading) {
      resetTimer(currentQuestion?.timeLimit || 30);
      questionStartTimeRef.current = Date.now();
      setTimeout(() => startTimer(), 300);
      setSelected(null);
      setAnswered(false);
    }
  }, [current, questions.length, loading]);

  const handleAnswer = useCallback((value) => {
    if (answered) return;
    setAnswered(true);

    const timeTaken = Math.round((Date.now() - questionStartTimeRef.current) / 1000);
    const isCorrect = value !== null && value === currentQuestion?.correctAnswer;

    if (isCorrect) {
      const basePoints = currentQuestion.points || 100;
      const timeLimit = currentQuestion.timeLimit || 30;
      const speedMultiplier = Math.max(0.5, (timeLimit - timeTaken) / timeLimit);
      const pointsEarned = Math.round(basePoints * (1 + speedMultiplier));
      setTotalScore(prev => prev + pointsEarned);
      setScoreFloat(`+${pointsEarned}`);
      setTimeout(() => setScoreFloat(null), 1500);
    }

    const answer = { questionId: currentQuestion._id, selectedOption: value, isCorrect, timeTaken };
    setSelected(value);

    setTimeout(() => {
      const updatedAnswers = [...allAnswers, answer];
      setAllAnswers(updatedAnswers);
      if (current < questions.length - 1) {
        setCurrent(prev => prev + 1);
      } else {
        setAnswers(updatedAnswers);
        navigate('/volunteer', { replace: true });
      }
    }, isCorrect ? 1200 : 1500);
  }, [answered, currentQuestion, allAnswers, current, questions.length]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: T.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
        <div className="anim-spin" style={{ width: 48, height: 48, border: `4px solid ${T.muted}`, borderTop: `4px solid ${T.ink}`, borderRadius: '50%' }} />
        <div style={{ fontFamily: DISP, fontWeight: 600, opacity: 0.6 }}>Loading quiz…</div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const timeLimit = currentQuestion.timeLimit || 30;
  const timePct = timeLeft / timeLimit;
  const timerColor = timePct > 0.4 ? T.green : timePct > 0.2 ? T.yellow : T.pink;

  return (
    <div style={{ minHeight: '100vh', background: T.bg, fontFamily: "'Inter', sans-serif", color: T.ink }}>

      {/* ── HEADER ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 16, padding: '16px 32px',
        borderBottom: `2px solid ${T.ink}`,
        background: T.bg,
      }}>
        <div style={{ fontFamily: DISP, fontWeight: 700, fontSize: 16, letterSpacing: '-0.03em', marginRight: 8 }}>LEAD GAME</div>

        {/* Progress segments */}
        <div style={{ flex: 1, display: 'flex', gap: 4 }}>
          {questions.map((_, i) => (
            <div key={i} style={{
              flex: 1, height: 8, borderRadius: 999,
              border: `1.5px solid ${T.ink}`,
              background: i < current ? T.green : i === current ? T.yellow : 'transparent',
              transition: 'background 0.3s',
            }} />
          ))}
        </div>

        <div style={{ fontFamily: DISP, fontWeight: 600, fontSize: 13, flexShrink: 0 }}>
          {String(current + 1).padStart(2, '0')} / {String(questions.length).padStart(2, '0')}
        </div>

        {/* Timer pill */}
        <Pill bg={timerColor} border={T.ink} style={{ flexShrink: 0, fontFamily: DISP, fontWeight: 700, fontSize: 14 }}>
          ⏱ {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </Pill>

        {/* Score */}
        <Pill bg={T.yellow} border={T.ink} style={{ flexShrink: 0, fontFamily: DISP, fontWeight: 700 }}>
          {totalScore.toLocaleString()} pts
        </Pill>
      </div>

      {/* ── BODY ── */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 32px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }} className="quiz-grid">

              {/* LEFT: Question */}
              <div style={{ position: 'relative' }}>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.16em', opacity: 0.5, marginBottom: 16 }}>
                  Scenario · Question {current + 1}
                </div>
                <h2 style={{
                  fontFamily: DISP, fontWeight: 700,
                  fontSize: 'clamp(22px, 3vw, 36px)',
                  lineHeight: 1.1, letterSpacing: '-0.02em', marginBottom: 28,
                }}>
                  {currentQuestion.text}
                </h2>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <Pill border={T.ink}>+{currentQuestion.points || 100} for accuracy</Pill>
                  <Pill border={T.ink} bg={T.muted}>+speed bonus</Pill>
                </div>

                {/* Score float */}
                {scoreFloat && (
                  <motion.div
                    initial={{ opacity: 1, y: 0, scale: 1 }}
                    animate={{ opacity: 0, y: -60, scale: 1.4 }}
                    transition={{ duration: 1.2 }}
                    style={{
                      position: 'absolute', top: 0, right: 0,
                      fontFamily: DISP, fontWeight: 700, fontSize: 32,
                      color: T.green, pointerEvents: 'none',
                    }}
                  >
                    {scoreFloat}
                  </motion.div>
                )}

                <FloatShape bottom={-20} left={0} delay={0.3} duration={3.5}>
                  <LGStar size={28} color={T.pink} />
                </FloatShape>
                <FloatShape top={0} right={0} delay={1} duration={4}>
                  <LGSpark size={24} color={T.green} />
                </FloatShape>
              </div>

              {/* RIGHT: Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {currentQuestion.options.map((option) => {
                  const val = option.value;
                  const isSelected = selected === val;
                  const isCorrect = answered && val === currentQuestion.correctAnswer;
                  const isWrong = answered && isSelected && !isCorrect;

                  let bg = OPTION_BG[val] || T.bg;
                  let textColor = answered ? T.ink : (OPTION_COLOR[val] || T.ink);
                  let shadow = `3px 3px 0 ${T.ink}`;
                  let transform = 'none';
                  let animation;

                  if (isCorrect && answered) {
                    bg = T.green; textColor = T.ink;
                    shadow = `5px 5px 0 ${T.ink}`;
                    transform = 'translate(-2px,-2px)';
                    animation = 'correct-flash 0.4s ease';
                  } else if (isWrong) {
                    bg = T.pink; textColor = T.ink;
                    animation = 'wrong-flash 0.4s ease';
                  } else if (isSelected) {
                    shadow = `5px 5px 0 ${T.ink}`;
                    transform = 'translate(-2px,-2px)';
                  }

                  return (
                    <motion.button
                      key={val}
                      whileHover={!answered ? { y: -2 } : {}}
                      whileTap={!answered ? { scale: 0.98 } : {}}
                      onClick={() => !answered && handleAnswer(val)}
                      disabled={answered}
                      style={{
                        background: bg, border: `2px solid ${T.ink}`,
                        borderRadius: 18, padding: '16px 20px',
                        cursor: answered ? 'default' : 'pointer',
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 16,
                        boxShadow: shadow, transform,
                        transition: answered ? 'none' : 'all 0.2s',
                        animation,
                        fontFamily: "'Inter', sans-serif",
                      }}
                    >
                      <div style={{
                        width: 40, height: 40, borderRadius: 999, flexShrink: 0,
                        background: (isCorrect && answered) ? T.ink : isWrong ? T.ink : 'rgba(0,0,0,0.15)',
                        color: (isCorrect && answered) || isWrong ? T.bg : textColor,
                        border: `2px solid ${T.ink}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: DISP, fontWeight: 700, fontSize: 16,
                      }}>
                        {isCorrect && answered ? '✓' : isWrong ? '✗' : val}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 15, lineHeight: 1.4, flex: 1, color: textColor }}>
                        {option.label}
                      </span>
                    </motion.button>
                  );
                })}

                {answered && selected === null && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      marginTop: 8, padding: '12px 16px',
                      background: T.muted, border: `2px solid ${T.ink}`, borderRadius: 12,
                      fontWeight: 600, fontSize: 14,
                    }}
                  >
                    ⏰ Time's up! The correct answer was {currentQuestion.correctAnswer}.
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
