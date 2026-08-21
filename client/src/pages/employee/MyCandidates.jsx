import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiUsers,
  FiPlay,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiClock,
  FiActivity,
} from 'react-icons/fi';

const MyCandidates = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMyCandidates = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees/my-candidates');
      setCandidates(res.data);
    } catch (err) {
      showToast('Failed to fetch assigned candidates.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyCandidates();
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FiUsers className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">My Candidates</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Candidates assigned specifically to your skill set for evaluation & interview
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 font-semibold bg-slate-950 px-3 py-2 rounded-xl border border-slate-800">
          Total Assigned: {candidates.length}
        </div>
      </div>

      {/* Candidates List */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Loading assigned candidates...
        </div>
      ) : candidates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400 space-y-2">
          <p className="text-white font-bold text-sm">No candidates currently assigned.</p>
          <p className="text-xs text-slate-500">
            Ensure your status is set to "Available". Matching candidates will automatically appear here.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Required Role</th>
                  <th className="px-5 py-3.5">Experience</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {candidates.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-800/40 transition">
                    {/* Candidate Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase flex-shrink-0">
                          {cand.name ? cand.name[0] : 'C'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{cand.name}</p>
                          <p className="text-[11px] text-slate-400">{cand.email}</p>
                          <p className="text-[10px] text-slate-500">{cand.position}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                        {cand.requiredRole}
                      </span>
                    </td>

                    {/* Experience */}
                    <td className="px-5 py-4 text-slate-300 font-medium">
                      {cand.experience || 'N/A'}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {cand.assignmentStatus === 'assigned' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <FiClock /> <span>Assigned</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'ongoing' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <FiActivity /> <span>Ongoing</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'passed' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <FiCheckCircle /> <span>Passed</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'failed' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <FiXCircle /> <span>Failed</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'on_hold' && (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          <FiHelpCircle /> <span>On Hold</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      {cand.assignmentStatus === 'assigned' || cand.assignmentStatus === 'ongoing' ? (
                        <button
                          onClick={() => navigate('/employee/current-interview')}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md transition"
                        >
                          <FiPlay />
                          <span>
                            {cand.assignmentStatus === 'assigned'
                              ? 'Start Interview'
                              : 'Continue'}
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/employee/history')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition"
                        >
                          View Result
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCandidates;
