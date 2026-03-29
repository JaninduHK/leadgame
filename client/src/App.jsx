import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuiz } from './context/QuizContext';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Register from './pages/Register';
import VideoPage from './pages/VideoPage';
import QuizPage from './pages/QuizPage';
import VolunteerPage from './pages/VolunteerPage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAttempts from './pages/admin/AdminAttempts';
import AdminQuestions from './pages/admin/AdminQuestions';
import AdminVideo from './pages/admin/AdminVideo';
import Navbar from './components/Navbar';

// Quiz flow guard — requires a valid session
function QuizGuard({ children }) {
  const { sessionId } = useQuiz();
  if (!sessionId) return <Navigate to="/register" replace />;
  return children;
}

// Quiz answers guard — requires answers in context
function AnswersGuard({ children }) {
  const { sessionId, answers } = useQuiz();
  if (!sessionId) return <Navigate to="/register" replace />;
  if (!answers || answers.length === 0) return <Navigate to="/quiz" replace />;
  return children;
}

// Admin route guard
function AdminGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />

        {/* Quiz flow (guarded) */}
        <Route path="/video" element={<QuizGuard><VideoPage /></QuizGuard>} />
        <Route path="/quiz" element={<QuizGuard><QuizPage /></QuizGuard>} />
        <Route path="/volunteer" element={<AnswersGuard><VolunteerPage /></AnswersGuard>} />
        <Route path="/results" element={<AnswersGuard><ResultsPage /></AnswersGuard>} />

        {/* Admin routes */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
        <Route path="/admin/attempts" element={<AdminGuard><AdminAttempts /></AdminGuard>} />
        <Route path="/admin/questions" element={<AdminGuard><AdminQuestions /></AdminGuard>} />
        <Route path="/admin/video" element={<AdminGuard><AdminVideo /></AdminGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
