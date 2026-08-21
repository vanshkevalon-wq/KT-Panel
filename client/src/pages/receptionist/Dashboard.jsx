import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers,
  FiUserCheck,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiSearch,
  FiArrowRight,
} from 'react-icons/fi';

const ReceptionistDashboard = () => {
  const { showToast, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/receptionist/dashboard');
      setStats(res.data.stats || {});
    } catch (err) {
      showToast('Failed to load receptionist dashboard stats.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/receptionist/verify?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Welcome & Quick Search Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 font-extrabold text-xs tracking-wider uppercase">
            <span>Receptionist Desk</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {user?.name || 'Receptionist'}
          </h1>
          <p className="text-xs text-slate-400">
            Verify arriving candidates and manage physical check-ins for interview queue assignment.
          </p>
        </div>

        {/* Search Bar Widget */}
        <form onSubmit={handleQuickSearchSubmit} className="flex items-center space-x-2 w-full md:w-80">
          <div className="relative w-full">
            <FiSearch className="absolute left-3.5 top-3 text-slate-500 text-sm" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Enrollment or Mobile..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center space-x-1 flex-shrink-0"
          >
            <span>Verify</span>
            <FiArrowRight />
          </button>
        </form>
      </div>

      {/* Summary Cards */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 text-xs">Loading desk stats...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500">Today's Candidates</span>
            <p className="text-2xl font-black text-white">{stats?.todaysTotal || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-500">Pending Verification</span>
            <p className="text-2xl font-black text-amber-400">{stats?.pendingVerification || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-emerald-500">Verified Today</span>
            <p className="text-2xl font-black text-emerald-400">{stats?.verifiedCount || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-indigo-500">Waiting for Employee</span>
            <p className="text-2xl font-black text-indigo-400">{stats?.waitingForEmployee || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-cyan-500">Interviews Ongoing</span>
            <p className="text-2xl font-black text-cyan-400">{stats?.interviewsOngoing || 0}</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1">
            <span className="text-[10px] uppercase font-bold text-purple-500">Completed Today</span>
            <p className="text-2xl font-black text-purple-400">{stats?.completedToday || 0}</p>
          </div>
        </div>
      )}

      {/* Quick Action Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          onClick={() => navigate('/receptionist/verify')}
          className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 p-6 rounded-2xl cursor-pointer transition space-y-2 group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl group-hover:scale-105 transition">
            <FiUserCheck />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition">
            Candidate Verification Desk →
          </h3>
          <p className="text-xs text-slate-400">
            Search arriving candidates by Enrollment Number or Mobile Number and confirm check-in with "Candidate Is Here".
          </p>
        </div>

        <div
          onClick={() => navigate('/receptionist/queue')}
          className="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl cursor-pointer transition space-y-2 group shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xl group-hover:scale-105 transition">
            <FiActivity />
          </div>
          <h3 className="text-base font-bold text-white group-hover:text-indigo-400 transition">
            Live Waiting Queue →
          </h3>
          <p className="text-xs text-slate-400">
            View real-time list of verified candidates waiting in queue for matching skill employees.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;
