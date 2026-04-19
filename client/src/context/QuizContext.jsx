import { createContext, useContext, useState, useEffect } from 'react';

const QuizContext = createContext(null);

const STORAGE_KEY = 'aiesec_quiz_state';

const defaultState = {
  sessionId: null,
  userName: '',
  userEmail: '',
  userPhone: '',
  campaignId: null,
  campaignTitle: '',
  answers: [],
  volunteerInterest: false,
  videoViews: 0,
  videoCompleted: false,
  quizCompleted: false,
  results: null,
};

export function QuizProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...defaultState, ...JSON.parse(saved) } : defaultState;
    } catch {
      return defaultState;
    }
  });

  // Persist state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const setUser = (userData) => {
    setState((prev) => ({ ...prev, ...userData }));
  };

  const setSessionId = (id) => {
    setState((prev) => ({ ...prev, sessionId: id }));
  };

  const incrementVideoView = () => {
    setState((prev) => ({ ...prev, videoViews: prev.videoViews + 1 }));
  };

  const setVideoCompleted = () => {
    setState((prev) => ({ ...prev, videoCompleted: true }));
  };

  const addAnswer = (answer) => {
    setState((prev) => ({
      ...prev,
      answers: [...prev.answers, answer],
    }));
  };

  const setAnswers = (answers) => {
    setState((prev) => ({ ...prev, answers }));
  };

  const setVolunteerInterest = (val) => {
    setState((prev) => ({ ...prev, volunteerInterest: val }));
  };

  const setResults = (results) => {
    setState((prev) => ({ ...prev, results, quizCompleted: true }));
  };

  const setCampaign = (id, title = '') => {
    setState((prev) => ({ ...prev, campaignId: id, campaignTitle: title }));
  };

  const resetQuiz = () => {
    const resetState = {
      ...defaultState,
      userName: state.userName,
      userEmail: state.userEmail,
      userPhone: state.userPhone,
    };
    setState(resetState);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <QuizContext.Provider
      value={{
        ...state,
        setUser,
        setSessionId,
        setCampaign,
        incrementVideoView,
        setVideoCompleted,
        addAnswer,
        setAnswers,
        setVolunteerInterest,
        setResults,
        resetQuiz,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const ctx = useContext(QuizContext);
  if (!ctx) throw new Error('useQuiz must be used within QuizProvider');
  return ctx;
}
