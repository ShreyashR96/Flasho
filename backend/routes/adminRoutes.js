const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js'); // 🟢 ADDED FOR AUTH
const authMiddleware = require('../middleware/auth');
const Service = require('../models/Service');
const User = require('../models/User');       
const Booking = require('../models/Booking'); 
const Agency = require('../models/Agency');
const Franchise = require('../models/Franchise'); // 🟢 ADDED FOR FRANCHISE

// 🟢 INITIALIZE SUPABASE ADMIN
// This allows the backend to create users without requiring a user to log in
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY
);

// ==========================================
// GET: Dashboard Statistics
// ==========================================
router.get('/stats', async (req, res) => {
  try {
    const [totalClients, totalWorkers, totalServices, totalBookings] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      User.countDocuments({ role: 'worker' }),
      Service.countDocuments(),
      Booking.countDocuments()
    ]);

    const revenueAggregation = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: "$price" } } }
    ]);
    const totalRevenue = revenueAggregation.length > 0 ? revenueAggregation[0].total : 0;

    res.status(200).json({ totalClients, totalWorkers, totalServices, totalBookings, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// ==========================================
// 🟢 NEW: USER MANAGEMENT (CLIENTS)
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'client' }).sort({ created_at: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// ==========================================
// 🟢 NEW: WORKER MANAGEMENT (ALL WORKERS)
// ==========================================
router.get('/workers', async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' })
      .populate('agency_id', 'name')
      .sort({ created_at: -1 });
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch workers" });
  }
});

// ==========================================
// WORKER VERIFICATION (PENDING ONLY)
// ==========================================
// Route to get pending verifications
router.get('/workers/pending', authMiddleware, async (req, res) => {
  try {
    console.log("📡 Admin requested pending workers..."); // 🟢 Add this

    const pendingWorkers = await User.find({ 
      role: 'worker', 
      verification_status: 'pending' 
    })
    .populate('agency_id', 'name')
    .sort({ created_at: -1 });
      
    console.log(`✅ Found ${pendingWorkers.length} pending workers!`); // 🟢 Add this
    
    res.status(200).json(pendingWorkers);
  } catch (error) {
    console.error("🔥 Error fetching workers:", error.message); // 🟢 Add this
    res.status(500).json({ error: error.message });
  }
});

// Route to get ALL workers
router.get('/workers', authMiddleware, async (req, res) => {
  try {
    // 🟢 ADD POPULATE HERE TOO
    const workers = await User.find({ role: 'worker' })
      .populate('agency_id', 'name')
      .sort({ created_at: -1 });
      
    res.status(200).json(workers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/workers/:id/verify', async (req, res) => {
  try {
    const { status } = req.body; 
    if (!['approved', 'rejected'].includes(status)) return res.status(400).json({ error: "Invalid status" });

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id, { $set: { verification_status: status, is_verified: status === 'approved' } }, { new: true }
    );
    if (!updatedUser) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: `User ${status} successfully`, user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
});

// ==========================================
// SERVICES MANAGEMENT
// ==========================================
router.get('/services', async (req, res) => {
  try {
    const services = await Service.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services" });
  }
});

router.post('/services', async (req, res) => {
  try {
    const newService = new Service(req.body);
    const savedService = await newService.save();
    res.status(201).json(savedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to create service", details: error.message });
  }
});

router.put('/services/:id', async (req, res) => {
  try {
    const updatedService = await Service.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!updatedService) return res.status(404).json({ error: "Service not found" });
    res.status(200).json(updatedService);
  } catch (error) {
    res.status(500).json({ error: "Failed to update service", details: error.message });
  }
});

router.delete('/services/:id', async (req, res) => {
  try {
    await Service.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete service" });
  }
});

// ==========================================
// AGENCIES MANAGEMENT
// ==========================================

// 🟢 NEW: GET ALL AGENCIES (Required for Flutter Mobile App Dropdown)
router.get('/agencies', async (req, res) => {
  try {
    // Only fetching _id and name to keep the mobile app response fast
    const agencies = await Agency.find({}, '_id name').sort({ name: 1 });
    res.status(200).json(agencies);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch agencies for mobile app" });
  }
});

router.post('/agencies', async (req, res) => {
  try {
    const newAgency = new Agency(req.body);
    await newAgency.save();
    res.status(201).json(newAgency);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/agencies/stats', async (req, res) => {
  try {
    const stats = await Agency.aggregate([
      { $lookup: { from: 'users', localField: '_id', foreignField: 'agency_id', as: 'workers' } },
      { $lookup: { from: 'bookings', localField: 'workers._id', foreignField: 'worker_id', as: 'jobs' } },
      {
        $project: {
          name: 1, contact_person: 1, phone: 1, address: 1,
          total_workers: { $size: "$workers" },
          total_jobs_completed: { $size: { $filter: { input: "$jobs", as: "job", cond: { $eq: ["$$job.status", "completed"] } } } },
          total_earnings: {
            $sum: {
              $map: {
                input: { $filter: { input: "$jobs", as: "job", cond: { $eq: ["$$job.status", "completed"] } } },
                as: "completedJob", in: "$$completedJob.price"
              }
            }
          }
        }
      }
    ]);
    res.status(200).json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/agencies/:id', async (req, res) => {
  try {
    const updatedAgency = await Agency.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!updatedAgency) return res.status(404).json({ error: "Agency not found" });
    res.status(200).json(updatedAgency);
  } catch (error) {
    res.status(500).json({ error: "Failed to update agency" });
  }
});

router.delete('/agencies/:id', async (req, res) => {
  try {
    await Agency.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Agency deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete agency" });
  }
});

// ==========================================
// 🟢 NEW: CREATE FRANCHISE LOGIN CREDENTIALS
// ==========================================
router.post('/agencies/:id/credentials', async (req, res) => {
  try {
    const { email, password } = req.body;
    const agencyId = req.params.id;

    // 1. Find the existing Agency
    const agency = await Agency.findById(agencyId);
    if (!agency) return res.status(404).json({ error: "Agency not found" });

    // 2. Create Auth User in Supabase directly
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true // Auto-verifies the email so they can log in immediately
    });

    if (authError) return res.status(400).json({ error: authError.message });

    // 3. Create the Franchise Owner User in MongoDB
    const franchiseOwner = new User({
      auth_id: authData.user.id,
      email: email,
      full_name: agency.contact_person || agency.name,
      phone: agency.phone,
      role: 'franchise_owner',
      agency_id: agency._id // Link back to the original agency
    });
    await franchiseOwner.save();

    // 4. Create the Franchise Record
    const newFranchise = new Franchise({
      name: agency.name,
      location_address: agency.address || 'Not Provided',
      owner_id: franchiseOwner._id,
      status: 'active'
    });
    await newFranchise.save();

    // 5. Link the Franchise ID back to the Owner
    franchiseOwner.franchise_id = newFranchise._id;
    await franchiseOwner.save();

    // 🟢 6. CRITICAL FIX: Automatically link all existing workers of this agency to the new Franchise
    await User.updateMany(
      { agency_id: agency._id, role: 'worker' },
      { $set: { franchise_id: newFranchise._id } }
    );

    res.status(201).json({ 
      message: "Franchise credentials created successfully!", 
      email: email 
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// ==========================================
// 🟢 ACCOUNT DELETION MANAGEMENT
// ==========================================
const accountDeletionController = require('../controllers/accountDeletionController');
router.get('/delete-account-requests', accountDeletionController.getAllRequests);
router.post('/delete-account-requests/:id/approve', accountDeletionController.approveAndProcessDeletion);
router.post('/delete-account-requests/:id/reject', accountDeletionController.rejectRequest);
router.delete('/delete-account-requests/:id', accountDeletionController.deleteRequestRecord);

module.exports = router;