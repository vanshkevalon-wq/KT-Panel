import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUserCheck, FiLock, FiPhone, FiHash, FiArrowRight } from 'react-icons/fi';

const CandidateLogin = () => {
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { candidateLogin, showToast } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!enrollmentNumber || !mobileNumber) {
      showToast('Please enter both Enrollment Number and Mobile Number.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await candidateLogin(enrollmentNumber, mobileNumber);
      if (res.success) {
        navigate('/candidate/dashboard');
      }
    } catch (err) {
      showToast('Enrollment number or mobile number is incorrect. Please check your details and try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-slate-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-emerald-500/20">
          KT
        </div>
        <h2 className="mt-4 text-2xl font-black text-white tracking-tight">
          Candidate Portal Login
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter your official Enrollment Number & registered Mobile Number to track your interview application.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-slate-900 border border-slate-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Enrollment Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Enrollment Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiHash className="text-base" />
                </div>
                <input
                  type="text"
                  required
                  value={enrollmentNumber}
                  onChange={(e) => setEnrollmentNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. KT202600001"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Registered Mobile Number
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <FiPhone className="text-base" />
                </div>
                <input
                  type="tel"
                  required
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="block w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 shadow-lg shadow-emerald-600/30 transition focus:outline-none disabled:opacity-50"
            >
              <span>{submitting ? 'Authenticating...' : 'Login to Candidate Portal'}</span>
              <FiArrowRight />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800 text-center">
            <Link
              to="/login"
              className="text-xs text-slate-400 hover:text-indigo-400 font-semibold transition"
            >
              Employee / Admin Staff Login →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateLogin;
