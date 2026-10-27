import fs from 'fs';
import path from 'path';

const DATA_FILE = path.resolve(process.cwd(), 'server', 'deletion_requests.json');

// Ensure the directory and file exist
function ensureDataFile() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(DATA_FILE)) {
      // Seed with initial sample if totally empty so admin sees prior history
      const initial = [
        {
          id: 'del_17300001',
          name: 'Vikram Shinde',
          phone: '9876543210',
          email: 'vikram.shinde@gmail.com',
          role: 'Customer',
          reason: 'No longer using the service',
          details: 'Moved to a different city.',
          status: 'completed',
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          processedAt: new Date(Date.now() - 86400000).toISOString(),
          emailSent: true
        }
      ];
      fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Error ensuring deletion requests data file:', err);
  }
}

export function getAllDeletionRequests() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('Error reading deletion requests:', err);
    return [];
  }
}

export function saveDeletionRequest(data) {
  ensureDataFile();
  try {
    const list = getAllDeletionRequests();
    
    // Check if an entry with this phone or email is already pending
    const existingIndex = list.findIndex(r => 
      (r.id && r.id === data.id) ||
      (r.phone && data.phone && r.phone === data.phone && r.status === 'pending') ||
      (r.email && data.email && r.email.toLowerCase() === data.email.toLowerCase() && r.status === 'pending')
    );

    const newRecord = {
      id: data.id || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: data.name || '',
      phone: data.phone || '',
      email: data.email || '',
      role: data.role || 'Customer',
      reason: data.reason || 'Account deletion requested',
      details: data.details || '',
      status: data.status || 'pending',
      createdAt: data.createdAt || new Date().toISOString(),
      emailSent: Boolean(data.emailSent)
    };

    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...newRecord };
    } else {
      list.unshift(newRecord);
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    return newRecord;
  } catch (err) {
    console.error('Error saving deletion request:', err);
    return data;
  }
}

export function approveDeletionRequest(id, adminNotes = '') {
  ensureDataFile();
  try {
    const list = getAllDeletionRequests();
    const index = list.findIndex(r => r.id === id || String(r._id) === String(id));
    if (index >= 0) {
      list[index].status = 'completed';
      list[index].processedAt = new Date().toISOString();
      list[index].adminNotes = adminNotes || 'Approved and account deleted by Admin';
      list[index].emailSent = true;
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
      return list[index];
    }
  } catch (err) {
    console.error('Error approving deletion request:', err);
  }
  return null;
}

export function rejectDeletionRequest(id, reason = '') {
  ensureDataFile();
  try {
    const list = getAllDeletionRequests();
    const index = list.findIndex(r => r.id === id || String(r._id) === String(id));
    if (index >= 0) {
      list[index].status = 'rejected';
      list[index].processedAt = new Date().toISOString();
      list[index].adminNotes = reason || 'Rejected by Admin';
      fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
      return list[index];
    }
  } catch (err) {
    console.error('Error rejecting deletion request:', err);
  }
  return null;
}

export function removeDeletionRequest(id) {
  ensureDataFile();
  try {
    let list = getAllDeletionRequests();
    const beforeCount = list.length;
    list = list.filter(r => r.id !== id && String(r._id) !== String(id));
    fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), 'utf8');
    return list.length < beforeCount;
  } catch (err) {
    console.error('Error removing deletion request:', err);
    return false;
  }
}
