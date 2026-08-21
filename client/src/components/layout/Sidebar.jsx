import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../common/ThemeToggle';
import {
  FiGrid,
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiCode,
  FiDatabase,
  FiFileText,
  FiCheckSquare,
  FiAward,
  FiActivity,
  FiSettings,
  FiUser,
  FiLogOut,
  FiX,
  FiLayers,
  FiPieChart,
  FiBell,
} from 'react-icons/fi';

const navMenus = {
  admin: [
    { label: 'Dashboard', path: '/admin/dashboard', icon: FiGrid },
    { label: 'Notifications', path: '/admin/notifications', icon: FiBell },
    { label: 'Users', path: '/admin/users', icon: FiUsers },
    { label: 'Receptionists', path: '/admin/receptionists', icon: FiUserCheck },
    { label: 'Employee Management', path: '/admin/employees', icon: FiUserCheck },
    { label: 'Skill Master', path: '/admin/skills', icon: FiLayers },
    { label: 'Candidate Queue', path: '/admin/candidate-queue', icon: FiActivity },
    { label: 'HR Management', path: '/admin/hr-management', icon: FiUserCheck },
    { label: 'Theory Management', path: '/admin/theory-management', icon: FiBookOpen },
    { label: 'Practical Management', path: '/admin/practical-management', icon: FiCode },
    { label: 'Question Bank', path: '/admin/question-bank', icon: FiDatabase },
    { label: 'PDF Import', path: '/admin/pdf-import', icon: FiFileText },
    { label: 'Exams / Assessments', path: '/admin/assessments', icon: FiCheckSquare },
    { label: 'Candidates', path: '/admin/candidates', icon: FiUserCheck },
    { label: 'Results', path: '/admin/results', icon: FiAward },
    { label: 'Reports', path: '/admin/reports', icon: FiPieChart },
    { label: 'Activity Logs', path: '/admin/activity-logs', icon: FiActivity },
    { label: 'Settings', path: '/admin/settings', icon: FiSettings },
    { label: 'Profile', path: '/admin/profile', icon: FiUser },
  ],
  receptionist: [
    { label: 'Dashboard', path: '/receptionist/dashboard', icon: FiGrid },
    { label: 'Candidate Verification', path: '/receptionist/verify', icon: FiUserCheck },
    { label: 'Waiting Queue', path: '/receptionist/queue', icon: FiActivity },
    { label: 'Today\'s Candidates', path: '/receptionist/history', icon: FiCheckSquare },
    { label: 'Profile', path: '/receptionist/profile', icon: FiUser },
  ],
  candidate: [
    { label: 'Dashboard', path: '/candidate/dashboard', icon: FiGrid },
    { label: 'My Profile', path: '/candidate/profile', icon: FiUser },
    { label: 'Application Status', path: '/candidate/status', icon: FiActivity },
    { label: 'My Result', path: '/candidate/result', icon: FiAward },
    { label: 'Notifications', path: '/candidate/notifications', icon: FiBell },
  ],
  employee: [
    { label: 'Dashboard', path: '/employee/dashboard', icon: FiGrid },
    { label: 'My Candidates', path: '/employee/candidates', icon: FiUsers },
    { label: 'Current Interview', path: '/employee/current-interview', icon: FiActivity },
    { label: 'Interview History', path: '/employee/history', icon: FiCheckSquare },
    { label: 'Profile', path: '/employee/profile', icon: FiUser },
  ],
  hr: [
    { label: 'Dashboard', path: '/hr/dashboard', icon: FiGrid },
    { label: 'Notifications', path: '/hr/notifications', icon: FiBell },
    { label: 'Candidate Queue', path: '/hr/candidate-queue', icon: FiActivity },
    { label: 'Candidates', path: '/hr/candidates', icon: FiUserCheck },
    { label: 'Assessments', path: '/hr/assessments', icon: FiCheckSquare },
    { label: 'Assign Assessment', path: '/hr/assign-assessment', icon: FiLayers },
    { label: 'Assessment Status', path: '/hr/status', icon: FiActivity },
    { label: 'Results', path: '/hr/results', icon: FiAward },
    { label: 'Candidate Reports', path: '/hr/reports', icon: FiPieChart },
    { label: 'Profile', path: '/hr/profile', icon: FiUser },
  ],
  theory: [
    { label: 'Dashboard', path: '/theory/dashboard', icon: FiGrid },
    { label: 'Notifications', path: '/theory/notifications', icon: FiBell },
    { label: 'Question Bank', path: '/theory/question-bank', icon: FiDatabase },
    { label: 'Questions', path: '/theory/questions', icon: FiBookOpen },
    { label: 'Question Categories', path: '/theory/categories', icon: FiLayers },
    { label: 'Exams', path: '/theory/exams', icon: FiCheckSquare },
    { label: 'Exam Questions', path: '/theory/exam-questions', icon: FiFileText },
    { label: 'Results', path: '/theory/results', icon: FiAward },
    { label: 'Profile', path: '/theory/profile', icon: FiUser },
  ],
  practical: [
    { label: 'Dashboard', path: '/practical/dashboard', icon: FiGrid },
    { label: 'Notifications', path: '/practical/notifications', icon: FiBell },
    { label: 'Practical Question Bank', path: '/practical/question-bank', icon: FiDatabase },
    { label: 'Tasks', path: '/practical/tasks', icon: FiCode },
    { label: 'Categories', path: '/practical/categories', icon: FiLayers },
    { label: 'Assessments', path: '/practical/assessments', icon: FiCheckSquare },
    { label: 'Results', path: '/practical/results', icon: FiAward },
    { label: 'Profile', path: '/practical/profile', icon: FiUser },
  ],
};

const roleBadges = {
  admin: { name: 'Admin Panel', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  receptionist: { name: 'Receptionist Desk', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  candidate: { name: 'Candidate Portal', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  employee: { name: 'Employee Panel', bg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  hr: { name: 'HR Panel', bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' },
  theory: { name: 'Theory Panel', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  practical: { name: 'Practical Panel', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
};

const Sidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const menuItems = navMenus[user.role] || navMenus.theory;
  const currentBadge = roleBadges[user.role] || roleBadges.admin;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/80 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header Branding */}
        <div className="h-16 px-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/kevalon-logo.png"
              alt="Kevalon Technology Logo"
              className="h-9 w-auto object-contain"
            />
          </div>

          <button
            className="lg:hidden text-slate-400 hover:text-white text-xl"
            onClick={() => setMobileOpen(false)}
          >
            <FiX />
          </button>
        </div>

        {/* Current Active Panel Badge & Theme Toggle */}
        <div className="px-4 py-3 flex items-center justify-between gap-2">
          <div className={`flex-1 px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center justify-between ${currentBadge.bg}`}>
            <span>{currentBadge.name}</span>
            <span className="w-2 h-2 rounded-full bg-current"></span>
          </div>
          <ThemeToggle />
        </div>

        {/* Navigation Items List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                }
              >
                <Icon className="text-base flex-shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* User Footer / Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 truncate">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                {user.name ? user.name[0] : 'U'}
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              title="Logout"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
            >
              <FiLogOut className="text-base" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
