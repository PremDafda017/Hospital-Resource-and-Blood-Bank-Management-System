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

/**
 * Resolves user email and full name from MongoDB collections or fallback stores
 */
async function resolveUserDetails(userId, roleHint = "") {
  if (!userId) return { email: "", name: "", role: roleHint };

  const isDbConnected = mongoose.connection.readyState === 1;
  if (!isDbConnected) {
    return { email: "", name: "User", role: roleHint };
  }

  try {
    // 1. Check UserProfile
    const UserProfile = mongoose.models.UserProfile;
    if (UserProfile) {
      const up = await UserProfile.findOne({
        $or: [{ clerkId: userId }, { _id: userId }, { email: userId }],
      });
      if (up) {
        return {
          email: up.email || "",
          name: up.fullName || "User",
          role: up.role || roleHint,
        };
      }
    }

    // 2. Check Patient
    const Patient = mongoose.models.Patient;
    if (Patient) {
      const p = await Patient.findOne({
        $or: [{ clerkId: userId }, { _id: userId }, { email: userId }],
      });
      if (p) {
        return {
          email: p.email || "",
          name: p.profile?.fullName || "Patient",
          role: "patient",
        };
      }
    }

    // 3. Check Donor
    const Donor = mongoose.models.Donor;
    if (Donor) {
      const d = await Donor.findOne({
        $or: [{ clerkId: userId }, { _id: userId }, { email: userId }],
      });
      if (d) {
        const name = d.profile?.fullName || `${d.profile?.firstName || ""} ${d.profile?.lastName || ""}`.trim() || "Donor";
        return {
          email: d.email || "",
          name,
          role: "donor",
        };
      }
    }

    // 4. Check HospitalStaff
    const HospitalStaff = mongoose.models.HospitalStaff;
    if (HospitalStaff) {
      const hs = await HospitalStaff.findOne({
        $or: [{ clerkId: userId }, { _id: userId }, { email: userId }],
      });
      if (hs) {
        return {
          email: hs.email || "",
          name: hs.profile?.fullName || "Hospital Staff",
          role: "hospital_staff",
        };
      }
    }

    // 5. Check BloodBankStaff
    const BloodBankStaff = mongoose.models.BloodBankStaff;
    if (BloodBankStaff) {
      const bbs = await BloodBankStaff.findOne({
        $or: [{ clerkId: userId }, { _id: userId }, { email: userId }],
      });
      if (bbs) {
        return {
          email: bbs.email || "",
          name: bbs.profile?.fullName || "Blood Bank Officer",
          role: "blood_bank_staff",
        };
      }
    }
  } catch (err) {
    console.warn("[NotificationEngine] Error resolving user details:", err.message);
  }

  return { email: "", name: "User", role: roleHint };
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

    if (!resolvedEmail || !resolvedName || !resolvedRole) {
      const details = await resolveUserDetails(recipientUserId, recipientRole);
      resolvedEmail = resolvedEmail || details.email;
      resolvedName = resolvedName || details.name;
      resolvedRole = resolvedRole || details.role || "patient";
    }

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
        const foundPrefs = await NotificationPreference.findOne({ userId: recipientUserId });
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
          userId: recipientUserId,
          userRole: resolvedRole,
          read: false,
          type: priority === "Critical" ? "alert" : priority === "High" ? "urgent" : "info",
        });

        savedNotification = await notifDoc.save();
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
          userId: recipientUserId,
          createdAt: new Date().toISOString(),
        };
      }
    }

    // 2. Real-Time Socket.IO Dispatch
    if (globalIo) {
      try {
        const notifPayload = savedNotification ? savedNotification.toObject ? savedNotification.toObject() : savedNotification : {
          recipientUserId,
          recipientRole: resolvedRole,
          title,
          message,
          priority,
          requestId,
          createdAt: new Date(),
        };

        // Specific user room
        globalIo.to(`user-${recipientUserId}`).emit("notification", notifPayload);

        // Canonical role room
        globalIo.to(`role-${resolvedRole}`).emit("role-notification", notifPayload);
        globalIo.to(resolvedRole).emit("role-notification", notifPayload);

        // Role-specific broadcast rooms
        if (resolvedRole === "hospital_staff" || resolvedRole === "hospital") {
          globalIo.to("role-hospital_staff").emit("role-notification", notifPayload);
          globalIo.to("hospital-staff").emit("role-notification", notifPayload);
        } else if (resolvedRole === "blood_bank_staff" || resolvedRole === "blood_bank") {
          globalIo.to("role-blood_bank_staff").emit("role-notification", notifPayload);
          globalIo.to("blood-bank-staff").emit("staff-notification", notifPayload);
        }
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
  createAndSendNotification,
  resolveUserDetails,
};

