import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiCheckCircle, FiClock } from 'react-icons/fi';

const ApplicationStatus = () => {
  const { showToast } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await API.get('/candidate/dashboard');
      setData(res.data);
    } catch (err) {
      showToast('Failed to load application status.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading status tracker...
      </div>
    );
  }

  if (!data || !data.timeline) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
            <FiActivity className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Application Lifecycle</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Live step-by-step progress tracking for Enrollment #{data.candidate.enrollmentNumber}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
          Progress Timeline
        </h2>

        <div className="space-y-6">
          {data.timeline.map((step, idx) => (
            <div key={step.key} className="flex items-start space-x-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs ${
                    step.isCompleted
                      ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}
                >
                  {step.isCompleted ? <FiCheckCircle className="text-base" /> : idx + 1}
                </div>
                {idx < data.timeline.length - 1 && (
                  <div
                    className={`w-0.5 h-12 ${
                      step.isCompleted ? 'bg-emerald-500/60' : 'bg-slate-800'
                    }`}
                  />
                )}
              </div>

              <div className="pt-1 space-y-1">
                <h3 className={`text-sm font-bold ${step.isCompleted ? 'text-white' : 'text-slate-500'}`}>
                  {step.title}
                </h3>
                <p className="text-xs text-slate-400">{step.description}</p>
                {step.date && (
                  <span className="text-[10px] text-slate-500 block font-mono">
                    Completed at: {new Date(step.date).toLocaleString()}
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

export default ApplicationStatus;
