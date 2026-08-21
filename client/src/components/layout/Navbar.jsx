import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiMenu, FiBell, FiSearch } from 'react-icons/fi';

const Navbar = ({ setMobileOpen }) => {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
      {/* Left section */}
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
        >
          <FiMenu className="text-xl" />
        </button>

        <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-200">Kevalon System</span>
          <span>/</span>
          <span className="capitalize text-indigo-400 font-medium">{user?.role} Portal</span>
        </div>
      </div>

      {/* Middle Search */}
      <div className="hidden md:flex items-center flex-1 max-w-xs mx-4">
        <div className="relative w-full">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            placeholder="Search questions, candidates, assessments..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center space-x-3">
        <button className="relative text-slate-400 hover:text-slate-200 p-2 rounded-xl hover:bg-slate-800/80 transition">
          <FiBell className="text-lg" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"></span>
        </button>

        <div className="h-4 w-px bg-slate-800"></div>

        {/* User Pill */}
        <div className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
          <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            {user?.name?.[0] || 'U'}
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">{user?.name}</span>
          <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            {user?.role}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
