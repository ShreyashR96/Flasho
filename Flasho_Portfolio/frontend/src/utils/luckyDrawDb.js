import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp, query, orderBy } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'flasho_luckydraw_participants';
const WINNERS_STORAGE_KEY = 'flasho_luckydraw_winners';
const SEQ_STORAGE_KEY = 'flasho_luckydraw_seq';
const DELETED_STORAGE_KEY = 'flasho_luckydraw_deleted';

export const luckyDrawDb = {
  // Generate next 4-digit sequential ticket number starting from 0001
  async getNextTicketNumber() {
    let highest = 0;

    // 1. Scan existing local participants for highest 4-digit number
    const localList = luckyDrawDb.getLocalParticipants();
    for (const item of localList) {
      if (item.ticketNumber) {
        const num = parseInt(item.ticketNumber, 10);
        if (!isNaN(num) && num > highest && num < 10000) {
          highest = num;
        }
      }
    }

    // 2. Check stored sequence counter in LocalStorage
    try {
      const storedSeq = parseInt(localStorage.getItem(SEQ_STORAGE_KEY) || '0', 10);
      if (!isNaN(storedSeq) && storedSeq > highest) {
        highest = storedSeq;
      }
    } catch {}

    const nextNum = highest + 1;
    try {
      localStorage.setItem(SEQ_STORAGE_KEY, String(nextNum));
    } catch {}

    // 4-digit zero-padded number (e.g. 0001, 0002, 0003, ...)
    return String(nextNum).padStart(4, '0');
  },

  // Save a new participant (Dual-write to Firestore + LocalStorage)
  async saveParticipant(data) {
    // Generate sequential 4-digit ticket if not already provided
    const ticketNumber = data.ticketNumber || (await luckyDrawDb.getNextTicketNumber());

    const newEntry = {
      ...data,
      ticketNumber,
      createdAt: new Date().toISOString()
    };

    // 1. Save to Firestore if available to get doc id immediately
    try {
      if (db) {
        const docRef = await addDoc(collection(db, 'lucky_draw_entries'), {
          ...newEntry,
          serverTimestamp: serverTimestamp()
        });
        newEntry.firestoreId = docRef.id;
        newEntry.id = docRef.id;
      }
    } catch (err) {
      console.warn('Firestore sync failed, local copy preserved:', err?.message || err);
    }

    // 2. Save to LocalStorage
    try {
      const localList = luckyDrawDb.getLocalParticipants();
      localList.unshift(newEntry);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    return newEntry;
  },

  // Get local participants
  getLocalParticipants() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  // Get all participants (tries Firestore first, falls back to LocalStorage)
  async getAllParticipants() {
    let deletedSet = new Set();
    try {
      const rawDeleted = localStorage.getItem(DELETED_STORAGE_KEY);
      if (rawDeleted) {
        deletedSet = new Set(JSON.parse(rawDeleted));
      }
    } catch {}

    let cloudEntries = [];
    try {
      if (db) {
        const q = query(collection(db, 'lucky_draw_entries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        cloudEntries = snap.docs.map(d => ({
          id: d.id,
          firestoreId: d.id,
          ...d.data()
        }));
      }
    } catch (err) {
      console.warn('Could not fetch from Firestore, reading local cache:', err?.message);
    }

    const localEntries = luckyDrawDb.getLocalParticipants();

    // Merge without duplicates by phone or ticketNumber
    const map = new Map();
    [...cloudEntries, ...localEntries].forEach(item => {
      const key = item.ticketNumber || item.phone || item.id;
      // Exclude if blacklisted as deleted
      const isDeleted = (
        deletedSet.has(item.ticketNumber) || 
        deletedSet.has(item.phone) || 
        (item.id && deletedSet.has(item.id)) ||
        (item.firestoreId && deletedSet.has(item.firestoreId))
      );

      if (key && !isDeleted) {
        if (!map.has(key)) {
          map.set(key, item);
        }
      }
    });

    return Array.from(map.values());
  },

  // Delete an entry
  async deleteParticipant(item) {
    const ticket = item.ticketNumber;
    const phone = item.phone;
    const docId = item.firestoreId || item.id;

    // 1. Add to deleted blacklist in LocalStorage so it never revives from cloud or cache
    try {
      const deletedList = JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY) || '[]');
      if (ticket && !deletedList.includes(ticket)) deletedList.push(ticket);
      if (phone && !deletedList.includes(phone)) deletedList.push(phone);
      if (docId && !deletedList.includes(docId)) deletedList.push(docId);
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedList));
    } catch (e) {
      console.warn(e);
    }

    // 2. Delete from LocalStorage
    try {
      let list = luckyDrawDb.getLocalParticipants();
      list = list.filter(p => 
        p.ticketNumber !== ticket && 
        p.phone !== phone &&
        (!docId || (p.id !== docId && p.firestoreId !== docId))
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // 3. Delete from Firestore if available
    if (db) {
      try {
        if (docId) {
          await deleteDoc(doc(db, 'lucky_draw_entries', docId));
        }
        
        // Also query and remove any matching ticketNumber in Firestore to be 100% thorough
        if (ticket) {
          const snap = await getDocs(collection(db, 'lucky_draw_entries'));
          for (const d of snap.docs) {
            const data = d.data();
            if (data.ticketNumber === ticket || (phone && data.phone === phone)) {
              await deleteDoc(doc(db, 'lucky_draw_entries', d.id));
            }
          }
        }
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }
  },

  // Clear all participant records & reset sequence counter
  async clearAll() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(WINNERS_STORAGE_KEY);
    localStorage.removeItem(SEQ_STORAGE_KEY);
    localStorage.removeItem(DELETED_STORAGE_KEY);

    // Also purge Firestore collection
    if (db) {
      try {
        const snap = await getDocs(collection(db, 'lucky_draw_entries'));
        const promises = snap.docs.map(d => deleteDoc(doc(db, 'lucky_draw_entries', d.id)));
        await Promise.all(promises);
      } catch (e) {
        console.warn('Firestore clear error:', e);
      }
    }
  },

  // Save latest 3 winners
  saveWinners(winners) {
    try {
      localStorage.setItem(WINNERS_STORAGE_KEY, JSON.stringify({
        date: new Date().toISOString(),
        winners
      }));
    } catch (e) {
      console.error(e);
    }
  },

  // Get last saved winners
  getSavedWinners() {
    try {
      const raw = localStorage.getItem(WINNERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
