const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const Razorpay = require('razorpay');

// Import MVC Controllers
const userController = require('../controllers/userController');
const bookingController = require('../controllers/bookingController');
const workerController = require('../controllers/workerController');

// Legacy un-refactored imports needed for Admin/Agency remaining routes below
const User = require('../models/User');
const Agency = require('../models/Agency');
const Review = require('../models/Review');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const NotificationService = require('../services/NotificationService');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ==========================================
// 🟢 MVC ARCHITECTURE ROUTES
// ==========================================

// USER & AUTH
router.post('/users/sync', authMiddleware, userController.syncUser);
router.get('/users/me', authMiddleware, userController.getProfile);
router.put('/users/me', authMiddleware, userController.updateProfile);
router.get('/users/address', authMiddleware, userController.getAddresses);
router.post('/users/address', authMiddleware, userController.addAddress);
router.delete('/users/address/:addressId', authMiddleware, userController.deleteAddress);

// PUBLIC CATALOG
router.get('/services', userController.getServices);
router.get('/agencies', userController.getAgencies);

// BOOKINGS (CLIENT)
router.post('/bookings', authMiddleware, bookingController.createBooking);
router.post('/bookings/:id/addon', authMiddleware, bookingController.addAddon);
router.get('/bookings/my-bookings', authMiddleware, bookingController.getMyBookings);
router.put('/bookings/:id/status', authMiddleware, bookingController.updateClientStatus);
router.post('/bookings/:id/review', authMiddleware, bookingController.addReview);

// JOBS (ADMIN / AGENCY DIRECTORIES)
router.get('/admin/bookings', authMiddleware, bookingController.getAdminBookings);
router.get('/agency/bookings', authMiddleware, bookingController.getAgencyBookings);

// WORKER OPERATIONS
router.put('/worker/tasks/:id/accept', authMiddleware, workerController.acceptTask);
router.put('/worker/tasks/:id/status', authMiddleware, workerController.updateTaskStatus);
router.post('/worker/verify-submit', authMiddleware, workerController.submitVerification);
router.post('/worker/withdraw', authMiddleware, workerController.requestWithdrawal);

// ==========================================
// 🟢 REMAINING ROUTES (Payments & Admin Panel)
// ==========================================

router.post('/payments/create-order', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body; 
    const options = { amount: Math.round(amount * 100), currency: "INR", receipt: `receipt_${Date.now()}` };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) { res.status(500).json({ error: 'Failed to create Razorpay order' }); }
});

router.post('/admin/notifications/broadcast', authMiddleware, async (req, res) => {
  try {
    const { title, message, imageUrl, discountCode } = req.body;
    if (!title || !message) return res.status(400).json({ error: "Title and message are required" });
    await NotificationService.sendBroadcastOffer(title, message, imageUrl, { discountCode: discountCode || null });
    res.status(200).json({ message: "Broadcast sent successfully to all users!" });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/admin/settlements/workers', authMiddleware, async (req, res) => {
  try {
    const pendingWorkers = await User.find({ role: 'worker', wallet_balance: { $gt: 0 }, $or: [{ agency_id: null }, { agency_id: { $exists: false } }] }).select('full_name email phone completed_jobs wallet_balance').sort({ wallet_balance: -1 });
    res.status(200).json(pendingWorkers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.get('/admin/settlements/agencies', authMiddleware, async (req, res) => {
  try {
    let agencies = await Agency.find({}).select('name email phone completed_jobs wallet_balance').sort({ wallet_balance: -1 });
    res.status(200).json(agencies);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/admin/settlements/process', authMiddleware, async (req, res) => {
  try {
    const { targetId, type, amount } = req.body;
    const exactAmount = Number(Number(amount).toFixed(2));
    
    if (exactAmount <= 0) {
      return res.status(400).json({ error: "Invalid settlement amount" });
    }

    if (type === 'workers') {
      const worker = await User.findById(targetId);
      if (worker) {
        // 🟢 SAFE MATH: Subtract the exact payout, never hardcode to 0
        worker.wallet_balance = Number(Math.max(0, worker.wallet_balance - exactAmount).toFixed(2));
        await worker.save();
      }
    } 
    else if (type === 'agencies') {
      const Agency = require('../models/Agency');
      const agency = await Agency.findById(targetId);
      if (agency) {
        // 🟢 SAFE MATH: Subtract the exact payout, never hardcode to 0
        agency.wallet_balance = Number(Math.max(0, agency.wallet_balance - exactAmount).toFixed(2));
        await agency.save();
      }
    }
    
    res.status(200).json({ message: "Payout marked as settled successfully." });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

router.get('/admin/workers', authMiddleware, async (req, res) => {
  try {
    const allWorkers = await User.find({ role: 'worker' }).populate('agency_id', 'name').sort({ created_at: -1 }); 
    res.status(200).json(allWorkers);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/admin/workers/:id/verify', authMiddleware, async (req, res) => {
  try {
    const { verification_status } = req.body; 
    const worker = await User.findByIdAndUpdate(req.params.id, { verification_status: verification_status, is_verified: verification_status === 'verified' }, { new: true });
    res.status(200).json(worker);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/agency/withdraw', authMiddleware, async (req, res) => {
  try {
    const { amount, payout_method, payout_details } = req.body;
    const user = await User.findOne({ auth_id: req.authId });
    const agency = await Agency.findById(user?.agency_id);
    if (!agency) return res.status(404).json({ error: "Agency not found." });

    // 🟢 EXACT DECIMAL MATH (Fixes the 400 Bad Request)
    const withdrawAmount = Number(Number(amount).toFixed(2));
    if (withdrawAmount <= 0 || agency.wallet_balance < withdrawAmount) {
        return res.status(400).json({ error: "Invalid amount or insufficient balance." });
    }

    agency.wallet_balance = Number((agency.wallet_balance - withdrawAmount).toFixed(2));
    await agency.save();

    const request = new WithdrawalRequest({
      entity_id: agency._id, 
      entity_type: 'agency', 
      entity_name: agency.name, 
      contact_info: agency.phone || agency.email || 'N/A',
      amount: withdrawAmount, 
      payout_method: payout_method || 'upi', 
      payout_details: payout_details || {}
    });
    await request.save();

    res.status(200).json({ message: "Withdrawal request submitted to admin!", new_balance: agency.wallet_balance });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

router.get('/admin/withdrawals/pending', authMiddleware, async (req, res) => {
  try {
    const requests = await WithdrawalRequest.find({ status: 'pending' }).sort({ created_at: 1 });
    res.status(200).json(requests);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.put('/admin/withdrawals/:id', authMiddleware, async (req, res) => {
  try {
    const { status } = req.body; 
    const request = await WithdrawalRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ error: "Request not found" });

    if (status === 'approved' && request.status !== 'approved') {
      try {
        // 🟢 1. FETCH EXACT PHONE AND EMAIL FOR RAZORPAY SMS/EMAIL
        let entityPhone = '';
        let entityEmail = '';

        if (request.entity_type === 'worker') {
          const worker = await User.findById(request.entity_id);
          if (worker) { entityPhone = worker.phone; entityEmail = worker.email; }
        } else {
          const agency = await Agency.findById(request.entity_id);
          if (agency) { entityPhone = agency.phone; entityEmail = agency.email; }
        }

        // 🟢 2. CREATE RAZORPAY CONTACT WITH FULL NOTIFICATION DETAILS
        // 1. Create Contact
        const contactData = {
          name: request.entity_name,
          type: "vendor", // 🟢 FIXED: Replaced request.entity_type with "vendor"
          reference_id: request.entity_id.toString(),
          ...(entityPhone && { contact: entityPhone }), 
          ...(entityEmail && { email: entityEmail })    
        };
        const contactRes = await axios.post('https://api.razorpay.com/v1/contacts', contactData, { 
          headers: { 'Authorization': authHeader }
        });
        
        const contact = await razorpay.contacts.create(contactData);
        
        let fundAccountPayload = {
          contact_id: contact.id,
          account_type: request.payout_method === 'upi' ? 'vpa' : 'bank_account',
        };
        
        if (request.payout_method === 'upi') {
          fundAccountPayload.vpa = { address: request.payout_details.upi_id };
        } else {
          fundAccountPayload.bank_account = {
            name: request.payout_details.account_name,
            ifsc: request.payout_details.ifsc_code,
            account_number: request.payout_details.account_number
          };
        }
        
        const fundAccount = await razorpay.fundAccount.create(fundAccountPayload);
        const amountInPaise = Math.round(request.amount * 100);

        const payout = await razorpay.payouts.create({
          account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER, 
          fund_account_id: fundAccount.id,
          amount: amountInPaise, 
          currency: "INR",
          mode: request.payout_method === 'upi' ? "UPI" : "IMPS",
          purpose: "payout",
          queue_if_low_balance: true,
          reference_id: request._id.toString(),
          notes: {
            platform: "Flasho",
            payout_type: request.entity_type
          }
        });

        console.log(`[RAZORPAY] Payout Executed & SMS Triggered! ID: ${payout.id}`);

        // 🟢 3. SEND IN-APP PUSH NOTIFICATION
        if (request.entity_type === 'worker') {
          await NotificationService.sendToUser(
            request.entity_id,
            "Bank Transfer Successful! 🏦",
            `₹${request.amount.toFixed(2)} has been successfully transferred to your bank account.`,
            { type: 'withdrawal_success' }
          );
        } else if (request.entity_type === 'agency') {
          const owner = await User.findOne({ agency_id: request.entity_id });
          if (owner) {
            await NotificationService.sendToUser(
              owner._id,
              "Agency Payout Successful! 🏦",
              `₹${request.amount.toFixed(2)} has been successfully transferred to your corporate bank account.`,
              { type: 'withdrawal_success' }
            );
          }
        }

      } catch (payoutErr) {
        console.error("[RAZORPAY ERROR]", payoutErr);
        return res.status(400).json({ error: "Razorpay Failed: " + (payoutErr.error?.description || payoutErr.message || "Unknown API error") });
      }
    }

    if (status === 'rejected' && request.status !== 'rejected') {
      if (request.entity_type === 'worker') {
        const worker = await User.findById(request.entity_id);
        if (worker) { 
          worker.wallet_balance = Number((worker.wallet_balance + request.amount).toFixed(2)); 
          await worker.save(); 
          await NotificationService.sendToUser(worker._id, "Withdrawal Failed ❌", `Your ₹${request.amount.toFixed(2)} withdrawal was rejected. The funds have been safely returned to your app wallet.`, { type: 'withdrawal_failed' });
        }
      } else {
        const agency = await Agency.findById(request.entity_id);
        if (agency) { 
          agency.wallet_balance = Number((agency.wallet_balance + request.amount).toFixed(2)); 
          await agency.save(); 
          const owner = await User.findOne({ agency_id: request.entity_id });
          if (owner) await NotificationService.sendToUser(owner._id, "Withdrawal Failed ❌", `Your agency's ₹${request.amount.toFixed(2)} withdrawal was rejected. Funds returned to your agency wallet.`, { type: 'withdrawal_failed' });
        }
      }
    }
    
    request.status = status;
    await request.save();
    
    res.status(200).json({ message: `Request marked as ${status}.` });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
});

router.get('/admin/reviews', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find().populate('client_id', 'full_name email').populate('worker_id', 'full_name phone agency_id').populate('booking_id', 'service_title').sort({ _id: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/agency/reviews', authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({ auth_id: req.authId });
    if (!user || !user.agency_id) return res.status(403).json({error: "Not an agency"});
    const workers = await User.find({ agency_id: user.agency_id }).select('_id');
    const workerIds = workers.map(w => w._id);
    const reviews = await Review.find({ worker_id: { $in: workerIds } }).populate('client_id', 'full_name').populate('worker_id', 'full_name phone').populate('booking_id', 'service_title').sort({ _id: -1 });
    res.json(reviews);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// ==========================================
// 🟢 ACCOUNT DELETION (Play Store Compliance)
// ==========================================
const accountDeletionController = require('../controllers/accountDeletionController');
router.post('/account-deletion-request', accountDeletionController.submitDeletionRequest);
router.get('/account-deletion-requests', accountDeletionController.getAllRequests);
router.post('/account-deletion-requests/:id/approve', accountDeletionController.approveAndProcessDeletion);
router.post('/account-deletion-requests/:id/reject', accountDeletionController.rejectRequest);
router.delete('/account-deletion-requests/:id', accountDeletionController.deleteRequestRecord);

module.exports = router;