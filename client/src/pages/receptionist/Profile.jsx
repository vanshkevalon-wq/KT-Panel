import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiShield } from 'react-icons/fi';

const ReceptionistProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-400 flex items-center justify-center font-black text-2xl uppercase">
            {user.name ? user.name[0] : 'R'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">{user.name}</h1>
            <p className="text-xs text-slate-400">{user.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-extrabold uppercase">
              Role: Receptionist
            </span>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
          Account Specifications
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
              <FiUser /> <span>Name</span>
            </span>
            <p className="font-bold text-white">{user.name}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
              <FiMail /> <span>Email</span>
            </span>
            <p className="font-bold text-white">{user.email}</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 font-bold uppercase flex items-center space-x-1">
              <FiShield /> <span>Desk Authority</span>
            </span>
            <p className="font-bold text-purple-400">Candidate Physical Verification & Queue Check-In</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReceptionistProfile;
