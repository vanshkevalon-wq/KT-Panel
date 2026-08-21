import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiUserPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiKey,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUserCheck,
  FiX,
} from 'react-icons/fi';

const Employees = () => {
  const { showToast } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [skillsMaster, setSkillsMaster] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [skillFilter, setSkillFilter] = useState('all');

  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    employeeRoles: [],
    isActive: true,
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [empRes, skillRes] = await Promise.all([
        API.get('/employees/admin/list'),
        API.get('/skills?status=active'),
      ]);
      setEmployees(empRes.data);
      setSkillsMaster(skillRes.data);
    } catch (err) {
      showToast('Failed to load employees or skills master.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingEmployee(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      employeeRoles: [],
      isActive: true,
    });
    setShowModal(true);
  };

  const openEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '', // leave empty unless resetting
      employeeRoles: emp.employeeRoles || [],
      isActive: emp.isActive,
    });
    setShowModal(true);
  };

  const toggleSkillSelection = (slug) => {
    setFormData((prev) => {
      const exists = prev.employeeRoles.includes(slug);
      if (exists) {
        return { ...prev, employeeRoles: prev.employeeRoles.filter((s) => s !== slug) };
      } else {
        return { ...prev, employeeRoles: [...prev.employeeRoles, slug] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Name and Email are required.', 'error');
      return;
    }

    if (!editingEmployee && !formData.password) {
      showToast('Password is required for new employee.', 'error');
      return;
    }

    if (formData.employeeRoles.length === 0) {
      showToast('Please select at least one role/skill for this employee.', 'error');
      return;
    }

    try {
      if (editingEmployee) {
        await API.put(`/employees/admin/${editingEmployee._id}`, formData);
        showToast(`Employee '${formData.name}' updated successfully.`, 'success');
      } else {
        await API.post('/employees/admin/create', formData);
        showToast(`New employee '${formData.name}' created successfully!`, 'success');
      }
      setShowModal(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to save employee.';
      showToast(msg, 'error');
    }
  };

  const handleDeactivate = async (emp) => {
    if (!window.confirm(`Deactivate employee '${emp.name}'?`)) return;
    try {
      await API.delete(`/employees/admin/${emp._id}`);
      showToast(`Employee '${emp.name}' deactivated.`, 'info');
      fetchData();
    } catch (err) {
      showToast('Failed to deactivate employee.', 'error');
    }
  };

  // Filter employees
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'active'
        ? emp.isActive
        : statusFilter === 'inactive'
        ? !emp.isActive
        : emp.availabilityStatus === statusFilter;

    const matchesSkill =
      skillFilter === 'all'
        ? true
        : (emp.employeeRoles || []).includes(skillFilter);

    return matchesSearch && matchesStatus && matchesSkill;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FiUserCheck className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Employee Management</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Create employees, assign multiple skill roles & manage availability statuses
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs transition shadow-lg shadow-indigo-600/20"
        >
          <FiUserPlus className="text-base" />
          <span>+ Create Employee</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search by employee name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Skill Filter */}
          <select
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Skills / Roles</option>
            {skillsMaster.map((s) => (
              <option key={s._id} value={s.slug}>
                {s.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Statuses</option>
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="offline">Offline</option>
            <option value="active">Active Accounts</option>
            <option value="inactive">Deactivated</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Loading employees...
        </div>
      ) : filteredEmployees.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No employees found matching criteria.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Employee</th>
                  <th className="px-5 py-3.5">Skills / Roles</th>
                  <th className="px-5 py-3.5">Availability</th>
                  <th className="px-5 py-3.5">Current Candidate</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-800/40 transition">
                    {/* Employee Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs uppercase flex-shrink-0">
                          {emp.name ? emp.name[0] : 'E'}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{emp.name}</p>
                          <p className="text-[11px] text-slate-400">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Assigned Skills Badges */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {(emp.employeeRoles || []).map((roleSlug) => {
                          const skillObj = skillsMaster.find(
                            (s) => s.slug === roleSlug || s.name.toLowerCase() === roleSlug
                          );
                          const displayName = skillObj ? skillObj.name : roleSlug.toUpperCase();
                          return (
                            <span
                              key={roleSlug}
                              className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px] font-medium"
                            >
                              {displayName}
                            </span>
                          );
                        })}
                      </div>
                    </td>

                    {/* Availability Status Badge */}
                    <td className="px-5 py-4">
                      {!emp.isActive ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <FiXCircle /> <span>Deactivated</span>
                        </span>
                      ) : emp.availabilityStatus === 'available' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <FiCheckCircle /> <span>Available</span>
                        </span>
                      ) : emp.availabilityStatus === 'busy' ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <FiClock /> <span>Busy</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                          <span>Offline</span>
                        </span>
                      )}
                    </td>

                    {/* Current Candidate */}
                    <td className="px-5 py-4">
                      {emp.currentCandidate ? (
                        <div className="text-xs">
                          <p className="font-semibold text-white">{emp.currentCandidate.name}</p>
                          <p className="text-[10px] text-slate-400 uppercase">
                            {emp.currentCandidate.requiredRole}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-500 text-xs italic">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                          title="Edit Employee & Roles"
                        >
                          <FiEdit2 />
                        </button>
                        {emp.isActive && (
                          <button
                            onClick={() => handleDeactivate(emp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                            title="Deactivate Employee"
                          >
                            <FiTrash2 />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Employee Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">
                {editingEmployee ? 'Edit Employee Details & Roles' : 'Create New Employee'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-base"
              >
                <FiX />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Employee Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Rahul Patel"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Email Address <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Password {editingEmployee ? '(Leave blank to keep existing)' : <span className="text-rose-400">*</span>}
                </label>
                <input
                  type="password"
                  placeholder="********"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required={!editingEmployee}
                />
              </div>

              {/* Multi-Select Roles / Skills Checkboxes */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Assign Roles / Skills <span className="text-rose-400">*</span>
                </label>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 grid grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
                  {skillsMaster.map((skill) => {
                    const isChecked = formData.employeeRoles.includes(skill.slug);
                    return (
                      <label
                        key={skill._id}
                        onClick={() => toggleSkillSelection(skill.slug)}
                        className={`flex items-center space-x-2.5 p-2 rounded-lg border text-xs cursor-pointer transition select-none ${
                          isChecked
                            ? 'bg-indigo-600/15 border-indigo-500/40 text-white font-semibold'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by click container
                          className="rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-0"
                        />
                        <span>{skill.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="empIsActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0"
                />
                <label htmlFor="empIsActive" className="text-xs text-slate-300 font-medium">
                  Active Account (Authorized to receive interview assignments)
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
                  {editingEmployee ? 'Update Employee' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
