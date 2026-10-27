import axios from 'axios';
import { db } from '../firebase';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

const STORAGE_KEY = 'flasho_account_deletion_requests';

export function getLocalDeletionRequests() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading from localStorage:', err);
  }
  return [];
}

export function saveLocalDeletionRequests(list) {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('flasho_deletion_requests_updated', { detail: list }));
    }
  } catch (err) {
    console.warn('Error writing to localStorage:', err);
  }
}

/**
 * Fetch all deletion requests.
 * Loads synchronously from localStorage first (0ms delay), then updates from Vite disk API & Firestore in parallel.
 */
export async function loadAllDeletionRequests() {
  // Start with localStorage
  let combined = getLocalDeletionRequests();

  try {
    // 1. Fetch from Vite server persistent disk API
    const res = await axios.get('/api/account-deletion-requests', { timeout: 2500 });
    if (Array.isArray(res.data)) {
      // Merge: server records are prioritized
      res.data.forEach(srvItem => {
        const idx = combined.findIndex(c => c.id === srvItem.id);
        if (idx >= 0) {
          combined[idx] = { ...combined[idx], ...srvItem };
        } else {
          combined.push(srvItem);
        }
      });
    }
  } catch (err) {
    console.warn('Vite API fetch note:', err.message);
  }

  // 2. Fetch from Firestore if active
  if (db) {
    try {
      const snap = await getDocs(collection(db, 'account_deletion_requests'));
      snap.docs.forEach(d => {
        const fsItem = { id: d.id, firestoreId: d.id, ...d.data() };
        const idx = combined.findIndex(c => c.id === fsItem.id || (c.phone && c.phone === fsItem.phone));
        if (idx >= 0) {
          combined[idx] = { ...combined[idx], ...fsItem, firestoreId: d.id };
        } else {
          combined.push(fsItem);
        }
      });
    } catch (fsErr) {
      console.warn('Firestore fetch note:', fsErr.message);
    }
  }

  // Sort newest first
  combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  saveLocalDeletionRequests(combined);
  return combined;
}

/**
 * Submit a new deletion request.
 */
export async function createDeletionRequest(payload) {
  const newRecord = {
    id: `req_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    ...payload,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  // 1. Save locally immediately
  const list = getLocalDeletionRequests();
  list.unshift(newRecord);
  saveLocalDeletionRequests(list);

  // 2. Persist to Vite server disk
  try {
    await axios.post('/api/account-deletion-requests', newRecord);
  } catch (e) {
    console.warn('Vite API save note:', e.message);
  }

  // 3. Dispatch acknowledgment email via Nodemailer
  try {
    axios.post('/api/send-deletion-mail', {
      ...payload,
      requestId: newRecord.id,
      type: 'received'
    }).catch(err => console.warn('Email dispatch notice:', err));
  } catch (e) {}

  // 4. Mirror to Firestore if available
  if (db) {
    try {
      await setDoc(doc(db, 'account_deletion_requests', newRecord.id), {
        ...newRecord,
        createdAt: serverTimestamp()
      });
    } catch (fsErr) {}
  }

  return newRecord;
}

/**
 * Approve and permanently delete account (Instant UI response + background email dispatch).
 */
export async function approveAndDeleteRequest(request, adminNotes = '') {
  const now = new Date().toISOString();

  // 1. Optimistically update local storage
  const list = getLocalDeletionRequests();
  const updatedList = list.map(r => {
    if (r.id === request.id) {
      return {
        ...r,
        status: 'completed',
        processedAt: now,
        adminNotes: adminNotes || 'Approved and deleted by Admin',
        emailSent: true
      };
    }
    return r;
  });
  saveLocalDeletionRequests(updatedList);

  // 2. Call Vite server API (updates disk & dispatches email)
  try {
    axios.post(`/api/account-deletion-requests/${request.id}/approve`, {
      email: request.email,
      name: request.name,
      phone: request.phone,
      admin_notes: adminNotes
    }).catch(err => console.warn('Approve API notice:', err));
  } catch (e) {}

  // 3. Update Firestore if active
  if (db) {
    try {
      const targetId = request.firestoreId || request.id;
      updateDoc(doc(db, 'account_deletion_requests', targetId), {
        status: 'completed',
        processedAt: serverTimestamp(),
        emailSent: true
      }).catch(err => {});
    } catch (fsErr) {}
  }

  return true;
}

/**
 * Reject request.
 */
export async function rejectRequest(request, reason = '') {
  const now = new Date().toISOString();

  // 1. Update local storage
  const list = getLocalDeletionRequests();
  const updatedList = list.map(r => {
    if (r.id === request.id) {
      return {
        ...r,
        status: 'rejected',
        processedAt: now,
        adminNotes: reason || 'Rejected by Admin'
      };
    }
    return r;
  });
  saveLocalDeletionRequests(updatedList);

  // 2. Call Vite API
  try {
    axios.post(`/api/account-deletion-requests/${request.id}/reject`, {
      reason
    }).catch(err => console.warn('Reject API notice:', err));
  } catch (e) {}

  // 3. Update Firestore
  if (db) {
    try {
      const targetId = request.firestoreId || request.id;
      updateDoc(doc(db, 'account_deletion_requests', targetId), {
        status: 'rejected',
        admin_notes: reason,
        processedAt: serverTimestamp()
      }).catch(err => {});
    } catch (fsErr) {}
  }

  return true;
}

/**
 * Permanently remove record log from disk and state.
 */
export async function removeRequestRecord(id, firestoreId = null) {
  // 1. Remove from local storage immediately
  const list = getLocalDeletionRequests();
  const filtered = list.filter(r => r.id !== id);
  saveLocalDeletionRequests(filtered);

  // 2. Remove from Vite server disk
  try {
    axios.delete(`/api/account-deletion-requests/${id}`).catch(err => {});
  } catch (e) {}

  // 3. Remove from Firestore
  if (db) {
    try {
      const targetId = firestoreId || id;
      deleteDoc(doc(db, 'account_deletion_requests', targetId)).catch(err => {});
    } catch (e) {}
  }

  return true;
}
