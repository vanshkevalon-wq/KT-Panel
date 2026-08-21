import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
} from 'react-icons/fi';

const ReceptionistVerification = () => {
  const { showToast } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('query') || '';

  const [query, setQuery] = useState(initialQuery);
  const [candidate, setCandidate] = useState(null);
  const [searching, setSearching] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);

  const handleSearch = async (searchTerm) => {
    const term = searchTerm || query;
    if (!term.trim()) {
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

  useEffect(() => {
    if (initialQuery) {
      handleSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleConfirmCandidateHere = async () => {
    if (!candidate) return;

    setVerifying(true);
    try {
      const res = await API.post(`/receptionist/candidates/${candidate._id}/verify`);
      showToast(res.data.message, 'success');
      setCandidate(res.data.candidate);
      setVerificationResult(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to verify candidate check-in.', 'error');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <FiUserCheck className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Candidate Check-In Verification</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Search candidate by Enrollment Number or Mobile Number to verify presence
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Search Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Search Candidate
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

      {/* Candidate Found Card */}
      {candidate && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-xl uppercase">
                {candidate.name ? candidate.name[0] : 'C'}
              </div>
              <div>
                <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-wider block">
                  Candidate Found
                </span>
                <h2 className="text-xl font-bold text-white">{candidate.name}</h2>
              </div>
            </div>

            <span className="px-3 py-1 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-xs">
              Role: {candidate.requiredRole}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
                <FiHash /> <span>Enrollment Number</span>
              </span>
              <p className="font-mono font-bold text-white text-sm">{candidate.enrollmentNumber}</p>
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
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            {candidate.applicationStatus === 'verified' || candidate.verifiedAt ? (
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-xl w-full justify-center">
                <FiCheckCircle className="text-base" />
                <span>Candidate Verified & Checked In ({new Date(candidate.verifiedAt).toLocaleTimeString()})</span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConfirmCandidateHere}
                disabled={verifying}
                className="w-full py-4 px-6 rounded-xl text-sm font-black text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-xl shadow-emerald-600/30 transition flex items-center justify-center space-x-2 disabled:opacity-50"
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
                  : 'Candidate added to waiting queue for matching employee.'}
              </p>
              <button
                onClick={() => navigate('/receptionist/queue')}
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
            We couldn't find a candidate with the provided enrollment number or mobile number. Please verify the candidate's details or contact the Admin Desk.
          </p>
        </div>
      )}
    </div>
  );
};

export default ReceptionistVerification;
