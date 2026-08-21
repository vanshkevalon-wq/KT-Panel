import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiCheckSquare, FiUserCheck, FiClock } from 'react-icons/fi';

const ReceptionistHistory = () => {
  const { showToast } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await API.get('/receptionist/history');
      setHistory(res.data || []);
    } catch (err) {
      showToast('Failed to load check-in history.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FiCheckSquare className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Candidate Check-In History</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Log of all candidates verified and checked in by your desk session
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Candidate</th>
                <th className="px-6 py-3.5">Enrollment #</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Verified At</th>
                <th className="px-6 py-3.5">Current Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Loading history...
                  </td>
                </tr>
              ) : history.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No check-in history records yet.
                  </td>
                </tr>
              ) : (
                history.map((item) => {
                  const cand = item.candidate || {};
                  return (
                    <tr key={item._id} className="hover:bg-slate-800/40 transition">
                      <td className="px-6 py-4">
                        <p className="font-bold text-white text-xs">{cand.name || 'Candidate'}</p>
                        <p className="text-[11px] text-slate-400">{cand.mobileNumber}</p>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                        {cand.enrollmentNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                          {cand.requiredRole}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 font-mono">
                        {new Date(item.verifiedAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 uppercase font-bold text-[10px] text-purple-400">
                        {cand.applicationStatus}
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

export default ReceptionistHistory;
