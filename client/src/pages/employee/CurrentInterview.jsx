import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiActivity,
  FiPlay,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiClock,
  FiUser,
  FiMail,
  FiPhone,
  FiBriefcase,
  FiAward,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';

const CurrentInterview = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const interviewIdParam = searchParams.get('id');

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [result, setResult] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const fetchCurrentInterview = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees/current-interview', {
        params: interviewIdParam ? { id: interviewIdParam } : {},
      });
      setInterview(res.data);
    } catch (err) {
      showToast('Failed to fetch current interview session.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentInterview();
  }, [interviewIdParam]);

  const handleStartInterview = async () => {
    if (!interview) return;
    try {
      setStarting(true);
      await API.post(`/interviews/${interview._id}/start`);
      showToast('Interview session started!', 'success');
      fetchCurrentInterview();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to start interview.';
      showToast(msg, 'error');
    } finally {
      setStarting(false);
    }
  };

  const handleOpenConfirmModal = (e) => {
    e.preventDefault();
    if (!result) {
      showToast('Please select an interview result (Pass, Fail, or On Hold).', 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const handleConfirmCompletion = async () => {
    if (!interview || !result) return;
    try {
      setCompleting(true);
      const res = await API.post(`/interviews/${interview._id}/complete`, {
        result,
        feedback,
      });

      showToast(res.data.message || 'Interview completed successfully!', 'success');
      setShowConfirmModal(false);

      if (res.data.nextAssignment) {
        showToast(`Next candidate '${res.data.nextAssignment.name}' automatically assigned!`, 'info');
      }

      fetchCurrentInterview();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to complete interview.';
      showToast(msg, 'error');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading interview workspace...
      </div>
    );
  }

  if (!interview || !interview.candidate) {
    return (
      <div className="p-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl mx-auto">
            <FiActivity />
          </div>
          <h2 className="text-lg font-bold text-white">No Active Interview Session</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You do not have any ongoing candidate interview assigned right now. When a candidate matching your role skills is assigned, they will appear here.
          </p>
          <button
            onClick={() => navigate('/employee/dashboard')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const cand = interview.candidate;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <FiActivity className="animate-pulse" />
            <span>Interview Workspace</span>
          </div>
          <h1 className="text-2xl font-bold text-white">{cand.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">Applied Position: {cand.position}</p>
        </div>

        <div className="flex items-center space-x-3">
          <span
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase border ${
              interview.status === 'ongoing'
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20'
                : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            }`}
          >
            Status: {interview.status}
          </span>

          {interview.status === 'assigned' && (
            <button
              onClick={handleStartInterview}
              disabled={starting}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
            >
              <FiPlay />
              <span>{starting ? 'Starting...' : 'Start Interview'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Grid Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Candidate Information Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <FiUser className="text-indigo-400" />
            <span>Candidate Details</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <FiUser /> <span>Full Name</span>
              </span>
              <span className="font-bold text-white">{cand.name}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <FiMail /> <span>Email Address</span>
              </span>
              <span className="font-bold text-indigo-300">{cand.email}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <FiPhone /> <span>Phone</span>
              </span>
              <span className="font-medium text-white">{cand.phone || 'N/A'}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <FiBriefcase /> <span>Position</span>
              </span>
              <span className="font-semibold text-white">{cand.position}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400 flex items-center space-x-2">
                <FiAward /> <span>Experience</span>
              </span>
              <span className="font-semibold text-slate-300">{cand.experience || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Interview Session Information Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <FiClock className="text-indigo-400" />
            <span>Interview Session Meta</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Target Role / Skill</span>
              <span className="font-bold text-cyan-300 uppercase">{interview.requiredRole}</span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Assigned At</span>
              <span className="text-slate-300">
                {new Date(interview.assignedAt).toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Session Started At</span>
              <span className="text-slate-300">
                {interview.startedAt
                  ? new Date(interview.startedAt).toLocaleTimeString()
                  : 'Not started yet'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80">
              <span className="text-slate-400">Session Status</span>
              <span className="font-bold text-emerald-400 uppercase">{interview.status}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation & Completion Form Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
        <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
          <FiAward className="text-indigo-400" />
          <span>Final Interview Evaluation</span>
        </h2>

        <form onSubmit={handleOpenConfirmModal} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Mandatory Result Selection Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Select Interview Result <span className="text-rose-400">*</span>
              </label>
              <select
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
                required
              >
                <option value="">-- Select Result --</option>
                <option value="pass">Pass (Candidate Cleared Interview)</option>
                <option value="fail">Fail (Candidate Rejected)</option>
                <option value="on_hold">On Hold (Decision Pending)</option>
              </select>
            </div>

            {/* Optional Evaluation Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Feedback & Remarks (Optional)
              </label>
              <input
                type="text"
                placeholder="Technical feedback, strengths, weak areas..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={!result}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition disabled:opacity-40"
            >
              <FiCheckCircle className="text-base" />
              <span>Complete Interview</span>
            </button>
          </div>
        </form>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FiAlertCircle className="text-indigo-400" />
                <span>Confirm Interview Completion</span>
              </h3>
              <button
                onClick={() => setShowConfirmModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <FiX />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300">
                Are you sure you want to finalize this candidate's interview session?
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                <p className="text-white font-bold">{cand.name}</p>
                <p className="text-slate-400">Position: {cand.position}</p>
                <div className="flex items-center space-x-2 pt-1">
                  <span className="text-slate-400">Selected Outcome:</span>
                  <span
                    className={`font-bold uppercase ${
                      result === 'pass'
                        ? 'text-emerald-400'
                        : result === 'fail'
                        ? 'text-rose-400'
                        : 'text-orange-400'
                    }`}
                  >
                    {result === 'pass' ? 'PASS' : result === 'fail' ? 'FAIL' : 'ON HOLD'}
                  </span>
                </div>
              </div>

              <p className="text-slate-400 text-[11px] italic">
                Note: Upon confirmation, your status will become Available and the system will automatically search for your next candidate!
              </p>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCompletion}
                disabled={completing}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {completing ? 'Completing...' : 'Confirm & Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CurrentInterview;
