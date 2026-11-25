/**
 * HemoCare Centralized Notification Engine
 * Standardizes creation, storage, real-time dispatch, and SMTP email delivery
 * across all roles (Patient, Hospital Staff, Donor, Blood Bank Staff, Admin).
 */

const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const NotificationPreference = require("../models/NotificationPreference");
const emailService = require("./emailService");

let globalIo = null;

/**
 * Register Socket.IO instance with the notification engine
 */
function setSocketIo(io) {
  globalIo = io;
  console.log("[NotificationEngine] Socket.IO registered for real-time notification dispatch.");
}

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

/**
 * Resolves user email and full name from MongoDB collections or fallback stores
 */
async function resolveUserDetails(userId, roleHint = "") {
  if (!userId) return { email: "", name: "", role: roleHint, clerkId: "", mongoId: "" };

  const isDbConnected = mongoose.connection.readyState === 1;
  if (!isDbConnected) {
    return { email: "", name: "User", role: roleHint, clerkId: userId, mongoId: "" };
  }

  const safeQueries = buildSafeUserQuery(userId);
  if (safeQueries.length === 0) {
    return { email: "", name: "User", role: roleHint, clerkId: userId, mongoId: "" };
  }

  try {
    // 1. Check UserProfile
    const UserProfile = mongoose.models.UserProfile;
    if (UserProfile) {
      const up = await UserProfile.findOne({ $or: safeQueries }).lean();
      if (up) {
        return {
          email: up.email || "",
          name: up.fullName || "User",
          role: up.role || roleHint,
          clerkId: up.clerkId || "",
          mongoId: up._id ? up._id.toString() : "",
        };
      }
    }

    // 2. Check Patient
    const Patient = mongoose.models.Patient;
    if (Patient) {
      const p = await Patient.findOne({ $or: safeQueries }).lean();
      if (p) {
        return {
          email: p.email || "",
          name: p.profile?.fullName || `${p.profile?.firstName || ""} ${p.profile?.lastName || ""}`.trim() || "Patient",
          role: "patient",
          clerkId: p.clerkId || "",
          mongoId: p._id ? p._id.toString() : "",
        };
      }
    }

    // 3. Check Donor
    const Donor = mongoose.models.Donor;
    if (Donor) {
      const d = await Donor.findOne({ $or: safeQueries }).lean();
      if (d) {
        const name = d.profile?.fullName || `${d.profile?.firstName || ""} ${d.profile?.lastName || ""}`.trim() || "Donor";
        return {
          email: d.email || "",
          name,
          role: "donor",
          clerkId: d.clerkId || "",
          mongoId: d._id ? d._id.toString() : "",
        };
      }
    }

    // 4. Check HospitalStaff
    const HospitalStaff = mongoose.models.HospitalStaff;
    if (HospitalStaff) {
      const hs = await HospitalStaff.findOne({ $or: safeQueries }).lean();
      if (hs) {
        return {
          email: hs.email || "",
          name: hs.profile?.fullName || "Hospital Staff",
          role: "hospital_staff",
          clerkId: hs.clerkId || "",
          mongoId: hs._id ? hs._id.toString() : "",
        };
      }
    }

    // 5. Check BloodBankStaff
    const BloodBankStaff = mongoose.models.BloodBankStaff;
    if (BloodBankStaff) {
      const bbs = await BloodBankStaff.findOne({ $or: safeQueries }).lean();
      if (bbs) {
        return {
          email: bbs.email || "",
          name: bbs.profile?.fullName || "Blood Bank Officer",
          role: "blood_bank_staff",
          clerkId: bbs.clerkId || "",
          mongoId: bbs._id ? bbs._id.toString() : "",
        };
      }
    }
  } catch (err) {
    console.warn("[NotificationEngine] Error resolving user details:", err.message);
  }

  return { email: "", name: "User", role: roleHint, clerkId: (typeof userId === "string" && userId.startsWith("user_")) ? userId : "", mongoId: "" };
}

/**
 * Central notification dispatcher
 */
async function createAndSendNotification({
  recipientUserId,
  recipientRole,
  recipientEmail,
  recipientName,
  senderUserId = "system",
  senderRole = "system",
  senderName = "HemoCare System",
  title,
  message,
  notificationType = "System Notification",
  relatedEntityType = "System",
  relatedEntityId = "",
  requestId = "",
  priority = "Normal",
  actionUrl = "",
  emailPayload = null, // Optional custom { subject, html }
}) {
  try {
    if (!recipientUserId) {
      console.warn("[NotificationEngine] Aborted: recipientUserId is required.");
      return null;
    }

    // Resolve missing recipient details
    let resolvedEmail = recipientEmail;
    let resolvedName = recipientName;
    let resolvedRole = recipientRole;
    let resolvedClerkId = "";
    let resolvedMongoId = "";

    const details = await resolveUserDetails(recipientUserId, recipientRole);
    resolvedEmail = resolvedEmail || details.email;
    resolvedName = resolvedName || details.name;
    resolvedRole = resolvedRole || details.role || "patient";
    resolvedClerkId = details.clerkId;
    resolvedMongoId = details.mongoId;

    // Check user preferences
    let prefs = {
      emailNotifications: true,
      inAppNotifications: true,
      bloodRequestAlerts: true,
      appointmentAlerts: true,
      messageAlerts: true,
      stockAlerts: true,
    };

    if (mongoose.connection.readyState === 1) {
      try {
        const foundPrefs = await NotificationPreference.findOne({
          $or: [{ userId: recipientUserId }, { userId: resolvedClerkId }, { userId: resolvedMongoId }].filter(Boolean)
        });
        if (foundPrefs) {
          prefs = foundPrefs;
        }
      } catch (e) {
        // Continue with defaults
      }
    }

    let savedNotification = null;

    // 1. In-App Notification Record Creation
    if (prefs.inAppNotifications !== false) {
      const isDbConnected = mongoose.connection.readyState === 1;

      if (isDbConnected) {
        // Anti-spam deduplication: check if an identical notification was created within the last 15 seconds
        const duplicateWindow = new Date(Date.now() - 15000);
        const allTargetIds = [recipientUserId, resolvedClerkId, resolvedMongoId].filter(Boolean);
        const existingRecent = await Notification.findOne({
          $or: [
            { recipientUserId: { $in: allTargetIds } },
            { userId: { $in: allTargetIds } }
          ],
          title,
          message,
          createdAt: { $gte: duplicateWindow }
        });

        if (existingRecent) {
          console.log("[NotificationEngine] Suppressed duplicate notification within 15s:", title);
          savedNotification = existingRecent;
        } else {
          const notifDoc = new Notification({
            recipientUserId,
            recipientRole: resolvedRole,
            recipientEmail: resolvedEmail,
            recipientName: resolvedName,
            senderUserId,
            senderRole,
            senderName,
            title,
            message,
            notificationType,
            relatedEntityType,
            relatedEntityId,
            requestId,
            priority,
            actionUrl,
            isRead: false,
            emailStatus: prefs.emailNotifications && resolvedEmail ? "pending" : "skipped",
            // Backwards-compatible aliases:
            userId: resolvedClerkId || recipientUserId,
            userRole: resolvedRole,
            read: false,
            type: priority === "Critical" ? "alert" : priority === "High" ? "urgent" : "info",
          });

          savedNotification = await notifDoc.save();
        }
      } else {
        // Fallback transient object when database is offline
        savedNotification = {
          _id: "notif_" + Math.random().toString(36).substring(2, 9),
          recipientUserId,
          recipientRole: resolvedRole,
          recipientEmail: resolvedEmail,
          recipientName: resolvedName,
          senderUserId,
          senderRole,
          senderName,
          title,
          message,
          notificationType,
          relatedEntityType,
          relatedEntityId,
          requestId,
          priority,
          actionUrl,
          isRead: false,
          read: false,
          userId: resolvedClerkId || recipientUserId,
          createdAt: new Date().toISOString(),
        };
      }
    }

    // 2. Real-Time Socket.IO Dispatch (Multi-Room Coverage, Single Event Delivery)
    if (globalIo) {
      try {
        const notifPayload = savedNotification ? (savedNotification.toObject ? savedNotification.toObject() : savedNotification) : {
          recipientUserId,
          recipientRole: resolvedRole,
          title,
          message,
          priority,
          requestId,
          createdAt: new Date(),
        };

        // Multi-identifier user rooms
        const userRooms = new Set();
        if (recipientUserId) userRooms.add(`user-${recipientUserId}`);
        if (resolvedClerkId) userRooms.add(`user-${resolvedClerkId}`);
        if (resolvedMongoId) userRooms.add(`user-${resolvedMongoId}`);
        if (resolvedEmail) userRooms.add(`user-${resolvedEmail}`);

        // Broadcast once per user room
        userRooms.forEach((room) => {
          globalIo.to(room).emit("notification", notifPayload);
        });

        // Canonical role rooms
        const normRole = (resolvedRole || "").toLowerCase().trim();
        if (normRole) {
          globalIo.to(`role-${normRole}`).emit("role-notification", notifPayload);
          globalIo.to(normRole).emit("role-notification", notifPayload);

          if (normRole === "hospital_staff" || normRole === "hospital" || normRole === "doctor") {
            globalIo.to("role-hospital_staff").emit("role-notification", notifPayload);
            globalIo.to("hospital-staff").emit("role-notification", notifPayload);
          } else if (normRole === "blood_bank_staff" || normRole === "blood_bank" || normRole === "bloodbank") {
            globalIo.to("role-blood_bank_staff").emit("role-notification", notifPayload);
            globalIo.to("blood-bank-staff").emit("staff-notification", notifPayload);
          } else if (normRole === "admin" || normRole === "administrator" || normRole === "super_admin") {
            globalIo.to("role-admin").emit("role-notification", notifPayload);
            globalIo.to("role-administrator").emit("role-notification", notifPayload);
            globalIo.to("admin").emit("role-notification", notifPayload);
          }
        }

        // Automatic Status Update & Real-Time Auto-Refresh Broadcast
        const refreshPayload = {
          requestId: requestId || relatedEntityId,
          relatedEntityId,
          relatedEntityType,
          notificationType,
          title,
          status: notificationType,
          priority,
          timestamp: new Date().toISOString(),
        };

        if (relatedEntityType === "BloodRequest" || (notificationType && (notificationType.includes("Blood") || notificationType.includes("Request")))) {
          globalIo.emit("request:statusUpdated", refreshPayload);
          globalIo.emit("blood-request-updated", refreshPayload);
          globalIo.emit("data:refresh", { entity: "blood-requests", ...refreshPayload });
        } else if (relatedEntityType === "Appointment" || (notificationType && notificationType.includes("Appointment"))) {
          globalIo.emit("appointment:statusUpdated", refreshPayload);
          globalIo.emit("data:refresh", { entity: "appointments", ...refreshPayload });
        } else if (relatedEntityType === "Donation" || (notificationType && (notificationType.includes("Donation") || notificationType.includes("Campaign")))) {
          globalIo.emit("donation:statusUpdated", refreshPayload);
          globalIo.emit("data:refresh", { entity: "donations", ...refreshPayload });
        } else if (relatedEntityType === "Message") {
          globalIo.emit("data:refresh", { entity: "messages", ...refreshPayload });
        }

        // General auto-refresh beacon to all active dashboards
        globalIo.emit("data:refresh", refreshPayload);
      } catch (socketErr) {
        console.warn("[NotificationEngine] Socket emit warning:", socketErr.message);
      }
    }

    // 3. Reliable SMTP Email Delivery (Asynchronous non-blocking)
    if (prefs.emailNotifications !== false && resolvedEmail && resolvedEmail.includes("@")) {
      setImmediate(async () => {
        try {
          let emailToSend = emailPayload;

          // If no specific email payload is passed, generate an appropriate template based on notification type
          if (!emailToSend) {
            emailToSend = emailService.EmailTemplates.systemAnnouncement({
              recipientName: resolvedName,
              title,
              message,
            });
          }

          const result = await emailService.sendEmail({
            to: resolvedEmail,
            subject: emailToSend.subject,
            html: emailToSend.html,
          });

          // Update email status on the notification record in MongoDB if available
          if (savedNotification && savedNotification._id && mongoose.connection.readyState === 1) {
            await Notification.findByIdAndUpdate(savedNotification._id, {
              emailStatus: result.success ? "sent" : "failed",
              emailSentAt: result.success ? new Date() : null,
              emailError: result.success ? "" : (result.error || result.reason || ""),
            }).catch(() => {});
          }
        } catch (emailErr) {
          console.error("[NotificationEngine] Email delivery error:", emailErr.message);
          if (savedNotification && savedNotification._id && mongoose.connection.readyState === 1) {
            await Notification.findByIdAndUpdate(savedNotification._id, {
              emailStatus: "failed",
              emailError: emailErr.message,
            }).catch(() => {});
          }
        }
      });
    }

    return savedNotification;
  } catch (err) {
    console.error("[NotificationEngine] Fatal error in createAndSendNotification:", err);
    // Never allow notification failure to crash the caller
    return null;
  }
}

module.exports = {
  setSocketIo,
  getSocketIo: () => globalIo,
  createAndSendNotification,
  resolveUserDetails,
};

