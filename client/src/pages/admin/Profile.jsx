import React from 'react';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import { FiUser, FiMail, FiShield, FiCalendar } from 'react-icons/fi';

const Profile = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl space-y-6 text-center shadow-2xl">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-3xl mx-auto shadow-xl shadow-indigo-600/30">
          {user.name ? user.name[0] : 'U'}
        </div>

        <div>
          <h2 className="text-xl font-black text-white">{user.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
          <div className="mt-3 flex justify-center">
            <Badge variant={user.role}>{user.role} Role</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-6 border-t border-slate-800 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <FiUser /> <span>Account Name</span>
            </span>
            <p className="font-bold text-white text-xs">{user.name}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <FiMail /> <span>Email Address</span>
            </span>
            <p className="font-bold text-white text-xs">{user.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <FiShield /> <span>Assigned Role</span>
            </span>
            <p className="font-bold text-indigo-400 text-xs uppercase">{user.role}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase font-bold flex items-center space-x-1">
              <FiCalendar /> <span>Account Status</span>
            </span>
            <p className="font-bold text-emerald-400 text-xs">Active & Authenticated</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
