import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import Modal from '../../components/common/Modal';
import {
  FiMail,
  FiSearch,
  FiTrash2,
  FiCheckCircle,
  FiEye,
  FiPhone,
  FiUser,
  FiClock,
  FiRefreshCw,
  FiMessageSquare,
} from 'react-icons/fi';

const ContactInquiries = () => {
  const { showToast } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/inquiries');
      setInquiries(res.data);
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to fetch contact inquiries.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await API.put(`/admin/inquiries/${id}`, { status, isRead: true });
      showToast(`Inquiry marked as ${status}`, 'success');
      setInquiries((prev) => prev.map((inq) => (inq._id === id ? res.data : inq)));
      if (selectedInquiry?._id === id) {
        setSelectedInquiry(res.data);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact inquiry?')) return;
    try {
      await API.delete(`/admin/inquiries/${id}`);
      showToast('Inquiry deleted successfully.', 'success');
      setInquiries((prev) => prev.filter((inq) => inq._id !== id));
      if (selectedInquiry?._id === id) {
        setIsDetailModalOpen(false);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to delete inquiry.', 'error');
    }
  };

  const openDetails = (inquiry) => {
    setSelectedInquiry(inquiry);
    setIsDetailModalOpen(true);
    if (!inquiry.isRead) {
      handleUpdateStatus(inquiry._id, 'read');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    const matchesSearch =
      inq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inq.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inq.phone && inq.phone.includes(searchQuery));

    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'unread'
        ? !inq.isRead
        : inq.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl">
              <FiMail />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Contact HR Inquiries</h1>
              <p className="text-xs text-purple-100 mt-0.5">
                Manage direct messages submitted via the public Contact HR form
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={fetchInquiries}
          className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-xs font-bold transition flex items-center space-x-2"
        >
          <FiRefreshCw className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-96">
          <FiSearch className="absolute left-3.5 top-3.5 text-slate-400 text-sm" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, phone, subject..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Inquiries' },
            { id: 'unread', label: 'Unread' },
            { id: 'read', label: 'Read' },
            { id: 'responded', label: 'Responded' },
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                statusFilter === f.id
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Datatable */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs font-semibold">
            Loading contact inquiries...
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <FiMessageSquare className="mx-auto text-4xl text-slate-400" />
            <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No contact inquiries found</p>
            <p className="text-xs text-slate-500">Inquiries submitted from the Contact HR form will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-extrabold text-[11px]">
                  <th className="p-4">Sender Details</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Message Snippet</th>
                  <th className="p-4">Date Received</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-medium text-slate-800 dark:text-slate-200">
                {filteredInquiries.map((inq) => (
                  <tr
                    key={inq._id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-950/50 transition ${
                      !inq.isRead ? 'bg-purple-500/5 font-bold' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center space-x-2">
                          <span>{inq.name}</span>
                          {!inq.isRead && (
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {inq.email} {inq.phone ? `• ${inq.phone}` : ''}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {inq.subject || 'General Inquiry'}
                      </span>
                    </td>
                    <td className="p-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                      {inq.message}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 text-[11px]">
                      {new Date(inq.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          inq.status === 'responded'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : inq.isRead
                            ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                            : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                        }`}
                      >
                        {inq.status || (inq.isRead ? 'read' : 'unread')}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button
                        onClick={() => openDetails(inq)}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-purple-600 transition"
                        title="View Details"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleDelete(inq._id)}
                        className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/20 transition"
                        title="Delete Inquiry"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inquiry Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title="Contact Inquiry Details"
        maxWidth="max-w-xl"
      >
        {selectedInquiry && (
          <div className="space-y-5 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                    <FiUser />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                      {selectedInquiry.name}
                    </h3>
                    <p className="text-[11px] text-slate-500">{selectedInquiry.email}</p>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-slate-400">
                  {new Date(selectedInquiry.createdAt).toLocaleString()}
                </span>
              </div>

              {selectedInquiry.phone && (
                <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                  <FiPhone className="text-purple-500" />
                  <span className="font-semibold">{selectedInquiry.phone}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                Subject
              </label>
              <p className="font-bold text-slate-900 dark:text-white text-sm">
                {selectedInquiry.subject || 'General Inquiry'}
              </p>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                Message Content
              </label>
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap leading-relaxed">
                {selectedInquiry.message}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleUpdateStatus(selectedInquiry._id, 'responded')}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs transition shadow-md hover:bg-emerald-500 flex items-center space-x-1.5"
                >
                  <FiCheckCircle />
                  <span>Mark as Responded</span>
                </button>
              </div>

              <button
                onClick={() => handleDelete(selectedInquiry._id)}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold text-xs hover:bg-rose-500/20 transition flex items-center space-x-1.5"
              >
                <FiTrash2 />
                <span>Delete Inquiry</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ContactInquiries;
