import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiCheckSquare,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiCalendar,
} from 'react-icons/fi';

const InterviewHistory = () => {
  const { showToast } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees/interview-history');
      setHistory(res.data);
    } catch (err) {
      showToast('Failed to fetch interview history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FiCheckSquare className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Interview History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Archive of all completed candidate interviews evaluated by you
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          Total Completed: {history.length}
        </div>
      </div>

      {/* History Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Loading history records...
        </div>
      ) : history.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No completed interviews recorded yet.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Interview Date</th>
                  <th className="px-5 py-3.5">Result</th>
                  <th className="px-5 py-3.5">Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {history.map((item) => {
                  const cand = item.candidate || {};
                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-bold text-white text-xs">{cand.name || 'N/A'}</p>
                          <p className="text-[11px] text-slate-400">{cand.email || 'N/A'}</p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                          {item.requiredRole}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-slate-300">
                        <div className="flex items-center space-x-1.5 text-[11px]">
                          <FiCalendar className="text-slate-500" />
                          <span>
                            {item.completedAt
                              ? new Date(item.completedAt).toLocaleString()
                              : new Date(item.updatedAt).toLocaleString()}
                          </span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {item.result === 'pass' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase">
                            <FiCheckCircle /> <span>Pass</span>
                          </span>
                        )}
                        {item.result === 'fail' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 uppercase">
                            <FiXCircle /> <span>Fail</span>
                          </span>
                        )}
                        {item.result === 'on_hold' && (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20 uppercase">
                            <FiHelpCircle /> <span>On Hold</span>
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-400 max-w-xs truncate">
                        {item.feedback || <span className="italic text-slate-600">No remarks</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewHistory;
