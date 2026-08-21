import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiBriefcase, FiHash, FiMapPin, FiCalendar, FiBookOpen } from 'react-icons/fi';

const CandidateProfile = () => {
  const { showToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get('/candidate/profile');
      setProfile(res.data);
    } catch (err) {
      showToast('Failed to load candidate profile.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading profile...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Profile Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-black text-2xl uppercase">
            {profile.name ? profile.name[0] : 'C'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">{profile.name}</h1>
            <p className="text-xs text-slate-400">{profile.email}</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase">
              Enrollment #{profile.enrollmentNumber}
            </span>
          </div>
        </div>

        <div className="text-xs text-right space-y-1">
          <span className="text-[10px] text-slate-500 uppercase font-bold block">Applied Skill / Role</span>
          <span className="px-3 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-bold uppercase text-xs">
            {profile.requiredRole} ({profile.position})
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
          Personal & Candidate Details
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiHash /> <span>Enrollment Number</span>
            </span>
            <p className="font-bold text-white font-mono text-sm">{profile.enrollmentNumber}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiUser /> <span>Full Name</span>
            </span>
            <p className="font-semibold text-slate-200">{profile.name}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiPhone /> <span>Registered Mobile Number</span>
            </span>
            <p className="font-semibold text-slate-200">{profile.mobileNumber || profile.phone || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiMail /> <span>Email Address</span>
            </span>
            <p className="font-semibold text-slate-200">{profile.email}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiBriefcase /> <span>Experience</span>
            </span>
            <p className="font-semibold text-slate-200">{profile.experience || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiBookOpen /> <span>Education</span>
            </span>
            <p className="font-semibold text-slate-200">{profile.education || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiMapPin /> <span>City / Location</span>
            </span>
            <p className="font-semibold text-slate-200">{profile.city || 'N/A'}</p>
          </div>

          <div className="space-y-1">
            <span className="text-slate-500 uppercase font-bold text-[10px] flex items-center space-x-1">
              <FiCalendar /> <span>Registration Date</span>
            </span>
            <p className="font-semibold text-slate-200">
              {profile.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CandidateProfile;
