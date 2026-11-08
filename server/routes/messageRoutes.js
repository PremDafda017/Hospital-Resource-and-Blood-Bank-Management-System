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

    const effectiveSenderId = senderUserId || (senderRole ? `${senderRole}_user` : "guest_user");
    const effectiveRecipientId = recipientUserId || (recipientRole ? `${recipientRole}_general` : "general_recipient");
    const effectiveSenderName = senderName || "HemoCare User";
    const effectiveRecipientName = recipientName || "Staff Member";

    const isDbConnected = mongoose.connection.readyState === 1;
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
        recipientRole: recipientRole || "patient",
        recipientName: effectiveRecipientName,
        recipientEmail,
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
        recipientRole,
        recipientName: effectiveRecipientName,
        message: message.trim(),
        attachments: [],
        read: false,
        createdAt: new Date().toISOString(),
      };
    }

    // Real-time Socket.IO emission to conversation room and recipient
    if (globalIo) {
      try {
        const payload = savedMessage.toObject ? savedMessage.toObject() : savedMessage;
        globalIo.to(`conversation-${requestId}`).emit("new-message", payload);
        globalIo.to(`user-${effectiveRecipientId}`).emit("new-message", payload);
      } catch (e) {
        console.warn("[MessageAPI] Socket emit warning:", e.message);
      }
    }

    // Automatically trigger In-App Notification and SMTP Email to recipient
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
    if (recipientRole === "hospital_staff" || recipientRole === "hospital" || recipientRole === "doctor") {
      actionUrl = "/hospital-blood-requests";
    } else if (recipientRole === "blood_bank_staff" || recipientRole === "blood_bank") {
      actionUrl = "/bloodbank-requests";
    } else if (recipientRole === "donor") {
      actionUrl = "/donor-dashboard";
    }

    await notificationService.createAndSendNotification({
      recipientUserId: effectiveRecipientId,
      recipientRole,
      recipientEmail,
      recipientName: effectiveRecipientName,
      senderUserId: effectiveSenderId,
      senderRole,
      senderName: effectiveSenderName,
      title: `New Message: Requisition ${requestNumber || requestId}`,
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

