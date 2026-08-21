import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers,
  FiClock,
  FiActivity,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiPlay,
  FiRadio,
} from 'react-icons/fi';

const EmployeeDashboard = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees/dashboard');
      setDashboardData(res.data);
    } catch (err) {
      showToast('Failed to load dashboard statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleToggleAvailability = async (newStatus) => {
    try {
      setUpdatingAvailability(true);
      const res = await API.put('/employees/availability', { availabilityStatus: newStatus });
      showToast(res.data.message, 'success');
      fetchDashboard();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update availability.';
      showToast(msg, 'error');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading Employee Dashboard...
      </div>
    );
  }

  const emp = dashboardData?.employee || {};
  const stats = dashboardData?.stats || {};
  const currCand = emp.currentCandidate;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
            <FiRadio className="animate-pulse" />
            <span>Employee Panel Active</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Welcome back, {user?.name || emp.name}!
          </h1>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-xs text-slate-400 mr-1 font-medium">Assigned Skills:</span>
            {(emp.employeeRoles || []).map((r) => (
              <span
                key={r}
                className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-bold uppercase"
              >
                {r}
              </span>
            ))}
          </div>
        </div>

        {/* Employee Availability Toggle Widget */}
        <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-xl space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 font-semibold uppercase">My Status:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                emp.availabilityStatus === 'available'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  : emp.availabilityStatus === 'busy'
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {emp.availabilityStatus}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleAvailability('available')}
              disabled={updatingAvailability || emp.availabilityStatus === 'available'}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                emp.availabilityStatus === 'available'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Available
            </button>
            <button
              onClick={() => handleToggleAvailability('offline')}
              disabled={updatingAvailability || emp.availabilityStatus === 'offline'}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                emp.availabilityStatus === 'offline'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              Offline
            </button>
          </div>
        </div>
      </div>

      {/* Dashboard Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Assigned
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-white">{stats.totalAssigned}</span>
            <FiUsers className="text-indigo-400 text-lg" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Pending
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-amber-400">{stats.pendingInterviews}</span>
            <FiClock className="text-amber-400 text-lg" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Ongoing
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-cyan-400">{stats.ongoingInterviews}</span>
            <FiActivity className="text-cyan-400 text-lg" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Completed
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-indigo-300">{stats.completedInterviews}</span>
            <FiCheckCircle className="text-indigo-300 text-lg" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Passed
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-emerald-400">{stats.passedCount}</span>
            <FiCheckCircle className="text-emerald-400 text-lg" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            Failed
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-rose-400">{stats.failedCount}</span>
            <FiXCircle className="text-rose-400 text-lg" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
            On Hold
          </span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-bold text-orange-400">{stats.onHoldCount}</span>
            <FiHelpCircle className="text-orange-400 text-lg" />
          </div>
        </div>
      </div>

      {/* Active Candidate Highlight Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></span>
            <span>Current Active Assignment</span>
          </h2>
          {currCand && (
            <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase">
              {currCand.assignmentStatus}
            </span>
          )}
        </div>

        {currCand ? (
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-white">{currCand.name}</h3>
              <p className="text-xs text-slate-400">Position: {currCand.position}</p>
              <div className="flex items-center space-x-3 pt-1">
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase">
                  Role: {currCand.requiredRole}
                </span>
                <span className="text-xs text-slate-500">{currCand.email}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/employee/current-interview')}
              className="flex items-center justify-center space-x-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex-shrink-0"
            >
              <FiPlay />
              <span>
                {currCand.assignmentStatus === 'ongoing'
                  ? 'Continue Interview'
                  : 'Start Interview'}
              </span>
            </button>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-950 rounded-xl border border-slate-800/80 text-slate-400 space-y-2">
            <p className="text-sm font-semibold text-white">No active candidate assigned right now.</p>
            <p className="text-xs text-slate-500">
              When a new candidate applies matching your skills ({emp.employeeRoles?.join(', ')}), the system will automatically assign them to you!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboard;
