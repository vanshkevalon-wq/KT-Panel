import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiAward,
  FiCheckCircle,
  FiInfo,
  FiClock,
  FiCalendar,
  FiBriefcase,
  FiMessageSquare,
  FiCheck,
} from 'react-icons/fi';

const CandidateResult = () => {
  const { showToast } = useAuth();
  const [resultData, setResultData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchResult = async () => {
    try {
      setLoading(true);
      const res = await API.get('/candidate/result');
      setResultData(res.data);
    } catch (err) {
      showToast('Failed to load candidate result.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResult();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading interview evaluation result...
      </div>
    );
  }

  if (!resultData) {
    return (
      <div className="p-6 text-center text-slate-400 text-sm">
        Result information is currently unavailable.
      </div>
    );
  }

  const {
    enrollmentNumber,
    name,
    position,
    requiredRole,
    result,
    resultPublished,
    interviewDate,
    publishedDate,
    feedback,
  } = resultData;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FiAward className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Interview Result</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Official interview evaluation report for Enrollment #{enrollmentNumber}
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold text-indigo-300 uppercase">
          {requiredRole}
        </span>
      </div>

      {/* Result Cards based on Outcome */}

      {/* Case 1: PASS */}
      {result === 'pass' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl flex-shrink-0">
              🎉
            </div>
            <div>
              <span className="px-3 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold text-[11px] uppercase tracking-wider">
                Official Result: PASS
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight mt-1">
                Congratulations, {name}!
              </h2>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
            You have successfully cleared the interview process. Your performance has met the required criteria. Our HR team will contact you shortly with the next steps regarding your onboarding.
          </p>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Applied Role</span>
              <span className="font-bold text-white text-sm uppercase">{requiredRole} ({position})</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Interview Date</span>
              <span className="font-bold text-slate-300">{interviewDate ? new Date(interviewDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Result Published</span>
              <span className="font-bold text-slate-300">{publishedDate ? new Date(publishedDate).toLocaleDateString() : 'N/A'}</span>
            </div>
          </div>

          {feedback && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-emerald-400 uppercase flex items-center space-x-1.5">
                <FiMessageSquare /> <span>Evaluator Feedback</span>
              </span>
              <p className="text-xs text-slate-300 italic">{feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Case 2: FAIL (Not Selected - Encouraging UI) */}
      {result === 'fail' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-2xl flex-shrink-0">
              ℹ️
            </div>
            <div>
              <span className="px-3 py-0.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-extrabold text-[11px] uppercase tracking-wider">
                Status: Not Selected
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                Thank You for Your Effort, {name}
              </h2>
            </div>
          </div>

          <div className="space-y-3 text-xs text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
            <p>
              We appreciate the time and effort you invested in the interview process at Kevalon Technology.
            </p>
            <p>
              At this time, your performance did not meet the exact technical requirements for this specific opportunity.
            </p>
            <p className="text-slate-400 italic">
              Please don't be discouraged — every experience is an opportunity to learn and grow. Keep improving your skills, and we wish you the very best for your future endeavors!
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Applied Role</span>
              <span className="font-bold text-white uppercase">{requiredRole} ({position})</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Interview Date</span>
              <span className="font-bold text-slate-300">{interviewDate ? new Date(interviewDate).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Status</span>
              <span className="font-bold text-indigo-400">Not Selected</span>
            </div>
          </div>

          {feedback && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-xs font-bold text-indigo-400 uppercase flex items-center space-x-1.5">
                <FiMessageSquare /> <span>Constructive Feedback</span>
              </span>
              <p className="text-xs text-slate-300 italic">{feedback}</p>
            </div>
          )}
        </div>
      )}

      {/* Case 3: ON HOLD */}
      {result === 'on_hold' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-orange-950/30 border border-orange-500/30 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-2xl flex-shrink-0">
              ◷
            </div>
            <div>
              <span className="px-3 py-0.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold text-[11px] uppercase tracking-wider">
                Status: On Hold
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-1">
                Your Application Is Under Consideration
              </h2>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 border border-slate-800/80 p-5 rounded-xl">
            Thank you for participating in the interview process. Your application is currently on hold and remains under active consideration. No final decision has been made at this time. Our team will contact you once there is an update.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Applied Role</span>
              <span className="font-bold text-white uppercase">{requiredRole}</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Decision Status</span>
              <span className="font-bold text-orange-400">On Hold</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Next Step</span>
              <span className="font-bold text-slate-300">Wait for Communication</span>
            </div>
          </div>
        </div>
      )}

      {/* Case 4: Pending / None */}
      {result === 'none' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl mx-auto">
            <FiClock />
          </div>
          <h2 className="text-base font-bold text-white">Evaluation In Progress</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Your interview evaluation is currently being processed by the technical evaluation team. Please check back later for your official result.
          </p>
        </div>
      )}
    </div>
  );
};

export default CandidateResult;
