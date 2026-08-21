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

