/**
 * HemoCare Notification API Routes
 * Role-aware endpoints for fetching, marking, filtering, and configuring notifications.
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");

let globalIo = null;
function setSocketIo(io) {
  globalIo = io;
}
router.setSocketIo = setSocketIo;

function isValidObjectId(id) {
  if (!id || typeof id !== "string") return false;
  return mongoose.Types.ObjectId.isValid(id) && String(new mongoose.Types.ObjectId(id)) === String(id);
}

function buildSafeUserQuery(userId) {
  if (!userId) return [];
  const or = [{ clerkId: userId }, { email: userId }];
  if (isValidObjectId(userId)) {
    or.push({ _id: new mongoose.Types.ObjectId(userId) });
  }
  return or;
}

// Helper to resolve all user IDs across collections safely
async function resolveAllUserIds(userId, role = "") {
  const idSet = new Set();
  if (userId) idSet.add(userId);
  if (!userId) return Array.from(idSet);

  const safeQueries = buildSafeUserQuery(userId);
  if (safeQueries.length === 0) {
    return Array.from(idSet);
  }

  try {
    const Patient = mongoose.models.Patient;
    if (Patient) {
      const p = await Patient.findOne({ $or: safeQueries }).lean();
      if (p) {
        if (p.clerkId) idSet.add(p.clerkId);
        if (p._id) idSet.add(p._id.toString());
        if (p.email) idSet.add(p.email);
      }
    }
    const HospitalStaff = mongoose.models.HospitalStaff;
    if (HospitalStaff) {
      const hs = await HospitalStaff.findOne({ $or: safeQueries }).lean();
      if (hs) {
        if (hs.clerkId) idSet.add(hs.clerkId);
        if (hs._id) idSet.add(hs._id.toString());
        if (hs.email) idSet.add(hs.email);
      }
    }
    const BloodBankStaff = mongoose.models.BloodBankStaff;
    if (BloodBankStaff) {
      const bbs = await BloodBankStaff.findOne({ $or: safeQueries }).lean();
      if (bbs) {
        if (bbs.clerkId) idSet.add(bbs.clerkId);
        if (bbs._id) idSet.add(bbs._id.toString());
        if (bbs.email) idSet.add(bbs.email);
      }
    }
    const Donor = mongoose.models.Donor;
    if (Donor) {
      const d = await Donor.findOne({ $or: safeQueries }).lean();
      if (d) {
        if (d.clerkId) idSet.add(d.clerkId);
        if (d._id) idSet.add(d._id.toString());
        if (d.email) idSet.add(d.email);
      }
    }
    const UserProfile = mongoose.models.UserProfile;
    if (UserProfile) {
      const up = await UserProfile.findOne({ $or: safeQueries }).lean();
      if (up) {
        if (up.clerkId) idSet.add(up.clerkId);
        if (up._id) idSet.add(up._id.toString());
        if (up.email) idSet.add(up.email);
      }
    }
  } catch (err) {
    console.warn("[resolveAllUserIds] Warning:", err.message);
  }
  return Array.from(idSet);
}

// Fallback generic notifications route
router.get("/api/notifications", async (req, res) => {
  try {
    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      return res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
    }
    const notifications = await Notification.find({ isArchived: { $ne: true } })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, notifications, unreadCount: 0 });
  } catch (err) {
    res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
  }
});

// Get notifications for a user with comprehensive filtering & tabs
router.get("/api/notifications/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { tab = "all", limit = 100, search = "", role = "" } = req.query;

    const isDbConnected = mongoose.connection.readyState === 1;
    if (!isDbConnected) {
      return res.status(200).json({ success: true, notifications: [], unreadCount: 0 });
    }

    const idList = await resolveAllUserIds(userId, role);

    // Build or conditions
    const orConditions = [
      { recipientUserId: { $in: idList } },
      { userId: { $in: idList } }
    ];

    if (role) {
      orConditions.push({ recipientRole: role });
      if (role === "hospital_staff") {
        orConditions.push({ recipientRole: "hospital" }, { recipientRole: "hospital_staff_general" });
      } else if (role === "blood_bank_staff") {
        orConditions.push({ recipientRole: "blood_bank" }, { recipientRole: "blood_bank_staff_general" });
      }
    }

    const filter = {
      $or: orConditions,
      isArchived: { $ne: true },
    };

    if (tab === "unread") {
      filter.$and = [{ isRead: false }, { read: false }];
    } else if (tab === "requests") {
      filter.relatedEntityType = "BloodRequest";
    } else if (tab === "appointments") {
      filter.relatedEntityType = "Appointment";
    } else if (tab === "donations") {
      filter.relatedEntityType = "Donation";
    } else if (tab === "messages") {
      filter.relatedEntityType = "Message";
    } else if (tab === "system") {
      filter.relatedEntityType = { $in: ["System", "Stock", "Other"] };
    }

    if (search && search.trim() !== "") {
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { message: { $regex: search, $options: "i" } },
          { requestId: { $regex: search, $options: "i" } },
        ]
      });
    }

    const rawNotifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit, 10));

    // Deduplicate any duplicate notifications (e.g. double created within 60s window)
    const seen = new Set();
    const notifications = [];
    for (const notif of rawNotifications) {
      const timeBucket = notif.createdAt ? Math.floor(new Date(notif.createdAt).getTime() / 60000) : 0;
      const key = `${notif.title}_${notif.message}_${timeBucket}`;
      if (!seen.has(key)) {
        seen.add(key);
        notifications.push(notif);
      }
    }

    const unreadCount = await Notification.countDocuments({
      $or: orConditions,
      isRead: false,
      read: false,
      isArchived: { $ne: true },
    });

    res.status(200).json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (err) {
    console.error("[NotificationAPI] Error fetching notifications:", err);
    res.status(500).json({ success: false, message: "Error fetching notifications.", error: err.message });
  }
});

// Create and store a notification (e.g. from popup toast or client action)
router.post("/api/notifications", async (req, res) => {
  try {
    const {
      recipientUserId,
      userId,
      recipientRole,
      title,
      message,
      notificationType,
      relatedEntityType,
      relatedEntityId,
      requestId,
      priority,
      actionUrl,
    } = req.body;

    const targetUserId = recipientUserId || userId;
    if (!targetUserId || !title) {
      return res.status(400).json({ success: false, message: "Missing recipientUserId or title." });
    }

    const notif = await notificationService.createAndSendNotification({
      recipientUserId: targetUserId,
      recipientRole: recipientRole || "patient",
      title,
      message: message || "",
      notificationType: notificationType || "System Notification",
      relatedEntityType: relatedEntityType || "System",
      relatedEntityId: relatedEntityId || "",
      requestId: requestId || "",
      priority: priority || "Normal",
      actionUrl: actionUrl || "",
    });

    res.status(201).json({ success: true, notification: notif });
  } catch (err) {
    console.error("[NotificationAPI] Error creating notification via POST:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Backward-compatible alias routes for role-specific fetches
router.get(["/api/donor/:userId/notifications", "/api/patient/:userId/notifications", "/api/hospital-staff/:userId/notifications", "/api/bloodbank/:userId/notifications"], async (req, res) => {
  try {
    const { userId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json([]);
    }

    const notifications = await Notification.find({
      $or: [{ recipientUserId: userId }, { userId: userId }],
      isArchived: { $ne: true },
    }).sort({ createdAt: -1 }).limit(100);

    // Return array directly for legacy callers that expect raw array
    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json([]);
  }
});


// Quick unread count endpoint for topbar bells
router.get("/api/notifications/unread-count/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, unreadCount: 0 });
    }

    const count = await Notification.countDocuments({
      $or: [{ recipientUserId: userId }, { userId: userId }],
      isRead: false,
      read: false,
      isArchived: { $ne: true },
    });

    res.status(200).json({ success: true, unreadCount: count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark single notification as read
router.put("/api/notifications/:notificationId/read", async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: "Marked as read (offline mode)." });
    }

    const notification = await Notification.findById(notificationId);
    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found." });
    }

    notification.isRead = true;
    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    if (globalIo && notification.recipientUserId) {
      globalIo.to(`user-${notification.recipientUserId}`).emit("notification:read", {
        notificationId: notification._id,
        id: notification._id,
      });
      if (notification.userId && notification.userId !== notification.recipientUserId) {
        globalIo.to(`user-${notification.userId}`).emit("notification:read", {
          notificationId: notification._id,
          id: notification._id,
        });
      }
    }

    res.status(200).json({ success: true, message: "Notification marked as read successfully.", notification });
  } catch (err) {
    console.error("[NotificationAPI] Error marking notification as read:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark all notifications as read for a user (Supports PUT & POST, with aliases)
router.all(["/api/notifications/mark-all-read/:userId", "/api/notifications/mark-all-as-read/:userId"], async (req, res) => {
  try {
    const { userId } = req.params;
    const role = (req.query.role || req.body?.role || "").toLowerCase().trim();

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: "All marked as read (offline mode)." });
    }

    const idList = await resolveAllUserIds(userId, role);

    const orConditions = [
      { recipientUserId: { $in: idList } },
      { userId: { $in: idList } }
    ];

    idList.forEach(id => {
      if (isValidObjectId(id)) {
        orConditions.push({ recipientUserId: new mongoose.Types.ObjectId(id) });
        orConditions.push({ userId: new mongoose.Types.ObjectId(id) });
      }
    });

    if (role) {
      orConditions.push({ recipientRole: role });
      if (role === "hospital_staff" || role === "hospital") {
        orConditions.push({ recipientRole: "hospital_staff" }, { recipientRole: "hospital" }, { recipientRole: "hospital_staff_general" });
      } else if (role === "blood_bank_staff" || role === "blood_bank") {
        orConditions.push({ recipientRole: "blood_bank_staff" }, { recipientRole: "blood_bank" }, { recipientRole: "blood_bank_staff_general" });
      }
    }

    // 1. Update standalone Notification collection
    const updateResult = await Notification.updateMany(
      { $or: orConditions },
      { $set: { isRead: true, read: true, readAt: new Date() } }
    );

    // 2. Also update embedded notifications in collections safely
    try {
      const matchQueries = [{ clerkId: { $in: idList } }, { email: { $in: idList } }];
      const validObjIds = idList.filter(id => isValidObjectId(id)).map(id => new mongoose.Types.ObjectId(id));
      if (validObjIds.length > 0) {
        matchQueries.push({ _id: { $in: validObjIds } });
      }

      const embeddedUpdate = { $set: { "notifications.$[].read": true, "notifications.$[].isRead": true } };

      const Patient = mongoose.models.Patient;
      if (Patient) {
        await Patient.updateMany({ $or: matchQueries }, embeddedUpdate);
      }
      const HospitalStaff = mongoose.models.HospitalStaff;
      if (HospitalStaff) {
        await HospitalStaff.updateMany({ $or: matchQueries }, embeddedUpdate);
      }
      const BloodBankStaff = mongoose.models.BloodBankStaff;
      if (BloodBankStaff) {
        await BloodBankStaff.updateMany({ $or: matchQueries }, embeddedUpdate);
      }
      const Donor = mongoose.models.Donor;
      if (Donor) {
        await Donor.updateMany({ $or: matchQueries }, embeddedUpdate);
      }
    } catch (embErr) {
      console.warn("Embedded notifications update warning:", embErr.message);
    }

    // 3. Broadcast real-time clear to all user rooms
    if (globalIo) {
      idList.forEach((id) => {
        globalIo.to(`user-${id}`).emit("notification:all-read", { userId: id });
        globalIo.to(`user-${id}`).emit("notification:count", { count: 0 });
      });
      if (role) {
        globalIo.to(`role-${role}`).emit("notification:all-read", { role });
        globalIo.to(`role-${role}`).emit("notification:count", { count: 0 });
      }
    }

    res.status(200).json({
      success: true,
      message: "All notifications marked as read.",
      modifiedCount: updateResult.modifiedCount || 0
    });
  } catch (err) {
    console.error("[NotificationAPI] Error in mark-all-read:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// Archive / Delete single notification
router.delete("/api/notifications/:notificationId", async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: "Notification deleted." });
    }

    await Notification.findByIdAndUpdate(notificationId, { isArchived: true });
    res.status(200).json({ success: true, message: "Notification archived successfully." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get notification preferences
router.get("/api/notification-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({
        success: true,
        preferences: {
          emailNotifications: true,
          inAppNotifications: true,
          bloodRequestAlerts: true,
          appointmentAlerts: true,
          messageAlerts: true,
          stockAlerts: true,
          soundAlerts: true,
        },
      });
    }

    let prefs = await NotificationPreference.findOne({ userId });
    if (!prefs) {
      prefs = await NotificationPreference.create({ userId });
    }

    res.status(200).json({ success: true, preferences: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Update notification preferences
router.put("/api/notification-preferences/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, message: "Preferences saved (offline mode)." });
    }

    const prefs = await NotificationPreference.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, message: "Notification preferences updated.", preferences: prefs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SMTP Email Connectivity & Diagnostic Test
router.post("/api/notifications/test-email", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: "Recipient email is required for test." });
    }

    const testTemplate = emailService.EmailTemplates.systemAnnouncement({
      recipientName: "HemoCare Administrator",
      title: "HemoCare SMTP Diagnostic Test",
      message: "This test email confirms that your HemoCare SMTP email server is correctly connected, authenticated, and ready to dispatch real-time clinical notifications.",
    });

    const result = await emailService.sendEmail({
      to: email,
      subject: testTemplate.subject,
      html: testTemplate.html,
    });

    res.status(200).json({
      success: result.success,
      isConfigured: emailService.isConfigured(),
      details: result,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
