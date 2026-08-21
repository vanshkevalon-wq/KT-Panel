import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiCheckCircle, FiXCircle, FiLayers } from 'react-icons/fi';

const Skills = () => {
  const { showToast } = useAuth();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true,
  });

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const res = await API.get('/skills');
      setSkills(res.data);
    } catch (err) {
      showToast('Failed to fetch skills master.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, []);

  const openCreateModal = () => {
    setEditingSkill(null);
    setFormData({ name: '', description: '', isActive: true });
    setShowModal(true);
  };

  const openEditModal = (skill) => {
    setEditingSkill(skill);
    setFormData({
      name: skill.name,
      description: skill.description || '',
      isActive: skill.isActive,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      showToast('Skill name is required.', 'error');
      return;
    }

    try {
      if (editingSkill) {
        await API.put(`/skills/${editingSkill._id}`, formData);
        showToast(`Skill '${formData.name}' updated successfully.`, 'success');
      } else {
        await API.post('/skills', formData);
        showToast(`New skill '${formData.name}' created successfully.`, 'success');
      }
      setShowModal(false);
      fetchSkills();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save skill.';
      showToast(msg, 'error');
    }
  };

  const handleDelete = async (skill) => {
    if (!window.confirm(`Deactivate skill '${skill.name}'?`)) return;
    try {
      await API.delete(`/skills/${skill._id}`);
      showToast(`Skill '${skill.name}' deactivated.`, 'info');
      fetchSkills();
    } catch (err) {
      showToast('Failed to deactivate skill.', 'error');
    }
  };

  const filteredSkills = skills.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="p-6 space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FiLayers className="text-xl" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide">Role / Skill Master</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage technology roles & skills for employee assignment matching
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20"
        >
          <FiPlus className="text-base" />
          <span>Add New Skill / Role</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search roles or skills..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold px-2">
          Total Skills: {filteredSkills.length}
        </div>
      </div>

      {/* Skills Table Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Loading skills...
        </div>
      ) : filteredSkills.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No skills found. Add your first technology skill above!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredSkills.map((skill) => (
            <div
              key={skill._id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white tracking-wide">{skill.name}</h3>
                  <span
                    className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                      skill.isActive
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}
                  >
                    {skill.isActive ? <FiCheckCircle /> : <FiXCircle />}
                    <span>{skill.isActive ? 'Active' : 'Inactive'}</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">
                  {skill.description || 'No description provided.'}
                </p>
                <div className="mt-3 inline-block px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-mono">
                  Slug: {skill.slug}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-2">
                <button
                  onClick={() => openEditModal(skill)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 text-xs transition"
                  title="Edit Skill"
                >
                  <FiEdit2 />
                </button>
                {skill.isActive && (
                  <button
                    onClick={() => handleDelete(skill)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 text-xs transition"
                    title="Deactivate Skill"
                  >
                    <FiTrash2 />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <h2 className="text-base font-bold text-white">
              {editingSkill ? 'Edit Skill / Role' : 'Add New Skill / Role'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Skill Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. React, UI/UX, Node.js, Flutter"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Short description of this technical role or skill..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="skillIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="skillIsActive" className="text-xs text-slate-300 font-medium">
                  Active for candidate matching & employee creation
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                >
                  {editingSkill ? 'Update Skill' : 'Create Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skills;
