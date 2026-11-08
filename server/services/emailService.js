/**
 * HemoCare SMTP Email Service
 * Centralized, reliable email delivery engine with responsive HTML templates,
 * automatic retries, and non-blocking background queue execution.
 */

const nodemailer = require("nodemailer");

// Configuration from environment
const SMTP_HOST = process.env.SMTP_HOST || "";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10);
const SMTP_SECURE = process.env.SMTP_SECURE === "true" || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const EMAIL_FROM = process.env.EMAIL_FROM || '"HemoCare Notifications" <notifications@hemocare.org>';
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

let transporter = null;
let isConfigured = false;

function initTransporter() {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";

  if (user && pass) {
    try {
      if (host.toLowerCase().includes("gmail")) {
        transporter = nodemailer.createTransport({
          service: "gmail",
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
      } else {
        transporter = nodemailer.createTransport({
          host: host || "smtp.gmail.com",
          port,
          secure,
          auth: { user, pass },
          tls: { rejectUnauthorized: false },
        });
      }
      isConfigured = true;
      console.log(`[EmailService] Active SMTP Transporter configured for: ${user} via ${host || 'gmail'}`);
    } catch (err) {
      console.error("[EmailService] Failed to initialize SMTP transporter:", err.message);
      isConfigured = false;
      transporter = null;
    }
  } else {
    isConfigured = false;
    transporter = null;
  }
}

initTransporter();

/**
 * Verifies SMTP connection health
 */
async function verifyConnection() {
  initTransporter();
  if (!isConfigured || !transporter) {
    return { success: false, reason: "SMTP credentials not provided in .env (SMTP_USER / SMTP_PASS empty)" };
  }
  try {
    await transporter.verify();
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Core send mail function with up to 3 retry attempts
 */
async function sendEmail({ to, subject, html, text }) {
  if (!to || !to.includes("@")) {
    console.warn(`[EmailService] Invalid recipient email address: "${to}". Email delivery skipped.`);
    return { success: false, reason: "Invalid recipient email" };
  }

  // Refresh transporter in case .env was populated or updated at runtime
  initTransporter();

  const emailFrom = process.env.EMAIL_FROM || (process.env.SMTP_USER ? `"HemoCare Notifications" <${process.env.SMTP_USER}>` : '"HemoCare Notifications" <notifications@hemocare.org>');

  // If SMTP is not configured, log to server console cleanly and return simulated success
  if (!isConfigured || !transporter) {
    console.log(`[EmailService - Offline/Simulation] Delivering to: ${to} | Subject: "${subject}"`);
    console.log(`[EmailService Note] To deliver actual SMTP emails to inboxes, specify SMTP_USER and SMTP_PASS in your .env file.`);
    return {
      success: true,
      simulated: true,
      messageId: "simulated_" + Date.now(),
      sentAt: new Date(),
    };
  }

  const mailOptions = {
    from: emailFrom,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
  };

  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EmailService] Email successfully sent to ${to} (MessageId: ${info.messageId}) on attempt ${attempt}`);
      return {
        success: true,
        messageId: info.messageId,
        sentAt: new Date(),
      };
    } catch (err) {
      lastError = err;
      console.warn(`[EmailService] Attempt ${attempt} failed for ${to}: ${err.message}`);
      if (attempt < MAX_RETRIES) {
        // Exponential backoff wait (500ms, 1000ms)
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }

  console.error(`[EmailService] All ${MAX_RETRIES} delivery attempts failed for ${to}:`, lastError?.message);
  return {
    success: false,
    error: lastError?.message || "Delivery failed",
  };
}

/**
 * Base Responsive HTML Wrapper for all HemoCare emails
 */
function createBaseEmailTemplate({ title, badgeText, badgeColor = "#C41230", recipientName, bodyContent, actionButton, details = [] }) {
  const detailsHtml = details.length > 0 ? `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; margin: 20px 0; padding: 12px 16px;">
      ${details.map(d => `
        <tr>
          <td style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #64748B; width: 38%;">${d.label}:</td>
          <td style="padding: 6px 0; font-size: 14px; font-weight: 700; color: #0F172A;">${d.value}</td>
        </tr>
      `).join("")}
    </table>
  ` : "";

  const actionButtonHtml = actionButton ? `
    <div style="text-align: center; margin: 28px 0 16px;">
      <a href="${actionButton.url}" style="background-color: #C41230; color: #FFFFFF; text-decoration: none; padding: 12px 28px; border-radius: 6px; font-size: 14px; font-weight: 700; display: inline-block; letter-spacing: 0.02em; box-shadow: 0 4px 12px rgba(196,18,48,0.25);">
        ${actionButton.text}
      </a>
    </div>
  ` : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #334155;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
    <tr>
      <td align="center" style="padding: 32px 16px;">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08); border: 1px solid #E2E8F0;">
          <!-- Top Accent Bar -->
          <tr>
            <td height="6" style="background: linear-gradient(90deg, #C41230 0%, #8B0000 100%);"></td>
          </tr>
          <!-- Header -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0F172A; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 22px; font-weight: 900; color: #FFFFFF; letter-spacing: -0.02em;">Hemo<span style="color: #EF4444;">Care</span></span>
                    <div style="font-size: 12px; color: #94A3B8; margin-top: 2px; font-weight: 500;">Hospital Resource & Blood Bank System</div>
                  </td>
                  ${badgeText ? `
                    <td align="right">
                      <span style="display: inline-block; padding: 4px 10px; border-radius: 16px; font-size: 11px; font-weight: 700; color: #FFFFFF; background-color: ${badgeColor}; text-transform: uppercase; letter-spacing: 0.05em;">
                        ${badgeText}
                      </span>
                    </td>
                  ` : ""}
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              ${recipientName ? `<p style="font-size: 15px; font-weight: 600; color: #0F172A; margin: 0 0 16px;">Dear ${recipientName},</p>` : ""}
              <div style="font-size: 14px; line-height: 1.6; color: #334155;">
                ${bodyContent}
              </div>
              ${detailsHtml}
              ${actionButtonHtml}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #F8FAFC; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #64748B; line-height: 1.5;">
              <p style="margin: 0 0 6px;">This is an automated operational notification from <strong>HemoCare</strong>.</p>
              <p style="margin: 0; color: #94A3B8; font-size: 11px;">Confidential medical record update. Please do not reply directly to this automated email.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

/**
 * Specialized Template Generators for all required events
 */
const EmailTemplates = {
  // 1. Welcome / Registration
  registrationConfirmation: ({ name, role, email }) => {
    return {
      subject: `Welcome to HemoCare - Account Registered (${role.toUpperCase()})`,
      html: createBaseEmailTemplate({
        title: "Welcome to HemoCare",
        badgeText: "Account Created",
        badgeColor: "#16A34A",
        recipientName: name,
        bodyContent: `<p>Your HemoCare account has been successfully registered. You are enrolled as <strong>${role.replace("_", " ").toUpperCase()}</strong>. You can now access real-time blood requests, verified inventory coordination, and emergency services.</p>`,
        details: [
          { label: "Registered Email", value: email },
          { label: "Assigned Role", value: role.replace("_", " ").toUpperCase() },
          { label: "Verification Status", value: "Active & Verified" },
        ],
        actionButton: {
          text: "Open Dashboard",
          url: `${FRONTEND_URL}/login`,
        },
      }),
    };
  },

  // 2. Profile Completed
  profileCompleted: ({ name, bloodGroup }) => {
    return {
      subject: "HemoCare - Medical Profile Successfully Completed",
      html: createBaseEmailTemplate({
        title: "Profile Completed",
        badgeText: "Profile Complete",
        badgeColor: "#2563EB",
        recipientName: name,
        bodyContent: `<p>Your clinical profile has been completed and safely recorded in our health information registry. Your medical record is now linked for immediate blood requisitions and hospital services.</p>`,
        details: [
          { label: "Blood Group", value: bloodGroup || "Recorded" },
          { label: "Status", value: "Eligible for Requisitions" },
        ],
        actionButton: {
          text: "Go to Dashboard",
          url: `${FRONTEND_URL}/patient-dashboard`,
        },
      }),
    };
  },

  // 3. New Blood Request Submitted (to Hospital Staff)
  bloodRequestSubmitted: ({ requestNumber, patientName, bloodGroup, units, hospitalName, urgency }) => {
    const isCritical = urgency === "Critical" || urgency === "High";
    return {
      subject: `[${urgency.toUpperCase()}] New Blood Request: ${requestNumber} (${bloodGroup} - ${units} Units)`,
      html: createBaseEmailTemplate({
        title: "New Blood Request Submitted",
        badgeText: urgency,
        badgeColor: isCritical ? "#DC2626" : "#2563EB",
        recipientName: "Hospital Clinical Staff",
        bodyContent: `<p>A new blood requisition has been submitted by <strong>${patientName}</strong> requiring your immediate review and verification.</p>`,
        details: [
          { label: "Requisition ID", value: requestNumber },
          { label: "Patient", value: patientName },
          { label: "Blood Group", value: bloodGroup },
          { label: "Units Required", value: `${units} Unit(s)` },
          { label: "Target Hospital", value: hospitalName || "Partner Hospital" },
          { label: "Urgency Level", value: urgency },
        ],
        actionButton: {
          text: "Review & Verify Request",
          url: `${FRONTEND_URL}/hospital-blood-requests`,
        },
      }),
    };
  },

  // 4. Request Forwarded to Blood Bank (to Blood Bank Staff)
  bloodRequestForwarded: ({ requestNumber, bloodGroup, units, hospitalName, forwardedByName }) => {
    return {
      subject: `Blood Requisition Forwarded: ${requestNumber} (${bloodGroup} - ${units} Units)`,
      html: createBaseEmailTemplate({
        title: "Requisition Forwarded to Blood Bank",
        badgeText: "Action Required",
        badgeColor: "#D97706",
        recipientName: "Blood Bank Officer",
        bodyContent: `<p>Hospital staff member <strong>${forwardedByName || "Hospital Officer"}</strong> has verified and forwarded blood request <strong>${requestNumber}</strong> for stock allocation and fulfillment.</p>`,
        details: [
          { label: "Request Number", value: requestNumber },
          { label: "Originating Hospital", value: hospitalName },
          { label: "Blood Group", value: bloodGroup },
          { label: "Quantity", value: `${units} Unit(s)` },
          { label: "Current Status", value: "Forwarded for Processing" },
        ],
        actionButton: {
          text: "Open Blood Bank Portal",
          url: `${FRONTEND_URL}/bloodbank-requests`,
        },
      }),
    };
  },

  // 5. Request Approved / Ready (to Patient & Staff)
  bloodRequestApproved: ({ requestNumber, recipientName, bloodGroup, units, bloodBankName, instructions }) => {
    return {
      subject: `Blood Requisition Ready: ${requestNumber} (${bloodGroup})`,
      html: createBaseEmailTemplate({
        title: "Blood Requisition Approved",
        badgeText: "Blood Ready",
        badgeColor: "#16A34A",
        recipientName,
        bodyContent: `<p>Great news. Your blood requisition <strong>${requestNumber}</strong> has been allocated and marked <strong>Blood Ready</strong>. The blood units have passed cold-chain quarantine and are ready for pickup or dispatch.</p>
        ${instructions ? `<p style="padding: 10px; background: #ECFDF5; border-left: 4px solid #10B981; margin: 12px 0;"><strong>Instructions:</strong> ${instructions}</p>` : ""}`,
        details: [
          { label: "Request Number", value: requestNumber },
          { label: "Blood Group", value: bloodGroup },
          { label: "Approved Units", value: `${units} Unit(s)` },
          { label: "Fulfilling Blood Bank", value: bloodBankName || "Central Blood Bank" },
          { label: "Status", value: "Blood Ready / Approved" },
        ],
        actionButton: {
          text: "View Requisition Details",
          url: `${FRONTEND_URL}/blood-requests`,
        },
      }),
    };
  },

  // 6. Request Rejected (to Patient & Hospital Staff)
  bloodRequestRejected: ({ requestNumber, recipientName, bloodGroup, units, reason, rejectedByName }) => {
    return {
      subject: `Update on Blood Requisition: ${requestNumber} - Action Notice`,
      html: createBaseEmailTemplate({
        title: "Blood Requisition Update",
        badgeText: "Rejected",
        badgeColor: "#DC2626",
        recipientName,
        bodyContent: `<p>We regret to inform you that requisition <strong>${requestNumber}</strong> could not be fulfilled at this time.</p>
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <strong style="color: #991B1B;">Reason for Decision:</strong>
          <p style="margin: 4px 0 0; color: #7F1D1D; font-size: 14px;">${reason || "Requirements or donor compatibility criteria not met."}</p>
        </div>
        <p>If you require alternative arrangements or an urgent reassessment, please submit a revised requisition or contact the coordinating department.</p>`,
        details: [
          { label: "Request Number", value: requestNumber },
          { label: "Blood Group", value: bloodGroup },
          { label: "Units", value: `${units} Unit(s)` },
          { label: "Reviewed By", value: rejectedByName || "Clinical Coordinator" },
        ],
        actionButton: {
          text: "Review Details & Reapply",
          url: `${FRONTEND_URL}/blood-requests`,
        },
      }),
    };
  },

  // 7. Appointment Confirmation / Scheduled
  appointmentBooked: ({ appointmentId, recipientName, doctorName, hospitalName, date, time, type }) => {
    return {
      subject: `Appointment Confirmed: ${date} at ${time} (${hospitalName})`,
      html: createBaseEmailTemplate({
        title: "Appointment Confirmed",
        badgeText: "Confirmed",
        badgeColor: "#16A34A",
        recipientName,
        bodyContent: `<p>Your medical appointment has been scheduled and confirmed in our clinic roster.</p>`,
        details: [
          { label: "Appointment ID", value: String(appointmentId) },
          { label: "Hospital / Center", value: hospitalName },
          { label: "Doctor / Specialist", value: doctorName || "Clinical Team" },
          { label: "Scheduled Date", value: date },
          { label: "Scheduled Time", value: time },
          { label: "Appointment Type", value: type || "Consultation" },
        ],
        actionButton: {
          text: "View My Appointments",
          url: `${FRONTEND_URL}/my-appointments`,
        },
      }),
    };
  },

  // 8. Donor Appointment Approved
  donorAppointmentApproved: ({ donorName, bloodBankName, date, time, location, instructions }) => {
    return {
      subject: `Donation Appointment Approved - ${bloodBankName}`,
      html: createBaseEmailTemplate({
        title: "Donation Appointment Approved",
        badgeText: "Approved",
        badgeColor: "#16A34A",
        recipientName: donorName,
        bodyContent: `<p>Thank you for offering the gift of life. Your voluntary blood donation appointment has been approved.</p>
        <p>Please remember to stay hydrated, eat a light meal prior to donation, and bring a valid photo identification.</p>`,
        details: [
          { label: "Blood Bank / Center", value: bloodBankName },
          { label: "Location", value: location || "Donation Center" },
          { label: "Scheduled Date", value: date },
          { label: "Scheduled Time", value: time },
          { label: "Special Instructions", value: instructions || "Arrive 10 minutes before intake" },
        ],
        actionButton: {
          text: "View Donation Schedule",
          url: `${FRONTEND_URL}/donor-dashboard`,
        },
      }),
    };
  },

  // 9. Donor Appointment Rejected
  donorAppointmentRejected: ({ donorName, reason }) => {
    return {
      subject: `Donation Appointment Update - HemoCare`,
      html: createBaseEmailTemplate({
        title: "Donation Appointment Status",
        badgeText: "Not Approved",
        badgeColor: "#DC2626",
        recipientName: donorName,
        bodyContent: `<p>Thank you for your willingness to donate. At this moment, your donation appointment request could not be accepted.</p>
        <div style="background-color: #FEF2F2; border-left: 4px solid #DC2626; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
          <strong style="color: #991B1B;">Reason:</strong>
          <p style="margin: 4px 0 0; color: #7F1D1D; font-size: 14px;">${reason || "Scheduling conflicts or donor cooldown interval."}</p>
        </div>`,
        actionButton: {
          text: "Check Donation Eligibility",
          url: `${FRONTEND_URL}/donor-dashboard`,
        },
      }),
    };
  },

  // 10. Donation Completed & Certificate Ready
  donationCompleted: ({ donorName, bloodGroup, units, date, location }) => {
    return {
      subject: `Thank You for Saving Lives! Donation Completed (${bloodGroup})`,
      html: createBaseEmailTemplate({
        title: "Blood Donation Completed",
        badgeText: "Hero Donor",
        badgeColor: "#C41230",
        recipientName: donorName,
        bodyContent: `<p>On behalf of the hospital network and patients in critical need, <strong>thank you for your selfless blood donation</strong>! Your contribution has been verified and processed into our verified inventory.</p>
        <p>Your official Donor Certificate of Appreciation and Reward Points are now available for download in your portal.</p>`,
        details: [
          { label: "Blood Group Donated", value: bloodGroup },
          { label: "Units Collected", value: `${units} Unit(s)` },
          { label: "Donation Date", value: date },
          { label: "Center Location", value: location },
          { label: "Next Eligible Date", value: "In 90 Days" },
        ],
        actionButton: {
          text: "Download Donation Certificate",
          url: `${FRONTEND_URL}/donor-dashboard`,
        },
      }),
    };
  },

  // 11. Request-Based Message Received
  newMessage: ({ recipientName, senderName, senderRole, requestId, requestNumber, messageText }) => {
    return {
      subject: `New Message: Requisition ${requestNumber || requestId} from ${senderName}`,
      html: createBaseEmailTemplate({
        title: "New Communication Message",
        badgeText: "Message",
        badgeColor: "#2563EB",
        recipientName,
        bodyContent: `<p>You have received a new message regarding requisition <strong>${requestNumber || requestId}</strong> from <strong>${senderName}</strong> (${senderRole.replace("_", " ").toUpperCase()}).</p>
        <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-left: 4px solid #2563EB; border-radius: 6px; padding: 16px; margin: 16px 0; font-style: italic; color: #1E293B;">
          "${messageText}"
        </div>`,
        details: [
          { label: "Requisition Ref", value: requestNumber || requestId },
          { label: "Sender", value: `${senderName} (${senderRole.replace("_", " ").toUpperCase()})` },
        ],
        actionButton: {
          text: "Open Request Conversation",
          url: `${FRONTEND_URL}/blood-requests`,
        },
      }),
    };
  },

  // 12. Blood Stock Alert (Critical/Low stock)
  stockAlert: ({ recipientName, bloodGroup, remainingUnits, hospitalName, threshold }) => {
    return {
      subject: `CRITICAL INVENTORY ALERT: Blood Group ${bloodGroup} Low (${remainingUnits} units)`,
      html: createBaseEmailTemplate({
        title: "Blood Inventory Alert",
        badgeText: "Critical Low Stock",
        badgeColor: "#DC2626",
        recipientName,
        bodyContent: `<p>Automated telemetry has detected that current stock for <strong>${bloodGroup}</strong> has dropped below the safety threshold of ${threshold} units at <strong>${hospitalName}</strong>.</p>
        <p>Immediate replenishment from regional blood banks or donor campaign intake is recommended.</p>`,
        details: [
          { label: "Blood Group", value: bloodGroup },
          { label: "Remaining Units", value: `${remainingUnits} Units` },
          { label: "Safety Threshold", value: `${threshold} Units` },
          { label: "Facility", value: hospitalName },
        ],
        actionButton: {
          text: "Review Blood Inventory",
          url: `${FRONTEND_URL}/hospital-blood-inventory`,
        },
      }),
    };
  },

  // 13. System Announcement
  systemAnnouncement: ({ recipientName, title, message }) => {
    return {
      subject: `HemoCare Notification: ${title}`,
      html: createBaseEmailTemplate({
        title,
        badgeText: "System Update",
        badgeColor: "#0F172A",
        recipientName,
        bodyContent: `<p>${message}</p>`,
        actionButton: {
          text: "Visit HemoCare Portal",
          url: `${FRONTEND_URL}`,
        },
      }),
    };
  },
};

module.exports = {
  sendEmail,
  verifyConnection,
  EmailTemplates,
  isConfigured: () => isConfigured,
};

