import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  FiPlus,
  FiFileText,
  FiSearch,
  FiEdit,
  FiTrash2,
  FiFilter,
  FiUploadCloud,
  FiDownload,
  FiCheckCircle,
  FiAlertCircle,
  FiCheckSquare,
  FiSquare,
  FiX,
} from 'react-icons/fi';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Checkbox selection state
  const [selectedIds, setSelectedIds] = useState([]);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [skillsMaster, setSkillsMaster] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [requiredRole, setRequiredRole] = useState('uiux');
  const [department, setDepartment] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState('active');

  // Excel Import Modal
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [excelFile, setExcelFile] = useState(null);
  const [uploadingExcel, setUploadingExcel] = useState(false);
  const [excelResult, setExcelResult] = useState(null);

  const { showToast } = useAuth();

  const fetchSkills = async () => {
    try {
      const res = await API.get('/skills?status=active');
      setSkillsMaster(res.data);
    } catch (e) {
      // ignore
    }
  };

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await API.get('/candidates', {
        params: { search, department: deptFilter, status: statusFilter },
      });
      setCandidates(res.data || []);
      setSelectedIds([]);
    } catch (err) {
      showToast('Failed to load candidate list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
    fetchCandidates();
  }, [search, deptFilter, statusFilter]);

  // Select all logic
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = candidates.map((c) => c._id);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected = candidates.length > 0 && selectedIds.length === candidates.length;

  // Single delete
  const handleDeleteSingle = async (c) => {
    if (!window.confirm(`Are you sure you want to delete candidate '${c.name}'?`)) return;
    try {
      await API.delete(`/candidates/${c._id}`);
      showToast(`Candidate '${c.name}' deleted successfully.`, 'success');
      fetchCandidates();
    } catch (err) {
      showToast('Failed to delete candidate', 'error');
    }
  };

  // Bulk delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedIds.length} selected candidate(s)?`)) return;

    try {
      const res = await API.post('/candidates/bulk-delete', { ids: selectedIds });
      showToast(res.data.message || `Deleted ${selectedIds.length} candidate(s).`, 'success');
      fetchCandidates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to bulk delete candidates', 'error');
    }
  };

  // Create / Edit modal handlers
  const openCreateModal = () => {
    setEditingCandidate(null);
    setName('');
    setEmail('');
    setPhone('');
    setPosition('UI/UX Designer');
    setRequiredRole('uiux');
    setDepartment('Engineering');
    setExperience('2 Years');
    setStatus('active');
    setIsModalOpen(true);
  };

  const openEditModal = (c) => {
    setEditingCandidate(c);
    setName(c.name);
    setEmail(c.email);
    setPhone(c.phone || '');
    setPosition(c.position);
    setRequiredRole(c.requiredRole || 'uiux');
    setDepartment(c.department);
    setExperience(c.experience || '');
    setStatus(c.status || 'active');
    setIsModalOpen(true);
  };

  const handleSaveCandidate = async (e) => {
    e.preventDefault();
    try {
      const payload = { name, email, phone, position, requiredRole, department, experience, status };

      if (editingCandidate) {
        await API.put(`/candidates/${editingCandidate._id}`, payload);
        showToast('Candidate profile updated', 'success');
      } else {
        await API.post('/candidates', payload);
        showToast('Candidate profile created & auto-assignment triggered!', 'success');
      }

      setIsModalOpen(false);
      fetchCandidates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save candidate', 'error');
    }
  };

  // Excel Import Handlers
  const handleExcelFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setExcelFile(e.target.files[0]);
      setExcelResult(null);
    }
  };

  const handleUploadExcel = async () => {
    if (!excelFile) return;

    setUploadingExcel(true);
    setExcelResult(null);

    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      const res = await API.post('/candidates/import-excel', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setExcelResult(res.data);
      showToast(res.data.message || 'Candidates imported successfully!', 'success');
      fetchCandidates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to import Excel sheet', 'error');
    } finally {
      setUploadingExcel(false);
    }
  };

  // Sample CSV download
  const downloadSampleTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,Name,Email,Phone,Position,Department,Experience,Status\nJohn Doe,john.doe@example.com,+91 9876543210,Frontend Developer,Engineering,3 Years,active\nJane Smith,jane.smith@example.com,+91 9123456789,Node.js Backend Engineer,Engineering,4 Years,active\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Candidate_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Candidate Management</h1>
          <p className="text-xs text-slate-400 mt-1">
            Register job applicants, import candidate lists from Excel/CSV sheets, and manage candidate status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={openCreateModal}
            className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/30 transition"
          >
            <FiPlus className="text-base" />
            <span>+ Add Candidate</span>
          </button>

          <button
            onClick={() => {
              setExcelFile(null);
              setExcelResult(null);
              setIsExcelModalOpen(true);
            }}
            className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/30 transition"
          >
            <FiFileText className="text-base" />
            <span>Import From Excel</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar (when rows are selected) */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-950/90 border border-indigo-500/40 p-4 rounded-2xl flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center space-x-3 text-xs">
            <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
              {selectedIds.length}
            </span>
            <span className="font-bold text-white">Candidate(s) Selected</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-400 hover:text-white font-semibold"
            >
              Clear Selection
            </button>
            <button
              onClick={handleBulkDelete}
              className="inline-flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
            >
              <FiTrash2 className="text-sm" />
              <span>Delete Selected ({selectedIds.length})</span>
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search candidate by name, email, or position..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center space-x-2">
            <FiFilter className="text-slate-400 text-xs" />
            <span className="text-xs font-semibold text-slate-400">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Quality Assurance">Quality Assurance</option>
              <option value="DevOps">DevOps</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidates Datatable */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th className="px-5 py-3.5">Candidate</th>
                <th className="px-5 py-3.5">Position & Dept</th>
                <th className="px-5 py-3.5">Required Role</th>
                <th className="px-5 py-3.5">Assigned Employee</th>
                <th className="px-5 py-3.5">Interview Result</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    Loading candidate directory...
                  </td>
                </tr>
              ) : candidates.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    No candidates found. Click "+ Add Candidate" or "+ Import From Excel" to add candidates.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => {
                  const isSelected = selectedIds.includes(c._id);
                  return (
                    <tr
                      key={c._id}
                      className={`transition ${isSelected ? 'bg-indigo-950/40' : 'hover:bg-slate-800/40'}`}
                    >
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(c._id)}
                          className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                        />
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-xs flex-shrink-0">
                            {c.name ? c.name[0] : 'C'}
                          </div>
                          <div>
                            <p className="font-bold text-white text-xs">{c.name}</p>
                            <p className="text-[11px] text-slate-400">{c.email}</p>
                            {c.phone && <p className="text-[10px] text-slate-500">{c.phone}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="font-semibold text-white">{c.position}</p>
                        <p className="text-[11px] text-slate-400">{c.department}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                          {c.requiredRole || 'UIUX'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {c.assignedEmployee ? (
                          <div>
                            <p className="font-semibold text-white">{c.assignedEmployee.name}</p>
                            <p className="text-[10px] text-slate-400">{c.assignedEmployee.email}</p>
                          </div>
                        ) : (
                          <span className="text-amber-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {c.assignmentStatus === 'passed' ? (
                          <span className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold uppercase text-[10px]">
                            Passed
                          </span>
                        ) : c.assignmentStatus === 'failed' ? (
                          <span className="px-2.5 py-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 font-bold uppercase text-[10px]">
                            Failed
                          </span>
                        ) : c.assignmentStatus === 'on_hold' ? (
                          <span className="px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-orange-400 font-bold uppercase text-[10px]">
                            On Hold
                          </span>
                        ) : c.assignmentStatus === 'ongoing' ? (
                          <span className="px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-bold uppercase text-[10px]">
                            Ongoing
                          </span>
                        ) : c.assignmentStatus === 'assigned' ? (
                          <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold uppercase text-[10px]">
                            Assigned
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold uppercase text-[10px]">
                            Waiting
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Candidate Profile"
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 transition"
                          >
                            <FiEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDeleteSingle(c)}
                            title="Delete Candidate"
                            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Candidate Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCandidate ? `Edit Candidate: ${editingCandidate.name}` : 'Add New Candidate'}
      >
        <form onSubmit={handleSaveCandidate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Candidate Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. John Patel"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.patel@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Applying Position
              </label>
              <input
                type="text"
                required
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                placeholder="Frontend Developer"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Required Role / Skill
              </label>
              <select
                value={requiredRole}
                onChange={(e) => setRequiredRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-semibold"
              >
                {skillsMaster.map((s) => (
                  <option key={s._id} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Software Engineering"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Experience
              </label>
              <input
                type="text"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="3 Years"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
            >
              Save Candidate Profile
            </button>
          </div>
        </form>
      </Modal>

      {/* Excel Sheet Import Modal */}
      <Modal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        title="Import Candidates from Excel / CSV Sheet"
        maxWidth="max-w-xl"
      >
        <div className="space-y-6">
          {/* Sample template download button */}
          <div className="p-4 rounded-xl bg-indigo-950/60 border border-indigo-500/30 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-white">Need a template structure?</p>
              <p className="text-slate-400 text-[11px]">Download sample CSV template with standard column headers.</p>
            </div>
            <button
              onClick={downloadSampleTemplate}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition flex-shrink-0"
            >
              <FiDownload />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Upload Drop Area */}
          <div className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950 rounded-2xl p-8 text-center space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
              <FiUploadCloud />
            </div>

            {excelFile ? (
              <div>
                <p className="text-xs font-bold text-white">{excelFile.name}</p>
                <p className="text-[11px] text-slate-400">
                  {(excelFile.size / 1024).toFixed(1)} KB | Excel Sheet Ready
                </p>
                <button
                  onClick={() => setExcelFile(null)}
                  className="text-xs text-rose-400 hover:underline font-semibold mt-1"
                >
                  Remove File
                </button>
              </div>
            ) : (
              <div>
                <p className="text-xs font-bold text-white mb-1">Select Excel (.xlsx, .xls) or CSV file</p>
                <p className="text-[11px] text-slate-400 mb-3">Columns: Name, Email, Phone, Position, Department, Experience, Status</p>
                <label className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg shadow-emerald-600/30 cursor-pointer transition">
                  <span>Browse Excel File</span>
                  <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleExcelFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Excel Import Results Banner */}
          {excelResult && (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between text-emerald-400 font-bold">
                <span className="flex items-center space-x-1.5">
                  <FiCheckCircle className="text-base" />
                  <span>{excelResult.message}</span>
                </span>
                <span>{excelResult.importedCount} Imported</span>
              </div>

              {excelResult.skippedCount > 0 && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-amber-400 space-y-1">
                  <p className="font-bold">{excelResult.skippedCount} Row(s) Skipped:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                    {excelResult.skippedDetails?.map((s, idx) => (
                      <li key={idx}>
                        Row #{s.row}: {s.reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-4 flex justify-end space-x-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsExcelModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Close
            </button>

            {excelFile && (
              <button
                type="button"
                onClick={handleUploadExcel}
                disabled={uploadingExcel}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center space-x-2 disabled:opacity-50"
              >
                {uploadingExcel ? (
                  <span>Importing Candidates...</span>
                ) : (
                  <>
                    <FiUploadCloud className="text-base" />
                    <span>Upload & Import Candidates</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Candidates;
