const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

// Helper to generate custom 7-char alphanumeric ID
const generateCustomId = () => Math.random().toString(36).substring(2, 9);

// ─────────────────────────────────────────────────────────────
// SCHEMAS FOR SUPER ADMIN EXTENSIONS
// ─────────────────────────────────────────────────────────────

// Admin Audit Log Schema
const adminAuditLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    adminId: { type: String, default: "super_admin" },
    adminName: { type: String, default: "Super Administrator" },
    action: { type: String, required: true },
    module: { type: String, required: true },
    details: { type: String, required: true },
    targetId: { type: String, default: "" },
    targetName: { type: String, default: "" },
    previousValues: { type: Object, default: null },
    updatedValues: { type: Object, default: null },
    ipAddress: { type: String, default: "127.0.0.1" },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

const AdminAuditLog = mongoose.models.AdminAuditLog || mongoose.model("AdminAuditLog", adminAuditLogSchema);

// Stock Transaction History Schema
const stockTransactionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    date: { type: String, default: () => new Date().toISOString().split("T")[0] },
    bloodGroup: { type: String, required: true },
    component: { type: String, default: "Whole Blood" },
    units: { type: Number, required: true },
    type: { type: String, enum: ["Received", "Issued", "Expired", "Adjusted"], required: true },
    batchId: { type: String, default: () => "BATCH-" + Math.floor(100000 + Math.random() * 900000) },
    expiryDate: { type: String, default: "" },
    hospital: { type: String, default: "Central Blood Bank Hub" },
    reason: { type: String, default: "Routine stock update" },
    performedBy: { type: String, default: "Super Administrator" }
  },
  { timestamps: true }
);

const StockTransaction = mongoose.models.StockTransaction || mongoose.model("StockTransaction", stockTransactionSchema);

// Helper function to log audit activities
const logAudit = async (req, action, module, details, targetId = "", targetName = "", prev = null, next = null) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "127.0.0.1";
    const adminName = req.headers["x-admin-name"] || "Super Administrator";
    const adminId = req.headers["x-admin-id"] || "super_admin";

    if (mongoose.connection.readyState === 1) {
      await AdminAuditLog.create({
        adminId,
        adminName,
        action,
        module,
        details,
        targetId,
        targetName,
        previousValues: prev,
        updatedValues: next,
        ipAddress: Array.isArray(ip) ? ip[0] : ip,
        timestamp: new Date()
      });
    }

    // Also persist in auditLogs.json for fallback durability
    const auditFile = path.join(__dirname, "auditLogs.json");
    let logs = [];
    if (fs.existsSync(auditFile)) {
      try {
        logs = JSON.parse(fs.readFileSync(auditFile, "utf8"));
      } catch (e) { logs = []; }
    }
    logs.unshift({
      _id: generateCustomId(),
      adminId,
      adminName,
      action,
      module,
      details,
      targetId,
      targetName,
      previousValues: prev,
      updatedValues: next,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      timestamp: new Date().toISOString()
    });
    if (logs.length > 500) logs = logs.slice(0, 500);
    fs.writeFileSync(auditFile, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.warn("Audit logging warning:", err.message);
  }
};

// Settings & Data Persistence Helpers
const SETTINGS_FILE = path.join(__dirname, "systemSettings.json");
const PATIENTS_FILE = path.join(__dirname, "patients.json");
const DEFAULT_SETTINGS = {
  general: {
    websiteName: "HemoCare Healthcare & Blood Bank Management System",
    logoText: "HemoCare",
    description: "Enterprise Hospital Resource, Live Blood Bank Inventory & Donor Network",
    contactEmail: "admin@hemocare.org",
    contactPhone: "+91 1800-HEMOCARE (436-6227)",
    address: "National Health Grid, Ansari Nagar, New Delhi 110029",
    maintenanceMode: false
  },
  user: {
    registrationOpen: true,
    autoVerifyDonors: false,
    defaultRole: "donor",
    maxFailedLogins: 5
  },
  security: {
    sessionTimeoutMinutes: 60,
    requireStrongPassword: true,
    twoFactorAuth: true,
    protectLastAdmin: true
  },
  notifications: {
    emailAlerts: true,
    smsEmergencyAlerts: true,
    lowStockThreshold: 15,
    expiryWarningDays: 7
  },
  rolesPermissions: {
    super_admin: { view: true, add: true, edit: true, delete: true, approve: true, export: true, manage: true },
    administrator: { view: true, add: true, edit: true, delete: true, approve: true, export: true, manage: true },
    hospital_staff: { view: true, add: true, edit: true, delete: false, approve: true, export: true, manage: false },
    blood_bank_staff: { view: true, add: true, edit: true, delete: false, approve: true, export: true, manage: true },
    doctor: { view: true, add: false, edit: true, delete: false, approve: true, export: true, manage: false },
    patient: { view: true, add: true, edit: false, delete: false, approve: false, export: true, manage: false },
    donor: { view: true, add: true, edit: false, delete: false, approve: false, export: true, manage: false }
  }
};

const getSettings = () => {
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, "utf8"));
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), "utf8");
  return DEFAULT_SETTINGS;
};

const saveSettings = (newSettings) => {
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(newSettings, null, 2), "utf8");
  return newSettings;
};

// ─────────────────────────────────────────────────────────────
// 1. DASHBOARD & ANALYTICS API
// ─────────────────────────────────────────────────────────────
// Build a MongoDB date-range match for `createdAt` based on query params.
// range: today | 7d | 30d | year | all ; optional from/to ISO dates for custom range.
const buildDateMatch = (req) => {
  const { range = "all", from, to } = req.query;
  const now = new Date();
  let start = null;
  let end = null;

  if (range === "today") {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  } else if (range === "7d") {
    start = new Date(now.getTime() - 7 * 86400000);
  } else if (range === "30d") {
    start = new Date(now.getTime() - 30 * 86400000);
  } else if (range === "year") {
    start = new Date(now.getFullYear(), 0, 1);
  } else if (range === "custom") {
    if (from) start = new Date(from);
    if (to) {
      end = new Date(to);
      end.setHours(23, 59, 59, 999);
    }
  }

  if (!start && !end) return null;
  const match = {};
  if (start) match.$gte = start;
  if (end) match.$lte = end;
  return { createdAt: match };
};

// Shared pagination helper: slices an in-memory array and returns pagination meta.
const paginateResults = (items, req, defaultLimit = 500) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit) || defaultLimit));
  const start = (page - 1) * limit;
  return {
    items: items.slice(start, start + limit),
    pagination: {
      currentPage: page,
      totalPages: Math.max(1, Math.ceil(items.length / limit)),
      totalRecords: items.length,
      limit
    }
  };
};

router.get("/api/admin/dashboard", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const dateMatch = buildDateMatch(req);

  try {
    const Patient = mongoose.models.Patient;
    const Donor = mongoose.models.Donor;
    const Doctors = mongoose.models.Doctors;
    const BloodBank = mongoose.models.BloodBank;
    const HospitalStaff = mongoose.models.HospitalStaff;
    const BloodBankStaff = mongoose.models.BloodBankStaff;
    const BloodRequest = mongoose.models.BloodRequest;
    const BloodInventory = mongoose.models.BloodInventory;
    const Appointment = mongoose.models.Appointment;
    const UserProfile = mongoose.models.UserProfile;

    let patientCount = 0;
    let doctorCount = 0;
    let donorCount = 0;
    let hospitalCount = 0;
    let bloodBankCount = 0;
    let hospitalStaffCount = 0;
    let bloodBankStaffCount = 0;
    let totalBloodRequests = 0;
    let pendingRequests = 0;
    let approvedRequests = 0;
    let completedRequests = 0;
    let totalAppointments = 0;
    let pendingAppointments = 0;
    let totalBloodUnits = 0;

    let bloodInventorySummary = {};
    let lowStockAlerts = [];
    let expiringAlerts = [];
    let recentRequests = [];
    let recentActivities = [];
    let monthlyDonations = [];
    let registrationTrends = [];

    if (isDbConnected) {
      if (Patient) patientCount = await Patient.countDocuments({ isDeleted: { $ne: true }, ...(dateMatch || {}) });
      if (Donor) donorCount = await Donor.countDocuments({ isDeleted: { $ne: true }, ...(dateMatch || {}) });
      if (Doctors) doctorCount = await Doctors.countDocuments({ isDeleted: { $ne: true }, ...(dateMatch || {}) });
      if (BloodBank) bloodBankCount = await BloodBank.countDocuments({ isDeleted: { $ne: true }, ...(dateMatch || {}) });
      if (HospitalStaff) hospitalStaffCount = await HospitalStaff.countDocuments({ isDeleted: { $ne: true }, ...(dateMatch || {}) });
      if (BloodBankStaff) bloodBankStaffCount = await BloodBankStaff.countDocuments({ isDeleted: { $ne: true }, ...(dateMatch || {}) });
      hospitalCount = bloodBankCount || 0;

      if (BloodRequest) {
        totalBloodRequests = await BloodRequest.countDocuments(dateMatch || {});
        pendingRequests = await BloodRequest.countDocuments({ ...(dateMatch || {}), status: { $regex: /pending|under verification/i } });
        approvedRequests = await BloodRequest.countDocuments({ ...(dateMatch || {}), status: { $regex: /approved|forwarded|blood ready|dispatched/i } });
        completedRequests = await BloodRequest.countDocuments({ ...(dateMatch || {}), status: { $regex: /completed/i } });

        recentRequests = await BloodRequest.find({})
          .sort({ createdAt: -1 })
          .limit(8)
          .lean();
      }

      if (Appointment) {
        totalAppointments = await Appointment.countDocuments(dateMatch || {});
        pendingAppointments = await Appointment.countDocuments({ ...(dateMatch || {}), status: { $regex: /pending|scheduled|upcoming/i } });
      }
      if (PatientAppointment && mongoose.models.PatientAppointment) {
        const paTotal = await PatientAppointment.countDocuments(dateMatch || {});
        const paPending = await PatientAppointment.countDocuments({ ...(dateMatch || {}), status: { $regex: /pending|approved/i } });
        totalAppointments += paTotal;
        pendingAppointments += paPending;
      }

      if (BloodInventory) {
        const invSummary = await BloodInventory.aggregate([
          { $group: { _id: "$bloodGroup", totalUnits: { $sum: "$units" } } }
        ]);
        invSummary.forEach(item => {
          if (item._id) {
            bloodInventorySummary[item._id] = item.totalUnits;
            totalBloodUnits += item.totalUnits;
          }
        });

        // Real expiring-batch alerts (next 7 days)
        const soon = new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0];
        const todayStr = new Date().toISOString().split("T")[0];
        const expiring = await BloodInventory.find({ "batches.expiryDate": { $gte: todayStr, $lte: soon } }).lean();
        expiring.forEach(inv => {
          (inv.batches || []).forEach(b => {
            if (b.expiryDate >= todayStr && b.expiryDate <= soon && b.status !== "expired") {
              expiringAlerts.push({
                batchId: b.batchId,
                bloodGroup: inv.bloodGroup,
                units: b.units,
                hospital: inv.hospital,
                expiryDate: b.expiryDate,
                daysLeft: Math.ceil((new Date(b.expiryDate) - new Date(todayStr)) / 86400000)
              });
            }
          });
        });
      }

      // Real monthly donation totals (last 6 months) from DonationHistory
      if (mongoose.models.DonationHistory) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        const donationAgg = await mongoose.models.DonationHistory.aggregate([
          { $match: { createdAt: { $gte: sixMonthsAgo } } },
          {
            $group: {
              _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
              donations: { $sum: 1 },
              units: { $sum: "$unitsCollected" }
            }
          },
          { $sort: { _id: 1 } }
        ]);
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const byMonth = {};
        donationAgg.forEach(d => { byMonth[d._id] = d; });
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          const rec = byMonth[key] || { donations: 0, units: 0 };
          monthlyDonations.push({ month: monthNames[d.getMonth()], donations: rec.donations, units: rec.units });
        }
      }

      // Real registration trends (last 6 months) across role collections
      {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
        sixMonthsAgo.setDate(1);
        const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        const trendMap = {};
        for (let i = 5; i >= 0; i--) {
          const d = new Date();
          d.setMonth(d.getMonth() - i);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
          trendMap[key] = { month: monthNames[d.getMonth()], patients: 0, donors: 0, staff: 0 };
        }
        const trendSources = [
          { model: Patient, key: "patients" },
          { model: Donor, key: "donors" },
          { model: HospitalStaff, key: "staff" },
          { model: BloodBankStaff, key: "staff" }
        ];
        for (const src of trendSources) {
          if (!src.model) continue;
          const agg = await src.model.aggregate([
            { $match: { createdAt: { $gte: sixMonthsAgo } } },
            { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } }
          ]);
          agg.forEach(a => {
            if (trendMap[a._id]) trendMap[a._id][src.key] += a.count;
          });
        }
        registrationTrends = Object.keys(trendMap).sort().map(k => trendMap[k]);
      }
    } else {
      // Fallback counts from mock files
      const mockDbFile = path.join(__dirname, "mockDb.json");
      if (fs.existsSync(mockDbFile)) {
        try {
          const users = JSON.parse(fs.readFileSync(mockDbFile, "utf8"));
          patientCount = users.filter(u => u.role === "patient").length || 32;
          donorCount = users.filter(u => u.role === "donor").length || 24;
          hospitalStaffCount = users.filter(u => u.role === "hospital_staff").length || 8;
          bloodBankStaffCount = users.filter(u => u.role === "blood_bank_staff").length || 10;
        } catch (e) {}
      } else {
        patientCount = 38;
        donorCount = 29;
        hospitalStaffCount = 12;
        bloodBankStaffCount = 14;
      }
      doctorCount = 26;
      bloodBankCount = 42;
      hospitalCount = 54;
      totalBloodRequests = 86;
      pendingRequests = 14;
      approvedRequests = 32;
      completedRequests = 40;
      totalAppointments = 115;
      pendingAppointments = 22;
      bloodInventorySummary = { "A+": 185, "A-": 42, "B+": 210, "B-": 35, "AB+": 98, "AB-": 24, "O+": 340, "O-": 48 };
      totalBloodUnits = Object.values(bloodInventorySummary).reduce((a, b) => a + b, 0);
      expiringAlerts = [
        { batchId: "BATCH-89104", bloodGroup: "O-", units: 4, hospital: "AIIMS Blood Bank", expiryDate: new Date(Date.now() + 3*86400000).toISOString().split("T")[0], daysLeft: 3 },
        { batchId: "BATCH-44122", bloodGroup: "AB-", units: 2, hospital: "Apollo Hospital Blood Bank", expiryDate: new Date(Date.now() + 5*86400000).toISOString().split("T")[0], daysLeft: 5 }
      ];
      monthlyDonations = [
        { month: "Jan", donations: 310, units: 310 },
        { month: "Feb", donations: 280, units: 280 },
        { month: "Mar", donations: 390, units: 390 },
        { month: "Apr", donations: 420, units: 420 },
        { month: "May", donations: 480, units: 480 },
        { month: "Jun", donations: 510, units: 510 },
        { month: "Jul", donations: 460, units: 460 }
      ];
      registrationTrends = [
        { month: "Feb", patients: 12, donors: 18, staff: 4 },
        { month: "Mar", patients: 24, donors: 28, staff: 6 },
        { month: "Apr", patients: 32, donors: 35, staff: 8 },
        { month: "May", patients: 45, donors: 52, staff: 10 },
        { month: "Jun", patients: 58, donors: 64, staff: 12 },
        { month: "Jul", patients: 42, donors: 48, staff: 7 }
      ];
    }

    if (totalBloodUnits === 0) {
      totalBloodUnits = Object.values(bloodInventorySummary).reduce((a, b) => a + b, 0);
    }

    // Build low stock alerts
    const settings = getSettings();
    const threshold = settings.notifications?.lowStockThreshold || 15;
    Object.entries(bloodInventorySummary).forEach(([group, units]) => {
      if (units <= threshold) {
        lowStockAlerts.push({
          group,
          units,
          threshold,
          status: units <= 5 ? "Critical" : "Low Stock",
          urgency: units <= 5 ? "urgent" : "warning"
        });
      }
    });

    // Recent activities from audit logs or requests
    const auditFile = path.join(__dirname, "auditLogs.json");
    if (fs.existsSync(auditFile)) {
      try {
        const storedLogs = JSON.parse(fs.readFileSync(auditFile, "utf8"));
        recentActivities = storedLogs.slice(0, 10);
      } catch (e) {}
    }

    res.status(200).json({
      success: true,
      range: req.query.range || "all",
      counts: {
        totalPatients: patientCount,
        totalDoctors: doctorCount,
        totalDonors: donorCount,
        totalHospitals: hospitalCount,
        totalBloodBanks: bloodBankCount,
        totalHospitalStaff: hospitalStaffCount,
        totalBloodBankStaff: bloodBankStaffCount,
        totalBloodRequests: totalBloodRequests,
        pendingRequests: pendingRequests,
        approvedRequests: approvedRequests,
        completedRequests: completedRequests,
        totalAppointments: totalAppointments,
        pendingAppointments: pendingAppointments,
        totalBloodUnitsAvailable: totalBloodUnits
      },
      bloodInventorySummary,
      lowStockAlerts,
      expiringAlerts,
      recentRequests,
      recentActivities,
      monthlyDonations,
      registrationTrends
    });
  } catch (err) {
    console.error("Super Admin Dashboard Error:", err);
    res.status(500).json({ success: false, message: "Error compiling admin dashboard data.", error: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 2. CENTRALIZED USERS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/all-users", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { role, status, search, page = 1, limit = 50 } = req.query;

  try {
    let allUsers = [];

    if (isDbConnected) {
      const Patient = mongoose.models.Patient;
      const Donor = mongoose.models.Donor;
      const HospitalStaff = mongoose.models.HospitalStaff;
      const BloodBankStaff = mongoose.models.BloodBankStaff;
      const UserProfile = mongoose.models.UserProfile;

      const [patients, donors, hStaff, bbStaff, profiles] = await Promise.all([
        Patient ? Patient.find({}).lean() : [],
        Donor ? Donor.find({}).lean() : [],
        HospitalStaff ? HospitalStaff.find({}).lean() : [],
        BloodBankStaff ? BloodBankStaff.find({}).lean() : [],
        UserProfile ? UserProfile.find({}).lean() : []
      ]);

      patients.forEach(p => allUsers.push({
        _id: p._id,
        clerkId: p.clerkId,
        fullName: p.profile?.fullName || p.name || "Patient " + p._id.substring(0,4),
        email: p.email || "patient@hemocare.org",
        phone: p.profile?.phone || "N/A",
        role: "patient",
        bloodGroup: p.profile?.bloodGroup || "O+",
        status: p.status || (p.isDeleted ? "Deleted" : "Active"),
        isDeleted: p.isDeleted || false,
        createdAt: p.createdAt || new Date().toISOString()
      }));

      donors.forEach(d => allUsers.push({
        _id: d._id,
        clerkId: d.clerkId,
        fullName: d.profile?.fullName || `${d.profile?.firstName||""} ${d.profile?.lastName||""}`.trim() || "Donor " + d._id.substring(0,4),
        email: d.email || "donor@hemocare.org",
        phone: d.profile?.phone || "N/A",
        role: "donor",
        bloodGroup: d.profile?.bloodGroup || "A+",
        status: d.status || (d.isDeleted ? "Deleted" : "Active"),
        isDeleted: d.isDeleted || false,
        createdAt: d.createdAt || new Date().toISOString()
      }));

      hStaff.forEach(hs => allUsers.push({
        _id: hs._id,
        clerkId: hs.clerkId,
        fullName: hs.profile?.fullName || "Hospital Staff " + hs._id.substring(0,4),
        email: hs.email || "hospital.staff@hemocare.org",
        phone: hs.profile?.phone || "N/A",
        hospitalName: hs.profile?.hospitalName || "Partner Hospital",
        role: "hospital_staff",
        status: hs.status || (hs.isDeleted ? "Deleted" : "Active"),
        isDeleted: hs.isDeleted || false,
        createdAt: hs.createdAt || new Date().toISOString()
      }));

      bbStaff.forEach(bs => allUsers.push({
        _id: bs._id,
        clerkId: bs.clerkId,
        fullName: bs.profile?.fullName || "Blood Bank Staff " + bs._id.substring(0,4),
        email: bs.email || "bloodbank.staff@hemocare.org",
        phone: bs.profile?.phone || "N/A",
        hospitalName: bs.profile?.hospitalName || "City Blood Bank",
        role: "blood_bank_staff",
        status: bs.status || (bs.isDeleted ? "Deleted" : "Active"),
        isDeleted: bs.isDeleted || false,
        createdAt: bs.createdAt || new Date().toISOString()
      }));

      profiles.forEach(prof => {
        if (!allUsers.some(u => u.clerkId === prof.clerkId)) {
          allUsers.push({
            _id: prof._id,
            clerkId: prof.clerkId,
            fullName: prof.fullName || "User " + prof._id.substring(0,4),
            email: prof.email,
            phone: "N/A",
            role: prof.role || "administrator",
            status: prof.status || (prof.isDeleted ? "Deleted" : "Active"),
            isDeleted: prof.isDeleted || false,
            createdAt: prof.createdAt || new Date().toISOString()
          });
        }
      });
    }

    // Merge or fallback to mockDb.json
    if (allUsers.length === 0) {
      const mockDbFile = path.join(__dirname, "mockDb.json");
      if (fs.existsSync(mockDbFile)) {
        try {
          const raw = JSON.parse(fs.readFileSync(mockDbFile, "utf8"));
          allUsers = raw.map(u => ({
            _id: u._id || generateCustomId(),
            clerkId: u.clerkId || "clerk_" + generateCustomId(),
            fullName: u.fullName || u.name || "System User",
            email: u.email || "user@hemocare.org",
            phone: u.phone || "+91 98765 43210",
            role: u.role || "donor",
            status: u.status || "Active",
            isDeleted: u.isDeleted || false,
            createdAt: u.createdAt || new Date().toISOString()
          }));
        } catch (e) {}
      }
    }

    // Filters
    let filtered = [...allUsers];
    if (role && role !== "all") {
      filtered = filtered.filter(u => u.role === role);
    }
    if (status && status !== "all") {
      filtered = filtered.filter(u => u.status?.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      filtered = filtered.filter(u =>
        u.fullName?.toLowerCase().includes(s) ||
        u.email?.toLowerCase().includes(s) ||
        u.phone?.toLowerCase().includes(s) ||
        u._id?.toLowerCase().includes(s)
      );
    }

    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const paginated = filtered.slice(startIndex, startIndex + parseInt(limit));

    res.status(200).json({
      success: true,
      users: paginated,
      data: paginated,
      totalCount: filtered.length,
      page: parseInt(page),
      totalPages: Math.ceil(filtered.length / parseInt(limit)),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filtered.length / parseInt(limit)),
        totalRecords: filtered.length,
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Error fetching all users:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create User (Super Admin)
router.post("/api/admin/users/create", async (req, res) => {
  try {
    const { fullName, email, phone, role, bloodGroup, hospitalName, password } = req.body;
    if (!fullName || !email || !role) {
      return res.status(400).json({ success: false, message: "Full Name, Email and Role are required." });
    }

    const newId = generateCustomId();
    const clerkId = "admin_created_" + newId;
    const isDbConnected = mongoose.connection.readyState === 1;

    let createdRecord = {
      _id: newId,
      clerkId,
      fullName,
      email,
      phone: phone || "",
      role,
      status: "Active",
      createdAt: new Date().toISOString()
    };

    if (isDbConnected) {
      const UserProfile = mongoose.models.UserProfile;
      if (UserProfile) {
        await UserProfile.create({
          _id: newId,
          clerkId,
          fullName,
          email,
          role,
          isVerified: true
        });
      }

      if (role === "patient") {
        const Patient = mongoose.models.Patient;
        if (Patient) {
          await Patient.create({
            _id: newId,
            clerkId,
            email,
            profile: { fullName, phone: phone || "", bloodGroup: bloodGroup || "O+" },
            bloodRequests: [],
            appointments: []
          });
        }
      } else if (role === "donor") {
        const Donor = mongoose.models.Donor;
        if (Donor) {
          await Donor.create({
            _id: newId,
            clerkId,
            email,
            profile: { fullName, phone: phone || "", bloodGroup: bloodGroup || "O+" }
          });
        }
      } else if (role === "hospital_staff") {
        const HospitalStaff = mongoose.models.HospitalStaff;
        if (HospitalStaff) {
          await HospitalStaff.create({
            _id: newId,
            clerkId,
            email,
            profile: { fullName, phone: phone || "", hospitalName: hospitalName || "Apollo Hospital" }
          });
        }
      } else if (role === "blood_bank_staff") {
        const BloodBankStaff = mongoose.models.BloodBankStaff;
        if (BloodBankStaff) {
          await BloodBankStaff.create({
            _id: newId,
            clerkId,
            email,
            profile: { fullName, phone: phone || "", hospital: hospitalName || "Central Blood Bank" }
          });
        }
      }
    }

    // Persist in mockDb.json
    const mockDbFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockDbFile)) {
      try {
        const list = JSON.parse(fs.readFileSync(mockDbFile, "utf8"));
        list.unshift(createdRecord);
        fs.writeFileSync(mockDbFile, JSON.stringify(list, null, 2), "utf8");
      } catch (e) {}
    }

    await logAudit(req, "USER_CREATED", "User Management", `Created ${role} account for ${fullName} (${email})`, newId, fullName, null, createdRecord);

    res.status(201).json({ success: true, message: "User account created successfully.", user: createdRecord });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update User (Super Admin)
router.put("/api/admin/users/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone, role, status, bloodGroup } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    if (isDbConnected) {
      const UserProfile = mongoose.models.UserProfile;
      const Patient = mongoose.models.Patient;
      const Donor = mongoose.models.Donor;
      const HospitalStaff = mongoose.models.HospitalStaff;
      const BloodBankStaff = mongoose.models.BloodBankStaff;

      if (UserProfile) await UserProfile.findByIdAndUpdate(id, { fullName, email, role, status });
      if (Patient) await Patient.findByIdAndUpdate(id, { "profile.fullName": fullName, "profile.phone": phone, "profile.bloodGroup": bloodGroup, email, status });
      if (Donor) await Donor.findByIdAndUpdate(id, { "profile.fullName": fullName, "profile.phone": phone, "profile.bloodGroup": bloodGroup, email, status });
      if (HospitalStaff) await HospitalStaff.findByIdAndUpdate(id, { "profile.fullName": fullName, "profile.phone": phone, email, status });
      if (BloodBankStaff) await BloodBankStaff.findByIdAndUpdate(id, { "profile.fullName": fullName, "profile.phone": phone, email, status });
    }

    // Also update mockDb.json if present
    const mockDbFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockDbFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(mockDbFile, "utf8"));
        const idx = list.findIndex(u => u._id === id);
        if (idx !== -1) {
          list[idx] = { ...list[idx], fullName: fullName || list[idx].fullName, email: email || list[idx].email, role: role || list[idx].role, status: status || list[idx].status };
          fs.writeFileSync(mockDbFile, JSON.stringify(list, null, 2), "utf8");
        }
      } catch (e) {}
    }

    await logAudit(req, "USER_UPDATED", "User Management", `Updated user details for ${fullName}`, id, fullName, null, req.body);

    res.status(200).json({ success: true, message: "User updated successfully." });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Soft Delete / Suspend / Restore User
router.patch("/api/admin/users/:id/action", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // "deactivate", "suspend", "activate", "soft-delete", "restore"
    const isDbConnected = mongoose.connection.readyState === 1;

    let newStatus = "Active";
    let isDeleted = false;

    if (action === "suspend") newStatus = "Suspended";
    else if (action === "deactivate") newStatus = "Inactive";
    else if (action === "soft-delete") { newStatus = "Deleted"; isDeleted = true; }
    else if (action === "restore") { newStatus = "Active"; isDeleted = false; }
    else if (action === "activate") newStatus = "Active";

    if (isDbConnected) {
      const models = [
        mongoose.models.Patient,
        mongoose.models.Donor,
        mongoose.models.HospitalStaff,
        mongoose.models.BloodBankStaff,
        mongoose.models.UserProfile
      ];

      for (const model of models) {
        if (model) {
          await model.findByIdAndUpdate(id, { status: newStatus, isDeleted });
        }
      }
    }

    // Update mockDb.json
    const mockDbFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockDbFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(mockDbFile, "utf8"));
        const idx = list.findIndex(u => u._id === id);
        if (idx !== -1) {
          list[idx].status = newStatus;
          list[idx].isDeleted = isDeleted;
          fs.writeFileSync(mockDbFile, JSON.stringify(list, null, 2), "utf8");
        }
      } catch (e) {}
    }

    await logAudit(req, `USER_${action.toUpperCase()}`, "User Management", `Action ${action} executed for user ID ${id}. New status: ${newStatus}`, id, "", null, { status: newStatus, isDeleted });

    res.status(200).json({ success: true, message: `User status changed to ${newStatus}.`, newStatus, isDeleted });
  } catch (err) {
    console.error("User action error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 3. PATIENTS MANAGEMENT API (Full Database Integration)
// ─────────────────────────────────────────────────────────────

// Helper function to query and consolidate all patients from MongoDB & Mock Stores
const getAllDatabasePatients = async () => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const patientMap = new Map();

  // 1. Query MongoDB Patient collection
  if (isDbConnected && mongoose.models.Patient) {
    try {
      const docs = await mongoose.models.Patient.find({ isDeleted: { $ne: true } }).lean();
      for (const p of docs) {
        const key = p.clerkId || String(p._id);
        const name = p.profile?.fullName || p.name || p.fullName || ("Patient " + String(p._id).substring(0, 5));
        const age = p.profile?.dateOfBirth
          ? Math.max(1, new Date().getFullYear() - new Date(p.profile.dateOfBirth).getFullYear())
          : (p.age || 34);

        patientMap.set(key, {
          _id: p._id,
          clerkId: p.clerkId || "",
          fullName: name,
          email: p.email || p.profile?.email || "patient@hemocare.org",
          phone: p.profile?.phone || p.phone || "+91 98765 43210",
          bloodGroup: p.profile?.bloodGroup || p.bloodGroup || "A+",
          gender: p.profile?.gender || p.gender || "Male",
          age: age,
          dateOfBirth: p.profile?.dateOfBirth || "",
          address: p.profile?.address || p.address || "",
          city: p.profile?.city || p.city || "New Delhi",
          state: p.profile?.state || p.state || "Delhi",
          pincode: p.profile?.pincode || p.pincode || "",
          emergencyContact: p.profile?.emergencyContact || p.emergencyContact || "",
          emergencyPhone: p.profile?.emergencyPhone || p.emergencyPhone || "",
          hospitalName: p.hospitalName || (p.profile?.city ? `${p.profile.city} General Hospital` : "AIIMS New Delhi"),
          condition: p.condition || "Stable",
          status: p.status || "Active",
          bloodRequests: p.bloodRequests || [],
          bloodRequestsCount: (p.bloodRequests || []).length,
          appointments: p.appointments || [],
          appointmentsCount: (p.appointments || []).length,
          reports: p.reports || [],
          reportsCount: (p.reports || []).length,
          notifications: p.notifications || [],
          createdAt: p.createdAt || new Date().toISOString(),
          updatedAt: p.updatedAt || new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn("Error reading MongoDB Patient collection:", err.message);
    }
  }

  // 2. Query MongoDB UserProfile collection for role: 'patient'
  if (isDbConnected && mongoose.models.UserProfile) {
    try {
      const userProfiles = await mongoose.models.UserProfile.find({ role: "patient", isDeleted: { $ne: true } }).lean();
      for (const u of userProfiles) {
        const key = u.clerkId || String(u._id);
        if (patientMap.has(key)) {
          const existing = patientMap.get(key);
          if (!existing.fullName && u.fullName) existing.fullName = u.fullName;
          if (!existing.email && u.email) existing.email = u.email;
          if (!existing.phone && u.phone) existing.phone = u.phone;
        } else {
          patientMap.set(key, {
            _id: u._id,
            clerkId: u.clerkId || "",
            fullName: u.fullName || ("Patient " + String(u._id).substring(0, 5)),
            email: u.email || "patient@hemocare.org",
            phone: u.phone || "+91 98765 43210",
            bloodGroup: u.bloodGroup || "A+",
            gender: u.gender || "Male",
            age: u.age || 30,
            dateOfBirth: u.dateOfBirth || "",
            address: u.address || "",
            city: u.city || "Mumbai",
            state: u.state || "Maharashtra",
            pincode: u.pincode || "",
            emergencyContact: u.emergencyContact || "",
            emergencyPhone: u.emergencyPhone || "",
            hospitalName: u.hospitalName || "Apollo Hospital Delhi",
            condition: u.condition || "Stable",
            status: u.accountStatus || (u.isVerified !== false ? "Active" : "Pending"),
            bloodRequests: [],
            bloodRequestsCount: 0,
            appointments: [],
            appointmentsCount: 0,
            reports: [],
            reportsCount: 0,
            notifications: [],
            createdAt: u.createdAt || new Date().toISOString(),
            updatedAt: u.updatedAt || new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.warn("Error reading MongoDB UserProfile collection:", err.message);
    }
  }

  // 3. Query mockDb.json for registered patients
  try {
    const mockFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockFile)) {
      const mockUsers = JSON.parse(fs.readFileSync(mockFile, "utf8"));
      const mockPatients = mockUsers.filter(u => u.role === "patient");
      for (const mp of mockPatients) {
        const key = mp.clerkId || String(mp._id);
        if (patientMap.has(key)) {
          const existing = patientMap.get(key);
          if (!existing.fullName && mp.fullName) existing.fullName = mp.fullName;
          if (!existing.email && mp.email) existing.email = mp.email;
        } else {
          patientMap.set(key, {
            _id: mp._id,
            clerkId: mp.clerkId || "",
            fullName: mp.fullName || ("Patient " + String(mp._id).substring(0, 5)),
            email: mp.email || "patient@hemocare.org",
            phone: mp.phone || "+91 98123 45678",
            bloodGroup: mp.bloodGroup || "B+",
            gender: mp.gender || "Male",
            age: mp.age || 29,
            dateOfBirth: mp.dateOfBirth || "",
            address: mp.address || "",
            city: mp.city || "Ahmedabad",
            state: mp.state || "Gujarat",
            pincode: mp.pincode || "",
            emergencyContact: mp.emergencyContact || "",
            emergencyPhone: mp.emergencyPhone || "",
            hospitalName: mp.hospitalName || "Civil Hospital Ahmedabad",
            condition: mp.condition || "Stable",
            status: mp.accountStatus || (mp.isVerified !== false ? "Active" : "Pending"),
            bloodRequests: [],
            bloodRequestsCount: 0,
            appointments: [],
            appointmentsCount: 0,
            reports: [],
            reportsCount: 0,
            notifications: [],
            createdAt: mp.createdAt || new Date().toISOString(),
            updatedAt: mp.updatedAt || new Date().toISOString()
          });
        }
      }
    }
  } catch (err) {
    console.warn("Error reading mockDb.json:", err.message);
  }

  // 4. Query patients.json for admin-created patients
  try {
    if (fs.existsSync(PATIENTS_FILE)) {
      const stored = JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf8"));
      for (const sp of stored) {
        const key = sp.clerkId || String(sp._id);
        patientMap.set(key, { ...(patientMap.get(key) || {}), ...sp });
      }
    }
  } catch (err) {
    console.warn("Error reading patients.json:", err.message);
  }

  // 5. Seed default patients if no patients found
  if (patientMap.size === 0) {
    const seed = [
      { _id: "pat001", fullName: "John Smith", email: "john.smith@email.com", phone: "+91 98111 22334", bloodGroup: "A+", age: 45, gender: "Male", hospitalName: "Apollo Hospital Delhi", condition: "Critical", status: "Active", createdAt: "2026-01-15", bloodRequestsCount: 2, appointmentsCount: 1 },
      { _id: "pat002", fullName: "Sarah Johnson", email: "sarah.j@email.com", phone: "+91 98222 33445", bloodGroup: "O-", age: 32, gender: "Female", hospitalName: "J.J. Hospital Mumbai", condition: "Stable", status: "Active", createdAt: "2026-01-18", bloodRequestsCount: 1, appointmentsCount: 0 },
      { _id: "pat003", fullName: "Michael Brown", email: "m.brown@email.com", phone: "+91 98333 44556", bloodGroup: "B+", age: 58, gender: "Male", hospitalName: "Fortis Hospital Bangalore", condition: "Recovering", status: "Discharged", createdAt: "2026-01-20", bloodRequestsCount: 0, appointmentsCount: 2 },
      { _id: "pat004", fullName: "Emily Davis", email: "emily.d@email.com", phone: "+91 98444 55667", bloodGroup: "AB+", age: 28, gender: "Female", hospitalName: "Victoria Hospital Bangalore", condition: "Critical", status: "Active", createdAt: "2026-01-22", bloodRequestsCount: 3, appointmentsCount: 1 },
      { _id: "pat005", fullName: "Robert Wilson", email: "r.wilson@email.com", phone: "+91 98555 66778", bloodGroup: "O+", age: 52, gender: "Male", hospitalName: "AIIMS New Delhi", condition: "Stable", status: "Active", createdAt: "2026-01-23", bloodRequestsCount: 1, appointmentsCount: 1 },
      { _id: "pat006", fullName: "Pooja Hegde", email: "pooja.h@email.com", phone: "+91 98666 77889", bloodGroup: "B-", age: 29, gender: "Female", hospitalName: "Max Healthcare Delhi", condition: "Critical", status: "Active", createdAt: "2026-02-01", bloodRequestsCount: 2, appointmentsCount: 0 },
      { _id: "pat007", fullName: "Arun Kumar", email: "arun.k@email.com", phone: "+91 98777 88990", bloodGroup: "AB-", age: 39, gender: "Male", hospitalName: "Kokilaben Hospital Mumbai", condition: "Stable", status: "Active", createdAt: "2026-02-04", bloodRequestsCount: 1, appointmentsCount: 1 }
    ];
    seed.forEach(s => patientMap.set(s._id, s));
  }

  // 6. Enrich with live BloodRequest records if available
  if (isDbConnected && mongoose.models.BloodRequest) {
    try {
      const allRequests = await mongoose.models.BloodRequest.find({}).lean();
      for (const [key, pat] of patientMap.entries()) {
        const matches = allRequests.filter(r => String(r.patientId) === String(pat._id) || (pat.clerkId && r.clerkId === pat.clerkId));
        if (matches.length > 0) {
          pat.bloodRequests = matches;
          pat.bloodRequestsCount = matches.length;
        }
      }
    } catch (err) { /* ignore */ }
  }

  // 7. Enrich with live Appointment records if available
  if (isDbConnected && mongoose.models.Appointment) {
    try {
      const allAppointments = await mongoose.models.Appointment.find({}).lean();
      for (const [key, pat] of patientMap.entries()) {
        const matches = allAppointments.filter(a => String(a.patientId) === String(pat._id) || (pat.clerkId && a.clerkId === pat.clerkId));
        if (matches.length > 0) {
          pat.appointments = matches;
          pat.appointmentsCount = matches.length;
        }
      }
    } catch (err) { /* ignore */ }
  }

  return Array.from(patientMap.values());
};

// GET: All Patients
router.get("/api/admin/patients-list", async (req, res) => {
  const { search, bloodGroup, status } = req.query;

  try {
    let patients = await getAllDatabasePatients();

    if (bloodGroup && bloodGroup !== "all") {
      patients = patients.filter(p => p.bloodGroup === bloodGroup);
    }
    if (status && status !== "all") {
      patients = patients.filter(p => p.status?.toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      patients = patients.filter(p =>
        p.fullName?.toLowerCase().includes(s) ||
        p.email?.toLowerCase().includes(s) ||
        p.phone?.includes(s) ||
        p.hospitalName?.toLowerCase().includes(s) ||
        p.city?.toLowerCase().includes(s)
      );
    }

    const { items, pagination } = paginateResults(patients, req);

    res.status(200).json({ success: true, count: patients.length, patients: items, data: items, pagination });
  } catch (err) {
    console.error("Patients fetch error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET: Single Patient Details
router.get("/api/admin/patients/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const patients = await getAllDatabasePatients();
    const patient = patients.find(p => String(p._id) === String(id) || p.clerkId === id);

    if (!patient) {
      return res.status(404).json({ success: false, message: "Patient record not found in database." });
    }

    res.status(200).json({ success: true, patient });
  } catch (err) {
    console.error("Get patient details error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST: Create New Patient
router.post("/api/admin/patients/create", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const {
    fullName,
    email,
    phone,
    bloodGroup,
    age,
    dateOfBirth,
    gender,
    address,
    city,
    state,
    pincode,
    emergencyContact,
    emergencyPhone,
    hospitalName,
    condition,
    status
  } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ success: false, message: "Full Name and Email are required to register a patient." });
  }

  try {
    const patientId = "pat_" + generateCustomId();
    const newPatient = {
      _id: patientId,
      clerkId: "clerk_" + generateCustomId(),
      fullName,
      email,
      phone: phone || "+91 98765 43210",
      bloodGroup: bloodGroup || "A+",
      gender: gender || "Male",
      age: parseInt(age) || 30,
      dateOfBirth: dateOfBirth || "",
      address: address || "",
      city: city || "New Delhi",
      state: state || "Delhi",
      pincode: pincode || "",
      emergencyContact: emergencyContact || "",
      emergencyPhone: emergencyPhone || "",
      hospitalName: hospitalName || "AIIMS New Delhi",
      condition: condition || "Stable",
      status: status || "Active",
      bloodRequests: [],
      bloodRequestsCount: 0,
      appointments: [],
      appointmentsCount: 0,
      reports: [],
      reportsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 1. Save in MongoDB Patient if connected
    if (isDbConnected && mongoose.models.Patient) {
      try {
        await mongoose.models.Patient.create({
          _id: newPatient._id,
          clerkId: newPatient.clerkId,
          email: newPatient.email,
          profile: {
            fullName: newPatient.fullName,
            phone: newPatient.phone,
            dateOfBirth: newPatient.dateOfBirth,
            gender: newPatient.gender,
            bloodGroup: newPatient.bloodGroup,
            address: newPatient.address,
            city: newPatient.city,
            state: newPatient.state,
            pincode: newPatient.pincode,
            emergencyContact: newPatient.emergencyContact,
            emergencyPhone: newPatient.emergencyPhone
          },
          status: newPatient.status,
          bloodRequests: [],
          appointments: [],
          notifications: [],
          reports: []
        });
      } catch (err) {
        console.warn("MongoDB Patient create warning:", err.message);
      }
    }

    // 2. Save in MongoDB UserProfile
    if (isDbConnected && mongoose.models.UserProfile) {
      try {
        await mongoose.models.UserProfile.create({
          _id: newPatient._id,
          clerkId: newPatient.clerkId,
          fullName: newPatient.fullName,
          email: newPatient.email,
          phone: newPatient.phone,
          bloodGroup: newPatient.bloodGroup,
          role: "patient",
          accountStatus: newPatient.status,
          isVerified: true
        });
      } catch (err) {
        console.warn("MongoDB UserProfile create warning:", err.message);
      }
    }

    // 3. Save in patients.json
    let stored = [];
    if (fs.existsSync(PATIENTS_FILE)) {
      try { stored = JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf8")); } catch (e) { stored = []; }
    }
    stored.unshift(newPatient);
    fs.writeFileSync(PATIENTS_FILE, JSON.stringify(stored, null, 2), "utf8");

    // 4. Save in mockDb.json
    const mockFile = path.join(__dirname, "mockDb.json");
    let mockUsers = [];
    if (fs.existsSync(mockFile)) {
      try { mockUsers = JSON.parse(fs.readFileSync(mockFile, "utf8")); } catch (e) { mockUsers = []; }
    }
    mockUsers.unshift({
      _id: newPatient._id,
      clerkId: newPatient.clerkId,
      fullName: newPatient.fullName,
      email: newPatient.email,
      phone: newPatient.phone,
      bloodGroup: newPatient.bloodGroup,
      role: "patient",
      isVerified: true,
      accountStatus: newPatient.status,
      createdAt: newPatient.createdAt,
      updatedAt: newPatient.updatedAt
    });
    fs.writeFileSync(mockFile, JSON.stringify(mockUsers, null, 2), "utf8");

    await logAudit(req, "CREATE_PATIENT", "Patients", `Created new patient: ${fullName} (${bloodGroup})`, patientId, fullName, null, newPatient);

    res.status(201).json({ success: true, message: "Patient registered successfully in database.", patient: newPatient });
  } catch (err) {
    console.error("Create patient error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT: Update Patient
router.put("/api/admin/patients/update/:id", async (req, res) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  const updates = req.body;

  try {
    // 1. Update in MongoDB Patient if connected
    if (isDbConnected && mongoose.models.Patient) {
      await mongoose.models.Patient.updateOne(
        { $or: [{ _id: id }, { clerkId: id }] },
        {
          $set: {
            email: updates.email,
            status: updates.status,
            "profile.fullName": updates.fullName,
            "profile.phone": updates.phone,
            "profile.bloodGroup": updates.bloodGroup,
            "profile.gender": updates.gender,
            "profile.dateOfBirth": updates.dateOfBirth,
            "profile.address": updates.address,
            "profile.city": updates.city,
            "profile.state": updates.state,
            "profile.pincode": updates.pincode,
            "profile.emergencyContact": updates.emergencyContact,
            "profile.emergencyPhone": updates.emergencyPhone
          }
        }
      );
    }

    // 2. Update in MongoDB UserProfile
    if (isDbConnected && mongoose.models.UserProfile) {
      await mongoose.models.UserProfile.updateOne(
        { $or: [{ _id: id }, { clerkId: id }] },
        {
          $set: {
            fullName: updates.fullName,
            email: updates.email,
            phone: updates.phone,
            bloodGroup: updates.bloodGroup,
            accountStatus: updates.status
          }
        }
      );
    }

    // 3. Update in patients.json
    if (fs.existsSync(PATIENTS_FILE)) {
      try {
        let stored = JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf8"));
        const idx = stored.findIndex(p => String(p._id) === String(id) || p.clerkId === id);
        if (idx !== -1) {
          stored[idx] = { ...stored[idx], ...updates, updatedAt: new Date().toISOString() };
        } else {
          stored.push({ _id: id, ...updates, updatedAt: new Date().toISOString() });
        }
        fs.writeFileSync(PATIENTS_FILE, JSON.stringify(stored, null, 2), "utf8");
      } catch (e) { /* ignore */ }
    }

    // 4. Update in mockDb.json
    const mockFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockFile)) {
      try {
        let mockUsers = JSON.parse(fs.readFileSync(mockFile, "utf8"));
        const mIdx = mockUsers.findIndex(u => String(u._id) === String(id) || u.clerkId === id);
        if (mIdx !== -1) {
          mockUsers[mIdx] = { ...mockUsers[mIdx], ...updates, updatedAt: new Date().toISOString() };
          fs.writeFileSync(mockFile, JSON.stringify(mockUsers, null, 2), "utf8");
        }
      } catch (e) { /* ignore */ }
    }

    await logAudit(req, "UPDATE_PATIENT", "Patients", `Updated patient profile for ID ${id}`, id, updates.fullName || id, null, updates);

    res.status(200).json({ success: true, message: "Patient updated successfully in database." });
  } catch (err) {
    console.error("Update patient error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE: Delete / Soft-delete Patient
router.delete("/api/admin/patients/:id", async (req, res) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  try {
    if (isDbConnected && mongoose.models.Patient) {
      await mongoose.models.Patient.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { isDeleted: true, status: "Deleted" } });
    }
    if (isDbConnected && mongoose.models.UserProfile) {
      await mongoose.models.UserProfile.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { isDeleted: true, accountStatus: "Deleted" } });
    }

    // Remove from patients.json
    if (fs.existsSync(PATIENTS_FILE)) {
      try {
        let stored = JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf8"));
        stored = stored.filter(p => String(p._id) !== String(id) && p.clerkId !== id);
        fs.writeFileSync(PATIENTS_FILE, JSON.stringify(stored, null, 2), "utf8");
      } catch (e) { /* ignore */ }
    }

    // Remove from mockDb.json
    const mockFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockFile)) {
      try {
        let mockUsers = JSON.parse(fs.readFileSync(mockFile, "utf8"));
        mockUsers = mockUsers.filter(u => String(u._id) !== String(id) && u.clerkId !== id);
        fs.writeFileSync(mockFile, JSON.stringify(mockUsers, null, 2), "utf8");
      } catch (e) { /* ignore */ }
    }

    await logAudit(req, "DELETE_PATIENT", "Patients", `Deleted patient record: ${id}`, id);

    res.status(200).json({ success: true, message: "Patient removed successfully from database." });
  } catch (err) {
    console.error("Delete patient error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH: Patient Status Action (activate, deactivate, suspend, restore, discharge)
router.patch("/api/admin/patients/:id/action", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  const statusMap = {
    activate: "Active",
    deactivate: "Inactive",
    suspend: "Suspended",
    restore: "Active",
    discharge: "Discharged"
  };

  const newStatus = statusMap[action] || "Active";

  try {
    if (isDbConnected && mongoose.models.Patient) {
      await mongoose.models.Patient.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { status: newStatus } });
    }
    if (isDbConnected && mongoose.models.UserProfile) {
      await mongoose.models.UserProfile.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { accountStatus: newStatus } });
    }

    // Update in patients.json
    if (fs.existsSync(PATIENTS_FILE)) {
      try {
        let stored = JSON.parse(fs.readFileSync(PATIENTS_FILE, "utf8"));
        const idx = stored.findIndex(p => String(p._id) === String(id) || p.clerkId === id);
        if (idx !== -1) {
          stored[idx].status = newStatus;
          fs.writeFileSync(PATIENTS_FILE, JSON.stringify(stored, null, 2), "utf8");
        }
      } catch (e) { /* ignore */ }
    }

    await logAudit(req, `PATIENT_${action.toUpperCase()}`, "Patients", `Set patient ${id} status to ${newStatus}`, id, "", null, { status: newStatus });

    res.status(200).json({ success: true, message: `Patient marked as ${newStatus}.`, status: newStatus });
  } catch (err) {
    console.error("Patient action error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 4. DOCTORS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/doctors-list", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { search, specialization, hospital, status, sort = "newest" } = req.query;

  try {
    let doctors = [];
    if (isDbConnected && mongoose.models.Doctors) {
      doctors = await mongoose.models.Doctors.find({ isDeleted: { $ne: true } }).lean();
    }

    if (!doctors || doctors.length === 0) {
      const doctorsFile = path.join(__dirname, "doctors.json");
      if (fs.existsSync(doctorsFile)) {
        try {
          doctors = JSON.parse(fs.readFileSync(doctorsFile, "utf8"));
        } catch (e) {}
      }
    }

    // Normalize field names for admin consumers
    doctors = doctors.map(d => ({
      ...d,
      name: d.name || d.fullName || "Doctor",
      specialization: d.specialization || d.speciality || "General Medicine",
      hospital: d.hospital || d.hospitalName || "",
      phone: d.phone || "",
      email: d.email || "",
      availability: d.availability || "Available",
      status: d.status || "Active",
      qualification: d.qualification || d.qualifications || "",
      experience: d.experience || 0,
      createdAt: d.createdAt || new Date().toISOString()
    }));

    if (specialization && specialization !== "all") {
      doctors = doctors.filter(d => d.specialization === specialization);
    }
    if (hospital && hospital !== "all") {
      const h = hospital.toLowerCase();
      doctors = doctors.filter(d => d.hospital?.toLowerCase().includes(h));
    }
    if (status && status !== "all") {
      doctors = doctors.filter(d => (d.status || "").toLowerCase() === status.toLowerCase());
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      doctors = doctors.filter(d =>
        d.name?.toLowerCase().includes(s) ||
        d.specialization?.toLowerCase().includes(s) ||
        d.hospital?.toLowerCase().includes(s) ||
        d.email?.toLowerCase().includes(s)
      );
    }

    if (sort === "name") doctors.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    else if (sort === "oldest") doctors.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else doctors.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const { items, pagination } = paginateResults(doctors, req);
    res.status(200).json({ success: true, doctors: items, data: items, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Doctor
router.put("/api/admin/doctors/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const allowed = ["name", "specialization", "hospital", "department", "phone", "email", "availability", "consultationFee", "qualification", "experience", "licenseNumber", "status", "rating"];
    const $set = {};
    allowed.forEach(k => { if (updates[k] !== undefined) $set[k] = updates[k]; });

    let updated = null;
    if (mongoose.connection.readyState === 1 && mongoose.models.Doctors) {
      updated = await mongoose.models.Doctors.findOneAndUpdate(
        { $or: [{ _id: id }, { clerkId: id }] },
        { $set },
        { new: true }
      ).lean();
    }

    // Persist in doctors.json fallback store
    const doctorsFile = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(doctorsFile, "utf8"));
        const idx = list.findIndex(d => String(d._id) === String(id));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...$set };
          fs.writeFileSync(doctorsFile, JSON.stringify(list, null, 2), "utf8");
        }
      } catch (e) {}
    }

    if (!updated && mongoose.connection.readyState !== 1) {
      return res.status(404).json({ success: false, message: "Doctor not found." });
    }

    await logAudit(req, "DOCTOR_UPDATED", "Doctors", `Updated doctor profile for ID ${id}`, id, updates.name || id, null, $set);
    res.status(200).json({ success: true, message: "Doctor updated successfully.", doctor: updated || { _id: id, ...$set } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Doctor Status Action (activate / deactivate / suspend / restore)
router.patch("/api/admin/doctors/:id/action", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const statusMap = { activate: "Active", deactivate: "Inactive", suspend: "Suspended", restore: "Active", available: "Available", unavailable: "On Leave" };
    const newStatus = statusMap[action] || "Active";

    if (mongoose.connection.readyState === 1 && mongoose.models.Doctors) {
      await mongoose.models.Doctors.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { status: newStatus } });
    }

    const doctorsFile = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(doctorsFile, "utf8"));
        const idx = list.findIndex(d => String(d._id) === String(id));
        if (idx !== -1) {
          list[idx].status = newStatus;
          fs.writeFileSync(doctorsFile, JSON.stringify(list, null, 2), "utf8");
        }
      } catch (e) {}
    }

    await logAudit(req, `DOCTOR_${String(action).toUpperCase()}`, "Doctors", `Doctor ${id} action '${action}' → ${newStatus}`, id, "", null, { status: newStatus });
    res.status(200).json({ success: true, message: `Doctor status set to ${newStatus}.`, status: newStatus });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Soft-delete Doctor
router.delete("/api/admin/doctors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.models.Doctors) {
      await mongoose.models.Doctors.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { isDeleted: true, status: "Deleted" } });
    }
    const doctorsFile = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(doctorsFile, "utf8"));
        list = list.filter(d => String(d._id) !== String(id));
        fs.writeFileSync(doctorsFile, JSON.stringify(list, null, 2), "utf8");
      } catch (e) {}
    }
    await logAudit(req, "DOCTOR_DELETED", "Doctors", `Soft-deleted doctor record ${id}`, id);
    res.status(200).json({ success: true, message: "Doctor record removed." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/api/admin/doctors/create", async (req, res) => {
  try {
    const { name, specialization, hospital, department, phone, email, availability, consultationFee, qualification, experience, licenseNumber, status } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Doctor name is required." });
    }
    const newDoc = {
      _id: "dr_" + generateCustomId(),
      name,
      specialization: specialization || "General Medicine",
      hospital: hospital || "Apollo Hospital",
      department: department || "",
      phone: phone || "+91 98765 00000",
      email: email || "doctor@hospital.com",
      availability: availability || "Available",
      consultationFee: consultationFee || 500,
      qualification: qualification || "",
      experience: parseInt(experience) || 0,
      licenseNumber: licenseNumber || "",
      status: status || "Active",
      isDeleted: false,
      createdAt: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1 && mongoose.models.Doctors) {
      await mongoose.models.Doctors.create(newDoc);
    }

    // Persist in doctors.json
    const doctorsFile = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsFile)) {
      try {
        let list = JSON.parse(fs.readFileSync(doctorsFile, "utf8"));
        list.unshift(newDoc);
        fs.writeFileSync(doctorsFile, JSON.stringify(list, null, 2), "utf8");
      } catch (e) {}
    }

    await logAudit(req, "DOCTOR_CREATED", "Doctors", `Registered doctor ${name} at ${hospital}`, newDoc._id, name, null, newDoc);

    res.status(201).json({ success: true, message: "Doctor profile created successfully.", doctor: newDoc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 5. DONORS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/donors-list", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { search, bloodGroup, status, verificationStatus } = req.query;

  try {
    let donors = [];

    if (isDbConnected && mongoose.models.Donor) {
      const docs = await mongoose.models.Donor.find({ isDeleted: { $ne: true } }).lean();
      donors = docs.map(d => {
        const eligible = d.isEligible !== undefined ? d.isEligible : (!d.nextEligibleDate || new Date(d.nextEligibleDate) <= new Date());
        return {
          _id: d._id,
          clerkId: d.clerkId || "",
          fullName: d.profile?.fullName || `${d.profile?.firstName||""} ${d.profile?.lastName||""}`.trim() || "Donor " + String(d._id).substring(0,4),
          email: d.email || "donor@hemocare.org",
          phone: d.profile?.phone || "+91 98111 55667",
          bloodGroup: d.profile?.bloodGroup || "O+",
          dateOfBirth: d.profile?.dateOfBirth || "",
          gender: d.profile?.gender || "",
          weight: d.profile?.weight || "",
          lastDonation: d.lastDonationDate || d.profile?.lastDonation || "",
          nextEligibleDate: d.nextEligibleDate || "",
          city: d.profile?.city || "",
          state: d.profile?.state || "",
          address: d.profile?.address || "",
          totalDonations: d.totalDonations ?? (d.donations ? d.donations.length : 0),
          isEligible: eligible,
          verificationStatus: d.verificationStatus || (d.status === "Pending" ? "Pending" : "Verified"),
          status: d.status || "Active",
          createdAt: d.createdAt || new Date().toISOString()
        };
      });
    }

    if (donors.length === 0) {
      donors = [
        { _id: "don001", fullName: "Vikram Malhotra", email: "vikram.m@gmail.com", phone: "+91 98112 33445", bloodGroup: "O+", weight: "72", lastDonation: "2026-04-10", city: "Mumbai", totalDonations: 6, isEligible: true, verificationStatus: "Verified", status: "Active" },
        { _id: "don002", fullName: "Ananya Deshmukh", email: "ananya.d@gmail.com", phone: "+91 98223 44556", bloodGroup: "A+", weight: "58", lastDonation: "2026-06-20", city: "Pune", totalDonations: 3, isEligible: false, verificationStatus: "Verified", status: "Active" },
        { _id: "don003", fullName: "Rohan Varma", email: "rohan.v@gmail.com", phone: "+91 98334 55667", bloodGroup: "B+", weight: "68", lastDonation: "2026-01-12", city: "Bangalore", totalDonations: 8, isEligible: true, verificationStatus: "Verified", status: "Active" },
        { _id: "don004", fullName: "Deepika Sen", email: "deepika.s@gmail.com", phone: "+91 98445 66778", bloodGroup: "AB+", weight: "54", lastDonation: "2025-11-05", city: "Kolkata", totalDonations: 2, isEligible: true, verificationStatus: "Pending", status: "Active" },
        { _id: "don005", fullName: "Kunal Ghosh", email: "kunal.g@gmail.com", phone: "+91 98556 77889", bloodGroup: "O-", weight: "80", lastDonation: "2026-05-18", city: "Delhi", totalDonations: 12, isEligible: true, verificationStatus: "Verified", status: "Active" },
        { _id: "don006", fullName: "Meera Nair", email: "meera.n@gmail.com", phone: "+91 98667 88990", bloodGroup: "B-", weight: "62", lastDonation: "2026-02-14", city: "Chennai", totalDonations: 5, isEligible: true, verificationStatus: "Verified", status: "Active" }
      ];
    }

    // Filters
    if (bloodGroup && bloodGroup !== "all") {
      donors = donors.filter(d => d.bloodGroup === bloodGroup);
    }
    if (status && status !== "all") {
      donors = donors.filter(d => (d.status || "").toLowerCase() === status.toLowerCase());
    }
    if (verificationStatus && verificationStatus !== "all") {
      donors = donors.filter(d => (d.verificationStatus || "").toLowerCase() === verificationStatus.toLowerCase());
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      donors = donors.filter(d =>
        d.fullName?.toLowerCase().includes(s) ||
        d.email?.toLowerCase().includes(s) ||
        d.phone?.includes(s) ||
        d.city?.toLowerCase().includes(s)
      );
    }

    const { items, pagination } = paginateResults(donors, req);
    res.status(200).json({ success: true, donors: items, data: items, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Donor (Admin)
router.post("/api/admin/donors/create", async (req, res) => {
  try {
    const { fullName, firstName, lastName, email, phone, bloodGroup, dateOfBirth, gender, weight, address, city, state, pincode, lastDonation, status, verificationStatus } = req.body;
    if (!fullName && !(firstName && lastName)) {
      return res.status(400).json({ success: false, message: "Donor name is required." });
    }
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required." });
    }

    const donorId = "don_" + generateCustomId();
    const name = fullName || `${firstName} ${lastName}`.trim();

    if (mongoose.connection.readyState === 1 && mongoose.models.Donor) {
      await mongoose.models.Donor.create({
        _id: donorId,
        clerkId: "admin_created_" + donorId,
        email,
        profile: {
          fullName: name,
          firstName: firstName || name.split(" ")[0] || "",
          lastName: lastName || name.split(" ").slice(1).join(" ") || "",
          phone: phone || "",
          dateOfBirth: dateOfBirth || "",
          gender: gender || "",
          bloodGroup: bloodGroup || "O+",
          weight: weight || "",
          lastDonation: lastDonation || "",
          address: address || "",
          city: city || "",
          state: state || "",
          pincode: pincode || ""
        },
        totalDonations: 0,
        status: status || "Active",
        verificationStatus: verificationStatus || "Verified",
        isEligible: true,
        donations: [],
        appointments: [],
        certificates: []
      });
    }

    // Mirror into UserProfile so the user appears in User Management
    if (mongoose.connection.readyState === 1 && mongoose.models.UserProfile) {
      try {
        await mongoose.models.UserProfile.create({
          _id: donorId,
          clerkId: "admin_created_" + donorId,
          fullName: name,
          email,
          phone: phone || "",
          bloodGroup: bloodGroup || "O+",
          role: "donor",
          accountStatus: status || "Active",
          isVerified: true
        });
      } catch (e) { /* duplicate profile is acceptable */ }
    }

    await logAudit(req, "DONOR_CREATED", "Donors", `Registered donor ${name} (${bloodGroup || "O+"})`, donorId, name, null, req.body);
    res.status(201).json({ success: true, message: "Donor registered successfully.", donor: { _id: donorId, fullName: name, email, bloodGroup } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Donor
router.put("/api/admin/donors/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const u = req.body || {};
    const $set = { updatedAt: new Date() };
    if (u.email !== undefined) $set.email = u.email;
    if (u.status !== undefined) $set.status = u.status;
    if (u.verificationStatus !== undefined) $set.verificationStatus = u.verificationStatus;
    if (u.isEligible !== undefined) $set.isEligible = u.isEligible;
    if (u.totalDonations !== undefined) $set.totalDonations = u.totalDonations;
    if (u.lastDonation !== undefined || u.lastDonationDate !== undefined) $set.lastDonationDate = u.lastDonation || u.lastDonationDate;
    if (u.nextEligibleDate !== undefined) $set.nextEligibleDate = u.nextEligibleDate;

    const profileSet = {};
    const profileMap = {
      fullName: "fullName", firstName: "firstName", lastName: "lastName", phone: "phone",
      dateOfBirth: "dateOfBirth", gender: "gender", bloodGroup: "bloodGroup",
      weight: "weight", address: "address", city: "city", state: "state", pincode: "pincode",
      lastDonation: "lastDonation", emergencyContact: "emergencyContact", emergencyPhone: "emergencyPhone"
    };
    Object.entries(profileMap).forEach(([k, p]) => {
      if (u[k] !== undefined) profileSet[`profile.${p}`] = u[k];
    });

    let updated = null;
    if (mongoose.connection.readyState === 1 && mongoose.models.Donor) {
      updated = await mongoose.models.Donor.findOneAndUpdate(
        { $or: [{ _id: id }, { clerkId: id }] },
        { $set: { ...$set, ...profileSet } },
        { new: true }
      ).lean();
      if (mongoose.models.UserProfile) {
        const profileUpdate = {};
        if (u.fullName !== undefined) profileUpdate.fullName = u.fullName;
        if (u.email !== undefined) profileUpdate.email = u.email;
        if (u.phone !== undefined) profileUpdate.phone = u.phone;
        if (u.bloodGroup !== undefined) profileUpdate.bloodGroup = u.bloodGroup;
        if (u.status !== undefined) profileUpdate.accountStatus = u.status;
        if (Object.keys(profileUpdate).length) {
          await mongoose.models.UserProfile.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: profileUpdate });
        }
      }
    }

    await logAudit(req, "DONOR_UPDATED", "Donors", `Updated donor record ${id}`, id, u.fullName || id, null, u);
    res.status(200).json({ success: true, message: "Donor updated successfully.", donor: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Donor Action (verify / approve / reject / suspend / restore / activate / deactivate)
router.patch("/api/admin/donors/:id/action", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const isDbConnected = mongoose.connection.readyState === 1;

    const statusMap = {
      verify: { verificationStatus: "Verified", status: "Active" },
      approve: { verificationStatus: "Verified", status: "Active" },
      reject: { verificationStatus: "Rejected", status: "Inactive" },
      suspend: { status: "Suspended" },
      restore: { status: "Active", isDeleted: false },
      activate: { status: "Active" },
      deactivate: { status: "Inactive" }
    };
    const patch = statusMap[action] || { status: "Active" };

    if (isDbConnected && mongoose.models.Donor) {
      await mongoose.models.Donor.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: patch });
    }
    if (isDbConnected && mongoose.models.UserProfile && (patch.status || patch.isDeleted !== undefined)) {
      const up = {};
      if (patch.status) up.accountStatus = patch.status;
      if (patch.isDeleted !== undefined) up.isDeleted = patch.isDeleted;
      await mongoose.models.UserProfile.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: up });
    }

    await logAudit(req, `DONOR_${String(action).toUpperCase()}`, "Donors", `Donor ${id} action '${action}'`, id, "", null, patch);
    res.status(200).json({ success: true, message: `Donor action '${action}' completed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Soft-delete Donor (preserves donation history & requests)
router.delete("/api/admin/donors/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1) {
      if (mongoose.models.Donor) {
        await mongoose.models.Donor.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { isDeleted: true, status: "Deleted" } });
      }
      if (mongoose.models.UserProfile) {
        await mongoose.models.UserProfile.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { isDeleted: true, accountStatus: "Deleted" } });
      }
    }
    await logAudit(req, "DONOR_DELETED", "Donors", `Soft-deleted donor record ${id}`, id);
    res.status(200).json({ success: true, message: "Donor account deactivated. Donation history preserved." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 6. BLOOD INVENTORY & TRANSACTIONS API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/inventory-items", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { search, bloodGroup, status, hospital } = req.query;

  try {
    let inventory = [];

    if (isDbConnected && mongoose.models.BloodInventory) {
      inventory = await mongoose.models.BloodInventory.find({}).lean();
    }

    if (!inventory || inventory.length === 0) {
      const stockFile = path.join(__dirname, "bloodInventory.json");
      if (fs.existsSync(stockFile)) {
        try {
          inventory = JSON.parse(fs.readFileSync(stockFile, "utf8"));
        } catch (e) {}
      }
    }

    // Standard baseline inventory across 8 groups
    if (!inventory || inventory.length === 0) {
      inventory = [
        { _id: "inv-o-pos", bloodGroup: "O+", component: "Whole Blood", units: 145, hospital: "Central Blood Bank Hub", reserved: 20, expired: 0, status: "Available", lastUpdated: new Date().toISOString() },
        { _id: "inv-a-pos", bloodGroup: "A+", component: "Whole Blood", units: 98, hospital: "Central Blood Bank Hub", reserved: 15, expired: 0, status: "Available", lastUpdated: new Date().toISOString() },
        { _id: "inv-b-pos", bloodGroup: "B+", component: "Whole Blood", units: 76, hospital: "Central Blood Bank Hub", reserved: 10, expired: 0, status: "Available", lastUpdated: new Date().toISOString() },
        { _id: "inv-ab-pos", bloodGroup: "AB+", component: "Whole Blood", units: 42, hospital: "Central Blood Bank Hub", reserved: 5, expired: 0, status: "Available", lastUpdated: new Date().toISOString() },
        { _id: "inv-o-neg", bloodGroup: "O-", component: "Whole Blood", units: 8, hospital: "Central Blood Bank Hub", reserved: 4, expired: 2, status: "Critical", lastUpdated: new Date().toISOString() },
        { _id: "inv-a-neg", bloodGroup: "A-", component: "Whole Blood", units: 14, hospital: "Central Blood Bank Hub", reserved: 2, expired: 1, status: "Low Stock", lastUpdated: new Date().toISOString() },
        { _id: "inv-b-neg", bloodGroup: "B-", component: "Whole Blood", units: 12, hospital: "Central Blood Bank Hub", reserved: 3, expired: 0, status: "Low Stock", lastUpdated: new Date().toISOString() },
        { _id: "inv-ab-neg", bloodGroup: "AB-", component: "Whole Blood", units: 6, hospital: "Central Blood Bank Hub", reserved: 2, expired: 1, status: "Critical", lastUpdated: new Date().toISOString() }
      ];
    }

    // Normalize + derive stock status
    inventory = inventory.map(item => {
      const units = parseInt(item.units) || 0;
      const derivedStatus = item.status || (units <= 5 ? "Critical" : units <= 15 ? "Low Stock" : "Available");
      return {
        ...item,
        component: item.component || "Whole Blood",
        units,
        reserved: item.reserved || 0,
        status: derivedStatus,
        lastUpdated: item.lastUpdated || (item.updatedAt ? new Date(item.updatedAt).toISOString() : new Date().toISOString())
      };
    });

    if (bloodGroup && bloodGroup !== "all") inventory = inventory.filter(i => i.bloodGroup === bloodGroup);
    if (hospital && hospital !== "all") {
      const h = hospital.toLowerCase();
      inventory = inventory.filter(i => i.hospital?.toLowerCase().includes(h));
    }
    if (status && status !== "all") inventory = inventory.filter(i => (i.status || "").toLowerCase() === status.toLowerCase());
    if (search && search.trim()) {
      const s = search.toLowerCase();
      inventory = inventory.filter(i =>
        i.bloodGroup?.toLowerCase().includes(s) ||
        i.hospital?.toLowerCase().includes(s) ||
        i.component?.toLowerCase().includes(s)
      );
    }

    const { items, pagination } = paginateResults(inventory, req);
    res.status(200).json({ success: true, inventory: items, data: items, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Add Stock (Guaranteed Non-Negative)
router.post("/api/admin/inventory/add", async (req, res) => {
  try {
    const { bloodGroup, component = "Whole Blood", units, hospital = "Central Blood Bank Hub", expiryDate, reason } = req.body;
    const addUnits = parseInt(units);
    if (!bloodGroup || isNaN(addUnits) || addUnits <= 0) {
      return res.status(400).json({ success: false, message: "Valid blood group and positive units required." });
    }

    const batchId = "BATCH-" + Math.floor(100000 + Math.random() * 900000);
    const calculatedExpiry = expiryDate || new Date(Date.now() + 42 * 86400000).toISOString().split("T")[0];

    if (mongoose.connection.readyState === 1 && mongoose.models.BloodInventory) {
      let existing = await mongoose.models.BloodInventory.findOne({ bloodGroup, hospital });
      if (existing) {
        existing.units += addUnits;
        existing.lastUpdated = new Date().toISOString();
        if (existing.batches) {
          existing.batches.push({ batchId, units: addUnits, expiryDate: calculatedExpiry, status: "active" });
        }
        await existing.save();
      } else {
        await mongoose.models.BloodInventory.create({
          bloodGroup,
          units: addUnits,
          hospital,
          component,
          lastUpdated: new Date().toISOString(),
          batches: [{ batchId, units: addUnits, expiryDate: calculatedExpiry, status: "active" }]
        });
      }
    }

    // Record Stock Transaction
    const trans = {
      _id: generateCustomId(),
      date: new Date().toISOString().split("T")[0],
      bloodGroup,
      component,
      units: addUnits,
      type: "Received",
      batchId,
      expiryDate: calculatedExpiry,
      hospital,
      reason: reason || "Admin Stock Addition",
      performedBy: req.headers["x-admin-name"] || "Super Administrator",
      timestamp: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      await StockTransaction.create(trans);
    }

    // Audit Log
    await logAudit(req, "STOCK_ADDED", "Blood Inventory", `Added ${addUnits} units of ${bloodGroup} (${component}) at ${hospital}`, batchId, bloodGroup, null, trans);

    res.status(201).json({ success: true, message: `Successfully added ${addUnits} units to ${bloodGroup}.`, transaction: trans });
  } catch (err) {
    console.error("Add stock error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Adjust Stock (Prevents Negative Inventory)
router.post("/api/admin/inventory/adjust", async (req, res) => {
  try {
    const { bloodGroup, units, hospital = "Central Blood Bank Hub", type = "Adjusted", reason } = req.body;
    const delta = parseInt(units);
    if (!bloodGroup || isNaN(delta)) {
      return res.status(400).json({ success: false, message: "Invalid parameters." });
    }

    if (mongoose.connection.readyState === 1 && mongoose.models.BloodInventory) {
      let existing = await mongoose.models.BloodInventory.findOne({ bloodGroup, hospital });
      if (existing) {
        if (existing.units + delta < 0) {
          return res.status(400).json({ success: false, message: `Cannot reduce stock below 0. Current units: ${existing.units}.` });
        }
        existing.units += delta;
        existing.lastUpdated = new Date().toISOString();
        await existing.save();
      }
    }

    const trans = {
      _id: generateCustomId(),
      date: new Date().toISOString().split("T")[0],
      bloodGroup,
      component: "Whole Blood",
      units: Math.abs(delta),
      type: delta >= 0 ? "Received" : "Issued",
      hospital,
      reason: reason || "Manual Inventory Adjustment",
      performedBy: req.headers["x-admin-name"] || "Super Administrator",
      timestamp: new Date().toISOString()
    };

    if (mongoose.connection.readyState === 1) {
      await StockTransaction.create(trans);
    }

    await logAudit(req, "STOCK_ADJUSTED", "Blood Inventory", `Adjusted ${bloodGroup} by ${delta > 0 ? "+" + delta : delta} units. Reason: ${reason || "N/A"}`, "", bloodGroup, null, trans);

    res.status(200).json({ success: true, message: "Inventory adjusted successfully.", transaction: trans });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Stock Transactions History
router.get("/api/admin/inventory/transactions", async (req, res) => {
  try {
    let transactions = [];
    if (mongoose.connection.readyState === 1) {
      transactions = await StockTransaction.find({}).sort({ createdAt: -1 }).limit(100).lean();
    }

    if (!transactions || transactions.length === 0) {
      transactions = [
        { _id: "tx001", date: "2026-07-06", bloodGroup: "O+", component: "Whole Blood", units: 10, type: "Received", batchId: "BATCH-901844", hospital: "Central Blood Bank Hub", reason: "Donor Camp Collection", performedBy: "Super Administrator" },
        { _id: "tx002", date: "2026-07-06", bloodGroup: "O-", component: "Whole Blood", units: 2, type: "Issued", batchId: "BATCH-89104", hospital: "Apollo Hospital", reason: "Emergency Blood Request Requisition", performedBy: "Super Administrator" },
        { _id: "tx003", date: "2026-07-05", bloodGroup: "A+", component: "Platelets", units: 6, type: "Received", batchId: "BATCH-33412", hospital: "AIIMS New Delhi", reason: "Apherisis Donation", performedBy: "Super Administrator" },
        { _id: "tx004", date: "2026-07-04", bloodGroup: "AB-", component: "Plasma", units: 1, type: "Expired", batchId: "BATCH-11923", hospital: "Central Blood Bank Hub", reason: "Shelf-life expired, safely discarded", performedBy: "Auto-Expiry Service" }
      ];
    }

    res.status(200).json({ success: true, transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 7. BLOOD BANKS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/blood-banks-list", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { search, state, city, type, status, verificationStatus } = req.query;

  try {
    let bloodBanks = [];
    if (isDbConnected && mongoose.models.BloodBank) {
      bloodBanks = await mongoose.models.BloodBank.find({ isDeleted: { $ne: true } }).lean();
    }

    if (!bloodBanks || bloodBanks.length === 0) {
      const bbFile = path.join(__dirname, "mockBloodBanks.json");
      if (fs.existsSync(bbFile)) {
        try {
          bloodBanks = JSON.parse(fs.readFileSync(bbFile, "utf8"));
        } catch (e) {}
      }
    }

    // Compute live stock totals per facility from BloodInventory when possible
    let stockByHospital = {};
    if (isDbConnected && mongoose.models.BloodInventory) {
      try {
        const agg = await mongoose.models.BloodInventory.aggregate([
          { $group: { _id: "$hospital", totalUnits: { $sum: "$units" } } }
        ]);
        agg.forEach(a => { if (a._id) stockByHospital[a._id] = a.totalUnits; });
      } catch (e) {}
    }

    bloodBanks = bloodBanks.map(b => {
      const stockObj = b.bloodStock && typeof b.bloodStock === "object" ? b.bloodStock : null;
      const stockTotal = stockObj
        ? Object.values(stockObj).reduce((a, v) => a + (parseInt(v) || 0), 0)
        : (stockByHospital[b.name] ?? stockByHospital[b.hospital] ?? null);
      return {
        ...b,
        name: b.name || b.hospital || "Blood Bank",
        city: b.city || "",
        state: b.state || "",
        phone: b.phone || b.contactNumber || "",
        email: b.email || "",
        address: b.address || "",
        type: b.type || "NABH",
        status: b.status || "Active",
        verificationStatus: b.verificationStatus || "Pending",
        staffCount: b.staffCount ?? 0,
        totalStock: stockTotal,
        bloodGroupsAvailable: stockObj ? Object.keys(stockObj).filter(k => (stockObj[k] || 0) > 0) : []
      };
    });

    if (search && search.trim()) {
      const s = search.toLowerCase();
      bloodBanks = bloodBanks.filter(b =>
        b.name?.toLowerCase().includes(s) ||
        b.city?.toLowerCase().includes(s) ||
        b.state?.toLowerCase().includes(s) ||
        b.email?.toLowerCase().includes(s) ||
        b.phone?.includes(s)
      );
    }
    if (state && state !== "all") bloodBanks = bloodBanks.filter(b => b.state === state);
    if (city && city !== "all") bloodBanks = bloodBanks.filter(b => b.city === city);
    if (type && type !== "all") bloodBanks = bloodBanks.filter(b => (b.type || "").toLowerCase() === type.toLowerCase());
    if (status && status !== "all") bloodBanks = bloodBanks.filter(b => (b.status || "").toLowerCase() === status.toLowerCase());
    if (verificationStatus && verificationStatus !== "all") bloodBanks = bloodBanks.filter(b => (b.verificationStatus || "").toLowerCase() === verificationStatus.toLowerCase());

    const { items, pagination } = paginateResults(bloodBanks, req);
    res.status(200).json({ success: true, bloodBanks: items, data: items, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Blood Bank
router.post("/api/admin/blood-banks/create", async (req, res) => {
  try {
    const { name, hospital, email, phone, address, city, state, type, licenseNumber, capacity, status, verificationStatus } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: "Blood bank name is required." });
    }
    const bbId = "bb_" + generateCustomId();
    const doc = {
      _id: bbId,
      name,
      hospital: hospital || name,
      email: email || "",
      phone: phone || "",
      address: address || "",
      city: city || "",
      state: state || "",
      type: type || "NABH",
      licenseNumber: licenseNumber || "",
      capacity: parseInt(capacity) || 0,
      status: status || "Active",
      verificationStatus: verificationStatus || "Pending",
      bloodStock: {},
      staffCount: 0,
      isDeleted: false
    };
    if (mongoose.connection.readyState === 1 && mongoose.models.BloodBank) {
      await mongoose.models.BloodBank.create(doc);
    }
    await logAudit(req, "BLOOD_BANK_CREATED", "Blood Banks", `Registered blood bank ${name}`, bbId, name, null, doc);
    res.status(201).json({ success: true, message: "Blood bank registered.", bloodBank: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update Blood Bank
router.put("/api/admin/blood-banks/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const u = req.body || {};
    const allowed = ["name", "hospital", "email", "phone", "address", "city", "state", "type", "licenseNumber", "capacity", "status", "verificationStatus", "bloodStock", "staffCount"];
    const $set = {};
    allowed.forEach(k => { if (u[k] !== undefined) $set[k] = u[k]; });

    let updated = null;
    if (mongoose.connection.readyState === 1 && mongoose.models.BloodBank) {
      updated = await mongoose.models.BloodBank.findOneAndUpdate({ $or: [{ _id: id }, { clerkId: id }] }, { $set }, { new: true }).lean();
    }
    await logAudit(req, "BLOOD_BANK_UPDATED", "Blood Banks", `Updated blood bank ${id}`, id, u.name || id, null, $set);
    res.status(200).json({ success: true, message: "Blood bank updated.", bloodBank: updated || { _id: id, ...$set } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Blood Bank Action (approve / activate / deactivate / suspend / restore / verify)
router.patch("/api/admin/blood-banks/:id/action", async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const map = {
      approve: { verificationStatus: "Verified", status: "Active" },
      verify: { verificationStatus: "Verified" },
      activate: { status: "Active" },
      deactivate: { status: "Inactive" },
      suspend: { status: "Suspended" },
      restore: { status: "Active", isDeleted: false },
      reject: { verificationStatus: "Rejected", status: "Inactive" }
    };
    const patch = map[action] || { status: "Active" };
    if (mongoose.connection.readyState === 1 && mongoose.models.BloodBank) {
      await mongoose.models.BloodBank.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: patch });
    }
    await logAudit(req, `BLOOD_BANK_${String(action).toUpperCase()}`, "Blood Banks", `Blood bank ${id} action '${action}'`, id, "", null, patch);
    res.status(200).json({ success: true, message: `Blood bank action '${action}' completed.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Soft-delete Blood Bank
router.delete("/api/admin/blood-banks/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (mongoose.connection.readyState === 1 && mongoose.models.BloodBank) {
      await mongoose.models.BloodBank.updateOne({ $or: [{ _id: id }, { clerkId: id }] }, { $set: { isDeleted: true, status: "Deleted" } });
    }
    await logAudit(req, "BLOOD_BANK_DELETED", "Blood Banks", `Soft-deleted blood bank ${id}`, id);
    res.status(200).json({ success: true, message: "Blood bank deactivated." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 8. APPOINTMENTS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
// Normalize a donor blood-donation Appointment doc into the admin table shape
const normalizeDonationAppointment = (a, donorNameMap = {}) => ({
  _id: a._id,
  patientName: donorNameMap[a.donorId] || a.donorName || a.donorId || "Donor",
  type: "Blood Donation",
  doctor: a.doctor || "Staff Nurse",
  hospital: a.bloodBankName || a.hospital || "",
  date: a.date || "",
  time: a.time || "",
  status: a.status === "Upcoming" ? "Scheduled" : (a.status === "Rescheduled" ? "Scheduled" : (a.status === "No Show" ? "Cancelled" : a.status)),
  rawStatus: a.status,
  source: "donation",
  remarks: a.remarks || a.instructions || "",
  createdAt: a.createdAt || new Date().toISOString()
});

// Normalize a PatientAppointment doc into the admin table shape
const normalizePatientAppointment = (a) => ({
  _id: a._id,
  patientName: a.patientName || "Patient",
  type: a.department ? `${a.department} (${a.speciality || "General"})` : (a.speciality || "Consultation"),
  doctor: a.doctorName || "Not Assigned",
  hospital: a.hospitalName || "",
  date: a.appointmentDate || "",
  time: a.appointmentTime || "",
  status: a.status || "Pending",
  rawStatus: a.status,
  source: "patient",
  appointmentNumber: a.appointmentNumber,
  remarks: a.reason || "",
  createdAt: a.createdAt || new Date().toISOString()
});

router.get("/api/admin/appointments-list", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { status, type, search, date } = req.query;

  try {
    let appointments = [];

    if (isDbConnected) {
      // Donor name lookup for donation appointments
      const donorNameMap = {};
      if (mongoose.models.Donor) {
        try {
          const donors = await mongoose.models.Donor.find({}, { profile: 1 }).lean();
          donors.forEach(d => {
            donorNameMap[d._id] = d.profile?.fullName || `${d.profile?.firstName || ""} ${d.profile?.lastName || ""}`.trim();
          });
        } catch (e) {}
      }

      if (mongoose.models.Appointment) {
        const docs = await mongoose.models.Appointment.find({}).sort({ createdAt: -1 }).lean();
        appointments.push(...docs.map(a => normalizeDonationAppointment(a, donorNameMap)));
      }
      if (mongoose.models.PatientAppointment) {
        const docs = await mongoose.models.PatientAppointment.find({}).sort({ createdAt: -1 }).lean();
        appointments.push(...docs.map(normalizePatientAppointment));
      }
    }

    if (!appointments || appointments.length === 0) {
      appointments = [
        { _id: "apt001", patientName: "Rahul Sharma", type: "Doctor Consultation", doctor: "Dr. John Smith", hospital: "Apollo Hospital Delhi", date: "2026-07-08", time: "10:30 AM", status: "Scheduled", remarks: "Routine cardiac evaluation" },
        { _id: "apt002", patientName: "Priya Patel", type: "Blood Donation", doctor: "Staff Nurse Neha", hospital: "AIIMS Blood Bank", date: "2026-07-08", time: "11:15 AM", status: "Completed", remarks: "Whole blood donation 450ml" },
        { _id: "apt003", patientName: "Amitabh Verma", type: "Doctor Consultation", doctor: "Dr. Sarah Johnson", hospital: "Fortis Hospital Bangalore", date: "2026-07-09", time: "02:00 PM", status: "Pending", remarks: "Neurology follow-up" },
        { _id: "apt004", patientName: "Deepak Soni", type: "Blood Component Draw", doctor: "Lab Tech Ramesh", hospital: "Central Blood Bank Hub", date: "2026-07-09", time: "03:30 PM", status: "Scheduled", remarks: "Platelet donor intake" },
        { _id: "apt005", patientName: "Sunita Roy", type: "Doctor Consultation", doctor: "Dr. Arjun Mehta", hospital: "Max Healthcare Delhi", date: "2026-07-10", time: "09:00 AM", status: "Cancelled", remarks: "Patient rescheduled" }
      ];
    }

    if (status && status !== "all") {
      appointments = appointments.filter(a => (a.status || "").toLowerCase() === status.toLowerCase());
    }
    if (type && type !== "all") {
      const t = type.toLowerCase();
      appointments = appointments.filter(a => a.type?.toLowerCase().includes(t));
    }
    if (date) {
      appointments = appointments.filter(a => a.date === date);
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      appointments = appointments.filter(a =>
        a.patientName?.toLowerCase().includes(s) ||
        a.doctor?.toLowerCase().includes(s) ||
        a.hospital?.toLowerCase().includes(s) ||
        a.type?.toLowerCase().includes(s)
      );
    }

    const { items, pagination } = paginateResults(appointments, req);
    res.status(200).json({ success: true, appointments: items, data: items, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Appointment (Admin) — stored in PatientAppointment for hospital consults,
// or Appointment (donation) when appointmentKind === "donation"
router.post("/api/admin/appointments/create", async (req, res) => {
  try {
    const {
      appointmentKind = "consultation",
      patientName, patientId, patientEmail, patientPhone,
      hospitalName, hospitalId, doctorName, doctorId,
      department, speciality, date, time, reason, status
    } = req.body || {};

    if (!date || !time) {
      return res.status(400).json({ success: false, message: "Date and time are required." });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    let created = null;

    if (appointmentKind === "donation") {
      if (isDbConnected && mongoose.models.Appointment) {
        created = await mongoose.models.Appointment.create({
          _id: "apt_" + generateCustomId(),
          donorId: patientId || "admin_donor",
          clerkId: "admin_console",
          bloodBankId: hospitalId || "central",
          bloodBankName: hospitalName || "Central Blood Bank",
          bloodBankAddress: "",
          date,
          time,
          doctor: doctorName || "",
          status: "Scheduled",
          remarks: reason || ""
        });
      }
    } else if (isDbConnected && mongoose.models.PatientAppointment) {
      const aptNumber = "APT-" + Date.now().toString().slice(-8);
      created = await mongoose.models.PatientAppointment.create({
        _id: "apt_" + generateCustomId(),
        appointmentNumber: aptNumber,
        patientId: patientId || "admin_patient",
        patientName: patientName || "Patient",
        patientEmail: patientEmail || "",
        patientPhone: patientPhone || "",
        hospitalId: hospitalId || "",
        hospitalName: hospitalName || "",
        doctorId: doctorId || "",
        doctorName: doctorName || "",
        department: department || "General",
        speciality: speciality || "General Medicine",
        appointmentDate: date,
        appointmentTime: time,
        reason: reason || "",
        status: status || "Pending",
        timeline: [{ status: status || "Pending", updatedBy: "admin", updatedByName: "Super Administrator", timestamp: new Date().toISOString(), notes: "Created via Admin Console" }]
      });
    }

    await logAudit(req, "APPOINTMENT_CREATED", "Appointments", `Created ${appointmentKind} appointment for ${patientName || "patient"} on ${date} ${time}`, created?._id || "", patientName || "", null, req.body);
    res.status(201).json({ success: true, message: "Appointment created successfully.", appointment: created });
  } catch (err) {
    console.error("Create appointment error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update / Reschedule Appointment
router.put("/api/admin/appointments/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const u = req.body || {};

    if (mongoose.connection.readyState === 1 && mongoose.models.PatientAppointment) {
      const paPatch = {};
      if (u.patientName !== undefined) paPatch.patientName = u.patientName;
      if (u.doctorName !== undefined) paPatch.doctorName = u.doctorName;
      if (u.hospitalName !== undefined) paPatch.hospitalName = u.hospitalName;
      if (u.department !== undefined) paPatch.department = u.department;
      if (u.speciality !== undefined) paPatch.speciality = u.speciality;
      if (u.date !== undefined) paPatch.appointmentDate = u.date;
      if (u.time !== undefined) paPatch.appointmentTime = u.time;
      if (u.reason !== undefined) paPatch.reason = u.reason;
      if (u.status !== undefined) paPatch.status = u.status;
      if (Object.keys(paPatch).length) {
        const updated = await mongoose.models.PatientAppointment.findOneAndUpdate({ _id: id }, { $set: paPatch }, { new: true }).lean();
        if (updated) {
          await logAudit(req, "APPOINTMENT_UPDATED", "Appointments", `Updated appointment ${id}`, id, u.patientName || id, null, paPatch);
          return res.status(200).json({ success: true, message: "Appointment updated.", appointment: updated });
        }
      }
    }

    if (mongoose.connection.readyState === 1 && mongoose.models.Appointment) {
      const aPatch = {};
      if (u.date !== undefined) aPatch.date = u.date;
      if (u.time !== undefined) aPatch.time = u.time;
      if (u.doctor !== undefined || u.doctorName !== undefined) aPatch.doctor = u.doctor || u.doctorName;
      if (u.hospitalName !== undefined || u.hospital !== undefined) aPatch.bloodBankName = u.hospitalName || u.hospital;
      if (u.status !== undefined) aPatch.status = u.status === "Scheduled" ? "Upcoming" : u.status;
      if (u.reason !== undefined) aPatch.remarks = u.reason;
      if (Object.keys(aPatch).length) {
        const updated = await mongoose.models.Appointment.findOneAndUpdate({ _id: id }, { $set: aPatch }, { new: true }).lean();
        if (updated) {
          await logAudit(req, "APPOINTMENT_UPDATED", "Appointments", `Updated donation appointment ${id}`, id, "", null, aPatch);
          return res.status(200).json({ success: true, message: "Appointment updated.", appointment: updated });
        }
      }
    }

    res.status(404).json({ success: false, message: "Appointment not found." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/api/admin/appointments/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    // Map admin-friendly statuses onto each schema's allowed values
    const patientStatusMap = { Scheduled: "Approved", Pending: "Pending", Completed: "Completed", Cancelled: "Cancelled", Approved: "Approved", Rejected: "Rejected" };
    const donationStatusMap = { Scheduled: "Upcoming", Pending: "Upcoming", Completed: "Completed", Cancelled: "Cancelled", Approved: "Upcoming", Rejected: "Cancelled" };

    let updated = null;
    if (mongoose.connection.readyState === 1 && mongoose.models.PatientAppointment) {
      const mapped = patientStatusMap[status] || status;
      const patch = { status: mapped };
      if (remarks !== undefined) patch.doctorRemarks = remarks;
      updated = await mongoose.models.PatientAppointment.findOneAndUpdate({ _id: id }, { $set: patch }, { new: true }).lean();
      if (updated) {
        patch.timeline = [{ status: mapped, updatedBy: "admin", updatedByName: "Super Administrator", timestamp: new Date().toISOString(), notes: remarks || "" }];
        await mongoose.models.PatientAppointment.updateOne({ _id: id }, { $push: { timeline: patch.timeline[0] } });
      }
    }
    if (!updated && mongoose.connection.readyState === 1 && mongoose.models.Appointment) {
      const mapped = donationStatusMap[status] || status;
      const patch = { status: mapped };
      if (remarks !== undefined) patch.remarks = remarks;
      updated = await mongoose.models.Appointment.findOneAndUpdate({ _id: id }, { $set: patch }, { new: true }).lean();
    }

    await logAudit(req, "APPOINTMENT_STATUS", "Appointments", `Changed appointment ${id} status to ${status}`, id, "", null, { status, remarks });
    res.status(200).json({ success: true, message: `Appointment status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 9. BLOOD REQUESTS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/blood-requests-list", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { status, urgency, bloodGroup, search } = req.query;

  try {
    let requests = [];
    if (isDbConnected && mongoose.models.BloodRequest) {
      requests = await mongoose.models.BloodRequest.find({}).sort({ createdAt: -1 }).lean();
    }

    if (!requests || requests.length === 0) {
      const emFile = path.join(__dirname, "mockEmergencyRequests.json");
      if (fs.existsSync(emFile)) {
        try {
          requests = JSON.parse(fs.readFileSync(emFile, "utf8"));
        } catch (e) {}
      }
    }

    if (!requests || requests.length === 0) {
      requests = [
        { _id: "req101", patientName: "Rahul Patel", bloodGroup: "O-", units: 2, hospitalName: "Apollo Hospital Delhi", urgency: "Critical", status: "Pending", contactNumber: "+91 98111 00011", createdAt: new Date(Date.now() - 15*60000).toISOString() },
        { _id: "req102", patientName: "Priya Sharma", bloodGroup: "B+", units: 1, hospitalName: "Fortis Hospital Bangalore", urgency: "High", status: "Approved", contactNumber: "+91 98222 00022", createdAt: new Date(Date.now() - 45*60000).toISOString() },
        { _id: "req103", patientName: "Amit Shah", bloodGroup: "A+", units: 3, hospitalName: "AIIMS New Delhi", urgency: "Normal", status: "Dispatched", contactNumber: "+91 98333 00033", createdAt: new Date(Date.now() - 120*60000).toISOString() },
        { _id: "req104", patientName: "Sunita Kumari", bloodGroup: "AB-", units: 1, hospitalName: "Narayana Health", urgency: "Critical", status: "Completed", contactNumber: "+91 98444 00044", createdAt: new Date(Date.now() - 360*60000).toISOString() }
      ];
    }

    // Normalize contact field used by admin UI
    requests = requests.map(r => ({ ...r, contactNumber: r.contactNumber || r.patientPhone || "" }));

    if (status && status !== "all") {
      requests = requests.filter(r => (r.status || "").toLowerCase() === status.toLowerCase());
    }
    if (urgency && urgency !== "all") {
      requests = requests.filter(r => (r.urgency || "").toLowerCase() === urgency.toLowerCase());
    }
    if (bloodGroup && bloodGroup !== "all") {
      requests = requests.filter(r => r.bloodGroup === bloodGroup);
    }
    if (search && search.trim()) {
      const s = search.toLowerCase();
      requests = requests.filter(r =>
        r.patientName?.toLowerCase().includes(s) ||
        r.hospitalName?.toLowerCase().includes(s) ||
        r.bloodBankName?.toLowerCase().includes(s) ||
        r.requestNumber?.toLowerCase().includes(s)
      );
    }

    const { items, pagination } = paginateResults(requests, req);
    res.status(200).json({ success: true, requests: items, data: items, pagination });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Create Blood Request (Admin / walk-in)
router.post("/api/admin/blood-requests/create", async (req, res) => {
  try {
    const {
      patientName, patientId, patientEmail, patientPhone,
      bloodGroup, units, hospitalName, hospitalId, bloodBankId, bloodBankName,
      urgency, reason, state, city, requiredDate
    } = req.body || {};

    if (!patientName || !bloodGroup || !units) {
      return res.status(400).json({ success: false, message: "Patient name, blood group and units are required." });
    }

    const requestNumber = "BR-" + Date.now().toString().slice(-8) + Math.floor(Math.random() * 90 + 10);
    const doc = {
      _id: "req_" + generateCustomId(),
      requestNumber,
      patientId: patientId || "admin_patient",
      patientName,
      patientEmail: patientEmail || "",
      patientPhone: patientPhone || "",
      bloodGroup,
      units: parseInt(units) || 1,
      hospitalId: hospitalId || "",
      hospitalName: hospitalName || "",
      bloodBankId: bloodBankId || "",
      bloodBankName: bloodBankName || "",
      state: state || "",
      city: city || "",
      status: "Pending",
      urgency: urgency || "Normal",
      reason: reason || "Admin created request",
      requiredDate: requiredDate || "",
      timeline: [{
        status: "Pending",
        updatedBy: "admin",
        updatedByName: "Super Administrator",
        timestamp: new Date().toISOString(),
        notes: "Request created via Admin Console"
      }]
    };

    let created = null;
    if (mongoose.connection.readyState === 1 && mongoose.models.BloodRequest) {
      created = await mongoose.models.BloodRequest.create(doc);
    }

    await logAudit(req, "REQUEST_CREATED", "Blood Requests", `Created blood request ${requestNumber} for ${patientName} (${bloodGroup} x${units})`, doc._id, patientName, null, doc);
    res.status(201).json({ success: true, message: "Blood request created.", request: created || doc });
  } catch (err) {
    console.error("Create blood request error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch("/api/admin/blood-requests/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, hospitalAssigned, bloodBankName, rejectionReason } = req.body;
    const adminName = req.headers["x-admin-name"] || "Super Administrator";

    const $set = { status };
    const $push = {
      timeline: {
        status,
        updatedBy: "admin",
        updatedByName: adminName,
        timestamp: new Date().toISOString(),
        notes: rejectionReason || ""
      }
    };
    const now = new Date().toISOString();

    // Record lifecycle metadata for auditability
    if (/under verification|approved/i.test(status)) { $set.verifiedBy = adminName; $set.verifiedDate = now; }
    if (/approved|forwarded|blood ready|dispatched/i.test(status)) { $set.approvedBy = adminName; $set.approvedDate = now; }
    if (/forwarded|blood ready|dispatched/i.test(status)) {
      $set.forwardedBy = adminName;
      $set.forwardedDate = now;
      if (hospitalAssigned) $set.hospitalAssigned = hospitalAssigned;
      if (bloodBankName || hospitalAssigned) $set.bloodBankName = bloodBankName || hospitalAssigned;
    }
    if (/completed/i.test(status)) { $set.completedDate = now; }
    if (/rejected/i.test(status) && rejectionReason) $set.rejectionReason = rejectionReason;

    if (mongoose.connection.readyState === 1 && mongoose.models.BloodRequest) {
      await mongoose.models.BloodRequest.findOneAndUpdate(
        { $or: [{ _id: id }, { requestNumber: id }] },
        { $set, $push },
        { new: true }
      );
    }

    await logAudit(req, "REQUEST_STATUS", "Blood Requests", `Changed request ${id} status to ${status}${hospitalAssigned ? " (Assigned to " + hospitalAssigned + ")" : ""}`, id, "", null, { status, hospitalAssigned, rejectionReason });

    res.status(200).json({ success: true, message: `Request status updated to ${status}.` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 10. ROLES & PERMISSIONS MATRIX API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/roles-permissions", (req, res) => {
  const settings = getSettings();
  res.status(200).json({ success: true, permissions: settings.rolesPermissions });
});

router.put("/api/admin/roles-permissions", async (req, res) => {
  try {
    const settings = getSettings();
    settings.rolesPermissions = {
      ...settings.rolesPermissions,
      ...req.body
    };
    // Ensure Super Admin remains permanently fully privileged
    settings.rolesPermissions.super_admin = { view: true, add: true, edit: true, delete: true, approve: true, export: true, manage: true };

    saveSettings(settings);
    await logAudit(req, "PERMISSIONS_UPDATED", "Role & Permissions", "Updated role permissions matrix", "", "", null, settings.rolesPermissions);

    res.status(200).json({ success: true, message: "Role permissions saved successfully.", permissions: settings.rolesPermissions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 11. REPORTS & ANALYTICS API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/reports-data", async (req, res) => {
  const { timeframe = "30days" } = req.query;

  try {
    const reportData = {
      generatedAt: new Date().toISOString(),
      timeframe,
      metrics: {
        totalDonations: 462,
        fulfilledRequests: 388,
        averageFulfillmentMinutes: 28,
        activeDonors: 194,
        criticalCasesHandled: 42,
        stockUtilizationRate: "94.2%"
      },
      bloodGroupFulfillment: [
        { group: "O+", requested: 160, fulfilled: 156, rate: "97.5%" },
        { group: "A+", requested: 120, fulfilled: 118, rate: "98.3%" },
        { group: "B+", requested: 95, fulfilled: 92, rate: "96.8%" },
        { group: "AB+", requested: 45, fulfilled: 44, rate: "97.7%" },
        { group: "O-", requested: 32, fulfilled: 28, rate: "87.5%" },
        { group: "A-", requested: 18, fulfilled: 16, rate: "88.8%" },
        { group: "B-", requested: 16, fulfilled: 15, rate: "93.7%" },
        { group: "AB-", requested: 12, fulfilled: 10, rate: "83.3%" }
      ],
      topHospitals: [
        { name: "AIIMS New Delhi", unitsIssued: 142, requests: 94 },
        { name: "Apollo Hospital Delhi", unitsIssued: 118, requests: 82 },
        { name: "Fortis Hospital Mulund", unitsIssued: 98, requests: 64 },
        { name: "Max Healthcare Saket", unitsIssued: 86, requests: 58 }
      ]
    };

    res.status(200).json({ success: true, report: reportData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 12. NOTIFICATIONS MANAGEMENT API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/notifications-list", (req, res) => {
  const notifFile = path.join(__dirname, "adminNotifications.json");
  let notifications = [
    { _id: "notif_1", target: "All Users", targetRole: "all", title: "National Voluntary Blood Donation Day", message: "Join our nationwide live drive across 200+ partner hospital blood centers this weekend.", type: "info", sentAt: new Date(Date.now() - 3600000*24).toISOString(), deliveredCount: 1482 },
    { _id: "notif_2", target: "Donors (O- Group)", targetRole: "donor", title: "Urgent: O- Negative Blood Needed", message: "Emergency requisition alert in Delhi-NCR. Eligible O- donors are requested to schedule intake.", type: "urgent", sentAt: new Date(Date.now() - 3600000*6).toISOString(), deliveredCount: 68 },
    { _id: "notif_3", target: "Hospital Staff", targetRole: "hospital_staff", title: "Cold Chain Sensor Protocol Update", message: "Please verify temperature telemetry sync on batch units received after 06:00 AM.", type: "alert", sentAt: new Date(Date.now() - 3600000*2).toISOString(), deliveredCount: 124 }
  ];

  if (fs.existsSync(notifFile)) {
    try {
      notifications = JSON.parse(fs.readFileSync(notifFile, "utf8"));
    } catch (e) {}
  }

  res.status(200).json({ success: true, notifications });
});

router.post("/api/admin/notifications/broadcast", async (req, res) => {
  try {
    const { targetRole = "all", title, message, type = "info" } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: "Title and message are required." });
    }

    const notifFile = path.join(__dirname, "adminNotifications.json");
    let list = [];
    if (fs.existsSync(notifFile)) {
      try { list = JSON.parse(fs.readFileSync(notifFile, "utf8")); } catch (e) {}
    }

    const newNotif = {
      _id: "notif_" + generateCustomId(),
      target: targetRole === "all" ? "All Users" : targetRole.replace("_", " ").toUpperCase(),
      targetRole,
      title,
      message,
      type,
      sentAt: new Date().toISOString(),
      deliveredCount: targetRole === "all" ? 1490 : 85
    };

    list.unshift(newNotif);
    fs.writeFileSync(notifFile, JSON.stringify(list, null, 2), "utf8");

    await logAudit(req, "NOTIFICATION_BROADCAST", "Notifications", `Broadcast '${title}' to target: ${targetRole}`, newNotif._id, title, null, newNotif);

    res.status(201).json({ success: true, message: "Notification broadcast sent successfully.", notification: newNotif });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 13. AUDIT LOGS API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/audit-logs", async (req, res) => {
  const { module, search, limit = 100 } = req.query;

  try {
    let logs = [];
    if (mongoose.connection.readyState === 1) {
      const query = {};
      if (module && module !== "all") query.module = module;
      if (search && search.trim()) {
        query.$or = [
          { action: { $regex: search, $options: "i" } },
          { details: { $regex: search, $options: "i" } },
          { adminName: { $regex: search, $options: "i" } }
        ];
      }
      logs = await AdminAuditLog.find(query).sort({ timestamp: -1 }).limit(parseInt(limit)).lean();
    }

    if (!logs || logs.length === 0) {
      const auditFile = path.join(__dirname, "auditLogs.json");
      if (fs.existsSync(auditFile)) {
        try {
          logs = JSON.parse(fs.readFileSync(auditFile, "utf8"));
          if (module && module !== "all") logs = logs.filter(l => l.module === module);
          if (search && search.trim()) {
            const s = search.toLowerCase();
            logs = logs.filter(l => l.action?.toLowerCase().includes(s) || l.details?.toLowerCase().includes(s) || l.adminName?.toLowerCase().includes(s));
          }
        } catch (e) {}
      }
    }

    if (!logs || logs.length === 0) {
      logs = [
        { _id: "log1", adminName: "Super Administrator", module: "User Management", action: "USER_STATUS_ACTIVE", details: "Activated hospital staff user account for Dr. Mehta", timestamp: new Date(Date.now() - 10*60000).toISOString(), ipAddress: "127.0.0.1" },
        { _id: "log2", adminName: "Super Administrator", module: "Blood Inventory", action: "STOCK_ADDED", details: "Added 25 units of O+ blood to Apollo Hospital Hub", timestamp: new Date(Date.now() - 35*60000).toISOString(), ipAddress: "127.0.0.1" },
        { _id: "log3", adminName: "Super Administrator", module: "Blood Requests", action: "REQUEST_APPROVED", details: "Approved urgent request for 2 units O- for Rahul Patel", timestamp: new Date(Date.now() - 75*60000).toISOString(), ipAddress: "127.0.0.1" },
        { _id: "log4", adminName: "Super Administrator", module: "Settings", action: "SETTINGS_UPDATED", details: "Updated notification low stock threshold to 15 units", timestamp: new Date(Date.now() - 180*60000).toISOString(), ipAddress: "127.0.0.1" }
      ];
    }

    res.status(200).json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 14. SETTINGS API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/settings", (req, res) => {
  const settings = getSettings();
  res.status(200).json({ success: true, settings });
});

router.put("/api/admin/settings", async (req, res) => {
  try {
    const current = getSettings();
    const updated = {
      ...current,
      ...req.body,
      rolesPermissions: {
        ...current.rolesPermissions,
        ...(req.body.rolesPermissions || {})
      }
    };
    saveSettings(updated);
    await logAudit(req, "SETTINGS_MODIFIED", "Settings", "Updated website and system configuration preferences", "", "", current, updated);
    res.status(200).json({ success: true, message: "Settings saved successfully.", settings: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────
// 15. SYSTEM MONITORING API
// ─────────────────────────────────────────────────────────────
router.get("/api/admin/system-monitoring", (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const memory = process.memoryUsage();

  res.status(200).json({
    success: true,
    system: {
      status: "Operational",
      uptimeSeconds: Math.floor(process.uptime()),
      database: {
        status: isDbConnected ? "Connected" : "Degraded / Offline Fallback",
        readyState: mongoose.connection.readyState,
        name: mongoose.connection.name || "Hospital_Management",
        collectionsCount: Object.keys(mongoose.connection.collections || {}).length || 18,
        host: "hospital.0xnylcb.mongodb.net (Atlas Replica Set)"
      },
      memory: {
        heapUsedMB: Math.round(memory.heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(memory.heapTotal / 1024 / 1024),
        rssMB: Math.round(memory.rss / 1024 / 1024)
      },
      environment: process.env.NODE_ENV || "production",
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      serverTime: new Date().toISOString(),
      socketConnections: 3,
      apiLatencyMs: 14
    }
  });
});

module.exports = router;

