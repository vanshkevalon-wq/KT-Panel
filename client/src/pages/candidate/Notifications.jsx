import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { FiBell, FiInfo, FiCheckCircle, FiAlertTriangle } from 'react-icons/fi';

const CandidateNotifications = () => {
  const { showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get('/candidate/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      showToast('Failed to load notifications.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] text-slate-400 text-sm">
        Loading notifications...
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <FiBell className="text-xl" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Candidate Notifications</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Official status updates and alerts regarding your application
            </p>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-8">No notifications yet.</p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className="flex items-start space-x-3 p-4 rounded-xl bg-slate-950 border border-slate-800"
            >
              <div className="mt-0.5 text-indigo-400 text-base flex-shrink-0">
                {n.type === 'success' ? (
                  <FiCheckCircle className="text-emerald-400" />
                ) : n.type === 'warning' ? (
                  <FiAlertTriangle className="text-amber-400" />
                ) : (
                  <FiInfo className="text-indigo-400" />
                )}
              </div>
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-white">{n.title}</h3>
                <p className="text-xs text-slate-400">{n.message}</p>
                <span className="text-[10px] text-slate-500 block font-mono">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CandidateNotifications;
