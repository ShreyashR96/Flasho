const mongoose = require('mongoose');

const accountDeletionRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  role: {
    type: String,
    enum: ['client', 'worker', 'agency', 'other'],
    default: 'client'
  },
  reason: {
    type: String,
    default: 'Not specified'
  },
  details: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'rejected'],
    default: 'pending'
  },
  admin_notes: {
    type: String,
    default: ''
  },
  user_found: {
    type: Boolean,
    default: false
  },
  matched_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  email_sent: {
    type: Boolean,
    default: false
  },
  email_sent_at: {
    type: Date,
    default: null
  },
  requested_at: {
    type: Date,
    default: Date.now
  },
  processed_at: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model('AccountDeletionRequest', accountDeletionRequestSchema);
