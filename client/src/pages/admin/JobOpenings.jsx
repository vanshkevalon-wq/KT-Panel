import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import {
  FiBriefcase,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiRefreshCw,
  FiTag,
  FiMapPin,
  FiClock,
} from 'react-icons/fi';

const JobOpenings = () => {
  const { showToast } = useAuth();
  const [openings, setOpenings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOpening, setEditingOpening] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Full Stack',
    department: 'Engineering',
    experience: '1 - 3 Years',
    location: 'Solaris Hub, Ahmedabad',
    type: 'Full-Time',
    tags: '',
    status: 'active',
    description: '',
  });

  const fetchOpenings = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/job-openings');
      setOpenings(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch job openings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpenings();
  }, []);

  const openCreateModal = () => {
    setEditingOpening(null);
    setFormData({
      title: '',
      category: 'Full Stack',
      department: 'Engineering',
      experience: '1 - 3 Years',
      location: 'Solaris Hub, Ahmedabad',
      type: 'Full-Time',
      tags: 'React.js, Node.js, Tailwind',
      status: 'active',
      description: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (opening) => {
    setEditingOpening(opening);
    setFormData({
      title: opening.title || '',
      category: opening.category || 'Full Stack',
      department: opening.department || 'Engineering',
      experience: opening.experience || '',
      location: opening.location || '',
      type: opening.type || 'Full-Time',
      tags: Array.isArray(opening.tags) ? opening.tags.join(', ') : '',
      status: opening.status || 'active',
      description: opening.description || '',
    });
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (opening) => {
    const newStatus = opening.status === 'active' ? 'hidden' : 'active';
    try {
      const res = await API.put(`/admin/job-openings/${opening._id}`, { status: newStatus });
      showToast(`Position set to ${newStatus.toUpperCase()}`, 'success');
      setOpenings((prev) => prev.map((o) => (o._id === opening._id ? res.data : o)));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to toggle status.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.category) {
      showToast('Title and category are required.', 'error');
      return;
    }

    setSubmitting(true);
    const tagsArray = formData.tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editingOpening) {
        const res = await API.put(`/admin/job-openings/${editingOpening._id}`, {
          ...formData,
          tags: tagsArray,
        });
        showToast('Job opening updated successfully!', 'success');
        setOpenings((prev) => prev.map((o) => (o._id === editingOpening._id ? res.data : o)));
      } else {
        const res = await API.post('/admin/job-openings', {
          ...formData,
          tags: tagsArray,
        });
        showToast('New job opening created successfully!', 'success');
        setOpenings((prev) => [res.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this position listing?')) return;
    try {
      await API.delete(`/admin/job-openings/${id}`);
      showToast('Job opening deleted successfully.', 'success');
      setOpenings((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete position.', 'error');
    }
  };

  const filteredOpenings = openings.filter((op) => {
    const matchesSearch =
      op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      op.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : op.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-teal-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              <FiBriefcase />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Manage Job Openings</h1>
              <p className="text-xs text-sky-100 mt-0.5">
                Add, edit, remove, and toggle Active/Hidden status of positions displayed on Landing Page
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchOpenings}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition flex items-center space-x-2"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-5 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-extrabold text-xs shadow-lg transition flex items-center space-x-2"
          >
            <FiPlus className="text-base" />
            <span>Add New Position</span>
          </button>
        </div>
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
            placeholder="Search by position title, category, department..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Listings' },
            { id: 'active', label: 'Active (Visible)' },
            { id: 'hidden', label: 'Hidden (Off)' },
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
            Loading position listings...
          </div>
        ) : filteredOpenings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FiBriefcase className="mx-auto text-4xl text-slate-400" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No job openings found</p>
            <p className="text-xs text-slate-500">Click "Add New Position" to create your first listing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="p-4">Position Title</th>
                  <th className="p-4">Category & Department</th>
                  <th className="p-4">Experience & Type</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4">Visibility Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredOpenings.map((op) => (
                  <tr key={op._id} className="hover:bg-slate-50 dark:hover:bg-slate-950/50 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">
                      {op.title}
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 text-[10px] font-extrabold uppercase">
                        {op.category}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                        {op.department}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 dark:text-slate-400">
                      <div>{op.experience}</div>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">
                        {op.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {Array.isArray(op.tags) &&
                          op.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-950 text-[10px] font-mono text-slate-600 dark:text-slate-400"
                            >
                              #{tag}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleStatus(op)}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider flex items-center space-x-1.5 transition ${
                          op.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                            : 'bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 hover:bg-slate-300'
                        }`}
                        title="Click to toggle Active/Hidden"
                      >
                        {op.status === 'active' ? <FiEye /> : <FiEyeOff />}
                        <span>{op.status === 'active' ? 'Active (Visible)' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openEditModal(op)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-sky-600 transition"
                        title="Edit Position"
                      >
                        <FiEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(op._id)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete Position"
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

      {/* Add / Edit Position Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingOpening ? 'Edit Job Opening' : 'Add New Job Opening'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Position Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Full Stack Developer (Node.js + React)"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Full Stack">Full Stack</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="QA">QA</option>
                <option value="Design">Design</option>
                <option value="Mobile">Mobile</option>
                <option value="DevOps">DevOps</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="e.g. Engineering"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Required Experience
              </label>
              <input
                type="text"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g. 2 - 4 Years"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Solaris Hub, Ahmedabad"
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Employment Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Visibility Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="active">Active (Show on Landing Page)</option>
                <option value="hidden">Hidden (Hide from Landing Page)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Skills & Tech Tags (Comma separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="React.js, Node.js, MongoDB, AWS"
              className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold uppercase tracking-wider shadow-lg shadow-sky-600/30 transition flex items-center space-x-2 disabled:opacity-50"
            >
              <span>{submitting ? 'Saving...' : editingOpening ? 'Update Position' : 'Create Position'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default JobOpenings;
