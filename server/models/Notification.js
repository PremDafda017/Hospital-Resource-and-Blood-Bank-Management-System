const mongoose = require("mongoose");

const generateCustomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    notificationId: { type: String, default: generateCustomId },

    // Recipient Details
    recipientUserId: { type: String, required: true, index: true },
    recipientRole: { type: String, required: true },
    recipientEmail: { type: String, default: "" },
    recipientName: { type: String, default: "" },

    // Sender Details
    senderUserId: { type: String, default: "system" },
    senderRole: { type: String, default: "system" },
    senderName: { type: String, default: "HemoCare System" },

    // Notification Content
    title: { type: String, required: true },
    message: { type: String, required: true },
    notificationType: {
      type: String,
      default: "System Notification",
    },

    // Entity Reference
    relatedEntityType: {
      type: String,
      enum: ["BloodRequest", "Appointment", "Donation", "Report", "Message", "Stock", "System", "Other"],
      default: "System",
    },
    relatedEntityId: { type: String, default: "" },
    requestId: { type: String, default: "", index: true },

    // Priority & Delivery
    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Critical"],
      default: "Normal",
    },

    // Read Tracking
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },

    // Email Outbox Tracking
    emailStatus: {
      type: String,
      enum: ["pending", "sent", "failed", "disabled", "skipped"],
      default: "pending",
    },
    emailSentAt: { type: Date, default: null },
    emailError: { type: String, default: "" },
    emailRetries: { type: Number, default: 0 },

    // Navigation Action
    actionUrl: { type: String, default: "" },
    isArchived: { type: Boolean, default: false },

    // Backward-Compatibility Aliases
    userId: { type: String },
    userRole: { type: String },
    read: { type: Boolean, default: false },
    type: { type: String, default: "info" },
  },
  { timestamps: true }
);

// Pre-save hook to keep compatibility aliases synchronized
notificationSchema.pre("save", function (next) {
  if (!this.userId && this.recipientUserId) this.userId = this.recipientUserId;
  if (!this.recipientUserId && this.userId) this.recipientUserId = this.userId;

  if (!this.userRole && this.recipientRole) this.userRole = this.recipientRole;
  if (!this.recipientRole && this.userRole) this.recipientRole = this.userRole;

  if (this.isModified("isRead")) {
    this.read = this.isRead;
    if (this.isRead && !this.readAt) this.readAt = new Date();
  } else if (this.isModified("read")) {
    this.isRead = this.read;
    if (this.read && !this.readAt) this.readAt = new Date();
  }

  next();
});

const Notification = mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

module.exports = Notification;

