import { useEffect, useState } from 'react';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { 
  Trash2, 
  Search, 
  UserX, 
  Clock, 
  Mail, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Loader2,
  Calendar,
  ShieldCheck,
  ShieldAlert,
  X,
  User
} from 'lucide-react';

export default function DeleteRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  // Modal States
  const [activeModal, setActiveModal] = useState(null); // 'approve' | 'reject' | 'deleteRecord' | null
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/delete-account-requests');
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Error fetching requests:", error);
      toast.error('Failed to load deletion requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const openApproveModal = (request) => {
    setSelectedRequest(request);
    setActiveModal('approve');
  };

  const openRejectModal = (request) => {
    setSelectedRequest(request);
    setRejectReason('Active bookings or unverified credentials');
    setActiveModal('reject');
  };

  const openDeleteRecordModal = (request) => {
    setSelectedRequest(request);
    setActiveModal('deleteRecord');
  };

  const closeModal = () => {
    if (processingId) return;
    setActiveModal(null);
    setSelectedRequest(null);
    setRejectReason('');
  };

  const executeApproveAndDelete = async () => {
    if (!selectedRequest) return;
    const request = selectedRequest;

    setProcessingId(request._id);
    try {
      const res = await api.post(`/admin/delete-account-requests/${request._id}/approve`, {
        admin_notes: 'Account deletion approved and completed by Admin.'
      });

      toast.success(res.data?.message || 'Account deleted and confirmation email sent via Nodemailer!');
      closeModal();
      fetchRequests();
    } catch (error) {
      console.error("Error approving deletion:", error);
      toast.error(error.response?.data?.error || 'Failed to approve account deletion');
    } finally {
      setProcessingId(null);
    }
  };

  const executeReject = async () => {
    if (!selectedRequest) return;
    const request = selectedRequest;

    setProcessingId(request._id);
    try {
      await api.post(`/admin/delete-account-requests/${request._id}/reject`, { reason: rejectReason });
      toast.success('Request marked as rejected');
      closeModal();
      fetchRequests();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const executeDeleteRecord = async () => {
    if (!selectedRequest) return;
    const id = selectedRequest._id;

    setProcessingId(id);
    try {
      await api.delete(`/admin/delete-account-requests/${id}`);
      toast.success('Request record removed');
      setRequests(prev => prev.filter(r => r._id !== id));
      closeModal();
    } catch (error) {
      toast.error('Failed to remove record');
    } finally {
      setProcessingId(null);
    }
  };

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
    <div className="max-w-7xl space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Account Deletion Requests</h1>
            {pendingCount > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
                {pendingCount} Pending (24-Hour Rule)
              </span>
            )}
          </div>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Manage user account deletion requests submitted through flasho.services/delete-account.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold text-sm rounded-xl border border-gray-200 transition-all cursor-pointer"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Compliance Notice */}
      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
          <Clock size={20} />
        </div>
        <div>
          <h4 className="font-bold text-red-900 text-sm">Play Store & App Store Mandatory Compliance</h4>
          <p className="text-red-700 text-xs mt-0.5 leading-relaxed">
            Per store regulations, accounts requesting deletion must be reviewed and purged within <strong>24 hours</strong>. When clicking <strong>"Accept & Delete"</strong>, the user's database records are removed and a confirmation email is automatically dispatched via Nodemailer.
          </p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'pending', 'completed', 'rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all shrink-0 cursor-pointer ${
                filter === tab 
                  ? 'bg-gray-900 text-white shadow-sm' 
                  : 'bg-gray-50 text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#00C896]/20 focus:border-[#00C896]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-gray-900 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">User Details</th>
                <th className="px-6 py-4">Account Type</th>
                <th className="px-6 py-4">Reason & Notes</th>
                <th className="px-6 py-4">Requested At</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 text-gray-400" />
                    Loading deletion requests...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-16 text-center text-gray-400">
                    <UserX size={36} className="mx-auto mb-2 text-gray-300" />
                    <p className="font-semibold">{search ? 'No requests match search criteria' : 'No account deletion requests in this category'}</p>
                  </td>
                </tr>
              ) : (
                filtered.map((req) => (
                  <tr key={req._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900 text-base">{req.name}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                        <Phone size={12} className="text-gray-400" />
                        {req.phone}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="text-gray-400" />
                        {req.email}
                      </div>
                      {req.matched_user_id && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded-full mt-1.5">
                          <ShieldCheck size={12} /> Matched in Database
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gray-100 text-gray-700">
                        {req.role || 'client'}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-xs">
                      <div className="text-xs font-semibold text-gray-900">{req.reason}</div>
                      {req.details && (
                        <div className="text-xs text-gray-500 italic mt-0.5">
                          "{req.details}"
                        </div>
                      )}
                      {req.admin_notes && (
                        <div className="text-[11px] text-blue-600 font-medium mt-1">
                          Admin note: {req.admin_notes}
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        {req.requested_at ? new Date(req.requested_at).toLocaleDateString() : 'N/A'}
                      </div>
                      <div className="text-[11px] text-gray-400 pl-4 mt-0.5">
                        {req.requested_at ? new Date(req.requested_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      {req.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                          <CheckCircle2 size={13} /> Completed
                        </span>
                      ) : req.status === 'rejected' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle size={13} /> Rejected
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                          <Clock size={13} /> Pending (&lt;24h)
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => openApproveModal(req)}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                              title="Accept request, delete user and send Nodemailer email"
                            >
                              <Trash2 size={13} />
                              Accept & Delete
                            </button>

                            <button
                              onClick={() => openRejectModal(req)}
                              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                              title="Reject Request"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => openDeleteRecordModal(req)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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

      {/* 🟢 CUSTOM IN-APP MODAL: CONFIRM ACCEPT & DELETE */}
      {activeModal === 'approve' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={closeModal}
              disabled={processingId !== null}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <ShieldAlert size={28} />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                  Permanent Purge
                </span>
                <h3 className="text-xl font-bold text-gray-900 mt-1">
                  Accept & Delete Account?
                </h3>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 mb-5 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-xs">User Name:</span>
                <span className="text-gray-900 font-bold flex items-center gap-1.5">
                  <User size={13} className="text-[#00C896]" />
                  {selectedRequest.name}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                <span className="text-gray-500 text-xs">Email:</span>
                <span className="text-gray-900 font-mono text-xs">{selectedRequest.email}</span>
              </div>
              <div className="flex items-center justify-between border-t border-gray-200/60 pt-2">
                <span className="text-gray-500 text-xs">Phone:</span>
                <span className="text-gray-900 font-mono text-xs">{selectedRequest.phone}</span>
              </div>
              {selectedRequest.reason && (
                <div className="border-t border-gray-200/60 pt-2">
                  <span className="text-gray-500 text-xs block mb-1">Reason:</span>
                  <p className="text-gray-700 text-xs bg-white p-2 rounded-lg border border-gray-200 italic">
                    "{selectedRequest.reason}"
                  </p>
                </div>
              )}
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 mb-6 text-xs text-red-800 leading-relaxed flex items-start gap-2.5">
              <AlertTriangle size={16} className="text-red-600 shrink-0 mt-0.5" />
              <span>
                This will <strong>permanently delete</strong> all records from MongoDB & Auth, and send an automated confirmation email to <strong className="underline">{selectedRequest.email}</strong> via <strong>Nodemailer</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={processingId !== null}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeApproveAndDelete}
                disabled={processingId !== null}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {processingId ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Confirm & Delete Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔴 CUSTOM IN-APP MODAL: REJECT */}
      {activeModal === 'reject' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100">
            <button
              onClick={closeModal}
              disabled={processingId !== null}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-700 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center transition-all cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                <XCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Reject Request</h3>
                <p className="text-xs text-gray-500">For {selectedRequest.name}</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-700 mb-2">
                Reason for rejection:
              </label>
              <textarea
                rows="3"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. User has active bookings..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={processingId !== null}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeReject}
                disabled={processingId !== null}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {processingId ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⚪ CUSTOM IN-APP MODAL: REMOVE LOG */}
      {activeModal === 'deleteRecord' && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 text-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Remove Record Log?</h3>
            <p className="text-xs text-gray-500 mb-6">
              This will remove the deletion request history item from this table.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeDeleteRecord}
                disabled={processingId !== null}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs transition-all shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                {processingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Delete Log
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
