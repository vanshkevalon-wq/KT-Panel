import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth, ROLE_REDIRECTS } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './routes/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Auth Pages
import Login from './pages/auth/Login';
import Unauthorized from './pages/Unauthorized';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Receptionists from './pages/admin/Receptionists';
import Employees from './pages/admin/Employees';
import Skills from './pages/admin/Skills';
import CandidateQueue from './pages/admin/CandidateQueue';
import QuestionBank from './pages/admin/QuestionBank';
import PDFImport from './pages/admin/PDFImport';
import Assessments from './pages/admin/Assessments';
import Candidates from './pages/admin/Candidates';
import Results from './pages/admin/Results';
import ActivityLogs from './pages/admin/ActivityLogs';
import Settings from './pages/admin/Settings';
import Profile from './pages/admin/Profile';
import Notifications from './pages/Notifications';

// HR Pages
import HRDashboard from './pages/hr/Dashboard';

// Theory Pages
import TheoryDashboard from './pages/theory/Dashboard';

// Practical Pages
import PracticalDashboard from './pages/practical/Dashboard';

// Employee Pages
import EmployeeDashboard from './pages/employee/Dashboard';
import MyCandidates from './pages/employee/MyCandidates';
import CurrentInterview from './pages/employee/CurrentInterview';
import InterviewHistory from './pages/employee/InterviewHistory';
import EmployeeProfile from './pages/employee/Profile';

// Candidate Panel Pages
import CandidateLogin from './pages/candidate/Login';
import CandidateDashboard from './pages/candidate/Dashboard';
import CandidateProfile from './pages/candidate/Profile';
import ApplicationStatus from './pages/candidate/ApplicationStatus';
import CandidateResult from './pages/candidate/Result';
import CandidateNotifications from './pages/candidate/Notifications';

// Receptionist Desk Pages
import ReceptionistDashboard from './pages/receptionist/Dashboard';
import ReceptionistVerification from './pages/receptionist/Verification';
import ReceptionistQueue from './pages/receptionist/Queue';
import ReceptionistHistory from './pages/receptionist/History';
import ReceptionistProfile from './pages/receptionist/Profile';

// Candidate Test Runner
import TakeAssessment from './pages/candidate/TakeAssessment';

const RootRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_REDIRECTS[user.role] || '/login'} replace />;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/candidate/login" element={<CandidateLogin />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/assessment/take/:assignmentId" element={<TakeAssessment />} />

      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* Admin Panel Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="users" element={<Users />} />
        <Route path="receptionists" element={<Receptionists />} />
        <Route path="employees" element={<Employees />} />
        <Route path="skills" element={<Skills />} />
        <Route path="candidate-queue" element={<CandidateQueue />} />
        <Route path="hr-management" element={<Candidates />} />
        <Route path="theory-management" element={<QuestionBank />} />
        <Route path="practical-management" element={<QuestionBank />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="pdf-import" element={<PDFImport />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="results" element={<Results />} />
        <Route path="reports" element={<Results />} />
        <Route path="activity-logs" element={<ActivityLogs />} />
        <Route path="settings" element={<Settings />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Candidate Panel Routes */}
      <Route
        path="/candidate"
        element={
          <ProtectedRoute allowedRoles={['candidate']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<CandidateDashboard />} />
        <Route path="profile" element={<CandidateProfile />} />
        <Route path="status" element={<ApplicationStatus />} />
        <Route path="result" element={<CandidateResult />} />
        <Route path="notifications" element={<CandidateNotifications />} />
      </Route>

      {/* Receptionist Desk Routes */}
      <Route
        path="/receptionist"
        element={
          <ProtectedRoute allowedRoles={['receptionist']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<ReceptionistDashboard />} />
        <Route path="verify" element={<ReceptionistVerification />} />
        <Route path="queue" element={<ReceptionistQueue />} />
        <Route path="history" element={<ReceptionistHistory />} />
        <Route path="profile" element={<ReceptionistProfile />} />
      </Route>

      {/* Employee Panel Routes */}
      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="candidates" element={<MyCandidates />} />
        <Route path="current-interview" element={<CurrentInterview />} />
        <Route path="history" element={<InterviewHistory />} />
        <Route path="profile" element={<EmployeeProfile />} />
      </Route>

      {/* HR Panel Routes */}
      <Route
        path="/hr"
        element={
          <ProtectedRoute allowedRoles={['hr']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<HRDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="candidate-queue" element={<CandidateQueue />} />
        <Route path="candidates" element={<Candidates />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="assign-assessment" element={<Assessments />} />
        <Route path="status" element={<HRDashboard />} />
        <Route path="results" element={<Results />} />
        <Route path="reports" element={<Results />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Theory Panel Routes */}
      <Route
        path="/theory"
        element={
          <ProtectedRoute allowedRoles={['theory']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<TheoryDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="questions" element={<QuestionBank />} />
        <Route path="categories" element={<QuestionBank />} />
        <Route path="exams" element={<Assessments />} />
        <Route path="exam-questions" element={<QuestionBank />} />
        <Route path="results" element={<Results />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Practical Panel Routes */}
      <Route
        path="/practical"
        element={
          <ProtectedRoute allowedRoles={['practical']}>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<PracticalDashboard />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="question-bank" element={<QuestionBank />} />
        <Route path="tasks" element={<QuestionBank />} />
        <Route path="categories" element={<QuestionBank />} />
        <Route path="assessments" element={<Assessments />} />
        <Route path="results" element={<Results />} />
        <Route path="profile" element={<Profile />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

