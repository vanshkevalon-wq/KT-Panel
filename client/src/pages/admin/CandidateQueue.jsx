import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  FiActivity,
  FiSearch,
  FiUserCheck,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiHelpCircle,
  FiX,
} from 'react-icons/fi';

const CandidateQueue = () => {
  const { showToast } = useAuth();
  const [candidates, setCandidates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [skillsMaster, setSkillsMaster] = useState([]);
  const [stats, setStats] = useState({
    waiting: 0,
    assigned: 0,
    ongoing: 0,
    completed: 0,
    onHold: 0,
  });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');

  const [assigningCandidate, setAssigningCandidate] = useState(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const [queueRes, empRes, skillRes] = await Promise.all([
        API.get('/interviews/admin/queue'),
        API.get('/employees/admin/list?status=active'),
        API.get('/skills?status=active'),
      ]);
      setCandidates(queueRes.data.candidates);
      setStats(queueRes.data.stats);
      setEmployees(empRes.data);
      setSkillsMaster(skillRes.data);
    } catch (err) {
      showToast('Failed to fetch candidate queue.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const openAssignModal = (cand) => {
    setAssigningCandidate(cand);
    setSelectedEmployeeId(cand.assignedEmployee ? cand.assignedEmployee._id : '');
  };

  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!selectedEmployeeId) {
      showToast('Please select an employee.', 'error');
      return;
    }

    try {
      await API.post(`/interviews/admin/candidates/${assigningCandidate._id}/assign`, {
        employeeId: selectedEmployeeId,
      });
      showToast(`Candidate assigned successfully.`, 'success');
      setAssigningCandidate(null);
      fetchQueue();
    } catch (err) {
      const msg = err.response?.data?.message || 'Assignment failed.';
      showToast(msg, 'error');
    }
  };

  const filteredCandidates = candidates.filter((cand) => {
    const matchesSearch =
      cand.name.toLowerCase().includes(search.toLowerCase()) ||
      cand.email.toLowerCase().includes(search.toLowerCase()) ||
      cand.position.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all'
        ? true
        : cand.requiredRole.toLowerCase() === roleFilter.toLowerCase();

    const matchesStatus =
      statusFilter === 'all' ? true : cand.assignmentStatus === statusFilter;

    const matchesEmployee =
      employeeFilter === 'all'
        ? true
        : cand.assignedEmployee && cand.assignedEmployee._id === employeeFilter;

    return matchesSearch && matchesRole && matchesStatus && matchesEmployee;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <FiActivity className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Candidate Assignment Queue</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor real-time candidate queue, assignment status & manual employee override
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Waiting</p>
            <p className="text-2xl font-bold text-amber-400 mt-0.5">{stats.waiting}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
            <FiClock />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Assigned</p>
            <p className="text-2xl font-bold text-indigo-400 mt-0.5">{stats.assigned}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <FiUserCheck />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Ongoing</p>
            <p className="text-2xl font-bold text-cyan-400 mt-0.5">{stats.ongoing}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <FiActivity />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">Completed</p>
            <p className="text-2xl font-bold text-emerald-400 mt-0.5">{stats.completed}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <FiCheckCircle />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase">On Hold</p>
            <p className="text-2xl font-bold text-orange-400 mt-0.5">{stats.onHold}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 flex items-center justify-center">
            <FiHelpCircle />
          </div>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 rounded-xl p-3">
        <div className="relative flex-1 w-full max-w-md">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search candidate by name, email, position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Required Roles</option>
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
            <option value="waiting">Waiting</option>
            <option value="assigned">Assigned</option>
            <option value="ongoing">Ongoing</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="on_hold">On Hold</option>
          </select>

          {/* Employee Filter */}
          <select
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-indigo-500"
          >
            <option value="all">All Employees</option>
            {employees.map((e) => (
              <option key={e._id} value={e._id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Queue Table */}
      {loading ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Loading queue...
        </div>
      ) : filteredCandidates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
          No candidates found in queue matching filters.
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Candidate</th>
                  <th className="px-5 py-3.5">Required Role</th>
                  <th className="px-5 py-3.5">Assigned Employee</th>
                  <th className="px-5 py-3.5">Assignment Status</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredCandidates.map((cand) => (
                  <tr key={cand._id} className="hover:bg-slate-800/40 transition">
                    {/* Candidate Info */}
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-white text-xs">{cand.name}</p>
                        <p className="text-[11px] text-slate-400">{cand.email}</p>
                        <span className="text-[10px] text-indigo-400">{cand.position}</span>
                      </div>
                    </td>

                    {/* Required Role */}
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                        {cand.requiredRole}
                      </span>
                    </td>

                    {/* Assigned Employee */}
                    <td className="px-5 py-4">
                      {cand.assignedEmployee ? (
                        <div>
                          <p className="font-semibold text-white">{cand.assignedEmployee.name}</p>
                          <p className="text-[10px] text-slate-400">{cand.assignedEmployee.email}</p>
                        </div>
                      ) : (
                        <span className="text-amber-400 text-xs italic font-medium">
                          No Employee Assigned
                        </span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      {cand.assignmentStatus === 'waiting' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <FiClock /> <span>Waiting</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'assigned' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          <FiUserCheck /> <span>Assigned</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'ongoing' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          <FiActivity /> <span>Ongoing</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'passed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <FiCheckCircle /> <span>Passed</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'failed' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <FiXCircle /> <span>Failed</span>
                        </span>
                      )}
                      {cand.assignmentStatus === 'on_hold' && (
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                          <FiHelpCircle /> <span>On Hold</span>
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => openAssignModal(cand)}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 border border-indigo-500/30 hover:border-indigo-500 text-indigo-300 hover:text-white font-medium text-xs transition"
                      >
                        {cand.assignedEmployee ? 'Reassign Employee' : 'Assign Employee'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Override Assignment Modal */}
      {assigningCandidate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-bold text-white">Manual Candidate Assignment</h2>
              <button
                onClick={() => setAssigningCandidate(null)}
                className="text-slate-400 hover:text-white text-base"
              >
                <FiX />
              </button>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
              <p className="text-white font-bold">{assigningCandidate.name}</p>
              <p className="text-slate-400">Position: {assigningCandidate.position}</p>
              <p className="text-indigo-400 font-semibold uppercase">
                Required Role: {assigningCandidate.requiredRole}
              </p>
            </div>

            <form onSubmit={handleManualAssign} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Employee <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  required
                >
                  <option value="">-- Choose Employee --</option>

                  <optgroup label="Matching Skills Employees">
                    {employees
                      .filter((e) =>
                        (e.employeeRoles || []).includes(assigningCandidate.requiredRole)
                      )
                      .map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.name} ({e.availabilityStatus}) - Skills: {e.employeeRoles.join(', ')}
                        </option>
                      ))}
                  </optgroup>

                  <optgroup label="Other Employees (Override)">
                    {employees
                      .filter(
                        (e) =>
                          !(e.employeeRoles || []).includes(assigningCandidate.requiredRole)
                      )
                      .map((e) => (
                        <option key={e._id} value={e._id}>
                          {e.name} ({e.availabilityStatus}) - Skills: {e.employeeRoles.join(', ')}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssigningCandidate(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateQueue;
