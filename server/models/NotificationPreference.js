const mongoose = require("mongoose");

const generateCustomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

const notificationPreferenceSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    userId: { type: String, required: true, unique: true, index: true },
    userRole: { type: String, default: "" },

    // Preferences
    emailNotifications: { type: Boolean, default: true },
    inAppNotifications: { type: Boolean, default: true },
    bloodRequestAlerts: { type: Boolean, default: true },
    appointmentAlerts: { type: Boolean, default: true },
    messageAlerts: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    soundAlerts: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const NotificationPreference = mongoose.models.NotificationPreference || mongoose.model("NotificationPreference", notificationPreferenceSchema);

module.exports = NotificationPreference;

