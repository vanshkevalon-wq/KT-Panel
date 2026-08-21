import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, ROLE_REDIRECTS } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import {
  FiUserCheck,
  FiLock,
  FiPhone,
  FiHash,
  FiMail,
  FiArrowRight,
  FiBriefcase,
  FiShield,
  FiBookOpen,
  FiCode,
  FiGrid,
  FiUsers,
  FiAward,
  FiGlobe,
  FiCheckCircle,
  FiChevronRight,
  FiX,
} from 'react-icons/fi';

const LandingPage = () => {
  const { user, login, candidateLogin, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Modal & Tab States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    searchParams.get('modal') === 'true' || searchParams.get('role') !== null
  );
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'candidate' ? 'candidate' : 'staff'
  );
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'admin');

  // Candidate Form
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [candidateSubmitting, setCandidateSubmitting] = useState(false);

  // Staff Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  // If user is already logged in, show quick dashboard access banner
  const handleDashboardRedirect = () => {
    if (user) {
      navigate(ROLE_REDIRECTS[user.role] || '/admin/dashboard');
    }
  };

  const openCandidateLogin = () => {
    setActiveTab('candidate');
    setIsLoginModalOpen(true);
  };

  const openStaffLogin = (role = 'admin') => {
    setSelectedRole(role);
    setActiveTab('staff');
    setIsLoginModalOpen(true);
  };

  // Handle Candidate Login Submit
  const handleCandidateSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentNumber || !mobileNumber) {
      showToast('Please enter both Enrollment Number and Mobile Number.', 'error');
      return;
    }

    setCandidateSubmitting(true);
    try {
      const res = await candidateLogin(enrollmentNumber, mobileNumber);
      if (res.success) {
        setIsLoginModalOpen(false);
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      showToast(
        'Enrollment number or mobile number is incorrect. Please check your details and try again.',
        'error'
      );
    } finally {
      setCandidateSubmitting(false);
    }
  };

  // Handle Staff Login Submit
  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('Please provide both email and password.', 'error');
      return;
    }

    setStaffSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        setIsLoginModalOpen(false);
        navigate(ROLE_REDIRECTS[res.role] || '/admin/dashboard');
      }
    } catch (err) {
      showToast('Login failed. Please check your credentials.', 'error');
    } finally {
      setStaffSubmitting(false);
    }
  };

  const rolesConfig = [
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'System administration, user roles, skills master & system settings.',
      icon: FiShield,
      color: 'from-rose-500/20 to-pink-500/20 text-rose-400 border-rose-500/30',
      badge: 'Email + Password',
    },
    {
      id: 'hr',
      title: 'HR Panel',
      description: 'Candidate registration, assessment creation & interview management.',
      icon: FiUsers,
      color: 'from-indigo-500/20 to-purple-500/20 text-indigo-400 border-indigo-500/30',
      badge: 'Email + Password',
    },
    {
      id: 'receptionist',
      title: 'Receptionist Desk',
      description: 'Candidate check-in verification, physical presence & queue trigger.',
      icon: FiUserCheck,
      color: 'from-purple-500/20 to-violet-500/20 text-purple-400 border-purple-500/30',
      badge: 'Email + Password',
    },
    {
      id: 'employee',
      title: 'Employee Panel',
      description: 'Skill-matched interview assignments, evaluation & grading.',
      icon: FiBriefcase,
      color: 'from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30',
      badge: 'Email + Password',
    },
    {
      id: 'theory',
      title: 'Theory Panel',
      description: 'Theory question bank, categories, exam creation & valuation.',
      icon: FiBookOpen,
      color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30',
      badge: 'Email + Password',
    },
    {
      id: 'practical',
      title: 'Practical Panel',
      description: 'Coding tasks, practical assignments & code submission grading.',
      icon: FiCode,
      color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30',
      badge: 'Email + Password',
    },
    {
      id: 'candidate',
      title: 'Candidate Portal',
      description: 'Track application progress, interview stage & final results.',
      icon: FiAward,
      color: 'from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30',
      badge: 'Enrollment # + Mobile #',
      isCandidate: true,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950 flex flex-col">
      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-4">
            <img
              src="/kevalon-logo.svg"
              alt="Kevalon Technology Logo"
              className="h-10 w-auto object-contain"
            />
            <div className="hidden sm:block border-l border-slate-800 pl-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 block">
                Careers & Talent Portal
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider">
                Management System
              </span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-300">
            <a href="#positions" className="hover:text-white transition">
              Open Positions
            </a>
            <a href="#why-us" className="hover:text-white transition">
              Why Join Us
            </a>
            <a href="#panels" className="hover:text-white transition">
              Portal Panels
            </a>
            <a href="#process" className="hover:text-white transition">
              Process
            </a>
            <a href="#contact" className="hover:text-white transition">
              Contact HR
            </a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <button
                onClick={handleDashboardRedirect}
                className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
              >
                <FiGrid />
                <span>Go to {user.role.toUpperCase()} Dashboard</span>
              </button>
            ) : (
              <>
                <button
                  onClick={openCandidateLogin}
                  className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs transition flex items-center space-x-2"
                >
                  <FiAward className="text-teal-400" />
                  <span>Candidate Sign In</span>
                </button>

                <button
                  onClick={() => openStaffLogin('admin')}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition flex items-center space-x-2"
                >
                  <FiShield />
                  <span>Employee / Staff Portal</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold tracking-wide uppercase">
                <span>✨ NOW HIRING DEVELOPERS & ENGINEERS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-none">
                Build Your Career with <br />
                <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                  Kevalon Technology
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
                Ahmedabad thi start karo, global clients sathe kaam karo. Join a team of passionate
                engineers building high-scale web apps, AI solutions, and cloud infrastructure for
                international clients.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={openCandidateLogin}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-teal-500/25 transition flex items-center space-x-2"
                >
                  <span>Candidate Login (Enrollment + Mobile)</span>
                  <FiArrowRight className="text-base" />
                </button>

                <button
                  onClick={() => openStaffLogin('admin')}
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-xs tracking-wider uppercase transition flex items-center space-x-2"
                >
                  <span>Employee / Staff Portal Login</span>
                  <FiShield className="text-base text-cyan-400" />
                </button>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-white">10+</p>
                  <p className="text-xs text-slate-400 font-medium">Countries Served</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-cyan-400">2020</p>
                  <p className="text-xs text-slate-400 font-medium">Founded Year</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-400">100%</p>
                  <p className="text-xs text-slate-400 font-medium">Career Growth</p>
                </div>
              </div>
            </div>

            {/* Right Widget Card */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/90 border border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 relative">
                <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-600 flex items-center justify-center font-black text-white text-base">
                    KT
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Engineering Culture</h3>
                    <p className="text-[11px] text-slate-400">Solaris Hub, Ahmedabad</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse ml-auto" />
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                    <FiCode className="text-cyan-400 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white">Enterprise Stack Experience</h4>
                      <p className="text-slate-400 text-[11px]">MERN, Python, Next.js, AWS Cloud</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                    <FiGlobe className="text-indigo-400 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white">Global Client Interaction</h4>
                      <p className="text-slate-400 text-[11px]">USA, UK, Australia, Middle East Projects</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start space-x-3">
                    <FiAward className="text-amber-400 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-white">Performance Appraisals</h4>
                      <p className="text-slate-400 text-[11px]">Bi-annual reviews & promotions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Role Panels Selector Section */}
      <section id="panels" className="py-16 bg-slate-900/50 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-cyan-400">
              Role-Based Access System
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight">
              Select Your Access Portal
            </h2>
            <p className="text-xs text-slate-400">
              Click on any role panel card below to instantly sign in with your credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {rolesConfig.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() =>
                    role.isCandidate ? openCandidateLogin() : openStaffLogin(role.id)
                  }
                  className={`bg-slate-900 border rounded-2xl p-6 hover:scale-[1.02] cursor-pointer transition shadow-xl space-y-4 group flex flex-col justify-between ${role.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-xl">
                        <Icon />
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-950 border text-[10px] font-extrabold uppercase tracking-wider">
                        {role.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition">
                        {role.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-slate-300 group-hover:text-white">
                    <span>Login to {role.title}</span>
                    <FiChevronRight className="text-base group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-950 border-t border-slate-800 text-center text-xs text-slate-500 space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <img src="/kevalon-logo.svg" alt="Logo" className="h-6 w-auto opacity-70" />
          <span className="font-bold text-slate-400">Kevalon Technology Management System</span>
        </div>
        <p>© {new Date().getFullYear()} Kevalon Technology. All rights reserved.</p>
      </footer>

      {/* Unified Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Kevalon Technology Portal Login"
        maxWidth="max-w-lg"
      >
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Employee / Staff Login
            </button>
            <button
              onClick={() => setActiveTab('candidate')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'candidate'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Candidate Login
            </button>
          </div>

          {/* Tab 1: Staff Login (Admin, HR, Receptionist, Employee, Theory, Practical) */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              {/* Role Pills Selector */}
              <div>
                <label className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2">
                  Select Role Panel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'admin', label: 'Admin' },
                    { id: 'hr', label: 'HR' },
                    { id: 'receptionist', label: 'Receptionist' },
                    { id: 'employee', label: 'Employee' },
                    { id: 'theory', label: 'Theory' },
                    { id: 'practical', label: 'Practical' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedRole(r.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold border transition ${
                        selectedRole === r.id
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-slate-500 text-base" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@kevalon.in"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-slate-500 text-base" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={staffSubmitting}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{staffSubmitting ? 'Authenticating...' : `Login to ${selectedRole.toUpperCase()} Panel`}</span>
                <FiArrowRight />
              </button>
            </form>
          )}

          {/* Tab 2: Candidate Login (Enrollment Number + Mobile Number) */}
          {activeTab === 'candidate' && (
            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                ℹ Candidate credentials require Enrollment Number & Registered Mobile Number.
              </div>

              {/* Enrollment Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Enrollment Number
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-3.5 text-slate-500 text-base" />
                  <input
                    type="text"
                    required
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. KT202600001"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-emerald-400 placeholder-slate-600 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3.5 text-slate-500 text-base" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={candidateSubmitting}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                <span>{candidateSubmitting ? 'Authenticating...' : 'Login to Candidate Portal'}</span>
                <FiArrowRight />
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default LandingPage;
