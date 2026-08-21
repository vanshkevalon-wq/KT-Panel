import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import {
  FiBriefcase,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiPhone,
  FiUser,
  FiRefreshCw,
  FiFileText,
  FiUserCheck,
} from 'react-icons/fi';

const JobApplications = () => {
  const { showToast } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/job-applications');
      setApplications(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch job applications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await API.put(`/admin/job-applications/${id}/status`, { status });
      showToast(`Application status updated to ${status}`, 'success');
      setApplications((prev) => prev.map((app) => (app._id === id ? res.data : app)));
      if (selectedApp?._id === id) {
        setSelectedApp(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update application status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await API.delete(`/admin/job-applications/${id}`);
      showToast('Application deleted successfully.', 'success');
      setApplications((prev) => prev.filter((app) => app._id !== id));
      if (selectedApp?._id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete application.', 'error');
    }
  };

  const openDetails = (app) => {
    setSelectedApp(app);
    setIsDetailModalOpen(true);
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.phone && app.phone.includes(searchQuery));

    const matchesStatus =
      statusFilter === 'all' ? true : app.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              <FiBriefcase />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Open Position Applications</h1>
              <p className="text-xs text-sky-100 mt-0.5">
                Review candidate applications submitted from the Open Positions section
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchApplications}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition flex items-center space-x-2"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search candidate name, position, email, phone..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Applications' },
            { id: 'pending', label: 'Pending' },
            { id: 'reviewed', label: 'Reviewed' },
            { id: 'shortlisted', label: 'Shortlisted' },
            { id: 'rejected', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Loading job applications...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FiFileText className="mx-auto text-4xl text-slate-400" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No applications found</p>
            <p className="text-xs text-slate-500">Applications submitted from the Open Positions section will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="p-4">Candidate Details</th>
                  <th className="p-4">Applied Position</th>
                  <th className="p-4">Experience</th>
                  <th className="p-4">Application Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredApplications.map((app) => (
                  <tr key={app._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {app.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {app.email} • {app.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div>
                        <span className="font-bold text-sky-600 dark:text-sky-400">
                          {app.position}
                        </span>
                        <span className="text-[10px] text-slate-400 block">
                          {app.department || 'Engineering'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      {app.experience || 'Not specified'}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(app.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={app.status || 'pending'}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition focus:outline-none ${
                          app.status === 'shortlisted'
                            ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                            : app.status === 'rejected'
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/30'
                            : app.status === 'reviewed'
                            ? 'bg-blue-500/10 text-blue-600 border-blue-500/30'
                            : 'bg-amber-500/10 text-amber-600 border-amber-500/30'
                        }`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openDetails(app)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 transition"
                        title="View Full Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleDelete(app._id)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete Application"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Application Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Job Application Details"
        maxWidth="max-w-xl"
      >
        {selectedApp && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                    <FiUser />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedApp.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{selectedApp.email}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(selectedApp.createdAt).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Phone Number
                  </span>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    {selectedApp.phone}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">
                    Applied Position
                  </span>
                  <p className="font-bold text-sky-600 dark:text-sky-400">
                    {selectedApp.position}
                  </p>
                </div>
              </div>
            </div>

            {selectedApp.notes && (
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                  Candidate Notes / Experience Summary
                </label>
                <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                  {selectedApp.notes}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleStatusChange(selectedApp._id, 'shortlisted')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs transition shadow-md hover:bg-emerald-500 flex items-center space-x-1.5"
                >
                  <FiCheckCircle />
                  <span>Shortlist Candidate</span>
                </button>
                <button
                  onClick={() => handleStatusChange(selectedApp._id, 'rejected')}
                  className="px-3.5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs transition shadow-md hover:bg-rose-500 flex items-center space-x-1.5"
                >
                  <span>Reject</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(selectedApp._id)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition flex items-center space-x-1.5"
              >
                <FiTrash2 />
                <span>Delete Application</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default JobApplications;
