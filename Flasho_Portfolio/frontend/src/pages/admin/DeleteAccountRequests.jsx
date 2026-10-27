import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Clock, 
  Mail, 
  Phone, 
  User, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  X,
  ShieldAlert,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';
import { 
  getLocalDeletionRequests, 
  loadAllDeletionRequests, 
  approveAndDeleteRequest, 
  rejectRequest, 
  removeRequestRecord 
} from '../../utils/deleteRequestsStore';

export default function DeleteAccountRequests() {
  const [requests, setRequests] = useState(getLocalDeletionRequests);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, pending, completed, rejected
  const [processingId, setProcessingId] = useState(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'deleteRecord' | null
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    try {
      const list = await loadAllDeletionRequests();
      setRequests(list);
    } catch (error) {
      console.warn("Error refreshing requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();

    // Listen for cross-tab or local updates
    const handleUpdate = (e) => {
      if (Array.isArray(e.detail)) {
        setRequests(e.detail);
      }
    };
    window.addEventListener('flasho_deletion_requests_updated', handleUpdate);
    return () => {
      window.removeEventListener('flasho_deletion_requests_updated', handleUpdate);
    };
  }, []);

  // Open the custom approve/delete confirmation popup
  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setActiveModal('approve');
  };

  // Open the custom reject popup
  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason('Account has active bookings or unverified identity credentials.');
    setActiveModal('reject');
  };

  // Open the custom remove record popup
  const openDeleteRecordModal = (request) => {
    setSelectedRequest(request);
    setActiveModal('deleteRecord');
  };

  const closeModal = () => {
    setActiveModal(null);
    setSelectedRequest(null);
    setRejectReason('');
  };

  // Confirmed: Accept & Permanently Delete User Account (Instant UI + Background Email)
  const executeApproveAndDelete = async () => {
    if (!selectedRequest) return;
    const request = selectedRequest;
    const id = request.id;

    // 1. Instant optimistic UI update
    setRequests(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'completed',
      processedAt: new Date().toISOString(),
      emailSent: true
    } : r));

    closeModal();
    toast.success(`Account deleted! Confirmation email sent to ${request.email}`);

    // 2. Background persistent server update & Nodemailer dispatch
    try {
      await approveAndDeleteRequest(request, 'Approved and deleted manually via Admin Panel');
    } catch (err) {
      console.warn("Background approval error:", err);
    }
  };

  // Confirmed: Reject Request (Instant UI + Background Server Sync)
  const executeReject = async () => {
    if (!selectedRequest) return;
    const request = selectedRequest;
    const reason = rejectReason.trim() || 'Rejected by administrator';

    // 1. Instant optimistic UI update
    setRequests(prev => prev.map(r => r.id === request.id ? {
      ...r,
      status: 'rejected',
      adminNotes: reason,
      processedAt: new Date().toISOString()
    } : r));

    closeModal();
    toast.success("Request marked as rejected");

    // 2. Background server update
    try {
      await rejectRequest(request, reason);
    } catch (err) {
      console.warn("Background reject error:", err);
    }
  };

  // Confirmed: Delete Record Log (Instant UI + Background Disk Removal)
  const executeDeleteRecord = async () => {
    if (!selectedRequest) return;
    const request = selectedRequest;

    // 1. Instant optimistic UI removal
    setRequests(prev => prev.filter(r => r.id !== request.id));
    closeModal();
    toast.success("Request log permanently removed");

    // 2. Background disk & database removal
    try {
      await removeRequestRecord(request.id, request.firestoreId);
    } catch (err) {
      console.warn("Background delete error:", err);
    }
  };

  // Filter requests
  const filtered = requests.filter(req => {
    const matchesFilter = filter === 'all' || req.status === filter;
    const term = search.toLowerCase();
    const matchesSearch = !search || 
      req.name?.toLowerCase().includes(term) ||
      req.email?.toLowerCase().includes(term) ||
      req.phone?.toLowerCase().includes(term) ||
      req.reason?.toLowerCase().includes(term);
    return matchesFilter && matchesSearch;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-display font-bold text-white">Account Deletion Requests</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                {pendingCount} Pending (24h)
              </span>
            )}
          </div>
          <p className="text-gray-400 text-sm mt-1">
            Review user account deletion requests submitted via <span className="text-primary font-mono text-xs">flasho.services/delete-account</span>.
          </p>
        </div>

        <button
          onClick={fetchRequests}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-all border border-white/10 text-sm font-medium self-start md:self-auto cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Compliance Information Card */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <Clock size={20} />
        </div>
        <div className="text-sm">
          <h4 className="font-semibold text-white">Google Play & App Store Compliance Rule</h4>
          <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
            Users are entitled to request deletion of their accounts. Deletions must be processed within <strong>24 hours</strong>. When you click <strong>"Accept & Delete"</strong>, the account records are wiped and an automatic confirmation email is dispatched to the user using Nodemailer.
          </p>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-[#111111] p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'completed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold capitalize transition-all shrink-0 cursor-pointer ${
                filter === tab 
                  ? 'bg-primary text-secondary' 
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#050505] border border-white/10 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-[#111111] rounded-3xl shadow-sm border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-[#050505] text-white font-medium border-b border-white/10">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Reason & Notes</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-primary" />
                    Loading deletion requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    {search ? 'No requests match your search criteria.' : 'No account deletion requests in this view.'}
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-white/5 transition-colors">
                    {/* User Details */}
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white flex items-center gap-2">
                        <User size={15} className="text-gray-400" />
                        {req.name}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                        <Phone size={12} className="text-gray-500" />
                        {req.phone}
                      </div>
                      <div className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="text-gray-500" />
                        {req.email}
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold capitalize bg-white/5 text-gray-300 border border-white/10">
                        {req.role || 'client'}
                      </span>
                    </td>

                    {/* Reason */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-xs font-medium text-white truncate" title={req.reason}>
                        {req.reason}
                      </div>
                      {req.details && (
                        <div className="text-[11px] text-gray-400 truncate mt-0.5" title={req.details}>
                          "{req.details}"
                        </div>
                      )}
                      {req.admin_notes && (
                        <div className="text-[11px] text-primary/80 italic mt-0.5">
                          Admin: {req.admin_notes}
                        </div>
                      )}
                    </td>

                    {/* Requested At */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">
                      {req.createdAt?.toDate 
                        ? req.createdAt.toDate().toLocaleString() 
                        : req.requested_at 
                          ? new Date(req.requested_at).toLocaleString() 
                          : req.requestedAt 
                            ? new Date(req.requestedAt).toLocaleString() 
                            : 'Recent'}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30">
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                          <XCircle size={13} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse">
                          <Clock size={13} /> Pending
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openApproveModal(req)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow flex items-center gap-1.5 cursor-pointer hover:shadow-red-600/20"
                              title="Accept & permanently delete this account + send Nodemailer email"
                            >
                              <Trash2 size={13} />
                              Accept & Delete
                            </button>

                            <button
                              onClick={() => openRejectModal(req)}
                              className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors text-xs cursor-pointer"
                              title="Reject Request"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => openDeleteRecordModal(req)}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Request Log"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 🟢 CUSTOM IN-APP MODAL: CONFIRM ACCEPT & DELETE */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeModal === 'approve' && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-[#141414] border border-red-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
              {/* Glow Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

              {/* Close Button */}
              <button
                onClick={closeModal}
                disabled={processingId !== null}
                className="absolute top-6 right-6 text-gray-400 hover:text-white w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>

              {/* Header Badge & Icon */}
              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0 shadow-inner">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded-full border border-red-500/20">
                    Permanent Action
                  </span>
                  <h3 className="text-xl font-display font-bold text-white mt-1">
                    Accept & Delete Account?
                  </h3>
                </div>
              </div>

              {/* User Details Box */}
              <div className="bg-[#0b0b0b] rounded-2xl p-4 border border-white/5 space-y-2.5 mb-5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs font-medium">User Name:</span>
                  <span className="text-white font-semibold flex items-center gap-1.5">
                    <User size={13} className="text-primary" />
                    {selectedRequest.name}
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-gray-400 text-xs font-medium">Email:</span>
                  <span className="text-white font-mono text-xs">{selectedRequest.email}</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/5 pt-2">
                  <span className="text-gray-400 text-xs font-medium">Phone:</span>
                  <span className="text-white font-mono text-xs">{selectedRequest.phone}</span>
                </div>
                {selectedRequest.reason && (
                  <div className="border-t border-white/5 pt-2">
                    <span className="text-gray-400 text-xs font-medium block mb-1">Reason Stated:</span>
                    <p className="text-gray-300 text-xs bg-white/5 p-2 rounded-lg italic">
                      "{selectedRequest.reason}"
                    </p>
                  </div>
                )}
              </div>

              {/* Confirmation Explanation */}
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3.5 mb-6 text-xs text-red-300 leading-relaxed flex items-start gap-2.5">
                <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                <span>
                  This will <strong>permanently purge</strong> the user's data from Flasho and dispatch a confirmation email to <strong className="text-white underline">{selectedRequest.email}</strong> via <strong>Nodemailer</strong>.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={processingId !== null}
                  className="px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-sm transition-all border border-white/10 cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeApproveAndDelete}
                  disabled={processingId !== null}
                  className="px-6 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg hover:shadow-red-600/30 flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {processingId ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Deleting Account...
                    </>
                  ) : (
                    <>
                      <Trash2 size={16} />
                      Confirm & Delete Account
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 🔴 CUSTOM IN-APP MODAL: REJECT REQUEST */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeModal === 'reject' && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-[#141414] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10"
            >
              <button
                onClick={closeModal}
                disabled={processingId !== null}
                className="absolute top-6 right-6 text-gray-400 hover:text-white w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 text-yellow-500 flex items-center justify-center shrink-0">
                  <XCircle size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-white">Reject Request</h3>
                  <p className="text-xs text-gray-400">For {selectedRequest.name}</p>
                </div>
              </div>

              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-300 mb-2">
                  Reason for rejection:
                </label>
                <textarea
                  rows="3"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. User has pending transactions or active tasks..."
                  className="w-full px-3.5 py-2.5 bg-[#0a0a0a] border border-white/10 rounded-xl text-white text-xs placeholder-gray-500 focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={processingId !== null}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeReject}
                  disabled={processingId !== null}
                  className="px-5 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {processingId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                  Reject Request
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* ⚪ CUSTOM IN-APP MODAL: REMOVE RECORD LOG */}
      {/* ============================================================== */}
      <AnimatePresence>
        {activeModal === 'deleteRecord' && selectedRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-sm bg-[#141414] border border-white/10 rounded-3xl p-6 shadow-2xl z-10 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-lg font-display font-bold text-white mb-2">Remove Record Log?</h3>
              <p className="text-xs text-gray-400 mb-6 leading-relaxed">
                This will only remove the deletion request history item from this table.
              </p>

              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-semibold rounded-xl text-xs transition-all border border-white/10 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteRecord}
                  disabled={processingId !== null}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                >
                  {processingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                  Delete Log
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
