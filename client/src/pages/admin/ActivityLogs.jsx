import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import { FiActivity, FiSearch, FiFilter, FiClock, FiRefreshCw } from 'react-icons/fi';

const ActivityLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');

  const { showToast } = useAuth();

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/activity-logs', {
        params: { search, module: moduleFilter, role: roleFilter },
      });
      const logList = res.data?.logs || (Array.isArray(res.data) ? res.data : []);
      setLogs(logList);
    } catch (err) {
      showToast('Failed to load activity logs', 'error');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter, roleFilter]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-6 rounded-3xl text-white shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center text-xl">
            <FiActivity />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">System Activity Logs</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time audit log recording user actions, question edits, PDF imports, and candidate evaluations
            </p>
          </div>
        </div>

        <button
          onClick={fetchLogs}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-white transition flex items-center space-x-2 w-fit"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search activity description, action, module or user email..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-semibold"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-slate-400 text-xs" />
            <span className="text-xs font-semibold text-slate-400">Module:</span>
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold"
            >
              <option value="all">All Modules</option>
              <option value="AUTH">AUTH</option>
              <option value="USER_MANAGEMENT">USER_MANAGEMENT</option>
              <option value="CANDIDATE_MANAGEMENT">CANDIDATE_MANAGEMENT</option>
              <option value="THEORY_MANAGEMENT">THEORY_MANAGEMENT</option>
              <option value="PRACTICAL_MANAGEMENT">PRACTICAL_MANAGEMENT</option>
              <option value="PDF_IMPORT">PDF_IMPORT</option>
              <option value="ASSESSMENT_MANAGEMENT">ASSESSMENT_MANAGEMENT</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">User Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="hr">HR</option>
              <option value="theory">Theory</option>
              <option value="practical">Practical</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-extrabold text-[11px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Timestamp</th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Action & Module</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-semibold">
                    Loading activity logs...
                  </td>
                </tr>
              ) : !Array.isArray(logs) || logs.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-500 font-semibold">
                    No activity logs recorded.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 text-slate-400 flex items-center space-x-1.5 whitespace-nowrap">
                      <FiClock className="text-slate-500" />
                      <span>{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-white whitespace-nowrap">
                      {log.userEmail || 'System'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={log.userRole || 'admin'}>{log.userRole || 'system'}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-bold text-indigo-400">{log.action || 'ACTION'}</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-mono">{log.module || 'SYSTEM'}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-200">{log.description || '-'}</td>
                    <td className="px-6 py-4 font-mono text-[11px] text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
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

export default ActivityLogs;
