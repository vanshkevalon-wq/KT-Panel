import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiActivity, FiClock, FiUser, FiCheckCircle } from 'react-icons/fi';

const ReceptionistQueue = () => {
  const { showToast } = useAuth();
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const res = await API.get('/receptionist/queue');
      setQueue(res.data || []);
    } catch (err) {
      showToast('Failed to load waiting queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // Auto refresh queue every 10s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FiActivity className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Live Waiting Queue</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified candidates waiting for matching skill employee availability
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-bold">
          Currently Waiting: {queue.length} Candidate(s)
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Enrollment #</th>
                <th className="px-6 py-3.5">Required Role</th>
                <th className="px-6 py-3.5">Verified At</th>
                <th className="px-6 py-3.5">Wait Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Loading queue...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No verified candidates currently waiting in queue.
                  </td>
                </tr>
              ) : (
                queue.map((cand, idx) => {
                  const verifiedTime = cand.verifiedAt ? new Date(cand.verifiedAt) : new Date(cand.createdAt);
                  const waitMinutes = Math.floor((new Date() - verifiedTime) / (1000 * 60));

                  return (
                    <tr key={cand._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4 font-bold text-white">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{cand.name}</p>
                            <p className="text-[11px] text-slate-400">{cand.mobileNumber || cand.phone}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        {cand.enrollmentNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                          {cand.requiredRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                        {verifiedTime.toLocaleTimeString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <FiClock /> <span>Waiting ({waitMinutes} min)</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistQueue;
