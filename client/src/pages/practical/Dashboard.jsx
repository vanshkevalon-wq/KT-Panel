import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import MetricCard from '../../components/common/MetricCard';
import Badge from '../../components/common/Badge';
import { FiCode, FiLayers, FiCheckSquare, FiAward } from 'react-icons/fi';

const PracticalDashboard = () => {
  const [stats, setStats] = useState({
    totalTasks: 0,
    publishedCount: 0,
    categoriesCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPracticalData = async () => {
      try {
        const [tRes, cRes] = await Promise.all([
          API.get('/practical/questions'),
          API.get('/practical/categories'),
        ]);

        const tasks = tRes.data || [];
        const categories = cRes.data || [];
        const published = tasks.filter((t) => t.status === 'published').length;

        setStats({
          totalTasks: tasks.length,
          publishedCount: published,
          categoriesCount: categories.length,
        });
      } catch (err) {
        console.error('Failed to fetch practical stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPracticalData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-xs font-semibold">Loading Practical Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Practical Coding Task Management Panel</h1>
          <p className="text-xs text-slate-400 mt-1">
            Practical task creation, instructions, required technology tags, time limits, and task grading.
          </p>
        </div>
        <Badge variant="practical">Practical Panel</Badge>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard title="Total Practical Tasks" value={stats.totalTasks} icon={FiCode} color="emerald" />
        <MetricCard title="Published Tasks" value={stats.publishedCount} icon={FiCheckSquare} color="indigo" />
        <MetricCard title="Task Categories" value={stats.categoriesCount} icon={FiLayers} color="purple" />
      </div>
    </div>
  );
};

export default PracticalDashboard;
