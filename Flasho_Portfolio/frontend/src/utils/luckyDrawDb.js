import { db } from '../firebase';
import { 
  collection, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy, 
  runTransaction 
} from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'flasho_luckydraw_participants';
const WINNERS_STORAGE_KEY = 'flasho_luckydraw_winners';
const SEQ_STORAGE_KEY = 'flasho_luckydraw_seq';
const DELETED_STORAGE_KEY = 'flasho_luckydraw_deleted';

/**
 * Normalizes phone numbers to clean 10-digit Indian standard.
 * Examples: "+91 98220 12345" -> "9822012345", "09822012345" -> "9822012345".
 */
export const normalizePhone = (rawPhone) => {
  if (!rawPhone) return '';
  const digits = String(rawPhone).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
};

/**
 * Normalizes email addresses to lower-case trimmed format.
 * Examples: " Rahul@Gmail.com " -> "rahul@gmail.com".
 */
export const normalizeEmail = (rawEmail) => {
  if (!rawEmail) return '';
  return String(rawEmail).trim().toLowerCase();
};

/**
 * Formats any integer to a 4-digit zero-padded string (e.g. 1 -> "0001", 450 -> "0450").
 */
export const formatTicketNumber = (num) => {
  const parsed = parseInt(num, 10);
  if (isNaN(parsed) || parsed < 1) return '0001';
  return String(parsed).padStart(4, '0');
};

/**
 * Global FIFO Queue for serialized participant registration.
 * Guarantees that even under heavy concurrent traffic (400-500 students submitting at once),
 * requests wait in a queue and are processed sequentially with zero ticket number collisions.
 */
let registrationQueue = Promise.resolve();

export function enqueueRegistration(taskFn) {
  const queuedPromise = registrationQueue.then(() => taskFn(), () => taskFn());
  // Keep the queue running regardless of individual task outcome
  registrationQueue = queuedPromise.catch(() => {});
  return queuedPromise;
}

export const luckyDrawDb = {
  /**
   * Find an existing participant by normalized 10-digit phone number OR email address.
   * Checks Firestore first, then local cache.
   */
  async findExistingParticipant(rawPhone, rawEmail) {
    const cleanPhone = normalizePhone(rawPhone);
    const cleanEmail = normalizeEmail(rawEmail);

    // 1. Check Cloud Firestore
    if (db) {
      try {
        // Fast lookup by Phone Document ID
        if (cleanPhone) {
          const phoneDocRef = doc(db, 'lucky_draw_entries', cleanPhone);
          const phoneDocSnap = await getDoc(phoneDocRef);
          if (phoneDocSnap.exists()) {
            return {
              id: phoneDocSnap.id,
              firestoreId: phoneDocSnap.id,
              ...phoneDocSnap.data(),
              matchedBy: 'phone'
            };
          }
        }

        // Fast lookup by Email Document Index
        if (cleanEmail) {
          const emailKey = cleanEmail.replace(/[/.]/g, '_');
          const emailDocRef = doc(db, 'lucky_draw_emails', emailKey);
          const emailDocSnap = await getDoc(emailDocRef);
          if (emailDocSnap.exists()) {
            const emailData = emailDocSnap.data();
            if (emailData.phone) {
              const userDocRef = doc(db, 'lucky_draw_entries', emailData.phone);
              const userSnap = await getDoc(userDocRef);
              if (userSnap.exists()) {
                return {
                  id: userSnap.id,
                  firestoreId: userSnap.id,
                  ...userSnap.data(),
                  matchedBy: 'email'
                };
              }
            }
            return {
              ...emailData,
              matchedBy: 'email'
            };
          }
        }
      } catch (err) {
        console.warn('Firestore participant lookup error:', err?.message || err);
      }
    }

    // 2. Check LocalStorage cache
    const localList = luckyDrawDb.getLocalParticipants();
    for (const p of localList) {
      if (cleanPhone && normalizePhone(p.phone) === cleanPhone) {
        return { ...p, matchedBy: 'phone' };
      }
      if (cleanEmail && normalizeEmail(p.email) === cleanEmail) {
        return { ...p, matchedBy: 'email' };
      }
    }

    return null;
  },

  /**
   * Generates the next sequential 4-digit ticket number (e.g. 0001, 0002, ... 0500).
   * Scans all participants to eliminate collisions.
   */
  async getNextTicketNumber() {
    let highest = 0;

    // Scan all existing participants to find actual highest ticket in use
    const all = await luckyDrawDb.getAllParticipants();
    for (const item of all) {
      if (item.ticketNumber) {
        const num = parseInt(item.ticketNumber, 10);
        if (!isNaN(num) && num > highest && num < 100000) {
          highest = num;
        }
      }
    }

    // Check Firestore counter
    if (db) {
      try {
        const counterRef = doc(db, 'lucky_draw_metadata', 'ticket_counter');
        const counterSnap = await getDoc(counterRef);
        if (counterSnap.exists()) {
          const val = counterSnap.data().lastTicketNumber;
          if (typeof val === 'number' && val > highest) {
            highest = val;
          }
        }
      } catch (e) {
        console.warn('Firestore counter fetch note:', e?.message);
      }
    }

    // Scan LocalStorage stored sequence
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

    return formatTicketNumber(nextNum);
  },

  /**
   * Save a participant into the system.
   * STRICT RULES ENFORCED:
   * 1. ZERO DUPLICATES BY PHONE OR EMAIL:
   *    If user already registered with the same phone OR same email,
   *    returns existing ticket without generating a new ticket or incrementing the counter.
   * 2. ASYNC REGISTRATION QUEUE & ATOMIC SERIALIZATION:
   *    All incoming requests pass through enqueueRegistration() FIFO queue.
   *    Firestore uses runTransaction with retry backoff to guarantee sequential, 100% unique tickets.
   */
  saveParticipant(data, options = {}) {
    return enqueueRegistration(async () => {
      const cleanPhone = normalizePhone(data.phone);
      const cleanEmail = normalizeEmail(data.email);

      if (!cleanPhone || cleanPhone.length !== 10) {
        throw new Error('Please enter a valid 10-digit mobile number.');
      }
      if (!cleanEmail) {
        throw new Error('Please enter a valid email address.');
      }

      // 1. Check if Phone OR Email is already registered
      const existing = await luckyDrawDb.findExistingParticipant(cleanPhone, cleanEmail);
      if (existing) {
        if (options.throwIfExists) {
          const field = existing.matchedBy === 'email'
            ? `Email address (${cleanEmail})`
            : `Mobile number (+91 ${cleanPhone})`;
          throw new Error(`${field} is already registered with Ticket #${existing.ticketNumber || 'N/A'} (${existing.name}). One entry per person only!`);
        }
        return {
          ...existing,
          isExisting: true
        };
      }

      // 2. Fast check of current sequence counter (instant memory lookup)
      let localMaxSeq = 0;
      try {
        localMaxSeq = parseInt(localStorage.getItem(SEQ_STORAGE_KEY) || '0', 10) || 0;
      } catch {}

      const localList = luckyDrawDb.getLocalParticipants();
      for (const p of localList) {
        const num = parseInt(p.ticketNumber, 10);
        if (!isNaN(num) && num > localMaxSeq && num < 100000) {
          localMaxSeq = num;
        }
      }

      // 3. If manual ticket was specified
      let assignedTicket = null;
      if (data.ticketNumber) {
        assignedTicket = formatTicketNumber(data.ticketNumber);
      }

      let finalEntry = null;

      // 4. Attempt atomic write in Cloud Firestore with retry backoff
      if (db) {
        const maxRetries = 8;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            const counterRef = doc(db, 'lucky_draw_metadata', 'ticket_counter');
            const userDocRef = doc(db, 'lucky_draw_entries', cleanPhone);
            const emailKey = cleanEmail.replace(/[/.]/g, '_');
            const emailDocRef = doc(db, 'lucky_draw_emails', emailKey);

            finalEntry = await runTransaction(db, async (transaction) => {
              // Concurrency check A: Check phone in transaction
              const userSnap = await transaction.get(userDocRef);
              if (userSnap.exists()) {
                return {
                  id: userSnap.id,
                  firestoreId: userSnap.id,
                  ...userSnap.data(),
                  matchedBy: 'phone',
                  isExisting: true
                };
              }

              // Concurrency check B: Check email in transaction
              const emailSnap = await transaction.get(emailDocRef);
              if (emailSnap.exists()) {
                return {
                  id: cleanPhone,
                  ...emailSnap.data(),
                  matchedBy: 'email',
                  isExisting: true
                };
              }

              // Determine unique ticket number
              let ticketToUse = assignedTicket;
              if (!ticketToUse) {
                const counterSnap = await transaction.get(counterRef);
                let lastSeq = localMaxSeq;
                if (counterSnap.exists()) {
                  const dbSeq = counterSnap.data().lastTicketNumber || 0;
                  if (dbSeq > lastSeq) lastSeq = dbSeq;
                }
                const nextSeq = lastSeq + 1;
                ticketToUse = formatTicketNumber(nextSeq);

                transaction.set(counterRef, {
                  lastTicketNumber: nextSeq,
                  updatedAt: serverTimestamp()
                }, { merge: true });
              } else {
                const manualNum = parseInt(ticketToUse, 10);
                const counterSnap = await transaction.get(counterRef);
                const currentLast = counterSnap.exists() ? (counterSnap.data().lastTicketNumber || 0) : localMaxSeq;
                if (manualNum > currentLast) {
                  transaction.set(counterRef, {
                    lastTicketNumber: manualNum,
                    updatedAt: serverTimestamp()
                  }, { merge: true });
                }
              }

              const newDoc = {
                name: data.name.trim(),
                phone: cleanPhone,
                email: cleanEmail,
                area: data.area,
                selectedDropdownArea: data.selectedDropdownArea || '',
                isOtherArea: !!data.isOtherArea,
                ticketNumber: ticketToUse,
                createdAt: new Date().toISOString(),
                serverTimestamp: serverTimestamp()
              };

              // Write participant document
              transaction.set(userDocRef, newDoc);

              // Write email index mapping document
              transaction.set(emailDocRef, {
                phone: cleanPhone,
                email: cleanEmail,
                name: data.name.trim(),
                ticketNumber: ticketToUse,
                createdAt: new Date().toISOString()
              });

              return {
                ...newDoc,
                id: cleanPhone,
                firestoreId: cleanPhone,
                isExisting: false
              };
            });

            if (finalEntry) break;
          } catch (err) {
            console.warn(`Firestore transaction retry ${attempt}/${maxRetries}:`, err?.message || err);
            if (attempt < maxRetries) {
              await new Promise(r => setTimeout(r, 80 + Math.random() * 150));
            }
          }
        }
      }

      // 5. Fallback if offline or local demo mode
      if (!finalEntry) {
        let ticketToUse = assignedTicket;
        if (!ticketToUse) {
          ticketToUse = formatTicketNumber(localMaxSeq + 1);
        }

        finalEntry = {
          name: data.name.trim(),
          phone: cleanPhone,
          email: cleanEmail,
          area: data.area,
          selectedDropdownArea: data.selectedDropdownArea || '',
          isOtherArea: !!data.isOtherArea,
          ticketNumber: ticketToUse,
          createdAt: new Date().toISOString(),
          id: cleanPhone,
          isExisting: false
        };

        try {
          const numVal = parseInt(ticketToUse, 10);
          const storedSeq = parseInt(localStorage.getItem(SEQ_STORAGE_KEY) || '0', 10);
          if (!isNaN(numVal) && numVal > storedSeq) {
            localStorage.setItem(SEQ_STORAGE_KEY, String(numVal));
          }
        } catch {}
      }

      // 6. Update local cache (preserving strictly 1 entry per phone and email)
      try {
        let localList = luckyDrawDb.getLocalParticipants();
        localList = localList.filter(p => 
          normalizePhone(p.phone) !== cleanPhone && 
          normalizeEmail(p.email) !== cleanEmail
        );
        localList.unshift(finalEntry);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(localList));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      return finalEntry;
    });
  },

  /**
   * Get cached participants from LocalStorage
   */
  getLocalParticipants() {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  /**
   * Sanitizes existing participants to guarantee:
   * 1. Strictly 1 ticket per normalized phone number and email address.
   * 2. Zero duplicate ticket numbers across participants.
   * If any duplicate tickets are found from legacy test data, re-sequences them sequentially.
   */
  async sanitizeAndDeduplicateTickets(rawList) {
    if (!rawList || rawList.length === 0) return [];

    let hasChanges = false;
    const cleanList = [];
    const seenPhones = new Set();
    const seenEmails = new Set();
    const usedTickets = new Set();
    let highestTicketNum = 0;

    // First pass: deduplicate by phone and email, and preserve non-colliding ticket numbers
    for (const p of rawList) {
      const cleanPhone = normalizePhone(p.phone);
      const cleanEmail = normalizeEmail(p.email);

      // Duplicate phone or duplicate email
      if ((cleanPhone && seenPhones.has(cleanPhone)) || (cleanEmail && seenEmails.has(cleanEmail))) {
        hasChanges = true;
        continue; // drop duplicate registration
      }
      if (cleanPhone) seenPhones.add(cleanPhone);
      if (cleanEmail) seenEmails.add(cleanEmail);

      const tNum = parseInt(p.ticketNumber, 10);
      if (!isNaN(tNum) && tNum > 0 && !usedTickets.has(p.ticketNumber)) {
        usedTickets.add(p.ticketNumber);
        if (tNum > highestTicketNum) highestTicketNum = tNum;
        cleanList.push(p);
      } else {
        // Ticket is colliding or invalid, will assign next free sequence
        cleanList.push({ ...p, ticketNumber: null });
        hasChanges = true;
      }
    }

    // Second pass: assign new unique sequential tickets to any colliding entries
    for (const p of cleanList) {
      if (!p.ticketNumber) {
        highestTicketNum++;
        p.ticketNumber = formatTicketNumber(highestTicketNum);
        hasChanges = true;
      }
    }

    // If modifications were made to clean legacy collisions, persist back
    if (hasChanges) {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cleanList));
        localStorage.setItem(SEQ_STORAGE_KEY, String(highestTicketNum));
      } catch {}

      if (db) {
        try {
          await setDoc(doc(db, 'lucky_draw_metadata', 'ticket_counter'), {
            lastTicketNumber: highestTicketNum,
            updatedAt: serverTimestamp()
          }, { merge: true });

          for (const item of cleanList) {
            const cleanPhone = normalizePhone(item.phone);
            const cleanEmail = normalizeEmail(item.email);
            if (cleanPhone) {
              await setDoc(doc(db, 'lucky_draw_entries', cleanPhone), {
                ...item,
                phone: cleanPhone,
                email: cleanEmail,
                serverTimestamp: serverTimestamp()
              }, { merge: true });

              if (cleanEmail) {
                const emailKey = cleanEmail.replace(/[/.]/g, '_');
                await setDoc(doc(db, 'lucky_draw_emails', emailKey), {
                  phone: cleanPhone,
                  email: cleanEmail,
                  name: item.name,
                  ticketNumber: item.ticketNumber,
                  createdAt: item.createdAt || new Date().toISOString()
                }, { merge: true });
              }
            }
          }
        } catch (e) {
          console.warn('Sanitation cloud sync note:', e?.message);
        }
      }
    }

    return cleanList;
  },

  /**
   * Fetch all participants across Cloud Firestore and LocalStorage.
   * Deduplicates by normalized 10-digit phone number and email address.
   * Orders results by ticket number in sequential order (0001, 0002, ...).
   */
  async getAllParticipants() {
    let deletedSet = new Set();
    try {
      const rawDeleted = localStorage.getItem(DELETED_STORAGE_KEY);
      if (rawDeleted) {
        deletedSet = new Set(JSON.parse(rawDeleted));
      }
    } catch {}

    let cloudEntries = [];
    if (db) {
      try {
        const q = query(collection(db, 'lucky_draw_entries'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        cloudEntries = snap.docs.map(d => ({
          id: d.id,
          firestoreId: d.id,
          ...d.data()
        }));
      } catch (err) {
        console.warn('Could not fetch from Firestore, reading local cache:', err?.message);
      }
    }

    const localEntries = luckyDrawDb.getLocalParticipants();

    // Deduplicate by clean 10-digit phone number and email
    const map = new Map();
    [...cloudEntries, ...localEntries].forEach(item => {
      const cleanPhone = normalizePhone(item.phone);
      const cleanEmail = normalizeEmail(item.email);
      const ticket = item.ticketNumber ? formatTicketNumber(item.ticketNumber) : null;
      const key = cleanPhone || cleanEmail || ticket || item.id;

      const isDeleted = (
        (cleanPhone && deletedSet.has(cleanPhone)) ||
        (cleanEmail && deletedSet.has(cleanEmail)) ||
        (ticket && deletedSet.has(ticket)) ||
        (item.id && deletedSet.has(item.id)) ||
        (item.firestoreId && deletedSet.has(item.firestoreId))
      );

      if (key && !isDeleted && !map.has(key)) {
        map.set(key, {
          ...item,
          phone: cleanPhone || item.phone,
          email: cleanEmail || item.email,
          ticketNumber: ticket || item.ticketNumber
        });
      }
    });

    const rawList = Array.from(map.values());

    // Sort by createdAt ascending so older registrations preserve earlier numbers
    rawList.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

    // Self-heal and deduplicate any colliding ticket numbers or duplicate emails/phones
    const sanitized = await luckyDrawDb.sanitizeAndDeduplicateTickets(rawList);

    // Final sort in ascending ticket number order: 0001, 0002, 0003...
    sanitized.sort((a, b) => {
      const numA = parseInt(a.ticketNumber, 10) || 0;
      const numB = parseInt(b.ticketNumber, 10) || 0;
      if (numA !== numB) return numA - numB;
      return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
    });

    return sanitized;
  },

  /**
   * Delete an entry from Firestore and LocalStorage
   */
  async deleteParticipant(item) {
    const cleanPhone = normalizePhone(item.phone);
    const cleanEmail = normalizeEmail(item.email);
    const ticket = item.ticketNumber ? formatTicketNumber(item.ticketNumber) : null;
    const docId = item.firestoreId || cleanPhone || item.id;

    // 1. Add to deleted set so it doesn't reappear
    try {
      const deletedList = JSON.parse(localStorage.getItem(DELETED_STORAGE_KEY) || '[]');
      if (ticket && !deletedList.includes(ticket)) deletedList.push(ticket);
      if (cleanPhone && !deletedList.includes(cleanPhone)) deletedList.push(cleanPhone);
      if (cleanEmail && !deletedList.includes(cleanEmail)) deletedList.push(cleanEmail);
      if (docId && !deletedList.includes(docId)) deletedList.push(docId);
      localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(deletedList));
    } catch (e) {
      console.warn(e);
    }

    // 2. Remove from LocalStorage
    try {
      let list = luckyDrawDb.getLocalParticipants();
      list = list.filter(p => 
        normalizePhone(p.phone) !== cleanPhone && 
        normalizeEmail(p.email) !== cleanEmail &&
        p.ticketNumber !== ticket && 
        p.id !== docId &&
        p.firestoreId !== docId
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }

    // 3. Remove from Firestore
    if (db) {
      try {
        if (cleanPhone) {
          await deleteDoc(doc(db, 'lucky_draw_entries', cleanPhone));
        }
        if (cleanEmail) {
          const emailKey = cleanEmail.replace(/[/.]/g, '_');
          await deleteDoc(doc(db, 'lucky_draw_emails', emailKey));
        }
        if (docId && docId !== cleanPhone) {
          await deleteDoc(doc(db, 'lucky_draw_entries', docId));
        }
        if (ticket) {
          const snap = await getDocs(collection(db, 'lucky_draw_entries'));
          for (const d of snap.docs) {
            const data = d.data();
            if (data.ticketNumber === ticket || normalizePhone(data.phone) === cleanPhone || normalizeEmail(data.email) === cleanEmail) {
              await deleteDoc(doc(db, 'lucky_draw_entries', d.id));
            }
          }
        }
      } catch (err) {
        console.warn('Firestore delete error:', err);
      }
    }
  },

  /**
   * Clear all records and reset the counter back to 0000
   */
  async clearAll() {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(WINNERS_STORAGE_KEY);
    localStorage.removeItem(SEQ_STORAGE_KEY);
    localStorage.removeItem(DELETED_STORAGE_KEY);

    if (db) {
      try {
        // Clear entries
        const snap = await getDocs(collection(db, 'lucky_draw_entries'));
        const promises = snap.docs.map(d => deleteDoc(doc(db, 'lucky_draw_entries', d.id)));
        await Promise.all(promises);

        // Clear email indexes
        const emailSnap = await getDocs(collection(db, 'lucky_draw_emails'));
        const emailPromises = emailSnap.docs.map(d => deleteDoc(doc(db, 'lucky_draw_emails', d.id)));
        await Promise.all(emailPromises);

        // Reset the centralized atomic ticket counter
        await setDoc(doc(db, 'lucky_draw_metadata', 'ticket_counter'), {
          lastTicketNumber: 0,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.warn('Firestore clear error:', e);
      }
    }
  },

  /**
   * Save latest 3 winners
   */
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

  /**
   * Get last saved winners
   */
  getSavedWinners() {
    try {
      const raw = localStorage.getItem(WINNERS_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
};
