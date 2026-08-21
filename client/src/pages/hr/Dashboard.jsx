import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import { FiUsers, FiCheckSquare, FiAward, FiClock } from 'react-icons/fi';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    candidatesCount: 0,
    assignmentsCount: 0,
    completedCount: 0,
    pendingReviewCount: 0,
  });
  const [recentAssignments, setRecentAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHRData = async () => {
      try {
        const [cRes, aRes, rRes] = await Promise.all([
          API.get('/candidates'),
          API.get('/assessments/assignments/all'),
          API.get('/results'),
        ]);

        const candidates = cRes.data || [];
        const assignments = aRes.data || [];
        const results = rRes.data || [];

        const completed = results.filter((r) => r.status === 'passed' || r.status === 'failed').length;
        const pending = results.filter((r) => r.status === 'pending_review').length;

        setStats({
          candidatesCount: candidates.length,
          assignmentsCount: assignments.length,
          completedCount: completed,
          pendingReviewCount: pending,
        });

        setRecentAssignments(assignments.slice(0, 5));
      } catch (err) {
        console.error('Failed to fetch HR stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHRData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Loading HR Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">HR Candidate Management Panel</h1>
          <p className="text-xs text-slate-400 mt-1">
            Candidate onboarding, assessment assignments, evaluation tracking, and applicant results.
          </p>
        </div>
        <Badge variant="hr">HR Authorized</Badge>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Candidates" value={stats.candidatesCount} icon={FiUsers} color="indigo" />
        <MetricCard title="Assigned Tests" value={stats.assignmentsCount} icon={FiCheckSquare} color="purple" />
        <MetricCard title="Completed Tests" value={stats.completedCount} icon={FiAward} color="emerald" />
        <MetricCard title="Pending Grading" value={stats.pendingReviewCount} icon={FiClock} color="amber" />
      </div>

      {/* Recent Candidate Assignments */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-4">
        <h2 className="text-sm font-bold text-white">Recent Candidate Assessment Assignments</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Candidate</th>
                <th className="px-4 py-3">Assessment Title</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {recentAssignments.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-4 py-6 text-center text-slate-500">
                    No active candidate assignments.
                  </td>
                </tr>
              ) : (
                recentAssignments.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-bold text-white">{a.candidateId?.name}</td>
                    <td className="px-4 py-3 text-slate-300">{a.assessmentId?.title}</td>
                    <td className="px-4 py-3 text-slate-400">{new Date(a.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.status}>{a.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default HRDashboard;
