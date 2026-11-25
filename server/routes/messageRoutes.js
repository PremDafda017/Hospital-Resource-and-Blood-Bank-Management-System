/**
 * HemoCare Request-Based Communication & Messaging API
 * Enables authenticated, bidirectional conversation threads tied directly to blood requests,
 * appointments, and clinical inquiries between Patient, Hospital Staff, Donor, Blood Bank, and Admin.
 */

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Message = require("../models/Message");
const notificationService = require("../services/notificationService");
const emailService = require("../services/emailService");

let globalIo = null;

function setSocketIo(io) {
  globalIo = io;
}

// Send a message associated with a request or direct inquiry
router.post("/api/messages", async (req, res) => {
  try {
    const {
      requestId,
      requestNumber = "",
      senderUserId,
      senderRole,
      senderName,
      senderEmail = "",
      recipientUserId,
      recipientRole,
      recipientName,
      recipientEmail = "",
      subject = "",
      message,
      attachments = [],
    } = req.body;

    if (!requestId || !message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: requestId and message are mandatory.",
      });
    }

    const isDbConnected = mongoose.connection.readyState === 1;

    let effectiveRecipientId = recipientUserId;
    let effectiveRecipientRole = (recipientRole || "patient").toLowerCase().trim();
    let effectiveRecipientName = recipientName || "Staff Member";
    let effectiveRecipientEmail = recipientEmail || "";

    // Automatically resolve patient or staff details from database if target is generic or not supplied
    if (isDbConnected && requestId) {
      try {
        const BloodRequest = mongoose.models.BloodRequest;
        if (BloodRequest) {
          const br = await BloodRequest.findById(requestId).lean();
          if (br) {
            if (effectiveRecipientRole === "patient" || (!recipientRole && senderRole !== "patient")) {
              effectiveRecipientId = br.patientClerkId || br.patientId || effectiveRecipientId;
              effectiveRecipientName = br.patientName || effectiveRecipientName;
              effectiveRecipientRole = "patient";
              effectiveRecipientEmail = br.patientEmail || effectiveRecipientEmail;
            } else if (effectiveRecipientRole.includes("hospital") || effectiveRecipientRole.includes("staff")) {
              effectiveRecipientId = br.hospitalId || br.verifiedBy || effectiveRecipientId;
              effectiveRecipientName = br.hospitalName || br.verifiedByName || "Hospital Staff";
            }
          }
        }

        const PatientAppointment = mongoose.models.PatientAppointment;
        if (PatientAppointment && (!effectiveRecipientId || effectiveRecipientId.includes("_general"))) {
          const apt = await PatientAppointment.findById(requestId).lean();
          if (apt) {
            if (effectiveRecipientRole === "patient" || (!recipientRole && senderRole !== "patient")) {
              effectiveRecipientId = apt.patientId || effectiveRecipientId;
              effectiveRecipientName = apt.patientName || effectiveRecipientName;
              effectiveRecipientRole = "patient";
              effectiveRecipientEmail = apt.patientEmail || effectiveRecipientEmail;
            }
          }
        }
      } catch (err) {
        console.warn("[MessageAPI] Error resolving request participants:", err.message);
      }
    }

    if (!effectiveRecipientId) {
      effectiveRecipientId = effectiveRecipientRole ? `${effectiveRecipientRole}_general` : "general_recipient";
    }

    const effectiveSenderId = senderUserId || (senderRole ? `${senderRole}_user` : "guest_user");
    const effectiveSenderName = senderName || "HemoCare User";

    let savedMessage = null;

    if (isDbConnected) {
      const msgDoc = new Message({
        requestId,
        requestNumber: requestNumber || requestId,
        senderUserId: effectiveSenderId,
        senderRole: senderRole || "staff",
        senderName: effectiveSenderName,
        senderEmail,
        recipientUserId: effectiveRecipientId,
        recipientRole: effectiveRecipientRole,
        recipientName: effectiveRecipientName,
        recipientEmail: effectiveRecipientEmail,
        subject,
        message: message.trim(),
        attachments: Array.isArray(attachments) ? attachments : [],
        read: false,
      });

      savedMessage = await msgDoc.save();
    } else {
      savedMessage = {
        _id: "msg_" + Math.random().toString(36).substring(2, 9),
        requestId,
        requestNumber: requestNumber || requestId,
        senderUserId: effectiveSenderId,
        senderRole,
        senderName: effectiveSenderName,
        recipientUserId: effectiveRecipientId,
        recipientRole: effectiveRecipientRole,
        recipientName: effectiveRecipientName,
        message: message.trim(),
        attachments: [],
        read: false,
        createdAt: new Date().toISOString(),
      };
    }

    // Real-time Socket.IO emission to conversation thread, recipient user rooms & role rooms
    if (globalIo) {
      try {
        const payload = savedMessage.toObject ? savedMessage.toObject() : savedMessage;
        
        // 1. Deliver to conversation thread room
        globalIo.to(`conversation-${requestId}`).emit("new-message", payload);

        // 2. Deliver to direct recipient room
        globalIo.to(`user-${effectiveRecipientId}`).emit("new-message", payload);

        // 3. Deliver to canonical role rooms so active users on any page get the notification
        const normRole = (effectiveRecipientRole || "").toLowerCase().trim();
        if (normRole) {
          globalIo.to(`role-${normRole}`).emit("new-message", payload);
          globalIo.to(normRole).emit("new-message", payload);

          if (normRole === "hospital_staff" || normRole === "hospital" || normRole === "doctor") {
            globalIo.to("role-hospital_staff").emit("new-message", payload);
            globalIo.to("hospital-staff").emit("new-message", payload);
          } else if (normRole === "blood_bank_staff" || normRole === "blood_bank" || normRole === "bloodbank") {
            globalIo.to("role-blood_bank_staff").emit("new-message", payload);
            globalIo.to("blood-bank-staff").emit("new-message", payload);
          } else if (normRole === "patient") {
            globalIo.to("role-patient").emit("new-message", payload);
          } else if (normRole === "donor") {
            globalIo.to("role-donor").emit("new-message", payload);
          } else if (normRole === "admin" || normRole === "administrator") {
            globalIo.to("role-admin").emit("new-message", payload);
            globalIo.to("role-administrator").emit("new-message", payload);
            globalIo.to("admin").emit("new-message", payload);
          }
        }

        // 4. Trigger auto-refresh across dashboards
        globalIo.emit("data:refresh", { entity: "messages", requestId });
      } catch (e) {
        console.warn("[MessageAPI] Socket emit warning:", e.message);
      }
    }

    // Automatically trigger In-App Real-Time Notification & Email
    const emailPayload = emailService.EmailTemplates.newMessage({
      recipientName: effectiveRecipientName,
      senderName: effectiveSenderName,
      senderRole: senderRole || "Staff",
      requestId,
      requestNumber: requestNumber || requestId,
      messageText: message.trim(),
    });

    const truncated = message.length > 90 ? `${message.substring(0, 90)}...` : message;

    // Determine target link based on recipient role
    let actionUrl = "/blood-requests";
    if (effectiveRecipientRole === "hospital_staff" || effectiveRecipientRole === "hospital" || effectiveRecipientRole === "doctor") {
      actionUrl = "/hospital-blood-requests";
    } else if (effectiveRecipientRole === "blood_bank_staff" || effectiveRecipientRole === "blood_bank") {
      actionUrl = "/bloodbank-requests";
    } else if (effectiveRecipientRole === "donor") {
      actionUrl = "/donor-dashboard";
    } else if (effectiveRecipientRole === "admin" || effectiveRecipientRole === "administrator") {
      actionUrl = "/admin-dashboard?tab=blood-requests";
    }

    await notificationService.createAndSendNotification({
      recipientUserId: effectiveRecipientId,
      recipientRole: effectiveRecipientRole,
      recipientEmail: effectiveRecipientEmail,
      recipientName: effectiveRecipientName,
      senderUserId: effectiveSenderId,
      senderRole,
      senderName: effectiveSenderName,
      title: `New Message from ${effectiveSenderName}`,
      message: `${effectiveSenderName}: "${truncated}"`,
      notificationType: "New Message",
      relatedEntityType: "Message",
      relatedEntityId: savedMessage._id,
      requestId,
      priority: "High",
      actionUrl,
      emailPayload,
    });

    res.status(201).json({
      success: true,
      message: "Message sent successfully.",
      data: savedMessage,
    });
  } catch (err) {
    console.error("[MessageAPI] Error sending message:", err);
    res.status(500).json({ success: false, message: "Error sending message.", error: err.message });
  }
});

// Get complete conversation thread for a specific request
router.get("/api/messages/request/:requestId", async (req, res) => {
  try {
    const { requestId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = await Message.find({ requestId }).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      requestId,
      messages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get user message threads
router.get("/api/messages/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true, messages: [] });
    }

    const messages = await Message.find({
      $or: [{ senderUserId: userId }, { recipientUserId: userId }],
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark message as read
router.put("/api/messages/:messageId/read", async (req, res) => {
  try {
    const { messageId } = req.params;
    if (mongoose.connection.readyState !== 1) {
      return res.status(200).json({ success: true });
    }

    await Message.findByIdAndUpdate(messageId, { read: true, readAt: new Date() });
    res.status(200).json({ success: true, message: "Message marked as read." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin Broadcast Message to Hospital Staff or Blood Bank Staff
router.post("/api/admin/messages/broadcast-staff", async (req, res) => {
  try {
    const { targetGroup = "all_staff", subject = "Administrative Notice", message, adminName = "HemoCare Administrator" } = req.body;

    if (!message || message.trim() === "") {
      return res.status(400).json({ success: false, message: "Message content is required." });
    }

    const isDbConnected = mongoose.connection.readyState === 1;
    let recipients = [];

    if (isDbConnected) {
      const HospitalStaff = mongoose.models.HospitalStaff;
      const BloodBankStaff = mongoose.models.BloodBankStaff;

      if (targetGroup === "hospital_staff" || targetGroup === "all_staff") {
        if (HospitalStaff) {
          const hsList = await HospitalStaff.find({ status: "Active" });
          hsList.forEach((h) => {
            recipients.push({
              userId: h.clerkId || h._id,
              role: "hospital_staff",
              email: h.email,
              name: h.profile?.fullName || "Hospital Staff",
            });
          });
        }
      }

      if (targetGroup === "blood_bank_staff" || targetGroup === "all_staff") {
        if (BloodBankStaff) {
          const bbsList = await BloodBankStaff.find({ status: "Active" });
          bbsList.forEach((b) => {
            recipients.push({
              userId: b.clerkId || b._id,
              role: "blood_bank_staff",
              email: b.email,
              name: b.profile?.fullName || "Blood Bank Officer",
            });
          });
        }
      }
    }

    // Dispatch notification & email to all targeted staff
    for (const r of recipients) {
      const emailPayload = emailService.EmailTemplates.systemAnnouncement({
        recipientName: r.name,
        title: subject,
        message,
      });

      await notificationService.createAndSendNotification({
        recipientUserId: r.userId,
        recipientRole: r.role,
        recipientEmail: r.email,
        recipientName: r.name,
        senderUserId: "admin",
        senderRole: "administrator",
        senderName: adminName,
        title: subject,
        message,
        notificationType: "Important Update",
        relatedEntityType: "System",
        priority: "High",
        emailPayload,
      });
    }

    res.status(200).json({
      success: true,
      message: `Message broadcast successfully dispatched to ${recipients.length} staff member(s).`,
      deliveredCount: recipients.length,
    });
  } catch (err) {
    console.error("[AdminMessageAPI] Error broadcasting staff message:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = {
  router,
  setSocketIo,
};

