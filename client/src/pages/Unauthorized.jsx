import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, ROLE_REDIRECTS } from '../context/AuthContext';
import { FiShieldOff, FiArrowLeft } from 'react-icons/fi';

const Unauthorized = () => {
  const { user } = useAuth();
  const targetDashboard = user ? ROLE_REDIRECTS[user.role] || '/login' : '/login';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-400 text-4xl mb-6 shadow-lg shadow-rose-950/50">
        <FiShieldOff />
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">403 Forbidden</h1>
      <p className="text-slate-400 max-w-md mb-8 text-sm leading-relaxed">
        Access Denied. You do not have permission to view this panel. Role-Based Access Control blocks unauthorized cross-panel access.
      </p>
      {user && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 mb-8 text-xs text-slate-300 flex items-center space-x-2">
          <span>Logged in as: <strong className="text-indigo-400">{user.email}</strong></span>
          <span className="text-slate-600">|</span>
          <span>Role: <span className="uppercase font-semibold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">{user.role}</span></span>
        </div>
      )}
      <Link
        to={targetDashboard}
        className="inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-600/30 transition duration-200"
      >
        <FiArrowLeft className="text-lg" />
        <span>Return to Authorized Dashboard</span>
      </Link>
    </div>
  );
};

export default Unauthorized;
