const mongoose = require("mongoose");

const generateCustomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

const messageSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    messageId: { type: String, default: generateCustomId },

    // Request reference tying this conversation to an active requisition or appointment
    requestId: { type: String, required: true, index: true },
    requestNumber: { type: String, default: "" },

    // Sender details
    senderUserId: { type: String, required: true, index: true },
    senderRole: { type: String, required: true },
    senderName: { type: String, required: true },
    senderEmail: { type: String, default: "" },

    // Recipient details
    recipientUserId: { type: String, required: true, index: true },
    recipientRole: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientEmail: { type: String, default: "" },

    // Message Content
    subject: { type: String, default: "" },
    message: { type: String, required: true },

    // Optional clinical attachments (lab result, prescription image, release note)
    attachments: [
      {
        fileName: { type: String, default: "" },
        fileUrl: { type: String, default: "" },
        fileType: { type: String, default: "" },
        fileSize: { type: Number, default: 0 },
      },
    ],

    // Read Tracking
    read: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);

module.exports = Message;

