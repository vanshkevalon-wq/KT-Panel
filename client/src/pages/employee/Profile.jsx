import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLayers, FiRadio, FiCheckCircle, FiShield } from 'react-icons/fi';

const EmployeeProfile = () => {
  const { user, showToast } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/employees/profile');
      setProfileData(res.data);
    } catch (err) {
      showToast('Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading Profile...
      </div>
    );
  }

  const emp = profileData?.employee || user || {};
  const completedCount = profileData?.completedCount || 0;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-2xl font-bold uppercase">
          {emp.name ? emp.name[0] : 'E'}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide">{emp.name}</h1>
          <p className="text-xs text-slate-400">{emp.email}</p>
          <div className="mt-2 flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-bold uppercase">
              Role: Employee
            </span>
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase">
              Status: {emp.availabilityStatus || 'Available'}
            </span>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <FiUser className="text-indigo-400" />
            <span>Account Details</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Employee Name</span>
              <span className="font-bold text-white">{emp.name}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Email Address</span>
              <span className="font-bold text-indigo-300">{emp.email}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Account Access Role</span>
              <span className="font-bold text-cyan-300 uppercase">Employee</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Completed Interviews</span>
              <span className="font-bold text-emerald-400 text-sm">{completedCount}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
          <h2 className="text-sm font-bold text-white border-b border-slate-800 pb-3 flex items-center space-x-2">
            <FiLayers className="text-indigo-400" />
            <span>Assigned Skills & Roles</span>
          </h2>

          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              You are configured to automatically receive candidate interview assignments matching the following assigned skills:
            </p>

            <div className="flex flex-wrap gap-2 pt-1">
              {(emp.employeeRoles || []).map((r) => (
                <span
                  key={r}
                  className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold text-xs uppercase"
                >
                  {r}
                </span>
              ))}
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 flex items-start space-x-2 mt-4">
              <FiShield className="text-amber-400 text-base flex-shrink-0 mt-0.5" />
              <span>
                Note: Role/skill configurations and permissions are managed strictly by Admin. Contact Admin if skill assignments need updating.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeProfile;
