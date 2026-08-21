import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import { FiBookOpen, FiLayers, FiFileText, FiCheckSquare } from 'react-icons/fi';

const TheoryDashboard = () => {
  const [stats, setStats] = useState({
    totalQuestions: 0,
    publishedCount: 0,
    draftCount: 0,
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheoryData = async () => {
      try {
        const [qRes, cRes] = await Promise.all([
          API.get('/theory/questions'),
          API.get('/theory/categories'),
        ]);

        const questions = qRes.data || [];
        const categories = cRes.data || [];

        const published = questions.filter((q) => q.status === 'published').length;
        const draft = questions.filter((q) => q.status === 'draft').length;

        setStats({
          totalQuestions: questions.length,
          publishedCount: published,
          draftCount: draft,
          categoriesCount: categories.length,
        });
      } catch (err) {
        console.error('Failed to fetch theory stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheoryData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Loading Theory Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Theory Examination Management Panel</h1>
          <p className="text-xs text-slate-400 mt-1">
            Theory MCQ question bank creation, options management, difficulty tagging, and question review.
          </p>
        </div>
        <Badge variant="theory">Theory Panel</Badge>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="Total Theory MCQs" value={stats.totalQuestions} icon={FiBookOpen} color="amber" />
        <MetricCard title="Published MCQs" value={stats.publishedCount} icon={FiCheckSquare} color="emerald" />
        <MetricCard title="Draft Questions" value={stats.draftCount} icon={FiFileText} color="indigo" />
        <MetricCard title="Categories" value={stats.categoriesCount} icon={FiLayers} color="purple" />
      </div>
    </div>
  );
};

export default TheoryDashboard;
