import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FiBell,
  FiCheck,
  FiCheckCircle,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiInfo,
  FiUserCheck,
  FiBookOpen,
  FiCode,
  FiCheckSquare,
  FiRefreshCw,
} from 'react-icons/fi';

const moduleIcons = {
  System: { icon: FiInfo, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  Candidates: { icon: FiUserCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  Theory: { icon: FiBookOpen, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  Practical: { icon: FiCode, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  Assessments: { icon: FiCheckSquare, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
};

const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

const Notifications = () => {
  const { showToast } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await API.get('/activity-logs');
      setNotifications(res.data.logs || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      showToast('Failed to fetch notifications', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/activity-logs/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      showToast('Marked as read', 'success');
    } catch (err) {
      showToast('Failed to update notification', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/activity-logs/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      showToast('All notifications marked as read', 'success');
    } catch (err) {
      showToast('Failed to mark all as read', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await API.delete('/activity-logs/clear');
      setNotifications([]);
      setUnreadCount(0);
      showToast('Notifications cleared', 'success');
    } catch (err) {
      showToast('Failed to clear notifications', 'error');
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter((n) => {
    const matchesTab =
      activeTab === 'all'
        ? true
        : activeTab === 'unread'
        ? !n.isRead
        : n.module?.toLowerCase() === activeTab.toLowerCase();

    const matchesSearch =
      !search ||
      n.description?.toLowerCase().includes(search.toLowerCase()) ||
      n.action?.toLowerCase().includes(search.toLowerCase()) ||
      n.module?.toLowerCase().includes(search.toLowerCase());

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center text-xl">
            <FiBell />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-white">Notifications Center</h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-indigo-500 text-white">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Stay updated with system activities, candidate submissions, and assessment updates.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchNotifications}
            title="Refresh"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition text-sm"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          </button>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-600 hover:text-white transition text-xs font-semibold"
            >
              <FiCheckCircle />
              <span>Mark all read</span>
            </button>
          )}
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-600 hover:text-white transition text-xs font-semibold"
            >
              <FiTrash2 />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-900 border border-slate-800 p-1.5 rounded-xl overflow-x-auto">
          {['all', 'unread', 'Candidates', 'Assessments', 'Theory', 'Practical', 'System'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize whitespace-nowrap transition ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {tab === 'unread' ? `Unread (${unreadCount})` : tab}
            </button>
          ))}
        </div>

        {/* Search inside Notifications */}
        <div className="relative w-full sm:w-64">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl divide-y divide-slate-800/80 overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <FiRefreshCw className="animate-spin text-2xl mx-auto text-indigo-400" />
            <p className="text-xs">Loading notifications...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-3">
            <FiBell className="text-4xl mx-auto opacity-30" />
            <p className="text-sm font-semibold text-slate-400">No notifications found</p>
            <p className="text-xs max-w-sm mx-auto text-slate-500">
              {search || activeTab !== 'all'
                ? 'Try adjusting your search query or tab filters.'
                : 'You are all caught up! System activities will appear here when events occur.'}
            </p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const moduleInfo = moduleIcons[notification.module] || moduleIcons.System;
            const ModuleIcon = moduleInfo.icon;

            return (
              <div
                key={notification._id}
                className={`p-4 sm:p-5 flex items-start space-x-4 transition hover:bg-slate-800/40 ${
                  !notification.isRead ? 'bg-indigo-950/20' : ''
                }`}
              >
                {/* Module Icon Badge */}
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center text-base flex-shrink-0 ${moduleInfo.color}`}
                >
                  <ModuleIcon />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center space-x-2 flex-wrap">
                      <span className="text-xs font-bold text-white capitalize">
                        {notification.module || 'System'}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                        {notification.action}
                      </span>
                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-medium">
                    {notification.description}
                  </p>

                  <div className="mt-2 flex items-center space-x-3 text-[11px] text-slate-500">
                    <span>Triggered by: {notification.userEmail}</span>
                    <span>•</span>
                    <span className="capitalize">Role: {notification.userRole}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {!notification.isRead && (
                    <button
                      onClick={() => handleMarkAsRead(notification._id)}
                      title="Mark as Read"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 transition"
                    >
                      <FiCheck className="text-sm" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Notifications;
