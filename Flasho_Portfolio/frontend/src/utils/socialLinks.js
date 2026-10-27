import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export const SOCIAL_STORAGE_KEY = 'flasho_social_links';
export const SOCIAL_BROADCAST_CHANNEL = 'flasho_social_channel';

export const DEFAULT_SOCIAL_LINKS = {
  instagram: '',
  whatsapp: '',
  facebook: '',
  twitter: '',
  youtube: '',
  linkedin: '',
  telegram: ''
};

/**
 * Format raw input to a valid external URL.
 * Handles WhatsApp numbers (e.g. 9561850928 or +91 9561850928) -> https://wa.me/919561850928
 * Prepends https:// if user typed "instagram.com/user" without protocol.
 */
export function formatSocialUrl(platform, rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim();
  if (!trimmed) return '';

  if (platform === 'whatsapp') {
    // If it's already a full whatsapp url
    if (/^https?:\/\/(wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(trimmed)) {
      return trimmed;
    }
    // If it starts with wa.me/ without protocol
    if (/^wa\.me\//i.test(trimmed)) {
      return `https://${trimmed}`;
    }
    // If it's digits/phone number
    const digits = trimmed.replace(/\D/g, '');
    if (digits.length >= 10) {
      const fullPhone = digits.length === 10 ? `91${digits}` : digits;
      return `https://wa.me/${fullPhone}`;
    }
  }

  // Prepend https:// if protocol is missing
  if (!/^https?:\/\//i.test(trimmed) && !/^(mailto|tel):/i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

/**
 * Get social links synchronously from localStorage
 */
export function getSocialLinks() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(SOCIAL_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SOCIAL_LINKS, ...parsed };
    }
  } catch (err) {
    console.warn('Error reading social links from localStorage:', err);
  }
  return { ...DEFAULT_SOCIAL_LINKS };
}

/**
 * Save social links to localStorage, BroadcastChannel, custom window event, and Firestore.
 */
export async function saveSocialLinks(links) {
  const sanitized = { ...DEFAULT_SOCIAL_LINKS, ...links };

  // 1. Update localStorage immediately
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(sanitized));
      window.dispatchEvent(new CustomEvent('flasho_social_updated', { detail: sanitized }));

      // Broadcast to other open tabs
      if (typeof BroadcastChannel !== 'undefined') {
        const channel = new BroadcastChannel(SOCIAL_BROADCAST_CHANNEL);
        channel.postMessage({ type: 'UPDATE_SOCIAL_LINKS', data: sanitized });
        channel.close();
      }
    }
  } catch (err) {
    console.warn('Error saving to localStorage/broadcast:', err);
  }

  // 2. Persist to Firebase Firestore if db is active
  if (db) {
    try {
      await setDoc(doc(db, 'settings', 'social_media'), sanitized);
    } catch (fbErr) {
      console.warn('Firestore social_media save note:', fbErr?.message);
    }
  }

  return sanitized;
}

/**
 * Subscribe to realtime updates for social links across localStorage, tabs, and Firestore.
 */
export function subscribeSocialLinks(callback) {
  // Fire callback immediately with initial state
  callback(getSocialLinks());

  // 1. Listen for in-window custom events
  const handleLocalEvent = (e) => {
    if (e?.detail) {
      callback(e.detail);
    } else {
      callback(getSocialLinks());
    }
  };

  // 2. Listen for cross-tab storage changes
  const handleStorage = (e) => {
    if (e.key === SOCIAL_STORAGE_KEY) {
      callback(getSocialLinks());
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('flasho_social_updated', handleLocalEvent);
    window.addEventListener('storage', handleStorage);
  }

  // 3. Listen via BroadcastChannel if available
  let channel = null;
  if (typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(SOCIAL_BROADCAST_CHANNEL);
      channel.onmessage = (event) => {
        if (event.data?.type === 'UPDATE_SOCIAL_LINKS' && event.data.data) {
          callback(event.data.data);
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel not initialized:', e);
    }
  }

  // 4. Real-time Firestore snapshot listener
  let unsubscribeFirestore = null;
  if (db) {
    try {
      const docRef = doc(db, 'settings', 'social_media');
      unsubscribeFirestore = onSnapshot(
        docRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = { ...DEFAULT_SOCIAL_LINKS, ...snapshot.data() };
            // Cache locally
            try {
              if (typeof window !== 'undefined') {
                localStorage.setItem(SOCIAL_STORAGE_KEY, JSON.stringify(data));
              }
            } catch (err) {}
            callback(data);
          }
        },
        (error) => {
          console.warn('Firestore social_media listener notice:', error?.message);
        }
      );
    } catch (err) {
      console.warn('Firestore onSnapshot init error:', err?.message);
    }
  }

  // Cleanup function
  return () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('flasho_social_updated', handleLocalEvent);
      window.removeEventListener('storage', handleStorage);
    }
    if (channel) {
      try { channel.close(); } catch (e) {}
    }
    if (unsubscribeFirestore) {
      try { unsubscribeFirestore(); } catch (e) {}
    }
  };
}
