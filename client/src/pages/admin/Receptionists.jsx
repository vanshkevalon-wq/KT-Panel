import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import Badge from '../../components/common/Badge';
import {
  FiSearch,
  FiUserCheck,
  FiUser,
  FiPhone,
  FiHash,
  FiBriefcase,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiActivity,
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiCheckSquare,
  FiRefreshCw,
} from 'react-icons/fi';

const Receptionists = () => {
  const { showToast } = useAuth();

  // Navigation Tab State: 'verification' | 'queue' | 'history' | 'staff'
  const [activeTab, setActiveTab] = useState('verification');

  // --- TAB 1: VERIFICATION DESK STATES ---
  const [query, setQuery] = useState('');
  const [candidate, setCandidate] = useState(null);
  const [searching, setSearching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [pendingCandidates, setPendingCandidates] = useState([]);
  const [loadingPending, setLoadingPending] = useState(false);

  // --- TAB 2: LIVE WAITING QUEUE STATES ---
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);

  // --- TAB 3: CHECK-IN HISTORY STATES ---
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // --- TAB 4: RECEPTIONIST STAFF ACCOUNTS STATES ---
  const [receptionists, setReceptionists] = useState([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [staffIsActive, setStaffIsActive] = useState(true);

  // FETCH PENDING CANDIDATES & STATS
  const fetchPendingCandidates = async () => {
    try {
      setLoadingPending(true);
      const res = await API.get('/receptionist/dashboard');
      setPendingCandidates(res.data.pendingCandidates || []);
    } catch (err) {
      // Quiet catch
    } finally {
      setLoadingPending(false);
    }
  };

  // FETCH QUEUE
  const fetchQueue = async () => {
    try {
      setLoadingQueue(true);
      const res = await API.get('/receptionist/queue');
      setQueue(res.data || []);
    } catch (err) {
      showToast('Failed to load waiting queue.', 'error');
    } finally {
      setLoadingQueue(false);
    }
  };

  // FETCH HISTORY
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const res = await API.get('/receptionist/history');
      setHistory(res.data || []);
    } catch (err) {
      showToast('Failed to load check-in history.', 'error');
    } finally {
      setLoadingHistory(false);
    }
  };

  // FETCH STAFF ACCOUNTS
  const fetchReceptionists = async () => {
    try {
      setLoadingStaff(true);
      const res = await API.get('/candidates/receptionists');
      setReceptionists(res.data || []);
    } catch (err) {
      showToast('Failed to load receptionist user accounts.', 'error');
    } finally {
      setLoadingStaff(false);
    }
  };

  // Tab change handler
  useEffect(() => {
    if (activeTab === 'verification') {
      fetchPendingCandidates();
    } else if (activeTab === 'queue') {
      fetchQueue();
    } else if (activeTab === 'history') {
      fetchHistory();
    } else if (activeTab === 'staff') {
      fetchReceptionists();
    }
  }, [activeTab]);

  // Queue Auto-Refresh interval when on Queue tab
  useEffect(() => {
    if (activeTab !== 'queue') return;
    const interval = setInterval(fetchQueue, 10000);
    return () => clearInterval(interval);
  }, [activeTab]);

  // --- SEARCH HANDLER ---
  const handleSearch = async (searchTerm) => {
    const term = searchTerm || query;
    if (!term || !term.trim()) {
      showToast('Please enter Enrollment Number or Mobile Number.', 'error');
      return;
    }

    setSearching(true);
    setNotFound(false);
    setCandidate(null);
    setVerificationResult(null);

    try {
      const res = await API.get('/receptionist/candidates/search', {
        params: { query: term.trim() },
      });
      setCandidate(res.data);
    } catch (err) {
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  // --- VERIFY CHECK-IN HANDLER ("Candidate Is Here") ---
  const handleConfirmCandidateHere = async (targetCandidate = candidate) => {
    if (!targetCandidate) return;

    setVerifying(true);
    try {
      const res = await API.post(`/receptionist/candidates/${targetCandidate._id}/verify`);
      showToast(res.data.message, 'success');
      setCandidate(res.data.candidate);
      setVerificationResult(res.data);
      fetchPendingCandidates();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to verify candidate check-in.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  // --- STAFF ACCOUNTS MODAL HANDLERS ---
  const openCreateStaffModal = () => {
    setEditingUser(null);
    setStaffName('');
    setStaffEmail('');
    setStaffPassword('');
    setStaffIsActive(true);
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (u) => {
    setEditingUser(u);
    setStaffName(u.name);
    setStaffEmail(u.email);
    setStaffPassword('');
    setStaffIsActive(u.isActive);
    setIsStaffModalOpen(true);
  };

  const handleStaffSubmit = async (e) => {
    e.preventDefault();
    if (!staffName || !staffEmail) {
      showToast('Name and email are required.', 'error');
      return;
    }

    if (!editingUser && !staffPassword) {
      showToast('Password is required for new receptionist.', 'error');
      return;
    }

    setSubmittingStaff(true);
    try {
      if (editingUser) {
        await API.put(`/candidates/receptionists/${editingUser._id}`, {
          name: staffName,
          email: staffEmail,
          isActive: staffIsActive,
          ...(staffPassword ? { password: staffPassword } : {}),
        });
        showToast(`Receptionist ${staffName} updated successfully.`, 'success');
      } else {
        await API.post('/candidates/receptionists', {
          name: staffName,
          email: staffEmail,
          password: staffPassword,
        });
        showToast(`Receptionist ${staffName} created successfully.`, 'success');
      }

      setIsStaffModalOpen(false);
      fetchReceptionists();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save receptionist user.', 'error');
    } finally {
      setSubmittingStaff(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
            <FiUserCheck className="text-2xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Reception Desk & Verification</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Verify candidate arrival, confirm physical check-in, monitor live queue & view check-in history
            </p>
          </div>
        </div>

        {/* Tab Selector Buttons */}
        <div className="flex flex-wrap items-center bg-slate-950 p-1 rounded-xl border border-slate-800 gap-1">
          <button
            onClick={() => setActiveTab('verification')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'verification'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FiUserCheck className="text-sm" />
            <span>Check-In Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'queue'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FiActivity className="text-sm" />
            <span>Live Waiting Queue</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FiCheckSquare className="text-sm" />
            <span>Check-In History</span>
          </button>

          <button
            onClick={() => setActiveTab('staff')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
              activeTab === 'staff'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <FiUsers className="text-sm" />
            <span>Staff Accounts</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: CHECK-IN VERIFICATION DESK */}
      {/* ========================================================================= */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          {/* Prominent Candidate Search Widget */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Search Arriving Candidate
            </label>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <FiSearch className="absolute left-4 top-3.5 text-slate-500 text-base" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Enter Enrollment Number (e.g. KT202600001) or Mobile Number..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={searching}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 flex-shrink-0"
              >
                <FiSearch />
                <span>{searching ? 'Searching...' : 'Search Candidate'}</span>
              </button>
            </form>
          </div>

          {/* Candidate Result Details Card */}
          {candidate && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-xl uppercase">
                    {candidate.name ? candidate.name[0] : 'C'}
                  </div>
                  <div>
                    <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                      Candidate Record Found
                    </span>
                    <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-xs">
                  Role: {candidate.requiredRole}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                    <FiHash /> <span>Enrollment Number</span>
                  </span>
                  <p className="font-mono font-bold text-emerald-400 text-sm">{candidate.enrollmentNumber}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                    <FiPhone /> <span>Mobile Number</span>
                  </span>
                  <p className="font-bold text-white text-sm">{candidate.mobileNumber || candidate.phone || 'N/A'}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                    <FiBriefcase /> <span>Applied Position</span>
                  </span>
                  <p className="font-bold text-slate-200">{candidate.position} ({candidate.department})</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                    <FiClock /> <span>Application Status</span>
                  </span>
                  <p className="font-bold text-purple-400 capitalize">{candidate.applicationStatus}</p>
                </div>
              </div>

              {/* Action Button: Candidate Is Here */}
              <div className="pt-2 border-t border-slate-800">
                {candidate.applicationStatus === 'verified' || candidate.verifiedAt ? (
                  <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-xl w-full justify-center">
                    <FiCheckCircle className="text-base" />
                    <span>Candidate Verified & Checked In ({new Date(candidate.verifiedAt).toLocaleTimeString()})</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleConfirmCandidateHere(candidate)}
                    disabled={verifying}
                    className="w-full py-4 px-6 rounded-xl text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                  >
                    <FiCheckCircle className="text-lg" />
                    <span>{verifying ? 'Verifying Check-In...' : 'Candidate Is Here'}</span>
                  </button>
                )}
              </div>

              {verificationResult && (
                <div className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-1 text-xs">
                  <p className="font-bold text-emerald-400">✓ Check-In Confirmed!</p>
                  <p className="text-slate-300">
                    {verificationResult.isAssigned
                      ? `Candidate automatically assigned to matching employee: ${verificationResult.assignedEmployee}`
                      : 'Candidate added to waiting queue for matching employee availability.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('queue')}
                    className="inline-flex items-center space-x-1 text-purple-400 hover:underline font-semibold mt-1"
                  >
                    <span>View Live Waiting Queue</span> <FiArrowRight />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Candidate Not Found Card */}
          {notFound && (
            <div className="bg-slate-900 border border-rose-500/30 rounded-2xl p-8 text-center space-y-3 shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center text-xl mx-auto">
                <FiAlertCircle />
              </div>
              <h2 className="text-base font-bold text-white">Candidate Not Found</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                We couldn't find a candidate with the provided enrollment number or mobile number. Please check the enrollment number or register the candidate first.
              </p>
            </div>
          )}

          {/* Registered Candidates Pending Check-In */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FiClock className="text-amber-400 text-lg" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Registered Candidates (Awaiting Physical Check-In)
                </h2>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold font-mono">
                {pendingCandidates.length} Pending
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Enrollment #</th>
                    <th className="px-5 py-3.5">Candidate Name</th>
                    <th className="px-5 py-3.5">Mobile Number</th>
                    <th className="px-5 py-3.5">Applying Role</th>
                    <th className="px-5 py-3.5 text-right">Verification Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {loadingPending ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                        Loading pending candidates...
                      </td>
                    </tr>
                  ) : pendingCandidates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-5 py-8 text-center text-slate-500">
                        No candidates currently pending check-in. All candidates checked in!
                      </td>
                    </tr>
                  ) : (
                    pendingCandidates.map((cand) => (
                      <tr key={cand._id} className="hover:bg-slate-800/40 transition">
                        <td className="px-5 py-3.5 font-mono font-bold text-emerald-400">
                          {cand.enrollmentNumber}
                        </td>
                        <td className="px-5 py-3.5 font-bold text-white">{cand.name}</td>
                        <td className="px-5 py-3.5 font-mono text-slate-300">{cand.mobileNumber || cand.phone}</td>
                        <td className="px-5 py-3.5">
                          <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                            {cand.requiredRole}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setQuery(cand.enrollmentNumber);
                              handleSearch(cand.enrollmentNumber);
                            }}
                            className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs rounded-xl shadow-md transition inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <FiUserCheck className="text-sm" />
                            <span>Candidate Is Here</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE WAITING QUEUE */}
      {/* ========================================================================= */}
      {activeTab === 'queue' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
                <FiActivity className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Live Candidate Waiting Queue</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Verified candidates waiting in queue for matching employee availability
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={fetchQueue}
                className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                title="Refresh Queue"
              >
                <FiRefreshCw className={`text-sm ${loadingQueue ? 'animate-spin' : ''}`} />
              </button>
              <div className="text-xs text-slate-300 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800 font-bold">
                Currently Waiting: <span className="text-indigo-400 font-mono text-sm">{queue.length}</span> Candidate(s)
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-6 py-3.5">Enrollment #</th>
                    <th className="px-6 py-3.5">Required Role</th>
                    <th className="px-6 py-3.5">Verified At</th>
                    <th className="px-6 py-3.5">Wait Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {loadingQueue ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        Loading waiting queue...
                      </td>
                    </tr>
                  ) : queue.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No verified candidates currently waiting in queue.
                      </td>
                    </tr>
                  ) : (
                    queue.map((cand, idx) => {
                      const verifiedTime = cand.verifiedAt ? new Date(cand.verifiedAt) : new Date(cand.createdAt);
                      const waitMinutes = Math.floor((new Date() - verifiedTime) / (1000 * 60));

                      return (
                        <tr key={cand._id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4 font-bold text-white">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-xs">
                                #{idx + 1}
                              </div>
                              <div>
                                <p className="font-bold text-white text-xs">{cand.name}</p>
                                <p className="text-[11px] text-slate-400">{cand.mobileNumber || cand.phone}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                            {cand.enrollmentNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                              {cand.requiredRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono text-[11px]">
                            {verifiedTime.toLocaleTimeString()}
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <FiClock /> <span>Waiting ({waitMinutes} min)</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CHECK-IN HISTORY */}
      {/* ========================================================================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <FiCheckSquare className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Candidate Check-In History Log</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Complete history of candidate physical check-ins and physical verifications
                </p>
              </div>
            </div>

            <button
              onClick={fetchHistory}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
              title="Refresh History"
            >
              <FiRefreshCw className={`text-sm ${loadingHistory ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Candidate</th>
                    <th className="px-6 py-3.5">Enrollment #</th>
                    <th className="px-6 py-3.5">Role</th>
                    <th className="px-6 py-3.5">Verified At</th>
                    <th className="px-6 py-3.5">Verified By</th>
                    <th className="px-6 py-3.5">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        Loading history logs...
                      </td>
                    </tr>
                  ) : history.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        No check-in history records found.
                      </td>
                    </tr>
                  ) : (
                    history.map((item) => {
                      const cand = item.candidate || {};
                      const staff = item.receptionist || {};
                      return (
                        <tr key={item._id} className="hover:bg-slate-800/40 transition">
                          <td className="px-6 py-4">
                            <p className="font-bold text-white text-xs">{cand.name || 'Candidate'}</p>
                            <p className="text-[11px] text-slate-400">{cand.mobileNumber}</p>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-emerald-400">
                            {cand.enrollmentNumber}
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-[10px]">
                              {cand.requiredRole}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-400 font-mono">
                            {new Date(item.verifiedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-slate-300 font-semibold">
                            {staff.name || 'Admin / Desk Staff'}
                          </td>
                          <td className="px-6 py-4 uppercase font-bold text-[10px] text-purple-400">
                            {cand.applicationStatus}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: RECEPTIONIST STAFF USER ACCOUNTS */}
      {/* ========================================================================= */}
      {activeTab === 'staff' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
                <FiUsers className="text-xl" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-wide">Receptionist Desk Staff Accounts</h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Manage receptionist staff user credentials and account active status
                </p>
              </div>
            </div>

            <button
              onClick={openCreateStaffModal}
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center space-x-2 flex-shrink-0"
            >
              <FiUserPlus />
              <span>+ Add Receptionist</span>
            </button>
          </div>

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
                  {loadingStaff ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        Loading receptionist accounts...
                      </td>
                    </tr>
                  ) : receptionists.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                        No receptionist staff accounts created yet. Click "+ Add Receptionist" to create one.
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
                            onClick={() => openEditStaffModal(u)}
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
        </div>
      )}

      {/* Staff Account Create/Edit Modal */}
      <Modal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        title={editingUser ? 'Edit Receptionist Account' : 'Create Receptionist Account'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleStaffSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
              Staff Full Name
            </label>
            <input
              type="text"
              required
              value={staffName}
              onChange={(e) => setStaffName(e.target.value)}
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
              value={staffEmail}
              onChange={(e) => setStaffEmail(e.target.value)}
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
              value={staffPassword}
              onChange={(e) => setStaffPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {editingUser && (
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="activeToggle"
                checked={staffIsActive}
                onChange={(e) => setStaffIsActive(e.target.checked)}
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
              onClick={() => setIsStaffModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingStaff}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30"
            >
              {submittingStaff ? 'Saving...' : editingUser ? 'Update Account' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Receptionists;
