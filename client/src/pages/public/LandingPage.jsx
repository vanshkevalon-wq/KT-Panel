import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth, ROLE_REDIRECTS } from '../../context/AuthContext';
import API from '../../services/api';
import Modal from '../../components/common/Modal';
import ThemeToggle from '../../components/common/ThemeToggle';
import KevalonLogo from '../../components/common/KevalonLogo';
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
  FiMapPin,
  FiClock,
  FiSend,
  FiStar,
  FiTrendingUp,
  FiLayers,
  FiHeart,
  FiMenu,
  FiX,
  FiCheckSquare,
} from 'react-icons/fi';

const LandingPage = () => {
  const { user, login, candidateLogin, showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Navigation Mobile Drawer State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Modal & Tab States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(
    searchParams.get('modal') === 'true' || searchParams.get('role') !== null
  );
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'candidate' ? 'candidate' : 'staff'
  );
  const [selectedRole, setSelectedRole] = useState(searchParams.get('role') || 'admin');

  // Job Application Modal State
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applyName, setApplyName] = useState('');
  const [applyEmail, setApplyEmail] = useState('');
  const [applyPhone, setApplyPhone] = useState('');
  const [applyNotes, setApplyNotes] = useState('');
  const [applySubmitting, setApplySubmitting] = useState(false);

  // Open Positions Filter State
  const [positionFilter, setPositionFilter] = useState('All');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitting, setContactSubmitting] = useState(false);

  // Candidate Login Form
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [candidateSubmitting, setCandidateSubmitting] = useState(false);

  // Staff Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [staffSubmitting, setStaffSubmitting] = useState(false);

  const handleDashboardRedirect = () => {
    if (user) {
      navigate(ROLE_REDIRECTS[user.role] || '/admin/dashboard');
    }
  };

  const openCandidateLogin = () => {
    setActiveTab('candidate');
    setIsLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openStaffLogin = (role = 'admin') => {
    setSelectedRole(role);
    setActiveTab('staff');
    setIsLoginModalOpen(true);
    setMobileMenuOpen(false);
  };

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setApplyName('');
    setApplyEmail('');
    setApplyPhone('');
    setApplyNotes('');
    setIsApplyModalOpen(true);
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
        'Enrollment number or mobile number is incorrect. Please check details and try again.',
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

  // Handle Contact HR Submit
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactMessage) {
      showToast('Please fill out all required contact fields.', 'error');
      return;
    }

    setContactSubmitting(true);
    try {
      const res = await API.post('/public/contact', {
        name: contactName,
        email: contactEmail,
        phone: contactPhone,
        subject: contactSubject,
        message: contactMessage,
      });
      showToast(res.data.message || 'Thank you! Your message has been sent to Kevalon HR team.', 'success');
      setContactName('');
      setContactEmail('');
      setContactPhone('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setContactSubmitting(false);
    }
  };

  // Handle Quick Job Application Submit
  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!applyName || !applyEmail || !applyPhone) {
      showToast('Name, email, and phone number are required.', 'error');
      return;
    }

    setApplySubmitting(true);
    try {
      const res = await API.post('/public/apply', {
        name: applyName,
        email: applyEmail,
        phone: applyPhone,
        position: selectedJob?.title || 'Software Engineer',
        department: selectedJob?.department || 'Engineering',
        experience: selectedJob?.experience || '',
        notes: applyNotes,
      });
      showToast(res.data.message || 'Application submitted successfully!', 'success');
      setIsApplyModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit application.', 'error');
    } finally {
      setApplySubmitting(false);
    }
  };

  const rolesConfig = [
    {
      id: 'admin',
      title: 'Admin Panel',
      description: 'System administration, user roles, skills master & system settings.',
      icon: FiShield,
      badge: 'Email + Password',
      color: 'border-rose-500/30 text-rose-500 dark:text-rose-400',
    },
    {
      id: 'hr',
      title: 'HR Panel',
      description: 'Candidate registration, assessment creation & interview management.',
      icon: FiUsers,
      badge: 'Email + Password',
      color: 'border-indigo-500/30 text-indigo-600 dark:text-indigo-400',
    },
    {
      id: 'employee',
      title: 'Employee Panel',
      description: 'Skill-matched interview assignments, evaluation & grading.',
      icon: FiBriefcase,
      badge: 'Email + Password',
      color: 'border-cyan-500/30 text-cyan-600 dark:text-cyan-400',
    },
    {
      id: 'theory',
      title: 'Theory Panel',
      description: 'Theory question bank, categories, exam creation & valuation.',
      icon: FiBookOpen,
      badge: 'Email + Password',
      color: 'border-amber-500/30 text-amber-600 dark:text-amber-400',
    },
    {
      id: 'practical',
      title: 'Practical Panel',
      description: 'Coding tasks, practical assignments & code submission grading.',
      icon: FiCode,
      badge: 'Email + Password',
      color: 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400',
    },
    {
      id: 'candidate',
      title: 'Candidate Portal',
      description: 'Track application progress, interview stage & final results.',
      icon: FiAward,
      badge: 'Enrollment # + Mobile #',
      color: 'border-teal-500/30 text-teal-600 dark:text-teal-400',
      isCandidate: true,
    },
  ];

  const [jobOpenings, setJobOpenings] = useState([
    {
      _id: '1',
      title: 'Senior Full Stack Developer (Node.js + React)',
      category: 'Full Stack',
      department: 'Engineering',
      experience: '3 - 5 Years',
      location: 'Ahmedabad / Hybrid',
      type: 'Full-Time',
      tags: ['React.js', 'Node.js', 'MongoDB', 'AWS', 'Tailwind CSS'],
    },
    {
      _id: '2',
      title: 'Frontend Engineer (React & Next.js)',
      category: 'Frontend',
      department: 'Web Development',
      experience: '1 - 3 Years',
      location: 'Solaris Hub, Ahmedabad',
      type: 'Full-Time',
      tags: ['React.js', 'Next.js', 'TypeScript', 'Tailwind'],
    },
    {
      _id: '3',
      title: 'Python / AI Backend Engineer',
      category: 'Backend',
      department: 'AI & Data Labs',
      experience: '2 - 4 Years',
      location: 'Ahmedabad / Remote',
      type: 'Full-Time',
      tags: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'Generative AI'],
    },
    {
      _id: '4',
      title: 'Quality Assurance & Test Automation Engineer',
      category: 'QA',
      department: 'Quality Assurance',
      experience: '1 - 3 Years',
      location: 'Solaris Hub, Ahmedabad',
      type: 'Full-Time',
      tags: ['Cypress', 'Playwright', 'Jest', 'API Testing'],
    },
    {
      _id: '5',
      title: 'UI/UX Product Designer',
      category: 'Design',
      department: 'Product & Design',
      experience: '2+ Years',
      location: 'Solaris Hub, Ahmedabad',
      type: 'Full-Time',
      tags: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    },
  ]);

  useEffect(() => {
    const fetchPublicJobOpenings = async () => {
      try {
        const res = await API.get('/public/job-openings');
        if (Array.isArray(res.data) && res.data.length > 0) {
          setJobOpenings(res.data);
        }
      } catch (err) {
        console.error('Failed to fetch public job openings:', err);
      }
    };
    fetchPublicJobOpenings();
  }, []);

  const categories = ['All', ...Array.from(new Set(jobOpenings.map((j) => j.category || 'Other')))];

  const filteredJobs = positionFilter === 'All'
    ? jobOpenings
    : jobOpenings.filter((job) => job.category === positionFilter);

  const perksList = [
    {
      icon: FiGlobe,
      title: 'Global Client Exposure',
      description: 'Work directly on enterprise software for international clients in USA, UK, Australia & Middle East.',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    },
    {
      icon: FiCode,
      title: 'Modern Tech Stack',
      description: 'Build with modern architectures using MERN, Next.js, Python, Docker, microservices, and AWS Cloud.',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    },
    {
      icon: FiTrendingUp,
      title: 'Fast-Track Career Growth',
      description: 'Bi-annual performance evaluations, mentorship from senior architects, and clear promotion paths.',
      color: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    {
      icon: FiStar,
      title: 'Competitive Rewards',
      description: 'Market-leading salaries, performance bonuses, festive incentives, and annual appraisal perks.',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
    },
    {
      icon: FiHeart,
      title: 'Work-Life Harmony',
      description: 'Flexible working hours, supportive leadership, 5-day work week, and generous paid leave policy.',
      color: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    },
    {
      icon: FiLayers,
      title: 'State-of-the-Art Workspace',
      description: 'Ergonomic workstations in Solaris Hub, SG Highway, Ahmedabad with high-speed fiber internet and coffee lounge.',
      color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    },
  ];

  const processSteps = [
    {
      step: '01',
      title: 'Online Application & Registration',
      description: 'Register via HR desk or candidate portal to receive your unique KT Enrollment Number.',
      icon: FiAward,
    },
    {
      step: '02',
      title: 'Reception Check-In & Verification',
      description: 'Arrive at Kevalon Reception Desk, verify enrollment # / mobile #, and enter physical waiting queue.',
      icon: FiUserCheck,
    },
    {
      step: '03',
      title: 'Skill Assessment & Evaluation',
      description: 'Complete skill-matched Theory & Practical coding evaluations assigned to expert interviewers.',
      icon: FiCheckSquare,
    },
    {
      step: '04',
      title: 'HR Discussion & Onboarding',
      description: 'Review performance scores, complete final HR discussion, and receive your official offer letter.',
      icon: FiShield,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-sky-500 selection:text-white flex flex-col transition-colors duration-300">
      {/* Header Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-sm transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-4">
            <KevalonLogo />
            <div className="hidden md:block border-l border-slate-200 dark:border-slate-800 pl-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 block">
                Careers & Talent Portal
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 tracking-wider">
                Management System
              </span>
            </div>
          </div>

          {/* Nav Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-8 text-xs font-bold text-slate-700 dark:text-slate-300">
            <a href="#positions" className="hover:text-sky-600 dark:hover:text-white transition">
              Open Positions
            </a>
            <a href="#why-us" className="hover:text-sky-600 dark:hover:text-white transition">
              Why Join Us
            </a>
            <a href="#panels" className="hover:text-sky-600 dark:hover:text-white transition">
              Portal Panels
            </a>
            <a href="#process" className="hover:text-sky-600 dark:hover:text-white transition">
              Process
            </a>
            <a href="#contact" className="hover:text-sky-600 dark:hover:text-white transition">
              Contact HR
            </a>
          </nav>

          {/* Action Buttons & Theme Toggle */}
          <div className="flex items-center space-x-3">
            <ThemeToggle className="shadow-sm" />

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 transition"
              title="Toggle Menu"
            >
              {mobileMenuOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
            </button>

            {user ? (
              <button
                onClick={handleDashboardRedirect}
                className="hidden sm:flex px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition items-center space-x-2"
              >
                <FiGrid />
                <span>Go to {user.role.toUpperCase()} Dashboard</span>
              </button>
            ) : (
              <div className="hidden sm:flex items-center space-x-2">
                <button
                  onClick={openCandidateLogin}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition flex items-center space-x-1.5 shadow-sm"
                >
                  <FiAward className="text-teal-600 dark:text-teal-400" />
                  <span>Candidate Sign In</span>
                </button>

                <button
                  onClick={() => openStaffLogin('admin')}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-600/25 transition flex items-center space-x-1.5"
                >
                  <FiShield />
                  <span>Staff Portal</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-3 animate-in fade-in slide-in-from-top-2">
            <nav className="flex flex-col space-y-2 text-xs font-bold text-slate-700 dark:text-slate-300">
              <a
                href="#positions"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-sky-600 transition"
              >
                Open Positions
              </a>
              <a
                href="#why-us"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-sky-600 transition"
              >
                Why Join Us
              </a>
              <a
                href="#panels"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-sky-600 transition"
              >
                Portal Panels
              </a>
              <a
                href="#process"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-sky-600 transition"
              >
                Process
              </a>
              <a
                href="#contact"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-sky-600 transition"
              >
                Contact HR
              </a>
            </nav>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={handleDashboardRedirect}
                  className="w-full py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2"
                >
                  <FiGrid />
                  <span>Go to {user.role.toUpperCase()} Dashboard</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={openCandidateLogin}
                    className="w-full py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                  >
                    <FiAward className="text-teal-500" />
                    <span>Candidate Sign In</span>
                  </button>
                  <button
                    onClick={() => openStaffLogin('admin')}
                    className="w-full py-2.5 bg-sky-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2"
                  >
                    <FiShield />
                    <span>Employee / Staff Portal</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-400 text-xs font-extrabold tracking-wide uppercase">
                <span>✨ NOW HIRING DEVELOPERS & ENGINEERS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-none">
                Build Your Career with <br />
                <span className="bg-gradient-to-r from-sky-600 via-teal-500 to-indigo-600 dark:from-sky-400 dark:via-teal-300 dark:to-indigo-400 bg-clip-text text-transparent">
                  Kevalon Technology
                </span>
              </h1>

              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-2xl">
                Join a team of passionate software engineers, cloud architects, and product designers building high-scale web applications, AI solutions, and enterprise software for global clients.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={openCandidateLogin}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 dark:from-teal-500 dark:to-emerald-500 hover:from-teal-500 hover:to-emerald-400 text-white font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-teal-600/20 transition flex items-center space-x-2"
                >
                  <span>Candidate Portal Sign In</span>
                  <FiArrowRight className="text-base" />
                </button>

                <a
                  href="#positions"
                  className="px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xs tracking-wider uppercase shadow-md transition flex items-center space-x-2"
                >
                  <span>View Open Positions</span>
                  <FiBriefcase className="text-base text-sky-600 dark:text-sky-400" />
                </a>
              </div>

              {/* Stats Bar */}
              <div className="pt-8 border-t border-slate-200 dark:border-slate-800/80 grid grid-cols-3 gap-6 max-w-lg">
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">10+</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Countries Served</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-sky-600 dark:text-sky-400">2020</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Founded Year</p>
                </div>
                <div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Career Growth</p>
                </div>
              </div>
            </div>

            {/* Right Widget Card */}
            <div className="lg:col-span-5">
              <div className="bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xl space-y-4 relative transition-colors">
                <div className="flex items-center space-x-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center font-black text-white text-base shadow-md">
                    KT
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Engineering Culture</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Solaris Hub, Ahmedabad</p>
                  </div>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-auto" />
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                    <FiCode className="text-sky-600 dark:text-sky-400 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Enterprise Stack Experience</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">MERN, Python, Next.js, AWS Cloud</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                    <FiGlobe className="text-indigo-600 dark:text-indigo-400 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Global Client Interaction</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">USA, UK, Australia, Middle East Projects</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start space-x-3">
                    <FiAward className="text-amber-600 dark:text-amber-400 text-lg mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Performance Appraisals</h4>
                      <p className="text-slate-600 dark:text-slate-400 text-[11px]">Bi-annual reviews & promotions</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 1: OPEN POSITIONS */}
      {/* ========================================================================= */}
      <section id="positions" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full inline-block">
              CAREER OPPORTUNITIES
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Explore Open Positions
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Join our engineering team at Solaris Hub, Ahmedabad. Choose a role matching your skill set and apply today.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setPositionFilter(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                  positionFilter === cat
                    ? 'bg-sky-600 border-sky-500 text-white shadow-lg shadow-sky-600/30'
                    : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Open Positions Cards List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job._id || job.id}
                className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 space-y-5 hover:border-sky-500/50 transition shadow-lg flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block">
                        {job.department}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                        {job.title}
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold uppercase flex-shrink-0">
                      {job.type}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <span className="flex items-center space-x-1.5">
                      <FiBriefcase className="text-sky-500" />
                      <span>{job.experience}</span>
                    </span>
                    <span className="flex items-center space-x-1.5">
                      <FiMapPin className="text-rose-500" />
                      <span>{job.location}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {job.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => openApplyModal(job)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-sky-600/20 transition flex items-center justify-center space-x-2"
                  >
                    <span>Apply for Position</span>
                    <FiArrowRight />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 2: WHY JOIN US */}
      {/* ========================================================================= */}
      <section id="why-us" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full inline-block">
              LIFE AT KEVALON
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Why Join Kevalon Technology?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              We empower developers to build impactful global software products with continuous mentorship, high performance rewards, and work-life balance.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {perksList.map((perk, idx) => {
              const Icon = perk.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-4 hover:scale-[1.02] transition shadow-lg"
                >
                  <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl ${perk.color}`}>
                    <Icon />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {perk.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 3: PORTAL PANELS */}
      {/* ========================================================================= */}
      <section id="panels" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-sky-600 dark:text-sky-400 bg-sky-500/10 border border-sky-500/20 px-3 py-1 rounded-full inline-block">
              ROLE-BASED ACCESS SYSTEM
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Select Access Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Select your role panel card below to sign in with authorized credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {rolesConfig.map((role) => {
              const Icon = role.icon;
              return (
                <div
                  key={role.id}
                  onClick={() =>
                    role.isCandidate ? openCandidateLogin() : openStaffLogin(role.id)
                  }
                  className={`bg-slate-50 dark:bg-slate-900 border rounded-3xl p-6 hover:scale-[1.02] cursor-pointer transition shadow-lg hover:shadow-2xl space-y-4 group flex flex-col justify-between ${role.color}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-xl">
                        <Icon />
                      </div>
                      <span className="px-3 py-1 rounded-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {role.badge}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-300 transition">
                        {role.title}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {role.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-sky-600 dark:group-hover:text-white">
                    <span>Login to {role.title}</span>
                    <FiChevronRight className="text-base group-hover:translate-x-1 transition" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 4: PROCESS */}
      {/* ========================================================================= */}
      <section id="process" className="py-20 bg-slate-100/70 dark:bg-slate-900/40 border-t border-slate-200 dark:border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full inline-block">
              RECRUITMENT PIPELINE
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Our 4-Step Selection Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Transparent, automated, and candidate-friendly evaluation workflow from check-in to offer letter.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {processSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl space-y-4 relative shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 flex items-center justify-center text-lg font-bold">
                      <Icon />
                    </div>
                    <span className="text-2xl font-black text-slate-300 dark:text-slate-800 font-mono">
                      {step.step}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h3>

                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* SECTION 5: CONTACT HR */}
      {/* ========================================================================= */}
      <section id="contact" className="py-20 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 scroll-mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full inline-block">
              GET IN TOUCH WITH HR
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              Contact Kevalon HR Team
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Have questions about career opportunities, candidate check-in, or interview process? Send a direct message to HR.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Contact Details Card */}
            <div className="lg:col-span-5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                <FiMail className="text-purple-500" />
                <span>HR Office Contact Info</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <FiMapPin className="text-rose-500 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Headquarters Address</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                      Solaris Business Hub, 913, Sola Rd, opp. The National Higher Secondary School, Vardhmannagar Society, C.P. Nagar-1, Naranpura, Ahmedabad, Gujarat 380063
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <FiMail className="text-sky-500 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Career Emails</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">sales@kevalontechnology.in</p>
                    <p className="text-slate-600 dark:text-slate-400">hr@kevalontechnology.in</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <FiPhone className="text-emerald-500 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">HR Desk Phone</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">+91 90810 12218 / +91 91040 12218</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                  <FiClock className="text-amber-500 text-lg mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">Office Timings</h4>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">Monday – Saturday: 10:00 AM – 7:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Contact Form */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-xl space-y-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Send Direct Message
              </h3>

              <form onSubmit={handleContactSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="e.g. Rahul Patel"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="rahul@example.com"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="9081012218"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="e.g. Job Application Query"
                      className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Your Message *
                  </label>
                  <textarea
                    rows="4"
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={contactSubmitting}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <FiSend />
                  <span>{contactSubmitting ? 'Sending Message...' : 'Send Message to HR'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 transition-colors space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <KevalonLogo className="h-6 w-auto" />
        </div>
        <p>© {new Date().getFullYear()} Kevalon Technology. All rights reserved.</p>
      </footer>

      {/* Quick Job Application Modal */}
      <Modal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        title={`Apply for Position: ${selectedJob?.title || 'Open Position'}`}
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 dark:text-sky-400 font-semibold">
            📋 Submit your application details below. Our HR team will review and contact you!
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={applyName}
              onChange={(e) => setApplyName(e.target.value)}
              placeholder="e.g. Rahul Patel"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={applyEmail}
              onChange={(e) => setApplyEmail(e.target.value)}
              placeholder="rahul@example.com"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Mobile Number *
            </label>
            <input
              type="tel"
              required
              value={applyPhone}
              onChange={(e) => setApplyPhone(e.target.value)}
              placeholder="9081012218"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Additional Experience / Qualifications / Portfolio Link
            </label>
            <textarea
              rows="3"
              value={applyNotes}
              onChange={(e) => setApplyNotes(e.target.value)}
              placeholder="Briefly describe your experience or share links..."
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsApplyModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applySubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-sky-600/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <FiSend />
              <span>{applySubmitting ? 'Submitting...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Unified Login Modal */}
      <Modal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        title="Kevalon Technology Portal Login"
        maxWidth="max-w-lg"
      >
        <div className="space-y-6">
          {/* Tab Switcher */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab('staff')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'staff'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Employee / Staff Login
            </button>
            <button
              onClick={() => setActiveTab('candidate')}
              className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'candidate'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Candidate Login
            </button>
          </div>

          {/* Tab 1: Staff Login */}
          {activeTab === 'staff' && (
            <form onSubmit={handleStaffSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Select Role Panel
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'admin', label: 'Admin' },
                    { id: 'hr', label: 'HR' },
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
                          : 'bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. admin@kevalon.in"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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

          {/* Tab 2: Candidate Login */}
          {activeTab === 'candidate' && (
            <form onSubmit={handleCandidateSubmit} className="space-y-4">
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                ℹ Candidate credentials require Enrollment Number & Registered Mobile Number.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Enrollment Number
                </label>
                <div className="relative">
                  <FiHash className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
                  <input
                    type="text"
                    required
                    value={enrollmentNumber}
                    onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                    placeholder="e.g. KT202600001"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 placeholder-slate-400 uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Registered Mobile Number
                </label>
                <div className="relative">
                  <FiPhone className="absolute left-3.5 top-3.5 text-slate-400 text-base" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
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