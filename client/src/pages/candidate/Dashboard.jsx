import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiCheckCircle,
  FiClock,
  FiUserCheck,
  FiClipboard,
  FiAward,
  FiAlertCircle,
  FiArrowRight,
  FiHelpCircle,
} from 'react-icons/fi';

const CandidateDashboard = () => {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/candidate/dashboard');
      setData(res.data);
    } catch (err) {
      showToast('Failed to load candidate dashboard.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading Candidate Portal...
      </div>
    );
  }

  if (!data || !data.candidate) {
    return (
      <div className="p-6 text-center text-slate-400">
        Candidate details not available.
      </div>
    );
  }

  const { candidate, timeline } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-xs tracking-wider uppercase">
            <span>Enrollment #{candidate.enrollmentNumber}</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Welcome, {candidate.name}
          </h1>
          <p className="text-xs text-slate-400">
            Applied Role: <strong className="text-indigo-400 uppercase">{candidate.requiredRole}</strong> ({candidate.position})
          </p>
        </div>

        <Link
          to="/candidate/result"
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition"
        >
          <FiAward />
          <span>View My Result</span>
          <FiArrowRight />
        </Link>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Application Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Application Status
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white capitalize">
              {candidate.applicationStatus === 'registered' ? 'Submitted' : candidate.applicationStatus}
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <FiClipboard className="text-base" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {candidate.applicationStatus === 'registered' && 'Profile registered. Next step: Reception check-in.'}
            {candidate.applicationStatus === 'verified' && 'Verified at Reception. Queued for interview.'}
            {['assigned', 'ongoing'].includes(candidate.applicationStatus) && 'Interview currently in progress.'}
            {candidate.applicationStatus === 'completed' && 'Interview evaluation completed.'}
          </p>
        </div>

        {/* Interview Status */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Interview Stage
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white capitalize">
              {candidate.interviewStatus || 'Waiting'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <FiUserCheck className="text-base" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {candidate.assignmentStatus === 'waiting' && 'In load-balanced queue for matching employee.'}
            {candidate.assignmentStatus === 'assigned' && 'Evaluator assigned. Interview starting shortly.'}
            {candidate.assignmentStatus === 'ongoing' && 'Interview session in progress.'}
            {['passed', 'failed', 'on_hold', 'completed'].includes(candidate.assignmentStatus) && 'Interview finished.'}
          </p>
        </div>

        {/* Result Summary Card */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
          <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
            Interview Result
          </span>
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white">
              {candidate.result === 'pass' ? 'PASS' : candidate.result === 'fail' ? 'Not Selected' : candidate.result === 'on_hold' ? 'On Hold' : 'Pending Review'}
            </span>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              candidate.result === 'pass'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : candidate.result === 'fail'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                : candidate.result === 'on_hold'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'bg-slate-800 text-slate-400'
            }`}>
              <FiAward className="text-base" />
            </div>
          </div>
          <p className="text-[11px] text-slate-400">
            {candidate.result === 'pass' && '🎉 Cleared interview criteria successfully!'}
            {candidate.result === 'fail' && 'ℹ️ Evaluation completed. Click to view feedback.'}
            {candidate.result === 'on_hold' && '◷ Application is currently under consideration.'}
            {candidate.result === 'none' && 'Result will be published post evaluation.'}
          </p>
        </div>
      </div>

      {/* Dynamic Application Timeline */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
          <FiClock className="text-indigo-400" />
          <span>Application Progress Timeline</span>
        </h2>

        <div className="space-y-4 pt-2">
          {timeline.map((step, idx) => (
            <div key={step.key} className="flex items-start space-x-3">
              <div className="flex flex-col items-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                    step.isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {step.isCompleted ? <FiCheckCircle /> : idx + 1}
                </div>
                {idx < timeline.length - 1 && (
                  <div
                    className={`w-0.5 h-10 ${
                      step.isCompleted ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>

              <div className="pt-0.5">
                <p className={`text-xs font-bold ${step.isCompleted ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                {step.date && (
                  <span className="text-[10px] text-slate-500 block mt-1">
                    {new Date(step.date).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidateDashboard;
