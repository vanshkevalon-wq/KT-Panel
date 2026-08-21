import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiCheckCircle,
  FiXCircle,
  FiMail,
  FiLock,
  FiUser,
} from 'react-icons/fi';

const Receptionists = () => {
  const { showToast } = useAuth();
  const [receptionists, setReceptionists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(true);

  const fetchReceptionists = async () => {
    try {
      setLoading(true);
      const res = await API.get('/candidates/receptionists');
      setReceptionists(res.data || []);
    } catch (err) {
      showToast('Failed to load receptionist user accounts.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceptionists();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPassword('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPassword('');
    setIsActive(u.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      showToast('Name and email are required.', 'error');
      return;
    }

    if (!editingUser && !password) {
      showToast('Password is required for new receptionist.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingUser) {
        await API.put(`/candidates/receptionists/${editingUser._id}`, {
          name,
          email,
          isActive,
          ...(password ? { password } : {}),
        });
        showToast(`Receptionist ${name} updated successfully.`, 'success');
      } else {
        await API.post('/candidates/receptionists', {
          name,
          email,
          password,
        });
        showToast(`Receptionist ${name} created successfully.`, 'success');
      }

      setIsModalOpen(false);
      fetchReceptionists();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save receptionist user.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FiUsers className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Receptionist Desk Staff</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create and manage receptionist accounts authorized to check in arriving candidates
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center space-x-2 flex-shrink-0"
        >
          <FiUserPlus />
          <span>+ Add Receptionist</span>
        </button>
      </div>

      {/* Receptionists Datatable */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Staff Name</th>
                <th className="px-6 py-3.5">Email</th>
                <th className="px-6 py-3.5">Role</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    Loading receptionist accounts...
                  </td>
                </tr>
              ) : receptionists.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    No receptionist accounts created yet. Click "+ Add Receptionist" to create one.
                  </td>
                </tr>
              ) : (
                receptionists.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-800/40 transition">
                    <td className="px-6 py-4 font-bold text-white">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-xs uppercase">
                          {u.name ? u.name[0] : 'R'}
                        </div>
                        <span>{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-400">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold uppercase text-[10px]">
                        Receptionist
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={u.isActive ? 'active' : 'inactive'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => openEditModal(u)}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-purple-400 hover:bg-slate-700 transition"
                      >
                        <FiEdit className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Receptionist Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit Receptionist Account' : 'Create Receptionist Account'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Staff Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Priya Sharma"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya.reception@kevalon.in"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              {editingUser ? 'New Password (Optional)' : 'Password'}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {editingUser && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="activeToggle" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Account Active Status
              </label>
            </div>
          )}

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
            >
              {submitting ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Receptionists;
