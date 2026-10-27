const AccountDeletionRequest = require('../models/AccountDeletionRequest');
const User = require('../models/User');
const EmailService = require('../services/EmailService');
const admin = require('firebase-admin');
const { createClient } = require('@supabase/supabase-js');

let supabaseAdmin = null;
if (process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)) {
  try {
    supabaseAdmin = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
    );
  } catch (err) {
    console.warn("Supabase admin initialization skipped in accountDeletionController:", err.message);
  }
}

// 🟢 1. PUBLIC: Submit account deletion request (called from flasho.services/delete-account)
exports.submitDeletionRequest = async (req, res) => {
  try {
    const { name, phone, email, role, reason, details } = req.body;

    if (!name || !phone || !email) {
      return res.status(400).json({ error: "Name, phone, and email are required fields." });
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPhone = String(phone).trim().replace(/[\s\-\(\)]/g, '');

    // Check if user exists in the platform database
    const matchedUser = await User.findOne({
      $or: [
        { phone: cleanPhone },
        { phone: cleanPhone.startsWith('+91') ? cleanPhone.slice(3) : `+91${cleanPhone}` },
        { email: cleanEmail }
      ]
    });

    const deletionRequest = new AccountDeletionRequest({
      name: name.trim(),
      phone: cleanPhone,
      email: cleanEmail,
      role: role || 'client',
      reason: reason || 'User requested account deletion',
      details: details || '',
      status: 'pending',
      user_found: !!matchedUser,
      matched_user_id: matchedUser ? matchedUser._id : null
    });

    await deletionRequest.save();

    // Send acknowledgment email using Nodemailer
    EmailService.sendDeletionRequestReceived({
      email: cleanEmail,
      name: name.trim(),
      phone: cleanPhone,
      requestId: deletionRequest._id
    }).catch(err => console.error("Error dispatching acknowledgment email:", err.message));

    // Real-time alert to open admin panels via Socket.io
    const io = req.app.get('io');
    if (io) {
      io.emit('new_account_deletion_request', {
        id: deletionRequest._id,
        name: deletionRequest.name,
        phone: deletionRequest.phone,
        email: deletionRequest.email,
        role: deletionRequest.role,
        requested_at: deletionRequest.requested_at
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account deletion request submitted successfully. Your account and personal data will be deleted within 24 hours and you will receive a confirmation email.",
      requestId: deletionRequest._id
    });
  } catch (error) {
    console.error("Error submitting account deletion request:", error);
    return res.status(500).json({ error: "Failed to submit account deletion request. Please try again." });
  }
};

// 🟢 2. ADMIN: List all deletion requests
exports.getAllRequests = async (req, res) => {
  try {
    const requests = await AccountDeletionRequest.find()
      .populate('matched_user_id', 'full_name phone email role wallet_balance created_at')
      .sort({ requested_at: -1 });

    return res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching deletion requests:", error);
    return res.status(500).json({ error: "Failed to fetch account deletion requests." });
  }
};

// 🟢 3. ADMIN: Accept & Permanently Delete User Account (Dispatches Nodemailer confirmation)
exports.approveAndProcessDeletion = async (req, res) => {
  try {
    const { id } = req.params;
    const { admin_notes } = req.body;

    const requestDoc = await AccountDeletionRequest.findById(id);
    if (!requestDoc) {
      return res.status(404).json({ error: "Deletion request not found." });
    }

    if (requestDoc.status === 'completed') {
      return res.status(400).json({ error: "This request has already been processed and completed." });
    }

    // Attempt to locate the user in the database
    const cleanPhone = requestDoc.phone;
    const cleanEmail = requestDoc.email;
    const user = await User.findOne({
      $or: [
        ...(requestDoc.matched_user_id ? [{ _id: requestDoc.matched_user_id }] : []),
        { phone: cleanPhone },
        { phone: cleanPhone.startsWith('+91') ? cleanPhone.slice(3) : `+91${cleanPhone}` },
        { email: cleanEmail }
      ]
    });

    let userDeletedFromDatabase = false;

    if (user) {
      const authId = user.auth_id;

      // 1. Delete from Supabase Auth if applicable
      if (supabaseAdmin && authId) {
        try {
          await supabaseAdmin.auth.admin.deleteUser(authId);
          console.log(`✅ Deleted user from Supabase Auth: ${authId}`);
        } catch (supabaseErr) {
          console.warn(`⚠️ Supabase auth deletion warning:`, supabaseErr.message);
        }
      }

      // 2. Delete from Firebase Auth if applicable
      if (admin.apps.length && authId) {
        try {
          await admin.auth().deleteUser(authId);
          console.log(`✅ Deleted user from Firebase Auth: ${authId}`);
        } catch (fbErr) {
          console.warn(`⚠️ Firebase auth deletion warning:`, fbErr.message);
        }
      }

      // 3. Delete from MongoDB
      await User.findByIdAndDelete(user._id);
      userDeletedFromDatabase = true;
      console.log(`✅ Permanently removed user ${user._id} (${user.full_name}) from MongoDB.`);
    }

    // Update request state to completed
    requestDoc.status = 'completed';
    requestDoc.processed_at = new Date();
    requestDoc.admin_notes = admin_notes || 'Accepted and deleted by administrator';
    requestDoc.email_sent = true;
    requestDoc.email_sent_at = new Date();
    await requestDoc.save();

    // 🟢 Send final confirmation email using Nodemailer
    const emailResult = await EmailService.sendAccountDeletedConfirmation({
      email: requestDoc.email,
      name: requestDoc.name,
      phone: requestDoc.phone
    });

    return res.status(200).json({
      success: true,
      message: `Account for ${requestDoc.name} has been deleted. Confirmation email sent to ${requestDoc.email}.`,
      userDeleted: userDeletedFromDatabase,
      emailSent: emailResult.success
    });
  } catch (error) {
    console.error("Error approving account deletion:", error);
    return res.status(500).json({ error: "Failed to process account deletion: " + error.message });
  }
};

// 🟢 4. ADMIN: Reject request
exports.rejectRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const requestDoc = await AccountDeletionRequest.findById(id);
    if (!requestDoc) {
      return res.status(404).json({ error: "Deletion request not found." });
    }

    requestDoc.status = 'rejected';
    requestDoc.admin_notes = reason || 'Rejected by administrator';
    requestDoc.processed_at = new Date();
    await requestDoc.save();

    return res.status(200).json({
      success: true,
      message: "Deletion request marked as rejected."
    });
  } catch (error) {
    console.error("Error rejecting deletion request:", error);
    return res.status(500).json({ error: "Failed to reject deletion request." });
  }
};

// 🟢 5. ADMIN: Delete request record
exports.deleteRequestRecord = async (req, res) => {
  try {
    const { id } = req.params;
    await AccountDeletionRequest.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Request record deleted." });
  } catch (error) {
    console.error("Error deleting request record:", error);
    return res.status(500).json({ error: "Failed to delete request record." });
  }
};
