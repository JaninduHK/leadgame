import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuiz } from './context/QuizContext';
import { useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Register from './pages/Register';
import PinEntry from './pages/PinEntry';
import VideoPage from './pages/VideoPage';
import QuizPage from './pages/QuizPage';
import VolunteerPage from './pages/VolunteerPage';
import ResultsPage from './pages/ResultsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import CampaignLeaderboard from './pages/CampaignLeaderboard';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminAttempts from './pages/admin/AdminAttempts';
import AdminCampaigns from './pages/admin/AdminCampaigns';
import AdminCampaignEdit from './pages/admin/AdminCampaignEdit';
import AdminCampaignEntries from './pages/admin/AdminCampaignEntries';
import AdminAdmins from './pages/admin/AdminAdmins';
import Navbar from './components/Navbar';
import AdminLayout from './components/AdminLayout';

function QuizGuard({ children }) {
  const { sessionId } = useQuiz();
  if (!sessionId) return <Navigate to="/register" replace />;
  return children;
}

function AnswersGuard({ children }) {
  const { sessionId, answers } = useQuiz();
  if (!sessionId) return <Navigate to="/register" replace />;
  if (!answers || answers.length === 0) return <Navigate to="/quiz" replace />;
  return children;
}

function AdminGuard({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

function SuperAdminGuard({ children }) {
  const { isAuthenticated, isSuperAdmin } = useAuth();
  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (!isSuperAdmin) return <Navigate to="/admin/dashboard" replace />;
  return <AdminLayout>{children}</AdminLayout>;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/play" element={<PinEntry />} />
        <Route path="/play/:pin" element={<PinEntry />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/leaderboard/:campaignId" element={<CampaignLeaderboard />} />

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
        <Route path="/admin/campaigns" element={<AdminGuard><AdminCampaigns /></AdminGuard>} />
        <Route path="/admin/campaigns/new" element={<AdminGuard><AdminCampaignEdit /></AdminGuard>} />
        <Route path="/admin/campaigns/:id" element={<AdminGuard><AdminCampaignEdit /></AdminGuard>} />
        <Route path="/admin/campaigns/:id/entries" element={<AdminGuard><AdminCampaignEntries /></AdminGuard>} />
        <Route path="/admin/admins" element={<SuperAdminGuard><AdminAdmins /></SuperAdminGuard>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
