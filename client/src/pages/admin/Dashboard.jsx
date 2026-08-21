import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import {
  FiUsers,
  FiUserCheck,
  FiBookOpen,
  FiCode,
  FiCheckSquare,
  FiAward,
  FiFileText,
  FiClock,
  FiActivity,
} from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHrUsers: 0,
    totalTheoryQuestions: 0,
    totalPracticalQuestions: 0,
    totalExams: 0,
    activeExams: 0,
    totalCandidates: 0,
    completedAssessments: 0,
    pendingAssessments: 0,
    pdfQuestionsCount: 0,
    manualQuestionsCount: 0,
  });

  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [usersRes, theoryRes, practicalRes, assessmentsRes, candidatesRes, resultsRes, activityRes] =
          await Promise.all([
            API.get('/users').catch(() => ({ data: [] })),
            API.get('/theory/questions').catch(() => ({ data: [] })),
            API.get('/practical/questions').catch(() => ({ data: [] })),
            API.get('/assessments').catch(() => ({ data: [] })),
            API.get('/candidates').catch(() => ({ data: [] })),
            API.get('/results').catch(() => ({ data: [] })),
            API.get('/activity-logs').catch(() => ({ data: [] })),
          ]);

        const users = usersRes.data || [];
        const theoryQs = theoryRes.data || [];
        const practicalQs = practicalRes.data || [];
        const assessments = assessmentsRes.data || [];
        const candidates = candidatesRes.data || [];
        const results = resultsRes.data || [];

        const hrUsers = users.filter((u) => u.role === 'hr').length;
        const activeExams = assessments.filter((a) => a.status === 'published').length;
        const completed = results.filter((r) => r.status === 'passed' || r.status === 'failed').length;
        const pending = results.filter((r) => r.status === 'pending_review').length;

        const pdfTheory = theoryQs.filter((q) => q.source === 'pdf').length;
        const pdfPractical = practicalQs.filter((q) => q.source === 'pdf').length;
        const totalPdf = pdfTheory + pdfPractical;
        const totalManual = theoryQs.length + practicalQs.length - totalPdf;

        setStats({
          totalUsers: users.length,
          totalHrUsers: hrUsers,
          totalTheoryQuestions: theoryQs.length,
          totalPracticalQuestions: practicalQs.length,
          totalExams: assessments.length,
          activeExams,
          totalCandidates: candidates.length,
          completedAssessments: completed,
          pendingAssessments: pending,
          pdfQuestionsCount: totalPdf,
          manualQuestionsCount: Math.max(0, totalManual),
        });

        setActivities((activityRes.data || []).slice(0, 7));
      } catch (err) {
        console.error('Error fetching admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Loading Admin Dashboard metrics...</p>
      </div>
    );
  }

  const totalQuestions = stats.totalTheoryQuestions + stats.totalPracticalQuestions;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Admin System Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete system overview, user roles, candidate evaluations, and PDF question bank analytics.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="admin">Full Access Control</Badge>
          <span className="text-xs text-slate-500 font-mono">v1.0.0</span>
        </div>
      </div>

      {/* Top 4 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total System Users"
          value={stats.totalUsers}
          icon={FiUsers}
          color="indigo"
          subtext={`${stats.totalHrUsers} HR Managers`}
        />
        <MetricCard
          title="Total Candidates"
          value={stats.totalCandidates}
          icon={FiUserCheck}
          color="emerald"
          subtext="Enrolled candidates"
        />
        <MetricCard
          title="Question Bank"
          value={totalQuestions}
          icon={FiBookOpen}
          color="amber"
          subtext={`${stats.totalTheoryQuestions} Theory | ${stats.totalPracticalQuestions} Practical`}
        />
        <MetricCard
          title="Total Assessments"
          value={stats.totalExams}
          icon={FiCheckSquare}
          color="purple"
          subtext={`${stats.activeExams} Active Published`}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard
          title="Completed Assessments"
          value={stats.completedAssessments}
          icon={FiAward}
          color="cyan"
          subtext="Graded results"
        />
        <MetricCard
          title="Pending Evaluations"
          value={stats.pendingAssessments}
          icon={FiClock}
          color="rose"
          subtext="Requires practical score"
        />
        <MetricCard
          title="PDF Imported Qs"
          value={stats.pdfQuestionsCount}
          icon={FiFileText}
          color="indigo"
          subtext={`${stats.manualQuestionsCount} Added Manually`}
        />
      </div>

      {/* Question Source Breakdown & Visual Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card 1: Question Bank Distribution */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <FiBookOpen className="text-indigo-400" />
            <span>Question Bank Analytics</span>
          </h2>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Theory Questions</span>
                <span className="text-indigo-400">{stats.totalTheoryQuestions}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalQuestions > 0 ? (stats.totalTheoryQuestions / totalQuestions) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Practical Tasks</span>
                <span className="text-emerald-400">{stats.totalPracticalQuestions}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalQuestions > 0 ? (stats.totalPracticalQuestions / totalQuestions) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">PDF Imported Questions</span>
                <span className="text-purple-400">{stats.pdfQuestionsCount}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-purple-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalQuestions > 0 ? (stats.pdfQuestionsCount / totalQuestions) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Manually Created Questions</span>
                <span className="text-amber-400">{stats.manualQuestionsCount}</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${totalQuestions > 0 ? (stats.manualQuestionsCount / totalQuestions) * 100 : 0}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Recent Activity Audit Stream */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-sm font-bold text-white mb-4 flex items-center space-x-2">
            <FiActivity className="text-rose-400" />
            <span>Recent System Activity</span>
          </h2>

          <div className="space-y-3">
            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No recent activity logged yet.</p>
            ) : (
              activities.map((act) => (
                <div
                  key={act._id}
                  className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-start space-x-3 text-xs"
                >
                  <Badge variant={act.userRole}>{act.userRole}</Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 font-medium truncate">{act.description}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(act.createdAt).toLocaleString()} | IP: {act.ipAddress}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
