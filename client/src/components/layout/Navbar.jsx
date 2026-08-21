import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../services/api';
import ThemeToggle from '../common/ThemeToggle';
import {
  FiMenu,
  FiBell,
  FiCheckCircle,
  FiX,
  FiArrowRight,
  FiInfo,
  FiUserCheck,
  FiBookOpen,
  FiCode,
  FiCheckSquare,
} from 'react-icons/fi';

const moduleIcons = {
  System: FiInfo,
  Candidates: FiUserCheck,
  Theory: FiBookOpen,
  Practical: FiCode,
  Assessments: FiCheckSquare,
};

const Navbar = ({ setMobileOpen }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const popupRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await API.get('/activity-logs');
      setNotifications(res.data.logs || []);
      setUnreadCount(res.data.unreadCount || 0);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowPopup(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await API.put(`/activity-logs/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await API.put('/activity-logs/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read:', err);
    }
  };

  const notificationPath = user?.role ? `/${user.role}/notifications` : '/notifications';

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

      {/* Right actions */}
      <div className="flex items-center space-x-3 relative" ref={popupRef}>
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notification Bell with Popup */}
        <div className="relative">
          <button
            onClick={() => setShowPopup(!showPopup)}
            title="Notifications"
            className={`relative p-2 rounded-xl border transition ${
              showPopup
                ? 'bg-indigo-600/20 text-indigo-400 border-indigo-500/40'
                : 'text-slate-400 border-transparent hover:text-slate-200 hover:bg-slate-800/80'
            }`}
          >
            <FiBell className="text-lg" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-indigo-500 text-white text-[10px] font-extrabold flex items-center justify-center border border-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Popup Dropdown */}
          {showPopup && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* Header */}
              <div className="p-3.5 px-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-xs text-white">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 transition"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowPopup(false)}
                    className="text-slate-400 hover:text-white p-1 rounded-lg text-sm"
                  >
                    <FiX />
                  </button>
                </div>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 space-y-2">
                    <FiBell className="text-2xl mx-auto opacity-30" />
                    <p className="text-xs">No notifications right now.</p>
                  </div>
                ) : (
                  notifications.slice(0, 6).map((item) => {
                    const IconComponent = moduleIcons[item.module] || FiInfo;
                    return (
                      <div
                        key={item._id}
                        onClick={() => !item.isRead && handleMarkAsRead(item._id)}
                        className={`p-3 sm:p-3.5 flex items-start space-x-3 transition cursor-pointer hover:bg-slate-800/50 ${
                          !item.isRead ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-indigo-400 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">
                          <IconComponent />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[11px] font-bold text-white truncate">
                              {item.action}
                            </span>
                            {!item.isRead && (
                              <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0"></span>
                            )}
                          </div>
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Popup Footer */}
              <div className="p-3 bg-slate-950 border-t border-slate-800 text-center">
                <Link
                  to={notificationPath}
                  onClick={() => setShowPopup(false)}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-indigo-400 hover:text-indigo-300 transition"
                >
                  <span>View All Notifications</span>
                  <FiArrowRight />
                </Link>
              </div>
            </div>
          )}
        </div>

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
