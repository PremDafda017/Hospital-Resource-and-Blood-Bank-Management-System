const dns = require("dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config({ path: "../.env" });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// MongoDB connection
const mongoUri = process.env.MONGODB_URI;
console.log("Connecting to MongoDB URI:", mongoUri);

// Configure Mongoose to fail fast instead of buffering when disconnected
mongoose.set("bufferCommands", false);

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 3000, // Timeout after 3 seconds instead of 10+
  })
  .then(() => {
    console.log("MongoDB connected successfully.");
    console.log("Database name:", mongoose.connection.name);
    console.log("Collections:", Object.keys(mongoose.connection.collections));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    console.warn("Continuing server execution with Mock JSON Database fallback.");
  });

// Generate custom 7-character lowercase alphanumeric ID (e.g. "lx15b16")
const generateCustomId = () => {
  return Math.random().toString(36).substring(2, 9);
};

// User Profile Schema for MongoDB
const userProfileSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    clerkId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    role: { type: String, required: true },
    isVerified: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

// Patient Schema for MongoDB with blood requests, appointments, and profile data
const patientSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    profile: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      dateOfBirth: { type: String, default: "" },
      gender: { type: String, default: "" },
      bloodGroup: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      emergencyContact: { type: String, default: "" },
      emergencyPhone: { type: String, default: "" },
    },
    bloodRequests: [{
      id: { type: Number, required: true },
      bloodGroup: { type: String, required: true },
      units: { type: Number, required: true },
      status: { type: String, default: "Pending" },
      date: { type: String, required: true },
      hospital: { type: String, required: true },
      urgency: { type: String, default: "Normal" },
      reason: { type: String, default: "Patient Request" },
    }],
    appointments: [{
      id: { type: Number, required: true },
      type: { type: String, required: true },
      date: { type: String, required: true },
      time: { type: String, required: true },
      hospital: { type: String, required: true },
      doctor: { type: String, default: "Not Assigned" },
      status: { type: String, default: "Scheduled" },
      notes: { type: String, default: "" },
    }],
    notifications: [{
      id: { type: Number, required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: String, required: true },
      read: { type: Boolean, default: false },
      type: { type: String, default: "info" },
    }],
    reports: [{
      id: { type: Number, required: true },
      title: { type: String, required: true },
      date: { type: String, required: true },
      description: { type: String, default: "" },
      fileUrl: { type: String, default: "" },
    }],
  },
  { timestamps: true }
);

const Patient = mongoose.model("Patient", patientSchema);

// Donor Schema for MongoDB
const donorSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, default: "" },
    profile: {
      firstName: { type: String, default: "" },
      lastName: { type: String, default: "" },
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      dateOfBirth: { type: String, default: "" },
      gender: { type: String, default: "" },
      bloodGroup: { type: String, default: "" },
      weight: { type: String, default: "" },
      lastDonation: { type: String, default: "" },
      medicalConditions: { type: String, default: "" },
      address: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      pincode: { type: String, default: "" },
      emergencyContact: { type: String, default: "" },
      emergencyPhone: { type: String, default: "" },
    },
    totalDonations: { type: Number, default: 0 },
    lastDonationDate: { type: String, default: null },
    nextEligibleDate: { type: String, default: null },
    donations: [{
      id: { type: Number, required: true },
      date: { type: String, required: true },
      location: { type: String, required: true },
      bloodGroup: { type: String, required: true },
      units: { type: Number, required: true },
      status: { type: String, default: "Completed" },
    }],
    appointments: [{
      id: { type: Number, required: true },
      preferredDate: { type: String, required: true },
      preferredTime: { type: String, required: true },
      preferredLocation: { type: String, required: true },
      status: { type: String, default: "Scheduled" },
    }],
    certificates: [{
      id: { type: Number, required: true },
      date: { type: String, required: true },
      location: { type: String, required: true },
      bloodGroup: { type: String, required: true },
      units: { type: Number, required: true },
    }],
  },
  { timestamps: true }
);

const Donor = mongoose.model("Donor", donorSchema);

// Donor Application Schema for MongoDB
const donorApplicationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    clerkId: { type: String, required: true },
    status: { type: String, enum: ["Pending Verification", "Verified", "Rejected"], default: "Pending Verification" },
    rejectionReason: { type: String, default: "" },
    personalInfo: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      gender: { type: String, required: true },
      dateOfBirth: { type: String, required: true },
      age: { type: Number, required: true },
      phone: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      governmentId: { type: String, required: true },
      governmentIdType: { type: String, required: true },
    },
    medicalInfo: {
      bloodGroup: { type: String, required: true },
      weight: { type: Number, required: true },
      height: { type: Number, required: true },
      hemoglobin: { type: Number, required: true },
      medicalConditions: { type: String, default: "" },
      currentMedicines: { type: String, default: "" },
      recentSurgery: { type: Boolean, default: false },
      surgeryDetails: { type: String, default: "" },
      pregnant: { type: Boolean, default: false },
      smoking: { type: Boolean, default: false },
      alcohol: { type: Boolean, default: false },
      vaccinationStatus: { type: String, default: "" },
      covidHistory: { type: String, default: "" },
    },
    lifestyle: {
      exercise: { type: String, default: "" },
      sleep: { type: String, default: "" },
      lastMeal: { type: String, default: "" },
    },
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relationship: { type: String, required: true },
    },
    verifiedBy: { type: String, default: "" },
    verifiedAt: { type: Date, default: null },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

const DonorApplication = mongoose.model("DonorApplication", donorApplicationSchema);

// Appointment Schema for MongoDB
const appointmentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    campaignId: { type: String, default: "" },
    bloodBankId: { type: String, required: true },
    bloodBankName: { type: String, required: true },
    bloodBankAddress: { type: String, required: true },
    bloodBankLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    date: { type: String, required: true },
    time: { type: String, required: true },
    doctor: { type: String, default: "" },
    status: { type: String, enum: ["Upcoming", "Completed", "Cancelled", "Rescheduled", "No Show"], default: "Upcoming" },
    reminders: {
      sent24h: { type: Boolean, default: false },
      sent2h: { type: Boolean, default: false },
      sent30m: { type: Boolean, default: false },
    },
    instructions: { type: String, default: "" },
    checkInTime: { type: String, default: "" },
    screeningResults: {
      bloodPressure: { type: String, default: "" },
      weight: { type: Number, default: 0 },
      temperature: { type: Number, default: 0 },
      hemoglobin: { type: Number, default: 0 },
      approved: { type: Boolean, default: false },
      doctorApproval: { type: String, default: "" },
    },
    donationDetails: {
      unitsCollected: { type: Number, default: 0 },
      collectionTime: { type: String, default: "" },
      staffName: { type: String, default: "" },
    },
    recoveryTime: { type: String, default: "" },
    checkoutTime: { type: String, default: "" },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

const Appointment = mongoose.model("Appointment", appointmentSchema);

// Donation History Schema for MongoDB
const donationHistorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    appointmentId: { type: String, required: true },
    donationNumber: { type: Number, required: true },
    date: { type: String, required: true },
    bloodBankId: { type: String, required: true },
    bloodBankName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    unitsCollected: { type: Number, required: true },
    status: { type: String, enum: ["Completed", "Rejected", "Under Testing"], default: "Completed" },
    certificateId: { type: String, default: "" },
    doctor: { type: String, default: "" },
    remarks: { type: String, default: "" },
    rewardPoints: { type: Number, default: 100 },
  },
  { timestamps: true }
);

const DonationHistory = mongoose.model("DonationHistory", donationHistorySchema);

// Certificate Schema for MongoDB
const certificateSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donationId: { type: String, default: "" },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    certificateNumber: { type: String, required: true, unique: true },
    donorName: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    donationDate: { type: String, default: "" },
    bloodBankName: { type: String, required: true },
    doctor: { type: String, default: "" },
    doctorSignature: { type: String, default: "" },
    hospitalLogo: { type: String, default: "" },
    bloodBankLogo: { type: String, default: "" },
    qrCode: { type: String, default: "" },
    issuedDate: { type: String, default: "" },
    certificateType: { type: String, default: "Donation" },
    validUntil: { type: String, default: "" },
    verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Certificate = mongoose.model("Certificate", certificateSchema);

// Reward Schema for MongoDB
const rewardSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    totalPoints: { type: Number, default: 0 },
    pointsHistory: [{
      id: { type: Number, required: true },
      points: { type: Number, required: true },
      reason: { type: String, required: true },
      date: { type: String, required: true },
      type: { type: String, enum: ["First Donation", "Regular Donation", "Emergency Donation", "Campaign Participation", "Referral"], required: true },
    }],
    badges: [{
      id: { type: Number, required: true },
      name: { type: String, required: true },
      icon: { type: String, required: true },
      description: { type: String, required: true },
      earnedDate: { type: String, required: true },
    }],
    tier: { type: String, enum: ["Bronze", "Silver", "Gold", "Platinum", "Life Saver"], default: "Bronze" },
  },
  { timestamps: true }
);

const Reward = mongoose.model("Reward", rewardSchema);

// Campaign Schema for MongoDB
const campaignSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    bloodBankId: { type: String, required: true },
    bloodBankName: { type: String, required: true },
    bloodBankAddress: { type: String, required: true },
    bloodBankLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    bloodGroupsNeeded: [{ type: String, required: true }],
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    availableSlots: { type: Number, required: true },
    bookedSlots: { type: Number, default: 0 },
    status: { type: String, enum: ["Active", "Upcoming", "Ended", "Cancelled"], default: "Active" },
    participants: [{ type: String }],
    instructions: { type: String, default: "" },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const Campaign = mongoose.model("Campaign", campaignSchema);

// Emergency Request Schema for MongoDB
const emergencyRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    hospitalId: { type: String, required: true },
    hospitalName: { type: String, required: true },
    hospitalAddress: { type: String, required: true },
    hospitalLocation: {
      latitude: { type: Number, default: 0 },
      longitude: { type: Number, default: 0 },
    },
    bloodGroup: { type: String, required: true },
    unitsNeeded: { type: Number, required: true },
    urgency: { type: String, enum: ["Critical", "Urgent", "Normal"], required: true },
    patientCondition: { type: String, required: true },
    contactPerson: { type: String, required: true },
    contactPhone: { type: String, required: true },
    status: { type: String, enum: ["Active", "Fulfilled", "Cancelled"], default: "Active" },
    responses: [{
      donorId: { type: String, required: true },
      donorName: { type: String, required: true },
      responseTime: { type: String, required: true },
      accepted: { type: Boolean, required: true },
    }],
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const EmergencyRequest = mongoose.model("EmergencyRequest", emergencyRequestSchema);

// Eligibility Log Schema for MongoDB
const eligibilityLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    checkDate: { type: String, required: true },
    eligible: { type: Boolean, required: true },
    age: { type: Number, required: true },
    weight: { type: Number, required: true },
    hemoglobin: { type: Number, required: true },
    lastDonationDate: { type: String, default: "" },
    daysSinceLastDonation: { type: Number, default: 0 },
    gender: { type: String, required: true },
    reasons: [{
      factor: { type: String, required: true },
      status: { type: String, required: true },
      message: { type: String, required: true },
    }],
    nextEligibleDate: { type: String, default: "" },
  },
  { timestamps: true }
);

const EligibilityLog = mongoose.model("EligibilityLog", eligibilityLogSchema);

// Medical Report Schema for MongoDB
const medicalReportSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    appointmentId: { type: String, required: true },
    checkDate: { type: String, required: true },
    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true },
      status: { type: String, required: true },
    },
    weight: { type: Number, required: true },
    temperature: { type: Number, required: true },
    hemoglobin: { type: Number, required: true },
    screeningQuestions: [{
      question: { type: String, required: true },
      answer: { type: String, required: true },
      notes: { type: String, default: "" },
    }],
    approved: { type: Boolean, required: true },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

const MedicalReport = mongoose.model("MedicalReport", medicalReportSchema);

// Activity Log Schema for MongoDB
const activityLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    action: { type: String, required: true },
    description: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    metadata: { type: Object, default: {} },
  },
  { timestamps: true }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

// Hospital Staff Schema for MongoDB
const hospitalStaffSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    profile: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      hospitalName: { type: String, default: "" },
      department: { type: String, default: "" },
      position: { type: String, default: "" },
    },
    notifications: [{
      id: { type: Number, required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: String, required: true },
      read: { type: Boolean, default: false },
      type: { type: String, default: "info" },
    }],
  },
  { timestamps: true }
);

const HospitalStaff = mongoose.model("HospitalStaff", hospitalStaffSchema);

// Blood Bank Staff Schema for MongoDB
const bloodBankStaffSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true },
    profile: {
      fullName: { type: String, default: "" },
      phone: { type: String, default: "" },
      bloodBankName: { type: String, default: "" },
      department: { type: String, default: "" },
      position: { type: String, default: "" },
    },
    notifications: [{
      id: { type: Number, required: true },
      title: { type: String, required: true },
      message: { type: String, required: true },
      date: { type: String, required: true },
      read: { type: Boolean, default: false },
      type: { type: String, default: "info" },
    }],
  },
  { timestamps: true }
);

const BloodBankStaff = mongoose.model("BloodBankStaff", bloodBankStaffSchema);

// Blood Inventory Schema for MongoDB
const bloodInventorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true, default: 0 },
    hospital: { type: String, required: true },
    expiryDate: { type: String, default: "" },
    lastUpdated: { type: String, default: new Date().toISOString().split('T')[0] },
    image: { type: String, default: "" },
  },
  { timestamps: true }
);

const BloodInventory = mongoose.model("BloodInventory", bloodInventorySchema, "Blood_Bank");

// Doctors Schema for MongoDB
const doctorsSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    name: { type: String, required: true },
    specialization: { type: String, required: true },
    hospital: { type: String, required: true },
    department: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    availability: { type: String, default: "Available" },
    consultationFee: { type: Number, default: 0 },
    patientsTreated: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    photo: { type: String, default: "" },
    availabilitySchedule: {
      monday: { available: { type: Boolean, default: true }, startTime: { type: String, default: "09:00" }, endTime: { type: String, default: "17:00" } },
      tuesday: { available: { type: Boolean, default: true }, startTime: { type: String, default: "09:00" }, endTime: { type: String, default: "17:00" } },
      wednesday: { available: { type: Boolean, default: true }, startTime: { type: String, default: "09:00" }, endTime: { type: String, default: "17:00" } },
      thursday: { available: { type: Boolean, default: true }, startTime: { type: String, default: "09:00" }, endTime: { type: String, default: "17:00" } },
      friday: { available: { type: Boolean, default: true }, startTime: { type: String, default: "09:00" }, endTime: { type: String, default: "17:00" } },
      saturday: { available: { type: Boolean, default: false }, startTime: { type: String, default: "" }, endTime: { type: String, default: "" } },
      sunday: { available: { type: Boolean, default: false }, startTime: { type: String, default: "" }, endTime: { type: String, default: "" } }
    },
    assignedPatients: [{
      id: { type: Number },
      name: { type: String },
      condition: { type: String },
      lastVisit: { type: String }
    }],
    todayAppointments: { type: Number, default: 0 }
  },
  { timestamps: true }
);

const Doctors = mongoose.model("Doctors", doctorsSchema);

// Patient Appointment Schema for MongoDB
const patientAppointmentSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    appointmentNumber: { type: String, required: true, unique: true },
    patientId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientEmail: { type: String, default: "" },
    patientPhone: { type: String, default: "" },
    hospitalId: { type: String, default: "" },
    hospitalName: { type: String, default: "" },
    doctorId: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    departmentId: { type: String, default: "" },
    department: { type: String, required: true },
    speciality: { type: String, required: true },
    appointmentDate: { type: String, required: true },
    appointmentTime: { type: String, required: true },
    reason: { type: String, default: "" },
    symptoms: { type: String, default: "" },
    medicalReports: [{
      name: { type: String },
      type: { type: String },
      size: { type: Number }
    }], // Array of file objects
    priority: { type: String, default: "Normal", enum: ["Normal", "Urgent", "Emergency"] },
    status: { type: String, default: "Pending", enum: ["Pending", "Approved", "Rejected", "Completed", "Cancelled"] },
    doctorRemarks: { type: String, default: "" },
    prescription: {
      diagnosis: { type: String, default: "" },
      medicines: [{
        name: { type: String },
        dosage: { type: String },
        duration: { type: String }
      }],
      notes: { type: String, default: "" }
    },
    followUpDate: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    createdBy: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    approvedDate: { type: String, default: "" },
    completedBy: { type: String, default: "" },
    completedDate: { type: String, default: "" },
    timeline: [{
      status: { type: String },
      updatedBy: { type: String },
      updatedByName: { type: String },
      timestamp: { type: String },
      notes: { type: String, default: "" }
    }]
  },
  { timestamps: true }
);

const PatientAppointment = mongoose.model("PatientAppointment", patientAppointmentSchema);

// Blood Bank Schema for MongoDB
const bloodBankSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    name: { type: String, required: true },
    hospital: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    email: { type: String, default: "" },
    licenseNumber: { type: String, default: "" },
    type: { type: String, default: "Government" },
    capacity: { type: Number, default: 0 },
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

const BloodBank = mongoose.model("BloodBank", bloodBankSchema);

// Blood Request Schema for MongoDB (separate collection)
const bloodRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    requestNumber: { type: String, required: true, unique: true },
    patientId: { type: String, required: true, ref: "Patient" },
    patientName: { type: String, required: true },
    patientEmail: { type: String, required: true },
    patientPhone: { type: String, default: "" },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true },
    hospitalId: { type: String, default: "", ref: "HospitalStaff" },
    hospitalName: { type: String, default: "" },
    state: { type: String, default: "" },
    city: { type: String, default: "" },
    bloodBankId: { type: String, default: "", ref: "BloodBank" },
    bloodBankName: { type: String, default: "" },
    status: { 
      type: String, 
      required: true, 
      enum: ["Pending", "Under Verification", "Forwarded", "Blood Ready", "Completed", "Rejected"],
      default: "Pending" 
    },
    urgency: { type: String, default: "Normal" },
    reason: { type: String, default: "Patient Request" },
    prescriptionUrl: { type: String, default: "" },
    medicalReportUrl: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    verifiedBy: { type: String, default: "" },
    forwardedBy: { type: String, default: "" },
    forwardedDate: { type: String, default: "" },
    approvedBy: { type: String, default: "" },
    approvedDate: { type: String, default: "" },
    bloodBagNumber: { type: String, default: "" },
    issuedBy: { type: String, default: "" },
    issuedDate: { type: String, default: "" },
    completedDate: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    reportId: { type: String, default: "", ref: "Report" },
    paymentStatus: { type: String, default: "Unpaid", enum: ["Unpaid", "Paid"] },
    paymentId: { type: String, default: "" },
    paymentAmount: { type: Number, default: 0 },
    paymentDate: { type: String, default: "" },
    homeDelivery: { type: Boolean, default: false },
    deliveryAddress: { type: String, default: "" },
    timeline: [{
      status: { type: String, required: true },
      updatedBy: { type: String, required: true },
      updatedByName: { type: String, required: true },
      timestamp: { type: String, required: true },
      notes: { type: String, default: "" }
    }],
  },
  { timestamps: true, strict: false }
);

const BloodRequest = mongoose.model("BloodRequest", bloodRequestSchema);

// Report Schema for MongoDB
const reportSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    reportNumber: { type: String, required: true, unique: true },
    requestId: { type: String, required: true, ref: "BloodRequest" },
    patientId: { type: String, required: true, ref: "Patient" },
    patientName: { type: String, required: true },
    hospitalName: { type: String, required: true },
    bloodBankName: { type: String, default: "" },
    bloodGroup: { type: String, required: true },
    units: { type: Number, required: true },
    bloodBagNumber: { type: String, default: "" },
    doctorName: { type: String, default: "" },
    hospitalStaffName: { type: String, default: "" },
    issueDate: { type: String, required: true },
    status: { type: String, default: "Issued" },
    qrCode: { type: String, default: "" },
    fileUrl: { type: String, default: "" },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

// Notification Schema for MongoDB (separate collection)
const notificationSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    userId: { type: String, required: true },
    userRole: { type: String, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "info" },
    requestId: { type: String, default: "" },
    read: { type: Boolean, default: false },
    priority: { type: String, default: "Normal" },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", notificationSchema);

// Appointment Request Schema for MongoDB (donor appointment requests pending approval)
const appointmentRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, default: "" },
    bloodGroup: { type: String, required: true },
    preferredDate: { type: String, default: "" },
    preferredTime: { type: String, default: "" },
    location: { type: String, default: "" },
    bloodBankName: { type: String, default: "" },
    doctor: { type: String, default: "" },
    notes: { type: String, default: "" },
    requestType: { type: String, default: "Appointment" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected", "Completed"], default: "Pending" },
    approvedBy: { type: String, default: "" },
    approvedDate: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
    requestedDate: { type: String, default: "" },
  },
  { timestamps: true }
);

const AppointmentRequest = mongoose.model("AppointmentRequest", appointmentRequestSchema);

// Campaign Request Schema for MongoDB (campaign participation requests pending approval)
const campaignRequestSchema = new mongoose.Schema(
  {
    _id: { type: String, default: generateCustomId },
    donorId: { type: String, required: true },
    clerkId: { type: String, required: true },
    donorName: { type: String, required: true },
    donorEmail: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    campaignId: { type: String, required: true },
    campaignName: { type: String, required: true },
    requestDate: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    approvedBy: { type: String, default: "" },
    approvedDate: { type: String, default: "" },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true }
);

const CampaignRequest = mongoose.model("CampaignRequest", campaignRequestSchema);

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  // Join user-specific room for notifications
  socket.on("join-user-room", (userId) => {
    socket.join(`user-${userId}`);
    console.log(`User ${userId} joined room`);
  });

  // Join blood bank staff room
  socket.on("join-staff-room", () => {
    socket.join("blood-bank-staff");
    console.log("Blood bank staff joined room");
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Helper function to emit notifications
const emitNotification = (userId, notification) => {
  io.to(`user-${userId}`).emit("notification", notification);
};

const emitStaffNotification = (notification) => {
  io.to("blood-bank-staff").emit("staff-notification", notification);
};

// Local JSON file mock database fallback setup
const mockDbPath = path.join(__dirname, "mockDb.json");

const getMockProfiles = () => {
  if (!fs.existsSync(mockDbPath)) {
    fs.writeFileSync(mockDbPath, JSON.stringify([], null, 2));
  }
  try {
    return JSON.parse(fs.readFileSync(mockDbPath, "utf8"));
  } catch (err) {
    return [];
  }
};

const saveMockProfile = (profileData) => {
  const profiles = getMockProfiles();
  const index = profiles.findIndex((p) => p.clerkId === profileData.clerkId);
  const now = new Date().toISOString();
  let updatedProfile;

  if (index !== -1) {
    updatedProfile = {
      ...profiles[index],
      fullName: profileData.fullName,
      email: profileData.email,
      role: profileData.role,
      isVerified: true,
      updatedAt: now,
    };
    profiles[index] = updatedProfile;
  } else {
    updatedProfile = {
      _id: generateCustomId(),
      clerkId: profileData.clerkId,
      fullName: profileData.fullName,
      email: profileData.email,
      role: profileData.role,
      isVerified: true,
      createdAt: now,
      updatedAt: now,
    };
    profiles.push(updatedProfile);
  }

  fs.writeFileSync(mockDbPath, JSON.stringify(profiles, null, 2));
  return updatedProfile;
};

// Create or update user profile route
app.post("/api/users/create-profile", async (req, res) => {
  const { clerkId, fullName, email, role } = req.body;

  if (!clerkId || !fullName || !email || !role) {
    return res.status(400).json({ message: "clerkId, fullName, email, and role are required." });
  }

  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      // Check if profile already exists for this clerkId
      let profile = await UserProfile.findOne({ clerkId });

      if (profile) {
        // Update existing profile
        profile.fullName = fullName;
        profile.email = email;
        profile.role = role;
        profile.isVerified = true;
        await profile.save();
        console.log(`[MongoDB] Updated profile for Clerk ID: ${clerkId}`);
        return res.status(200).json({ message: "Profile updated successfully.", profile });
      }

      // Create new profile with custom ID
      const customId = generateCustomId();
      profile = new UserProfile({
        _id: customId,
        clerkId,
        fullName,
        email,
        role,
        isVerified: true
      });

      await profile.save();
      console.log(`[MongoDB] Created profile in database:`, profile);
      res.status(201).json({ message: "Profile created successfully in database.", profile });
    } catch (err) {
      console.error("Create profile error:", err);
      res.status(500).json({ message: "Server error occurred while creating profile." });
    }
  } else {
    // Fallback to Mock Database
    try {
      const profile = saveMockProfile({ clerkId, fullName, email, role });
      console.log(`[MockDB] Saved profile (MongoDB offline):`, profile);
      res.status(201).json({
        message: "Profile saved successfully in Mock local database (MongoDB connection not active).",
        profile,
      });
    } catch (err) {
      console.error("Mock save profile error:", err);
      res.status(500).json({ message: "Server error saving to mock database." });
    }
  }
});

// Check profile in MongoDB by clerkId
app.get("/api/users/profile/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const profile = await UserProfile.findOne({ clerkId });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found in database." });
      }
      res.status(200).json(profile);
    } catch (err) {
      console.error("Get profile error:", err);
      res.status(500).json({ message: "Server error occurred while retrieving profile." });
    }
  } else {
    // Fallback to Mock Database
    const profiles = getMockProfiles();
    const profile = profiles.find((p) => p.clerkId === clerkId);
    if (!profile) {
      return res.status(404).json({ message: "Profile not found in Mock database." });
    }
    res.status(200).json(profile);
  }
});

// ==================== PATIENT DATA API ENDPOINTS ====================

// Get or create patient data by clerkId
app.get("/api/patient/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let patient = await Patient.findOne({ clerkId });
      if (!patient) {
        patient = new Patient({
          clerkId,
          email: req.query.email || "",
          profile: {},
          bloodRequests: [],
          appointments: [],
          notifications: [],
          reports: [],
        });
        await patient.save();
      }

      // Fetch blood requests from BloodRequest collection instead of embedded array
      const bloodRequests = await BloodRequest.find({ patientId: patient._id }).sort({ createdAt: -1 });
      console.log('Fetched blood requests for patient:', bloodRequests);
      console.log('First request state:', bloodRequests[0]?.state);
      console.log('First request city:', bloodRequests[0]?.city);
      
      // Return patient data with blood requests from the collection
      res.status(200).json({
        ...patient.toObject(),
        bloodRequests: bloodRequests
      });
    } catch (err) {
      console.error("Get patient error:", err);
      res.status(500).json({ message: "Server error occurred while retrieving patient data." });
    }
  } else {
    res.status(200).json({
      clerkId,
      email: req.query.email || "",
      profile: {},
      bloodRequests: [],
      appointments: [],
      notifications: [],
      reports: [],
    });
  }
});

// Get all patients
app.get("/api/patient/all", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patients = await Patient.find({});
      res.status(200).json(patients);
    } catch (err) {
      console.error("Get all patients error:", err);
      res.status(500).json({ message: "Server error occurred while fetching patients." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get users by role (for HospitalStaff to view patients)
app.get("/api/users/role/:role", async (req, res) => {
  const { role } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    const users = await UserProfile.find({ role });
    res.status(200).json(users);
  } catch (err) {
    console.error("Get users by role error:", err);
    res.status(500).json({ message: "Server error occurred while fetching users." });
  }
});

// Update patient profile
app.put("/api/patient/:clerkId/profile", async (req, res) => {
  const { clerkId } = req.params;
  const { profile } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      patient.profile = { ...patient.profile, ...profile };
      await patient.save();
      res.status(200).json({ message: "Profile updated successfully.", patient });
    } catch (err) {
      console.error("Update profile error:", err);
      res.status(500).json({ message: "Server error occurred while updating profile." });
    }
  } else {
    res.status(200).json({ message: "Profile updated (MongoDB offline)." });
  }
});

// Add blood request (using separate BloodRequest collection)
app.post("/api/patient/:clerkId/blood-requests", async (req, res) => {
  const { clerkId } = req.params;
  const { request, email } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  console.log('POST blood request - clerkId:', clerkId);
  console.log('POST blood request - request:', request);
  console.log('POST blood request - email:', email);
  console.log('MongoDB connected:', isDbConnected);

  if (isDbConnected) {
    try {
      // Get or create patient
      let patient = await Patient.findOne({ clerkId });
      console.log('Found patient:', patient ? 'Yes' : 'No');
      
      if (!patient) {
        console.log('Creating new patient for blood request');
        patient = new Patient({
          clerkId,
          email: email || "",
          profile: {},
          bloodRequests: [],
          appointments: [],
          notifications: [],
          reports: [],
        });
        await patient.save();
      }
      
      // Generate request number
      const requestNumber = `BR-${Date.now()}`;
      
      // Create blood request in separate collection
      console.log('Creating blood request with state:', request.state);
      console.log('Creating blood request with city:', request.city);
      const bloodRequest = new BloodRequest({
        requestNumber,
        patientId: patient._id,
        patientName: patient.profile?.fullName || "Unknown",
        patientEmail: email || patient.email,
        patientPhone: patient.profile?.phone || "",
        bloodGroup: request.bloodGroup,
        units: request.units,
        hospitalId: "", // Will be assigned by hospital staff
        hospitalName: request.hospital || "",
        state: request.state || "",
        city: request.city || "",
        bloodBankId: "",
        bloodBankName: "",
        status: "Pending",
        urgency: request.urgency || "Normal",
        reason: request.reason || "Patient Request",
        prescriptionUrl: request.prescriptionUrl || "",
        medicalReportUrl: request.medicalReportUrl || "",
        doctorName: request.doctorName || "",
        timeline: [{
          status: "Pending",
          updatedBy: clerkId,
          updatedByName: patient.profile?.fullName || "Patient",
          timestamp: new Date().toISOString(),
          notes: "Blood request submitted by patient"
        }]
      });
      
      await bloodRequest.save();
      console.log('Blood request saved to BloodRequest collection');
      console.log('Saved request state:', bloodRequest.state);
      console.log('Saved request city:', bloodRequest.city);
      console.log('Full saved request:', bloodRequest.toObject());
      
      // Also add to patient's bloodRequests array for backward compatibility
      patient.bloodRequests.push({
        id: parseInt(request.id || Date.now()),
        bloodGroup: request.bloodGroup,
        units: request.units,
        status: "Pending",
        date: request.date || new Date().toISOString().split('T')[0],
        hospital: request.hospital || "",
        urgency: request.urgency || "Normal",
        reason: request.reason || "Patient Request"
      });
      await patient.save();
      
      // Create notification for patient
      const patientNotification = new Notification({
        userId: patient._id,
        userRole: "patient",
        title: "Blood Request Submitted",
        message: `Your blood request #${requestNumber} has been submitted successfully. Status: Pending`,
        type: "success",
        requestId: bloodRequest._id,
        priority: "Normal"
      });
      await patientNotification.save();
      
      // Notify all hospital staff about new blood request (non-blocking)
      setImmediate(async () => {
        try {
          const allStaff = await HospitalStaff.find({});
          if (allStaff && allStaff.length > 0) {
            for (const staff of allStaff) {
              const staffNotification = new Notification({
                userId: staff._id,
                userRole: "hospitalstaff",
                title: "New Blood Request",
                message: `New blood request #${requestNumber} for ${request.bloodGroup} (${request.units} units) from ${patient.profile?.fullName || "Patient"}`,
                type: "info",
                requestId: bloodRequest._id,
                priority: request.urgency === "Critical" ? "High" : "Normal"
              });
              await staffNotification.save();
              
              // Also add to staff's notifications array for backward compatibility
              staff.notifications.unshift({
                id: Date.now(),
                title: "New Blood Request",
                message: `New blood request for ${request.bloodGroup} (${request.units} units) from ${patient.profile?.fullName || "Patient"}`,
                date: new Date().toISOString().split('T')[0],
                read: false,
                type: "info"
              });
              await staff.save();
            }
          }
        } catch (notifyErr) {
          console.error("Error notifying hospital staff:", notifyErr);
        }
      });
      
      res.status(201).json({ message: "Blood request added successfully.", bloodRequest, patient });
    } catch (err) {
      console.error("Add blood request error:", err);
      res.status(500).json({ message: "Server error occurred while adding blood request." });
    }
  } else {
    res.status(201).json({ message: "Blood request added (MongoDB offline)." });
  }
});

// Update blood request
app.put("/api/patient/:clerkId/blood-requests/:requestId", async (req, res) => {
  const { clerkId, requestId } = req.params;
  const { request } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      const index = patient.bloodRequests.findIndex(r => r.id === parseInt(requestId));
      if (index === -1) {
        return res.status(404).json({ message: "Blood request not found." });
      }
      patient.bloodRequests[index] = { ...patient.bloodRequests[index], ...request };
      await patient.save();
      res.status(200).json({ message: "Blood request updated successfully.", patient });
    } catch (err) {
      console.error("Update blood request error:", err);
      res.status(500).json({ message: "Server error occurred while updating blood request." });
    }
  } else {
    res.status(200).json({ message: "Blood request updated (MongoDB offline)." });
  }
});

// Delete blood request
app.delete("/api/patient/:clerkId/blood-requests/:requestId", async (req, res) => {
  const { clerkId, requestId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      // Delete from BloodRequest collection
      const deletedRequest = await BloodRequest.findByIdAndDelete(requestId);
      
      if (!deletedRequest) {
        return res.status(404).json({ message: "Blood request not found." });
      }
      
      res.status(200).json({ message: "Blood request deleted successfully." });
    } catch (err) {
      console.error("Delete blood request error:", err);
      res.status(500).json({ message: "Server error occurred while deleting blood request." });
    }
  } else {
    res.status(200).json({ message: "Blood request deleted (MongoDB offline)." });
  }
});

// Approve or拒绝 blood request (Hospital Staff)
app.put("/api/hospital/blood-requests/:requestId/status", async (req, res) => {
  const { requestId } = req.params;
  const { status, clerkId } = req.body; // clerkId is the patient's clerkId
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      
      const requestIndex = patient.bloodRequests.findIndex(r => r.id === parseInt(requestId));
      if (requestIndex === -1) {
        return res.status(404).json({ message: "Blood request not found." });
      }
      
      // Update the blood request status
      patient.bloodRequests[requestIndex].status = status;
      
      // Add notification to patient
      const notification = {
        id: Date.now(),
        title: status === "Approved" ? "Blood Request Approved" : "Blood Request Rejected",
        message: status === "Approved" 
          ? `Your blood request for ${patient.bloodRequests[requestIndex].bloodGroup} has been approved.`
          : `Your blood request for ${patient.bloodRequests[requestIndex].bloodGroup} has been rejected.`,
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: status === "Approved" ? "success" : "error"
      };
      patient.notifications.unshift(notification);
      
      await patient.save();
      res.status(200).json({ message: `Blood request ${status.toLowerCase()} successfully.`, patient });
    } catch (err) {
      console.error("Update blood request status error:", err);
      res.status(500).json({ message: "Server error occurred while updating blood request status." });
    }
  } else {
    res.status(200).json({ message: "Blood request status updated (MongoDB offline)." });
  }
});

// Add appointment
app.post("/api/patient/:clerkId/appointments", async (req, res) => {
  const { clerkId } = req.params;
  const { appointment } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let patient = await Patient.findOne({ clerkId });
      if (!patient) {
        patient = new Patient({
          clerkId,
          email: req.body.email || "",
          profile: {},
          bloodRequests: [],
          appointments: [],
          notifications: [],
          reports: [],
        });
      }
      patient.appointments.push(appointment);
      await patient.save();
      
      // Notify all hospital staff about new appointment (non-blocking)
      setImmediate(async () => {
        try {
          const allStaff = await HospitalStaff.find({});
          if (allStaff && allStaff.length > 0) {
            const notification = {
              id: Date.now(),
              title: "New Appointment",
              message: `New ${appointment.type} appointment on ${appointment.date} at ${appointment.time} from ${patient.profile?.fullName || "Patient"}`,
              date: new Date().toISOString().split('T')[0],
              read: false,
              type: "info"
            };
            
            for (const staff of allStaff) {
              staff.notifications.unshift(notification);
              await staff.save();
            }
          }
        } catch (notifyErr) {
          console.error("Error notifying hospital staff:", notifyErr);
        }
      });
      
      res.status(201).json({ message: "Appointment added successfully.", patient });
    } catch (err) {
      console.error("Add appointment error:", err);
      res.status(500).json({ message: "Server error occurred while adding appointment." });
    }
  } else {
    res.status(201).json({ message: "Appointment added (MongoDB offline)." });
  }
});

// Update appointment
app.put("/api/patient/:clerkId/appointments/:appointmentId", async (req, res) => {
  const { clerkId, appointmentId } = req.params;
  const { appointment } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      const index = patient.appointments.findIndex(a => a.id === parseInt(appointmentId));
      if (index === -1) {
        return res.status(404).json({ message: "Appointment not found." });
      }
      patient.appointments[index] = { ...patient.appointments[index], ...appointment };
      await patient.save();
      res.status(200).json({ message: "Appointment updated successfully.", patient });
    } catch (err) {
      console.error("Update appointment error:", err);
      res.status(500).json({ message: "Server error occurred while updating appointment." });
    }
  } else {
    res.status(200).json({ message: "Appointment updated (MongoDB offline)." });
  }
});

// Delete appointment
app.delete("/api/patient/:clerkId/appointments/:appointmentId", async (req, res) => {
  const { clerkId, appointmentId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      patient.appointments = patient.appointments.filter(a => a.id !== parseInt(appointmentId));
      await patient.save();
      res.status(200).json({ message: "Appointment deleted successfully.", patient });
    } catch (err) {
      console.error("Delete appointment error:", err);
      res.status(500).json({ message: "Server error occurred while deleting appointment." });
    }
  } else {
    res.status(200).json({ message: "Appointment deleted (MongoDB offline)." });
  }
});

// Approve or reject appointment (Hospital Staff)
app.put("/api/hospital/appointments/:appointmentId/status", async (req, res) => {
  const { appointmentId } = req.params;
  const { status, clerkId } = req.body; // clerkId is the patient's clerkId
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      
      const appointmentIndex = patient.appointments.findIndex(a => a.id === parseInt(appointmentId));
      if (appointmentIndex === -1) {
        return res.status(404).json({ message: "Appointment not found." });
      }
      
      // Update the appointment status
      patient.appointments[appointmentIndex].status = status;
      
      // Add notification to patient
      const notification = {
        id: Date.now(),
        title: status === "Approved" ? "Appointment Approved" : "Appointment Rejected",
        message: status === "Approved" 
          ? `Your appointment for ${patient.appointments[appointmentIndex].type} on ${patient.appointments[appointmentIndex].date} has been approved.`
          : `Your appointment for ${patient.appointments[appointmentIndex].type} on ${patient.appointments[appointmentIndex].date} has been rejected.`,
        date: new Date().toISOString().split('T')[0],
        read: false,
        type: status === "Approved" ? "success" : "error"
      };
      patient.notifications.unshift(notification);
      
      await patient.save();
      res.status(200).json({ message: `Appointment ${status.toLowerCase()} successfully.`, patient });
    } catch (err) {
      console.error("Update appointment status error:", err);
      res.status(500).json({ message: "Server error occurred while updating appointment status." });
    }
  } else {
    res.status(200).json({ message: "Appointment status updated (MongoDB offline)." });
  }
});

// Add notification
app.post("/api/patient/:clerkId/notifications", async (req, res) => {
  const { clerkId } = req.params;
  const { notification } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let patient = await Patient.findOne({ clerkId });
      if (!patient) {
        patient = new Patient({
          clerkId,
          email: req.body.email || "",
          profile: {},
          bloodRequests: [],
          appointments: [],
          notifications: [],
          reports: [],
        });
      }
      patient.notifications.push(notification);
      await patient.save();
      res.status(201).json({ message: "Notification added successfully.", patient });
    } catch (err) {
      console.error("Add notification error:", err);
      res.status(500).json({ message: "Server error occurred while adding notification." });
    }
  } else {
    res.status(201).json({ message: "Notification added (MongoDB offline)." });
  }
});

// Update notification
app.put("/api/patient/:clerkId/notifications/:notificationId", async (req, res) => {
  const { clerkId, notificationId } = req.params;
  const { notification } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      const index = patient.notifications.findIndex(n => n.id === parseInt(notificationId));
      if (index === -1) {
        return res.status(404).json({ message: "Notification not found." });
      }
      patient.notifications[index] = { ...patient.notifications[index], ...notification };
      await patient.save();
      res.status(200).json({ message: "Notification updated successfully.", patient });
    } catch (err) {
      console.error("Update notification error:", err);
      res.status(500).json({ message: "Server error occurred while updating notification." });
    }
  } else {
    res.status(200).json({ message: "Notification updated (MongoDB offline)." });
  }
});

// Delete notification
app.delete("/api/patient/:clerkId/notifications/:notificationId", async (req, res) => {
  const { clerkId, notificationId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patient = await Patient.findOne({ clerkId });
      if (!patient) {
        return res.status(404).json({ message: "Patient not found." });
      }
      patient.notifications = patient.notifications.filter(n => n.id !== parseInt(notificationId));
      await patient.save();
      res.status(200).json({ message: "Notification deleted successfully.", patient });
    } catch (err) {
      console.error("Delete notification error:", err);
      res.status(500).json({ message: "Server error occurred while deleting notification." });
    }
  } else {
    res.status(200).json({ message: "Notification deleted (MongoDB offline)." });
  }
});

// Add report
app.post("/api/patient/:clerkId/reports", async (req, res) => {
  const { clerkId } = req.params;
  const { report, email } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let patient = await Patient.findOne({ clerkId });
      if (!patient) {
        patient = new Patient({
          clerkId,
          email: email || "",
          profile: {},
          bloodRequests: [],
          appointments: [],
          notifications: [],
          reports: [],
        });
      }
      patient.reports.push(report);
      await patient.save();
      res.status(201).json({ message: "Report added successfully.", patient });
    } catch (err) {
      console.error("Add report error:", err);
      res.status(500).json({ message: "Server error occurred while adding report." });
    }
  } else {
    res.status(201).json({ message: "Report added (MongoDB offline)." });
  }
});

// ==================== DONOR DATA API ENDPOINTS ====================

// Get or create donor data by clerkId
app.get("/api/donor/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const { email } = req.query;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let donor = await Donor.findOne({ clerkId });
      if (!donor) {
        // Create donor if not found (like patient)
        donor = new Donor({
          clerkId,
          email: email || "",
          profile: {},
          donations: [],
          appointments: [],
          certificates: [],
          totalDonations: 0,
          lastDonationDate: null,
          nextEligibleDate: null,
        });
        await donor.save();
      } else {
        // Migrate old flat structure to nested profile if needed
        if (!donor.profile || Object.keys(donor.profile).length === 0) {
          donor.profile = {
            firstName: donor.firstName || "",
            lastName: donor.lastName || "",
            fullName: donor.fullName || "",
            phone: donor.phone || "",
            dateOfBirth: donor.dateOfBirth || "",
            gender: donor.gender || "",
            bloodGroup: donor.bloodGroup || "",
            weight: donor.weight || "",
            lastDonation: donor.lastDonation || "",
            medicalConditions: donor.medicalConditions || "",
            address: donor.address || "",
            city: donor.city || "",
            state: donor.state || "",
            pincode: donor.pincode || "",
            emergencyContact: donor.emergencyContact || "",
            emergencyPhone: donor.emergencyPhone || "",
          };
          await donor.save();
          console.log("Migrated donor to new profile structure");
        }
      }
      res.status(200).json(donor);
    } catch (err) {
      console.error("Get donor error:", err);
      res.status(500).json({ message: "Server error occurred while fetching donor data." });
    }
  } else {
    res.status(200).json({
      clerkId,
      email: email || "",
      profile: {},
      donations: [],
      appointments: [],
      certificates: [],
      totalDonations: 0,
      lastDonationDate: null,
      nextEligibleDate: null,
    });
  }
});

// Register new donor
app.post("/api/donor/:clerkId/register", async (req, res) => {
  const { clerkId } = req.params;
  const donorData = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      // Check if donor already exists
      let existingDonor = await Donor.findOne({ clerkId });
      if (existingDonor) {
        return res.status(400).json({ message: "Donor already registered." });
      }

      // Create new donor
      const newDonor = new Donor({
        clerkId,
        ...donorData,
        totalDonations: 0,
        lastDonationDate: null,
        nextEligibleDate: null,
        donations: [],
        appointments: [],
        certificates: [],
      });

      await newDonor.save();
      res.status(201).json({ message: "Donor registered successfully.", donor: newDonor });
    } catch (err) {
      console.error("Register donor error:", err);
      res.status(500).json({ message: "Server error occurred while registering donor." });
    }
  } else {
    res.status(200).json({ message: "Donor registered (MongoDB offline)." });
  }
});

// Update donor profile
app.put("/api/donor/:clerkId/profile", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let donor = await Donor.findOne({ clerkId });
      if (!donor) {
        return res.status(404).json({ message: "Donor not found." });
      }

      // Update donor profile object
      const profileData = req.body.profile || req.body;
      donor.profile = { ...donor.profile, ...profileData };

      await donor.save();
      res.status(200).json({ message: "Donor profile updated successfully.", donor });
    } catch (err) {
      console.error("Update donor profile error:", err);
      res.status(500).json({ message: "Server error occurred while updating donor profile." });
    }
  } else {
    res.status(200).json({ message: "Donor profile updated (MongoDB offline)." });
  }
});

// Submit donor application
app.post("/api/donor/application", async (req, res) => {
  const applicationData = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      // Check if application already exists
      const existingApplication = await DonorApplication.findOne({ clerkId: applicationData.clerkId });
      if (existingApplication) {
        return res.status(400).json({ message: "Application already submitted." });
      }

      const newApplication = new DonorApplication(applicationData);
      await newApplication.save();
      
      // Log activity
      const activityLog = new ActivityLog({
        donorId: newApplication._id,
        clerkId: applicationData.clerkId,
        action: "Application Submitted",
        description: "Donor submitted registration application",
        metadata: { applicationId: newApplication._id }
      });
      await activityLog.save();

      res.status(201).json({ message: "Application submitted successfully.", application: newApplication });
    } catch (err) {
      console.error("Submit donor application error:", err);
      res.status(500).json({ message: "Server error occurred while submitting application." });
    }
  } else {
    res.status(200).json({ message: "Application submitted (MongoDB offline)." });
  }
});

// Get donor application
app.get("/api/donor/application/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const application = await DonorApplication.findOne({ clerkId });
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }
      res.status(200).json(application);
    } catch (err) {
      console.error("Get donor application error:", err);
      res.status(500).json({ message: "Server error occurred while fetching application." });
    }
  } else {
    res.status(200).json({ message: "MongoDB offline." });
  }
});

// Get all pending applications (for blood bank staff)
app.get("/api/donor/applications/pending", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const applications = await DonorApplication.find({ status: "Pending Verification" });
      res.status(200).json(applications);
    } catch (err) {
      console.error("Get pending applications error:", err);
      res.status(500).json({ message: "Server error occurred while fetching applications." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Verify donor application (approve/reject)
app.put("/api/donor/application/:applicationId/verify", async (req, res) => {
  const { applicationId } = req.params;
  const { status, rejectionReason, verifiedBy, remarks } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const application = await DonorApplication.findById(applicationId);
      if (!application) {
        return res.status(404).json({ message: "Application not found." });
      }

      application.status = status;
      application.rejectionReason = rejectionReason || "";
      application.verifiedBy = verifiedBy;
      application.verifiedAt = new Date();
      application.remarks = remarks || "";

      await application.save();

      // If approved, update donor status
      if (status === "Verified") {
        const donor = await Donor.findOne({ clerkId: application.clerkId });
        if (donor) {
          donor.profile = { ...donor.profile, ...application.personalInfo };
          donor.profile.bloodGroup = application.medicalInfo.bloodGroup;
          donor.profile.weight = application.medicalInfo.weight;
          await donor.save();
        }
      }

      // Log activity
      const activityLog = new ActivityLog({
        donorId: application._id,
        clerkId: application.clerkId,
        action: status === "Verified" ? "Application Approved" : "Application Rejected",
        description: status === "Verified" ? "Donor application approved" : `Donor application rejected: ${rejectionReason}`,
        metadata: { applicationId, verifiedBy, status }
      });
      await activityLog.save();

      res.status(200).json({ message: `Application ${status.toLowerCase()} successfully.`, application });
    } catch (err) {
      console.error("Verify donor application error:", err);
      res.status(500).json({ message: "Server error occurred while verifying application." });
    }
  } else {
    res.status(200).json({ message: "Application verified (MongoDB offline)." });
  }
});

// Check donor eligibility
app.post("/api/donor/:clerkId/eligibility", async (req, res) => {
  const { clerkId } = req.params;
  const { age, weight, hemoglobin, gender, lastDonationDate } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const donor = await Donor.findOne({ clerkId });
      if (!donor) {
        return res.status(404).json({ message: "Donor not found." });
      }

      const reasons = [];
      let eligible = true;
      let nextEligibleDate = "";

      // Check age (18-65)
      if (age < 18 || age > 65) {
        eligible = false;
        reasons.push({
          factor: "Age",
          status: "Failed",
          message: age < 18 ? "Must be at least 18 years old" : "Maximum age is 65 years"
        });
      } else {
        reasons.push({
          factor: "Age",
          status: "Passed",
          message: `${age} years old`
        });
      }

      // Check weight (50kg minimum)
      if (weight < 50) {
        eligible = false;
        reasons.push({
          factor: "Weight",
          status: "Failed",
          message: "Must be at least 50kg"
        });
      } else {
        reasons.push({
          factor: "Weight",
          status: "Passed",
          message: `${weight}kg`
        });
      }

      // Check hemoglobin (12.5g/dL for men, 12.0g/dL for women)
      if (gender === "Female" && hemoglobin < 12.0) {
        eligible = false;
        reasons.push({
          factor: "Hemoglobin",
          status: "Failed",
          message: "Must be at least 12.0g/dL for females"
        });
      } else if (gender === "Male" && hemoglobin < 12.5) {
        eligible = false;
        reasons.push({
          factor: "Hemoglobin",
          status: "Failed",
          message: "Must be at least 12.5g/dL for males"
        });
      } else {
        reasons.push({
          factor: "Hemoglobin",
          status: "Passed",
          message: `${hemoglobin}g/dL`
        });
      }

      // Check last donation date (minimum 56 days gap)
      if (lastDonationDate) {
        const lastDonation = new Date(lastDonationDate);
        const today = new Date();
        const daysSinceDonation = Math.floor((today - lastDonation) / (1000 * 60 * 60 * 24));
        
        if (daysSinceDonation < 56) {
          eligible = false;
          const nextDate = new Date(lastDonation);
          nextDate.setDate(nextDate.getDate() + 56);
          nextEligibleDate = nextDate.toISOString().split('T')[0];
          reasons.push({
            factor: "Last Donation",
            status: "Failed",
            message: `Last donation was ${daysSinceDonation} days ago. Must wait 56 days. Next eligible: ${nextEligibleDate}`
          });
        } else {
          reasons.push({
            factor: "Last Donation",
            status: "Passed",
            message: `${daysSinceDonation} days since last donation`
          });
        }
      } else {
        reasons.push({
          factor: "Last Donation",
          status: "Passed",
          message: "No previous donation"
        });
      }

      // Save eligibility result to database
      const eligibilityLog = new EligibilityLog({
        donorId: donor._id,
        clerkId,
        age,
        weight,
        hemoglobin,
        gender,
        lastDonationDate,
        eligible,
        reasons,
        nextEligibleDate,
        checkedDate: new Date().toISOString().split('T')[0]
      });
      await eligibilityLog.save();

      // Update donor's eligibility status in profile
      donor.eligibilityStatus = {
        isEligible: eligible,
        score: reasons.filter(r => r.status === "Passed").length * 25,
        lastChecked: new Date().toISOString(),
        nextEligibleDate
      };
      await donor.save();

      res.status(200).json({ eligible, reasons, nextEligibleDate });
    } catch (err) {
      console.error("Check eligibility error:", err);
      res.status(500).json({ message: "Server error occurred while checking eligibility." });
    }
  } else {
    res.status(200).json({ eligible: true, reasons: [], nextEligibleDate: "" });
  }
});

// Get donor eligibility status
app.get("/api/donor/:clerkId/eligibility-status", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const donor = await Donor.findOne({ clerkId });
      if (!donor) {
        return res.status(404).json({ message: "Donor not found." });
      }

      res.status(200).json(donor.eligibilityStatus || { isEligible: true, score: 0, lastChecked: null, nextEligibleDate: "" });
    } catch (err) {
      console.error("Get eligibility status error:", err);
      res.status(500).json({ message: "Server error occurred while fetching eligibility status." });
    }
  } else {
    res.status(200).json({ isEligible: true, score: 0, lastChecked: null, nextEligibleDate: "" });
  }
});

// Get donor dashboard data
app.get("/api/donor/:clerkId/dashboard", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const donor = await Donor.findOne({ clerkId });
      if (!donor) {
        return res.status(404).json({ message: "Donor not found." });
      }

      const application = await DonorApplication.findOne({ clerkId });
      const appointments = await Appointment.find({ clerkId, status: "Upcoming" }).sort({ date: 1 });
      const recentDonations = await DonationHistory.find({ clerkId }).sort({ date: -1 }).limit(5);
      const reward = await Reward.findOne({ clerkId });
      const emergencyRequests = await EmergencyRequest.find({ status: "Active" }).sort({ createdAt: -1 }).limit(5);
      const campaigns = await Campaign.find({ status: "Active" }).sort({ startDate: 1 }).limit(5);

      // Calculate eligibility
      let eligible = true;
      let nextEligibleDate = "";
      if (donor.profile.dateOfBirth) {
        const age = new Date().getFullYear() - new Date(donor.profile.dateOfBirth).getFullYear();
        if (age < 18 || age > 65) eligible = false;
      }
      if (donor.profile.weight && donor.profile.weight < 50) eligible = false;
      if (donor.lastDonationDate) {
        const lastDonation = new Date(donor.lastDonationDate);
        const daysSinceLastDonation = Math.floor((new Date() - lastDonation) / (1000 * 60 * 60 * 24));
        const minDays = donor.profile.gender === "Female" ? 120 : 90;
        if (daysSinceLastDonation < minDays) {
          eligible = false;
          const daysRemaining = minDays - daysSinceLastDonation;
          const nextDate = new Date();
          nextDate.setDate(new Date().getDate() + daysRemaining);
          nextEligibleDate = nextDate.toISOString().split('T')[0];
        }
      }

      res.status(200).json({
        donor,
        application,
        appointments,
        recentDonations,
        reward,
        emergencyRequests,
        campaigns,
        eligibility: {
          eligible,
          nextEligibleDate,
          lastDonationDate: donor.lastDonationDate,
          totalDonations: donor.totalDonations
        }
      });
    } catch (err) {
      console.error("Get donor dashboard error:", err);
      res.status(500).json({ message: "Server error occurred while fetching dashboard data." });
    }
  } else {
    res.status(200).json({ message: "MongoDB offline." });
  }
});

// Get donor donation history
app.get("/api/donor/:clerkId/donations", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const donations = await DonationHistory.find({ clerkId }).sort({ date: -1 });
      res.status(200).json(donations);
    } catch (err) {
      console.error("Get donor donations error:", err);
      res.status(500).json({ message: "Server error occurred while fetching donation history." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get donor appointments
app.get("/api/donor/:clerkId/appointments", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const appointments = await Appointment.find({ clerkId }).sort({ date: -1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get donor appointments error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointments." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Create appointment request (for donor to request donation appointment)
app.post("/api/donor/:clerkId/appointment-requests", async (req, res) => {
  const { clerkId } = req.params;
  const requestType = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const donor = await Donor.findOne({ clerkId });
      if (!donor) {
        return res.status(404).json({ message: "Donor not found." });
      }

      const newRequest = new AppointmentRequest({
        clerkId,
        donorId: donor._id,
        donorName: requestType.donorName || `${donor.profile.firstName} ${donor.profile.lastName}`,
        donorEmail: donor.profile.email || "",
        bloodGroup: requestType.bloodGroup || donor.profile.bloodGroup,
        requestType: requestType.requestType || "Appointment",
        preferredDate: requestType.preferredDate || "",
        preferredTime: requestType.preferredTime || "",
        bloodBankName: requestType.bloodBankName || "",
        location: requestType.location || "",
        notes: requestType.notes || "",
        status: "Pending",
        requestedDate: new Date().toISOString().split('T')[0],
      });

      await newRequest.save();

      // Log activity
      const activityLog = new ActivityLog({
        donorId: donor._id,
        clerkId,
        action: "Appointment Request",
        description: `Requested ${requestType.requestType || "appointment"} at ${requestType.bloodBankName || "blood bank"}`,
        metadata: { requestId: newRequest._id, bloodGroup: requestType.bloodGroup, preferredDate: requestType.preferredDate }
      });
      await activityLog.save();

      res.status(201).json({ message: "Appointment request submitted successfully.", request: newRequest });
    } catch (err) {
      console.error("Create appointment request error:", err);
      res.status(500).json({ message: "Server error occurred while submitting appointment request." });
    }
  } else {
    res.status(200).json({ message: "Appointment request submitted (MongoDB offline)." });
  }
});

// Create appointment
app.post("/api/donor/:clerkId/appointments", async (req, res) => {
  const { clerkId } = req.params;
  const appointmentData = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const newAppointment = new Appointment({
        ...appointmentData,
        clerkId,
        donorId: clerkId,
      });
      await newAppointment.save();

      // Log activity
      const activityLog = new ActivityLog({
        donorId: newAppointment._id,
        clerkId,
        action: "Appointment Booked",
        description: `Appointment booked at ${appointmentData.bloodBankName}`,
        metadata: { appointmentId: newAppointment._id, date: appointmentData.date }
      });
      await activityLog.save();

      res.status(201).json({ message: "Appointment booked successfully.", appointment: newAppointment });
    } catch (err) {
      console.error("Create appointment error:", err);
      res.status(500).json({ message: "Server error occurred while booking appointment." });
    }
  } else {
    res.status(200).json({ message: "Appointment booked (MongoDB offline)." });
  }
});

// Update appointment
app.put("/api/donor/:clerkId/appointments/:appointmentId", async (req, res) => {
  const { clerkId, appointmentId } = req.params;
  const updates = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }

      Object.assign(appointment, updates);
      await appointment.save();

      res.status(200).json({ message: "Appointment updated successfully.", appointment });
    } catch (err) {
      console.error("Update appointment error:", err);
      res.status(500).json({ message: "Server error occurred while updating appointment." });
    }
  } else {
    res.status(200).json({ message: "Appointment updated (MongoDB offline)." });
  }
});

// Generate certificate for approved appointment
app.post("/api/bloodbank/certificates/:requestId/generate", async (req, res) => {
  const { requestId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await AppointmentRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Appointment request not found." });
      }

      if (request.status !== "Approved") {
        return res.status(400).json({ message: "Can only generate certificate for approved requests." });
      }

      // Check if certificate already exists
      const existingCertificate = await Certificate.findOne({ 
        donorId: request.donorId,
        certificateType: "Appointment Approved",
        issueDate: new Date().toISOString().split('T')[0]
      });

      if (existingCertificate) {
        return res.status(200).json({ message: "Certificate already generated.", certificate: existingCertificate });
      }

      // Generate new certificate
      const certificate = new Certificate({
        donorId: request.donorId,
        clerkId: request.clerkId,
        donorName: request.donorName,
        bloodGroup: request.bloodGroup,
        certificateType: "Appointment Approved",
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: request.preferredDate || "",
        bloodBankName: request.bloodBankName || "Blood Bank",
        certificateNumber: `CERT-${Date.now()}-${request._id.slice(-6)}`,
        status: "Issued"
      });
      await certificate.save();

      res.status(200).json({ message: "Certificate generated successfully.", certificate });
    } catch (err) {
      console.error("Generate certificate error:", err);
      res.status(500).json({ message: "Server error occurred while generating certificate." });
    }
  } else {
    res.status(200).json({ message: "Certificate generated (MongoDB offline)." });
  }
});

// Get donor certificates
app.get("/api/donor/:clerkId/certificates", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const certificates = await Certificate.find({ clerkId }).sort({ issuedDate: -1 });
      res.status(200).json(certificates);
    } catch (err) {
      console.error("Get donor certificates error:", err);
      res.status(500).json({ message: "Server error occurred while fetching certificates." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get donor rewards
app.get("/api/donor/:clerkId/rewards", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let reward = await Reward.findOne({ clerkId });
      if (!reward) {
        // Create reward record if not exists
        reward = new Reward({
          donorId: clerkId,
          clerkId,
          totalPoints: 0,
          pointsHistory: [],
          badges: [],
          tier: "Bronze",
        });
        await reward.save();
      }
      res.status(200).json(reward);
    } catch (err) {
      console.error("Get donor rewards error:", err);
      res.status(500).json({ message: "Server error occurred while fetching rewards." });
    }
  } else {
    res.status(200).json({ totalPoints: 0, pointsHistory: [], badges: [], tier: "Bronze" });
  }
});

// Add reward points
app.post("/api/donor/:clerkId/rewards", async (req, res) => {
  const { clerkId } = req.params;
  const { points, reason, type } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let reward = await Reward.findOne({ clerkId });
      if (!reward) {
        reward = new Reward({
          donorId: clerkId,
          clerkId,
          totalPoints: 0,
          pointsHistory: [],
          badges: [],
          tier: "Bronze",
        });
      }

      const pointsEntry = {
        id: Date.now(),
        points,
        reason,
        date: new Date().toISOString().split('T')[0],
        type,
      };

      reward.totalPoints += points;
      reward.pointsHistory.push(pointsEntry);

      // Update tier based on points
      if (reward.totalPoints >= 5000) {
        reward.tier = "Life Saver";
      } else if (reward.totalPoints >= 2500) {
        reward.tier = "Platinum";
      } else if (reward.totalPoints >= 1000) {
        reward.tier = "Gold";
      } else if (reward.totalPoints >= 500) {
        reward.tier = "Silver";
      }

      // Check for badges
      if (reward.totalPoints >= 100 && !reward.badges.find(b => b.name === "First Donation")) {
        reward.badges.push({
          id: Date.now(),
          name: "First Donation",
          icon: "🏅",
          description: "Completed first blood donation",
          earnedDate: new Date().toISOString().split('T')[0],
        });
      }

      await reward.save();
      res.status(200).json({ message: "Reward points added successfully.", reward });
    } catch (err) {
      console.error("Add reward points error:", err);
      res.status(500).json({ message: "Server error occurred while adding reward points." });
    }
  } else {
    res.status(200).json({ message: "Reward points added (MongoDB offline)." });
  }
});

// Get active campaigns
app.get("/api/campaigns", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaigns = await Campaign.find({ status: "Active" }).sort({ startDate: 1 });
      res.status(200).json(campaigns);
    } catch (err) {
      console.error("Get campaigns error:", err);
      res.status(500).json({ message: "Server error occurred while fetching campaigns." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Participate in campaign
app.post("/api/donor/:clerkId/campaigns/:campaignId/participate", async (req, res) => {
  const { clerkId, campaignId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found." });
      }

      if (campaign.bookedSlots >= campaign.availableSlots) {
        return res.status(400).json({ message: "Campaign is fully booked." });
      }

      if (!campaign.participants.includes(clerkId)) {
        campaign.participants.push(clerkId);
        campaign.bookedSlots += 1;
        await campaign.save();
      }

      // Log activity
      const activityLog = new ActivityLog({
        donorId: clerkId,
        clerkId,
        action: "Campaign Participation",
        description: `Participated in campaign: ${campaign.title}`,
        metadata: { campaignId, campaignTitle: campaign.title }
      });
      await activityLog.save();

      res.status(200).json({ message: "Successfully participated in campaign.", campaign });
    } catch (err) {
      console.error("Participate in campaign error:", err);
      res.status(500).json({ message: "Server error occurred while participating in campaign." });
    }
  } else {
    res.status(200).json({ message: "Participated in campaign (MongoDB offline)." });
  }
});

// ==================== BLOOD BANK STAFF API ENDPOINTS ====================

// Get all appointment requests (for blood bank staff) - returns ALL statuses
app.get("/api/bloodbank/appointment-requests", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const requests = await AppointmentRequest.find({}).sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (err) {
      console.error("Get appointment requests error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointment requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get donor's appointment requests (for donor to view their own requests)
app.get("/api/donor/:clerkId/appointment-requests", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const requests = await AppointmentRequest.find({ clerkId }).sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (err) {
      console.error("Get donor appointment requests error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointment requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Approve appointment request
app.post("/api/bloodbank/appointment-requests/:requestId/approve", async (req, res) => {
  const { requestId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await AppointmentRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Appointment request not found." });
      }

      request.status = "Approved";
      request.approvedBy = req.body.approvedBy || "Blood Bank Staff";
      request.approvedDate = new Date().toISOString();

      await request.save();

      let appointment = null;
      // Create approved appointment
      if (request.preferredDate && request.preferredTime) {
        appointment = new Appointment({
          donorId: request.donorId,
          clerkId: request.clerkId,
          campaignId: "",
          bloodBankId: req.body.bloodBankId || "default",
          bloodBankName: request.bloodBankName || "Blood Bank",
          bloodBankAddress: request.location || "Main Branch",
          date: request.preferredDate,
          time: request.preferredTime,
          doctor: request.doctor || "",
          status: "Upcoming",
        });
        await appointment.save();
      }

      // Create Donation History record when approved
      const donationHistory = new DonationHistory({
        donorId: request.donorId,
        clerkId: request.clerkId,
        appointmentId: request._id,
        donationNumber: Date.now(),
        date: request.preferredDate || new Date().toISOString().split('T')[0],
        bloodBankId: "default",
        bloodBankName: request.bloodBankName || "Blood Bank",
        bloodGroup: request.bloodGroup,
        unitsCollected: 1,
        status: "Under Testing",
        doctor: request.doctor || "",
        remarks: "Appointment approved, awaiting donation",
        rewardPoints: 100
      });
      await donationHistory.save();

      // Log activity
      const activityLog = new ActivityLog({
        donorId: request.donorId,
        clerkId: request.clerkId,
        action: "Appointment Approved",
        description: `Appointment approved for ${request.donorName}`,
        metadata: { requestId: request._id, bloodGroup: request.bloodGroup }
      });
      await activityLog.save();

      res.status(200).json({ message: "Appointment request approved successfully.", request, appointment, donationHistory });
    } catch (err) {
      console.error("Approve appointment request error:", err);
      res.status(500).json({ message: "Server error occurred while approving appointment request." });
    }
  } else {
    res.status(200).json({ message: "Appointment request approved (MongoDB offline)." });
  }
});

// Reject appointment request
app.post("/api/bloodbank/appointment-requests/:requestId/reject", async (req, res) => {
  const { requestId } = req.params;
  const { rejectionReason } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await AppointmentRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Appointment request not found." });
      }

      request.status = "Rejected";
      request.rejectionReason = rejectionReason || "Request rejected by blood bank staff";

      await request.save();
      res.status(200).json({ message: "Appointment request rejected successfully.", request });
    } catch (err) {
      console.error("Reject appointment request error:", err);
      res.status(500).json({ message: "Server error occurred while rejecting appointment request." });
    }
  } else {
    res.status(200).json({ message: "Appointment request rejected (MongoDB offline)." });
  }
});

// Complete appointment request (after certificate generation)
app.post("/api/bloodbank/appointment-requests/:requestId/complete", async (req, res) => {
  const { requestId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await AppointmentRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Appointment request not found." });
      }

      request.status = "Completed";
      await request.save();

      // Update Donation History status to Completed
      const donationHistory = await DonationHistory.findOne({
        clerkId: request.clerkId,
        date: request.preferredDate,
        bloodBankName: request.bloodBankName
      });
      
      if (donationHistory) {
        donationHistory.status = "Completed";
        await donationHistory.save();
      }

      // Generate certificate
      const certificate = new Certificate({
        donorId: request.donorId,
        clerkId: request.clerkId,
        donorName: request.donorName,
        bloodGroup: request.bloodGroup,
        certificateType: "Blood Donation",
        issueDate: new Date().toISOString().split('T')[0],
        validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        bloodBankName: request.bloodBankName || "Blood Bank",
        certificateNumber: `CERT-${Date.now()}-${request.bloodGroup}`,
        status: "Issued"
      });
      await certificate.save();

      // Log activity
      const activityLog = new ActivityLog({
        donorId: request.donorId,
        clerkId: request.clerkId,
        action: "Certificate Generated",
        description: `Certificate generated for ${request.donorName}`,
        metadata: { requestId: request._id, certificateNumber: certificate.certificateNumber }
      });
      await activityLog.save();

      res.status(200).json({ message: "Appointment request completed successfully.", request, certificate, donationHistory });
    } catch (err) {
      console.error("Complete appointment request error:", err);
      res.status(500).json({ message: "Server error occurred while completing appointment request." });
    }
  } else {
    res.status(200).json({ message: "Appointment request completed (MongoDB offline)." });
  }
});

// Get all campaign requests (for blood bank staff)
app.get("/api/bloodbank/campaign-requests", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const requests = await CampaignRequest.find({ status: "Pending" }).sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (err) {
      console.error("Get campaign requests error:", err);
      res.status(500).json({ message: "Server error occurred while fetching campaign requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Approve campaign request
app.post("/api/bloodbank/campaign-requests/:requestId/approve", async (req, res) => {
  const { requestId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await CampaignRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Campaign request not found." });
      }

      request.status = "Approved";
      request.approvedBy = req.body.approvedBy || "Blood Bank Staff";
      request.approvedDate = new Date().toISOString();

      await request.save();

      // Add donor to campaign participants
      const campaign = await Campaign.findById(request.campaignId);
      if (campaign && !campaign.participants.includes(request.clerkId)) {
        campaign.participants.push(request.clerkId);
        campaign.bookedSlots += 1;
        await campaign.save();
      }

      res.status(200).json({ message: "Campaign request approved successfully.", request });
    } catch (err) {
      console.error("Approve campaign request error:", err);
      res.status(500).json({ message: "Server error occurred while approving campaign request." });
    }
  } else {
    res.status(200).json({ message: "Campaign request approved (MongoDB offline)." });
  }
});

// Reject campaign request
app.post("/api/bloodbank/campaign-requests/:requestId/reject", async (req, res) => {
  const { requestId } = req.params;
  const { rejectionReason } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await CampaignRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Campaign request not found." });
      }

      request.status = "Rejected";
      request.rejectionReason = rejectionReason || "Request rejected by blood bank staff";

      await request.save();
      res.status(200).json({ message: "Campaign request rejected successfully.", request });
    } catch (err) {
      console.error("Reject campaign request error:", err);
      res.status(500).json({ message: "Server error occurred while rejecting campaign request." });
    }
  } else {
    res.status(200).json({ message: "Campaign request rejected (MongoDB offline)." });
  }
});

// Get all approved appointments (for blood bank staff appointment management)
app.get("/api/bloodbank/appointments", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const appointments = await Appointment.find({ status: "Approved" }).sort({ date: 1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get appointments error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointments." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Complete donation (for blood bank staff)
app.post("/api/bloodbank/appointments/:appointmentId/complete", async (req, res) => {
  const { appointmentId } = req.params;
  const { completedBy, completedDate, notes, unitsCollected } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }

      appointment.status = "Completed";
      appointment.donationDetails.unitsCollected = unitsCollected || 1;
      appointment.donationDetails.collectionTime = new Date().toISOString();
      appointment.donationDetails.staffName = completedBy || "Blood Bank Staff";
      appointment.remarks = notes || "";
      await appointment.save();

      // Create donation history record
      const donationHistory = new DonationHistory({
        donorId: appointment.donorId,
        clerkId: appointment.clerkId,
        appointmentId: appointment._id,
        donationNumber: Date.now(),
        date: appointment.date,
        bloodBankId: appointment.bloodBankId,
        bloodBankName: appointment.bloodBankName,
        bloodGroup: req.body.bloodGroup || "O+",
        unitsCollected: unitsCollected || 1,
        status: "Completed",
      });
      await donationHistory.save();

      // Generate certificate
      const certificate = new Certificate({
        donationId: donationHistory._id,
        donorId: appointment.donorId,
        clerkId: appointment.clerkId,
        certificateNumber: `CERT-${Date.now()}`,
        donorName: req.body.donorName || "Donor",
        bloodGroup: req.body.bloodGroup || "O+",
        donationDate: appointment.date,
        bloodBankName: appointment.bloodBankName,
        issuedDate: new Date().toISOString(),
        verified: true,
      });
      await certificate.save();

      res.status(200).json({ message: "Donation completed successfully.", appointment, certificate });
    } catch (err) {
      console.error("Complete donation error:", err);
      res.status(500).json({ message: "Server error occurred while completing donation." });
    }
  } else {
    res.status(200).json({ message: "Donation completed (MongoDB offline)." });
  }
});

// Cancel appointment (for blood bank staff)
app.post("/api/bloodbank/appointments/:appointmentId/cancel", async (req, res) => {
  const { appointmentId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }

      appointment.status = "Cancelled";
      await appointment.save();
      res.status(200).json({ message: "Appointment cancelled successfully.", appointment });
    } catch (err) {
      console.error("Cancel appointment error:", err);
      res.status(500).json({ message: "Server error occurred while cancelling appointment." });
    }
  } else {
    res.status(200).json({ message: "Appointment cancelled (MongoDB offline)." });
  }
});

// Get all campaigns (for blood bank staff campaign management)
app.get("/api/bloodbank/campaigns", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaigns = await Campaign.find({}).sort({ startDate: -1 });
      res.status(200).json(campaigns);
    } catch (err) {
      console.error("Get campaigns error:", err);
      res.status(500).json({ message: "Server error occurred while fetching campaigns." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Create campaign (for blood bank staff)
app.post("/api/bloodbank/campaigns", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaign = new Campaign(req.body);
      await campaign.save();
      res.status(201).json({ message: "Campaign created successfully.", campaign });
    } catch (err) {
      console.error("Create campaign error:", err);
      res.status(500).json({ message: "Server error occurred while creating campaign." });
    }
  } else {
    res.status(201).json({ message: "Campaign created (MongoDB offline)." });
  }
});

// Update campaign (for blood bank staff)
app.put("/api/bloodbank/campaigns/:campaignId", async (req, res) => {
  const { campaignId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaign = await Campaign.findByIdAndUpdate(campaignId, req.body, { new: true });
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found." });
      }
      res.status(200).json({ message: "Campaign updated successfully.", campaign });
    } catch (err) {
      console.error("Update campaign error:", err);
      res.status(500).json({ message: "Server error occurred while updating campaign." });
    }
  } else {
    res.status(200).json({ message: "Campaign updated (MongoDB offline)." });
  }
});

// Delete campaign (for blood bank staff)
app.delete("/api/bloodbank/campaigns/:campaignId", async (req, res) => {
  const { campaignId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaign = await Campaign.findByIdAndDelete(campaignId);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found." });
      }
      res.status(200).json({ message: "Campaign deleted successfully." });
    } catch (err) {
      console.error("Delete campaign error:", err);
      res.status(500).json({ message: "Server error occurred while deleting campaign." });
    }
  } else {
    res.status(200).json({ message: "Campaign deleted (MongoDB offline)." });
  }
});

// Toggle campaign status (for blood bank staff)
app.patch("/api/bloodbank/campaigns/:campaignId/status", async (req, res) => {
  const { campaignId } = req.params;
  const { status } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const campaign = await Campaign.findByIdAndUpdate(campaignId, { status }, { new: true });
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found." });
      }
      res.status(200).json({ message: "Campaign status updated successfully.", campaign });
    } catch (err) {
      console.error("Toggle campaign status error:", err);
      res.status(500).json({ message: "Server error occurred while updating campaign status." });
    }
  } else {
    res.status(200).json({ message: "Campaign status updated (MongoDB offline)." });
  }
});

// Get donor notifications
app.get("/api/donor/:clerkId/notifications", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const notifications = await Notification.find({ userId: clerkId, userRole: "donor" }).sort({ createdAt: -1 }).limit(20);
      res.status(200).json(notifications);
    } catch (err) {
      console.error("Get donor notifications error:", err);
      res.status(500).json({ message: "Server error occurred while fetching notifications." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get emergency requests
app.get("/api/emergency-requests", async (req, res) => {
  const { bloodGroup } = req.query;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const query = { status: "Active" };
      if (bloodGroup) {
        query.bloodGroup = bloodGroup;
      }
      const requests = await EmergencyRequest.find(query).sort({ createdAt: -1 });
      res.status(200).json(requests);
    } catch (err) {
      console.error("Get emergency requests error:", err);
      res.status(500).json({ message: "Server error occurred while fetching emergency requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Respond to emergency request
app.post("/api/emergency-requests/:requestId/respond", async (req, res) => {
  const { requestId } = req.params;
  const { donorId, donorName, accepted } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const request = await EmergencyRequest.findById(requestId);
      if (!request) {
        return res.status(404).json({ message: "Emergency request not found." });
      }

      const response = {
        donorId,
        donorName,
        responseTime: new Date().toISOString(),
        accepted,
      };

      request.responses.push(response);

      if (accepted && request.status === "Active") {
        // Mark as fulfilled if enough responses
        const acceptedCount = request.responses.filter(r => r.accepted).length;
        if (acceptedCount >= request.unitsNeeded) {
          request.status = "Fulfilled";
        }
      }

      await request.save();

      // Log activity
      const activityLog = new ActivityLog({
        donorId,
        clerkId: donorId,
        action: accepted ? "Emergency Donation Accepted" : "Emergency Donation Declined",
        description: accepted ? "Accepted emergency blood donation request" : "Declined emergency blood donation request",
        metadata: { requestId, urgency: request.urgency }
      });
      await activityLog.save();

      res.status(200).json({ message: "Response recorded successfully.", request });
    } catch (err) {
      console.error("Respond to emergency request error:", err);
      res.status(500).json({ message: "Server error occurred while responding to emergency request." });
    }
  } else {
    res.status(200).json({ message: "Response recorded (MongoDB offline)." });
  }
});

// Get donor activity log
app.get("/api/donor/:clerkId/activity", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const activities = await ActivityLog.find({ clerkId }).sort({ timestamp: -1 }).limit(50);
      res.status(200).json(activities);
    } catch (err) {
      console.error("Get donor activity error:", err);
      res.status(500).json({ message: "Server error occurred while fetching activity log." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Hospital Staff Notifications
// Get hospital staff notifications
app.get("/api/hospital-staff/:clerkId/notifications", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const staff = await HospitalStaff.findOne({ clerkId });
      if (!staff) {
        return res.status(404).json({ message: "Hospital staff not found." });
      }
      res.status(200).json({ notifications: staff.notifications || [] });
    } catch (err) {
      console.error("Get hospital staff notifications error:", err);
      res.status(500).json({ message: "Server error occurred while fetching notifications." });
    }
  } else {
    res.status(200).json({ notifications: [] });
  }
});

// Add notification to hospital staff
app.post("/api/hospital-staff/:clerkId/notifications", async (req, res) => {
  const { clerkId } = req.params;
  const { notification } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let staff = await HospitalStaff.findOne({ clerkId });
      if (!staff) {
        staff = new HospitalStaff({
          clerkId,
          email: req.body.email || "",
          profile: {},
          notifications: [],
        });
      }
      staff.notifications.push(notification);
      await staff.save();
      res.status(201).json({ message: "Notification added successfully.", staff });
    } catch (err) {
      console.error("Add hospital staff notification error:", err);
      res.status(500).json({ message: "Server error occurred while adding notification." });
    }
  } else {
    res.status(201).json({ message: "Notification added (MongoDB offline)." });
  }
});

// Update hospital staff notification as read
app.put("/api/hospital-staff/:clerkId/notifications/:notificationId", async (req, res) => {
  const { clerkId, notificationId } = req.params;
  const { notification } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const staff = await HospitalStaff.findOne({ clerkId });
      if (!staff) {
        return res.status(404).json({ message: "Hospital staff not found." });
      }
      const index = staff.notifications.findIndex(n => n.id === parseInt(notificationId));
      if (index === -1) {
        return res.status(404).json({ message: "Notification not found." });
      }
      staff.notifications[index] = { ...staff.notifications[index], ...notification };
      await staff.save();
      res.status(200).json({ message: "Notification updated successfully.", staff });
    } catch (err) {
      console.error("Update hospital staff notification error:", err);
      res.status(500).json({ message: "Server error occurred while updating notification." });
    }
  } else {
    res.status(200).json({ message: "Notification updated (MongoDB offline)." });
  }
});

// Delete hospital staff notification
app.delete("/api/hospital-staff/:clerkId/notifications/:notificationId", async (req, res) => {
  const { clerkId, notificationId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const staff = await HospitalStaff.findOne({ clerkId });
      if (!staff) {
        return res.status(404).json({ message: "Hospital staff not found." });
      }
      staff.notifications = staff.notifications.filter(n => n.id !== parseInt(notificationId));
      await staff.save();
      res.status(200).json({ message: "Notification deleted successfully.", staff });
    } catch (err) {
      console.error("Delete hospital staff notification error:", err);
      res.status(500).json({ message: "Server error occurred while deleting notification." });
    }
  } else {
    res.status(200).json({ message: "Notification deleted (MongoDB offline)." });
  }
});

// Blood Inventory Endpoints
// Seed blood inventory data
app.post("/api/blood-inventory/seed", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      // Clear existing inventory
      await BloodInventory.deleteMany({});

      // Seed data
      const inventoryData = [
        {
          _id: "bi001",
          bloodGroup: "A+",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi002",
          bloodGroup: "A-",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi003",
          bloodGroup: "B+",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi004",
          bloodGroup: "B-",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi005",
          bloodGroup: "AB+",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi006",
          bloodGroup: "AB-",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi007",
          bloodGroup: "O+",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        },
        {
          _id: "bi008",
          bloodGroup: "O-",
          units: 100,
          hospital: "City General Hospital",
          expiryDate: "2024-12-31",
          lastUpdated: "2026-07-25"
        }
      ];

      await BloodInventory.insertMany(inventoryData);
      const count = await BloodInventory.countDocuments();
      res.status(200).json({ message: "Blood inventory seeded successfully", count });
    } catch (err) {
      console.error("Seed blood inventory error:", err);
      res.status(500).json({ message: "Server error occurred while seeding blood inventory." });
    }
  } else {
    res.status(500).json({ message: "MongoDB not connected." });
  }
});

// Get all blood inventory
app.get("/api/blood-inventory", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  console.log('GET /api/blood-inventory - MongoDB connected:', isDbConnected);

  if (isDbConnected) {
    try {
      const inventory = await BloodInventory.find({});
      console.log('Fetched inventory from MongoDB:', inventory);
      res.status(200).json(inventory);
    } catch (err) {
      console.error("Get blood inventory error:", err);
      res.status(500).json({ message: "Server error occurred while fetching blood inventory." });
    }
  } else {
    // Fallback to localStorage-like JSON file
    console.log('Using JSON file fallback');
    const inventoryPath = path.join(__dirname, "bloodInventory.json");
    if (fs.existsSync(inventoryPath)) {
      const data = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
      console.log('Fetched inventory from JSON file:', data);
      res.status(200).json(data);
    } else {
      res.status(200).json([]);
    }
  }
});

// Add blood inventory
app.post("/api/blood-inventory", async (req, res) => {
  const { inventory } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const newInventory = new BloodInventory(inventory);
      await newInventory.save();
      res.status(201).json({ message: "Blood inventory added successfully.", inventory: newInventory });
    } catch (err) {
      console.error("Add blood inventory error:", err);
      res.status(500).json({ message: "Server error occurred while adding blood inventory." });
    }
  } else {
    // Fallback to JSON file
    const inventoryPath = path.join(__dirname, "bloodInventory.json");
    let inventoryData = [];
    if (fs.existsSync(inventoryPath)) {
      inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
    }
    inventoryData.push({ ...inventory, _id: generateCustomId() });
    fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));
    res.status(201).json({ message: "Blood inventory added successfully." });
  }
});

// Update blood inventory
app.put("/api/blood-inventory/:id", async (req, res) => {
  const { id } = req.params;
  const { units, image } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const updateData = { units, lastUpdated: new Date().toISOString().split('T')[0] };
      if (image !== undefined) {
        updateData.image = image;
      }
      const inventory = await BloodInventory.findByIdAndUpdate(id, updateData, { new: true });
      if (!inventory) {
        return res.status(404).json({ message: "Blood inventory not found." });
      }
      res.status(200).json({ message: "Blood inventory updated successfully.", inventory });
    } catch (err) {
      console.error("Update blood inventory error:", err);
      res.status(500).json({ message: "Server error occurred while updating blood inventory." });
    }
  } else {
    // Fallback to JSON file
    const inventoryPath = path.join(__dirname, "bloodInventory.json");
    if (fs.existsSync(inventoryPath)) {
      let inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
      const index = inventoryData.findIndex(item => item._id === id);
      if (index !== -1) {
        inventoryData[index].units = units;
        inventoryData[index].lastUpdated = new Date().toISOString().split('T')[0];
        inventoryData[index].updatedAt = new Date().toISOString();
        if (image !== undefined) {
          inventoryData[index].image = image;
        }
        fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));
        console.log('Updated JSON file inventory:', inventoryData[index]);
        res.status(200).json({ message: "Blood inventory updated successfully.", inventory: inventoryData[index] });
      } else {
        res.status(404).json({ message: "Blood inventory not found." });
      }
    } else {
      res.status(500).json({ message: "Inventory file not found." });
    }
  }
});

// Delete blood inventory
app.delete("/api/blood-inventory/:id", async (req, res) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const inventory = await BloodInventory.findByIdAndDelete(id);
      if (!inventory) {
        return res.status(404).json({ message: "Blood inventory not found." });
      }
      res.status(200).json({ message: "Blood inventory deleted successfully." });
    } catch (err) {
      console.error("Delete blood inventory error:", err);
      res.status(500).json({ message: "Server error occurred while deleting blood inventory." });
    }
  } else {
    // Fallback to JSON file
    const inventoryPath = path.join(__dirname, "bloodInventory.json");
    if (fs.existsSync(inventoryPath)) {
      let inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
      inventoryData = inventoryData.filter(item => item._id !== id);
      fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));
    }
    res.status(200).json({ message: "Blood inventory deleted successfully." });
  }
});

// ==================== BLOOD REQUEST WORKFLOW API ENDPOINTS ====================

// Get all blood requests
app.get("/api/blood-requests", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequests = await BloodRequest.find({}).sort({ createdAt: -1 });
      res.status(200).json(bloodRequests);
    } catch (err) {
      console.error("Get blood requests error:", err);
      res.status(500).json({ message: "Server error occurred while fetching blood requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get blood requests by status
app.get("/api/blood-requests/status/:status", async (req, res) => {
  const { status } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequests = await BloodRequest.find({ status }).sort({ createdAt: -1 });
      res.status(200).json(bloodRequests);
    } catch (err) {
      console.error("Get blood requests by status error:", err);
      res.status(500).json({ message: "Server error occurred while fetching blood requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get blood requests by hospital
app.get("/api/blood-requests/hospital/:hospitalId", async (req, res) => {
  const { hospitalId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequests = await BloodRequest.find({ hospitalId }).sort({ createdAt: -1 });
      res.status(200).json(bloodRequests);
    } catch (err) {
      console.error("Get blood requests by hospital error:", err);
      res.status(500).json({ message: "Server error occurred while fetching blood requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get blood requests by blood bank
app.get("/api/blood-requests/bloodbank/:bloodBankId", async (req, res) => {
  const { bloodBankId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequests = await BloodRequest.find({ bloodBankId }).sort({ createdAt: -1 });
      res.status(200).json(bloodRequests);
    } catch (err) {
      console.error("Get blood requests by blood bank error:", err);
      res.status(500).json({ message: "Server error occurred while fetching blood requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get blood request by ID
app.get("/api/blood-requests/:requestId", async (req, res) => {
  const { requestId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequest = await BloodRequest.findById(requestId);
      if (!bloodRequest) {
        return res.status(404).json({ message: "Blood request not found." });
      }
      res.status(200).json(bloodRequest);
    } catch (err) {
      console.error("Get blood request error:", err);
      res.status(500).json({ message: "Server error occurred while fetching blood request." });
    }
  } else {
    res.status(404).json({ message: "Blood request not found." });
  }
});

// Update blood request status (Hospital Staff - Start Verification)
app.put("/api/blood-requests/:requestId/status/under-verification", async (req, res) => {
  const { requestId } = req.params;
  const { hospitalId, hospitalName, verifiedBy, verifiedByName } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequest = await BloodRequest.findById(requestId);
      if (!bloodRequest) {
        return res.status(404).json({ message: "Blood request not found." });
      }

      if (bloodRequest.status !== "Pending") {
        return res.status(400).json({ message: "Can only start verification for Pending requests." });
      }

      bloodRequest.status = "Under Verification";
      bloodRequest.hospitalId = hospitalId || "";
      bloodRequest.hospitalName = hospitalName || bloodRequest.hospitalName;
      bloodRequest.verifiedBy = verifiedBy || "";
      bloodRequest.timeline.push({
        status: "Under Verification",
        updatedBy: verifiedBy || "",
        updatedByName: verifiedByName || "Hospital Staff",
        timestamp: new Date().toISOString(),
        notes: "Verification started by hospital staff"
      });

      await bloodRequest.save();

      // Notify patient
      const patientNotification = new Notification({
        userId: bloodRequest.patientId,
        userRole: "patient",
        title: "Request Under Verification",
        message: `Your blood request #${bloodRequest.requestNumber} is under verification by hospital staff.`,
        type: "info",
        requestId: bloodRequest._id,
        priority: "Normal"
      });
      await patientNotification.save();

      res.status(200).json({ message: "Blood request status updated successfully.", bloodRequest });
    } catch (err) {
      console.error("Update blood request status error:", err);
      res.status(500).json({ message: "Server error occurred while updating blood request status." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Forward blood request to blood bank (Hospital Staff)
app.put("/api/blood-requests/:requestId/status/forwarded", async (req, res) => {
  const { requestId } = req.params;
  const { bloodBankId, bloodBankName, forwardedBy, forwardedByName } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequest = await BloodRequest.findById(requestId);
      if (!bloodRequest) {
        return res.status(404).json({ message: "Blood request not found." });
      }

      if (bloodRequest.status !== "Under Verification") {
        return res.status(400).json({ message: "Can only forward requests that are Under Verification." });
      }

      bloodRequest.status = "Forwarded";
      bloodRequest.bloodBankId = bloodBankId || "";
      bloodRequest.bloodBankName = bloodBankName || "";
      bloodRequest.forwardedBy = forwardedBy || "";
      bloodRequest.forwardedByName = forwardedByName || "";
      bloodRequest.forwardedDate = new Date().toISOString().split('T')[0];
      bloodRequest.timeline.push({
        status: "Forwarded",
        updatedBy: forwardedBy || "",
        updatedByName: forwardedByName || "Hospital Staff",
        timestamp: new Date().toISOString(),
        notes: `Request forwarded to ${bloodBankName || "Blood Bank"}`
      });

      await bloodRequest.save();

      // Notify patient
      const patientNotification = new Notification({
        userId: bloodRequest.patientId,
        userRole: "patient",
        title: "Request Forwarded to Blood Bank",
        message: `Your blood request #${bloodRequest.requestNumber} has been forwarded to ${bloodBankName || "Blood Bank"}.`,
        type: "info",
        requestId: bloodRequest._id,
        priority: "Normal"
      });
      await patientNotification.save();

      // Notify blood bank staff
      const bloodBankStaff = await HospitalStaff.find({ profile: { hospitalName: bloodBankName } });
      if (bloodBankStaff && bloodBankStaff.length > 0) {
        for (const staff of bloodBankStaff) {
          const staffNotification = new Notification({
            userId: staff._id,
            userRole: "bloodbankstaff",
            title: "New Blood Request Forwarded",
            message: `Blood request #${bloodRequest.requestNumber} forwarded from ${bloodRequest.hospitalName} - ${bloodRequest.bloodGroup} (${bloodRequest.units} units)`,
            type: "info",
            requestId: bloodRequest._id,
            priority: bloodRequest.urgency === "Critical" ? "High" : "Normal"
          });
          await staffNotification.save();
        }
      }

      res.status(200).json({ message: "Blood request forwarded successfully.", bloodRequest });
    } catch (err) {
      console.error("Forward blood request error:", err);
      res.status(500).json({ message: "Server error occurred while forwarding blood request." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Approve blood request (Blood Bank Staff)
app.put("/api/blood-requests/:requestId/status/blood-ready", async (req, res) => {
  const { requestId } = req.params;
  const { approvedBy, approvedByName, bloodBagNumber } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  console.log('Approve blood request - requestId:', requestId);
  console.log('Approve blood request - body:', req.body);
  console.log('MongoDB connected:', isDbConnected);

  if (isDbConnected) {
    try {
      const bloodRequest = await BloodRequest.findById(requestId);
      if (!bloodRequest) {
        console.log('Blood request not found:', requestId);
        return res.status(404).json({ message: "Blood request not found." });
      }

      console.log('Blood request found, current status:', bloodRequest.status);
      console.log('Blood request details:', {
        bloodGroup: bloodRequest.bloodGroup,
        units: bloodRequest.units,
        bloodBankName: bloodRequest.bloodBankName,
        hospitalName: bloodRequest.hospitalName
      });

      if (bloodRequest.status !== "Forwarded") {
        console.log('Cannot approve - status is not Forwarded:', bloodRequest.status);
        return res.status(400).json({ message: `Can only approve requests that are Forwarded. Current status: ${bloodRequest.status}` });
      }

      // Check and reduce blood inventory
      // First try to find by blood bank name, then fall back to hospital name
      const inventoryQuery = { 
        bloodGroup: bloodRequest.bloodGroup
      };
      
      console.log('Inventory query:', inventoryQuery);
      console.log('Looking for blood bank:', bloodRequest.bloodBankName, 'or hospital:', bloodRequest.hospitalName);
      
      // First check if MongoDB has any inventory at all
      const allInventory = await BloodInventory.find({});
      console.log('All inventory in MongoDB:', allInventory);
      
      let inventory = await BloodInventory.findOne(inventoryQuery);

      console.log('Found inventory in MongoDB:', inventory);

      // If no inventory in MongoDB, fall back to JSON file
      if (!inventory) {
        console.log('No inventory in MongoDB, checking JSON file...');
        const inventoryPath = path.join(__dirname, "bloodInventory.json");
        if (fs.existsSync(inventoryPath)) {
          const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
          inventory = inventoryData.find(item => item.bloodGroup === bloodRequest.bloodGroup);
          console.log('Found inventory in JSON file:', inventory);
          
          if (!inventory) {
            console.log('No inventory found for blood group:', bloodRequest.bloodGroup);
            console.log('Available blood groups in JSON:', inventoryData.map(i => i.bloodGroup));
            return res.status(400).json({ message: `No blood inventory found for blood group ${bloodRequest.bloodGroup}. Please add inventory first.` });
          }
          
          // Create inventory in MongoDB from JSON data
          const newInventory = new BloodInventory(inventory);
          await newInventory.save();
          console.log('Created inventory in MongoDB from JSON:', newInventory);
          inventory = newInventory;
        } else {
          console.log('No inventory found for blood group:', bloodRequest.bloodGroup);
          return res.status(400).json({ message: `No blood inventory found for blood group ${bloodRequest.bloodGroup}. Please add inventory first.` });
        }
      }

      if (inventory.units < bloodRequest.units) {
        console.log('Insufficient inventory - available:', inventory.units, 'requested:', bloodRequest.units);
        return res.status(400).json({ 
          message: `Insufficient blood inventory for ${bloodRequest.bloodGroup}. Available: ${inventory.units} units, Requested: ${bloodRequest.units} units`,
          available: inventory.units,
          requested: bloodRequest.units,
          bloodGroup: bloodRequest.bloodGroup
        });
      }

      inventory.units -= bloodRequest.units;
      
      // Check if inventory came from JSON file (no _id from MongoDB)
      if (!inventory._id || typeof inventory._id === 'string' && inventory._id.startsWith('bi')) {
        // Update JSON file
        const inventoryPath = path.join(__dirname, "bloodInventory.json");
        if (fs.existsSync(inventoryPath)) {
          const inventoryData = JSON.parse(fs.readFileSync(inventoryPath, "utf8"));
          const index = inventoryData.findIndex(item => item.bloodGroup === bloodRequest.bloodGroup);
          if (index !== -1) {
            inventoryData[index].units = inventory.units;
            inventoryData[index].lastUpdated = new Date().toISOString().split('T')[0];
            inventoryData[index].updatedAt = new Date().toISOString();
            fs.writeFileSync(inventoryPath, JSON.stringify(inventoryData, null, 2));
            console.log('Updated JSON file with new inventory:', inventoryData[index]);
          }
        }
      } else {
        // Save to MongoDB
        await inventory.save();
      }

      bloodRequest.status = "Blood Ready";
      bloodRequest.approvedBy = approvedBy || "";
      bloodRequest.approvedByName = approvedByName || "";
      bloodRequest.approvedDate = new Date().toISOString().split('T')[0];
      bloodRequest.bloodBagNumber = bloodBagNumber || "";
      bloodRequest.timeline.push({
        status: "Blood Ready",
        updatedBy: approvedBy || "",
        updatedByName: approvedByName || "Blood Bank Staff",
        timestamp: new Date().toISOString(),
        notes: `Blood prepared and reserved. Bag number: ${bloodBagNumber || "N/A"}`
      });

      await bloodRequest.save();

      // Notify patient
      try {
        if (bloodRequest.patientId) {
          const patientNotification = new Notification({
            userId: bloodRequest.patientId,
            userRole: "patient",
            title: "Blood Ready",
            message: `Good news! Blood is available for your request #${bloodRequest.requestNumber}. Please wait for confirmation from the hospital.`,
            type: "success",
            requestId: bloodRequest._id,
            priority: "High"
          });
          await patientNotification.save();
          console.log('Patient notification sent successfully');
        } else {
          console.log('Patient ID missing, skipping patient notification');
        }
      } catch (notificationError) {
        console.error('Error sending patient notification:', notificationError);
        // Don't block the approval process if notification fails
      }

      // Notify hospital staff
      try {
        const hospitalStaff = await HospitalStaff.findOne({ _id: bloodRequest.hospitalId });
        if (hospitalStaff && hospitalStaff._id) {
          const staffNotification = new Notification({
            userId: hospitalStaff._id,
            userRole: "hospitalstaff",
            title: "Blood Ready for Collection",
            message: `Blood is ready for request #${bloodRequest.requestNumber} - ${bloodRequest.bloodGroup} (${bloodRequest.units} units)`,
            type: "success",
            requestId: bloodRequest._id,
            priority: "High"
          });
          await staffNotification.save();
          console.log('Hospital staff notification sent successfully');
        } else {
          console.log('Hospital staff not found or invalid ID for notification');
        }
      } catch (notificationError) {
        console.error('Error sending hospital staff notification:', notificationError);
        // Don't block the approval process if notification fails
      }

      res.status(200).json({ message: "Blood request approved successfully.", bloodRequest });
    } catch (err) {
      console.error("Approve blood request error:", err);
      console.error("Error details:", err.message);
      console.error("Error stack:", err.stack);
      res.status(500).json({ message: "Server error occurred while approving blood request.", error: err.message });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Reject blood request (Hospital Staff or Blood Bank Staff)
app.put("/api/blood-requests/:requestId/status/rejected", async (req, res) => {
  const { requestId } = req.params;
  const { rejectedBy, rejectedByName, rejectionReason } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequest = await BloodRequest.findById(requestId);
      if (!bloodRequest) {
        return res.status(404).json({ message: "Blood request not found." });
      }

      if (!["Pending", "Forwarded"].includes(bloodRequest.status)) {
        return res.status(400).json({ message: "Can only reject Pending or Forwarded requests." });
      }

      bloodRequest.status = "Rejected";
      bloodRequest.rejectionReason = rejectionReason || "";
      bloodRequest.timeline.push({
        status: "Rejected",
        updatedBy: rejectedBy || "",
        updatedByName: rejectedByName || "Staff",
        timestamp: new Date().toISOString(),
        notes: rejectionReason || "Request rejected"
      });

      await bloodRequest.save();

      // Notify patient
      const patientNotification = new Notification({
        userId: bloodRequest.patientId,
        userRole: "patient",
        title: "Blood Request Rejected",
        message: `Your blood request #${bloodRequest.requestNumber} has been rejected. ${rejectionReason ? `Reason: ${rejectionReason}` : ""}`,
        type: "danger",
        requestId: bloodRequest._id,
        priority: "High"
      });
      await patientNotification.save();

      res.status(200).json({ message: "Blood request rejected successfully.", bloodRequest });
    } catch (err) {
      console.error("Reject blood request error:", err);
      res.status(500).json({ message: "Server error occurred while rejecting blood request." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Issue blood and complete request (Hospital Staff)
app.put("/api/blood-requests/:requestId/status/completed", async (req, res) => {
  const { requestId } = req.params;
  const { issuedBy, issuedByName } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const bloodRequest = await BloodRequest.findById(requestId);
      if (!bloodRequest) {
        return res.status(404).json({ message: "Blood request not found." });
      }

      if (bloodRequest.status !== "Blood Ready") {
        return res.status(400).json({ message: "Can only complete requests that are Blood Ready." });
      }

      bloodRequest.status = "Completed";
      bloodRequest.issuedBy = issuedBy || "";
      bloodRequest.issuedByName = issuedByName || "";
      bloodRequest.issuedDate = new Date().toISOString().split('T')[0];
      bloodRequest.completedDate = new Date().toISOString().split('T')[0];
      bloodRequest.timeline.push({
        status: "Completed",
        updatedBy: issuedBy || "",
        updatedByName: issuedByName || "Hospital Staff",
        timestamp: new Date().toISOString(),
        notes: "Blood issued to patient"
      });

      await bloodRequest.save();

      // Notify patient about completion (only if patientId exists)
      if (bloodRequest.patientId) {
        const patientNotification = new Notification({
          userId: bloodRequest.patientId,
          userRole: "patient",
          title: "Blood Request Completed",
          message: `Your blood request #${bloodRequest.requestNumber} has been completed. Blood has been issued to you.`,
          type: "success",
          requestId: bloodRequest._id,
          priority: "High"
        });
        await patientNotification.save();
      }

      // Generate blood issue report
      const reportNumber = `RPT-${Date.now()}`;
      const report = new Report({
        reportNumber,
        requestId: bloodRequest._id,
        patientId: bloodRequest.patientId,
        patientName: bloodRequest.patientName,
        hospitalName: bloodRequest.hospitalName,
        bloodBankName: bloodRequest.bloodBankName,
        bloodGroup: bloodRequest.bloodGroup,
        units: bloodRequest.units,
        bloodBagNumber: bloodRequest.bloodBagNumber,
        doctorName: bloodRequest.doctorName,
        hospitalStaffName: issuedByName || "",
        issueDate: bloodRequest.issuedDate,
        status: "Issued",
        qrCode: `QR-${bloodRequest.requestNumber}`
      });

      await report.save();

      // Link report to blood request
      bloodRequest.reportId = report._id;
      await bloodRequest.save();

      res.status(200).json({ message: "Blood request completed successfully.", bloodRequest, report });
    } catch (err) {
      console.error("Complete blood request error:", err);
      res.status(500).json({ message: "Server error occurred while completing blood request." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// ==================== NOTIFICATION API ENDPOINTS ====================

// Get notifications for user
app.get("/api/notifications/:userId", async (req, res) => {
  const { userId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
      res.status(200).json(notifications);
    } catch (err) {
      console.error("Get notifications error:", err);
      res.status(500).json({ message: "Server error occurred while fetching notifications." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Mark notification as read
app.put("/api/notifications/:notificationId/read", async (req, res) => {
  const { notificationId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const notification = await Notification.findById(notificationId);
      if (!notification) {
        return res.status(404).json({ message: "Notification not found." });
      }

      notification.read = true;
      await notification.save();

      res.status(200).json({ message: "Notification marked as read successfully." });
    } catch (err) {
      console.error("Mark notification as read error:", err);
      res.status(500).json({ message: "Server error occurred while marking notification as read." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// ==================== REPORT API ENDPOINTS ====================

// Get report by ID
app.get("/api/reports/:reportId", async (req, res) => {
  const { reportId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found." });
      }
      res.status(200).json(report);
    } catch (err) {
      console.error("Get report error:", err);
      res.status(500).json({ message: "Server error occurred while fetching report." });
    }
  } else {
    res.status(404).json({ message: "Report not found." });
  }
});

// Get reports by patient
app.get("/api/reports/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const reports = await Report.find({ patientId }).sort({ createdAt: -1 });
      res.status(200).json(reports);
    } catch (err) {
      console.error("Get reports by patient error:", err);
      res.status(500).json({ message: "Server error occurred while fetching reports." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Generate PDF report
app.get("/api/reports/:reportId/pdf", async (req, res) => {
  const { reportId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const report = await Report.findById(reportId);
      if (!report) {
        return res.status(404).json({ message: "Report not found." });
      }

      // Generate PDF
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const filename = `BloodIssueReport_${report.reportNumber}.pdf`;
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      
      doc.pipe(res);

      // Header
      doc.fontSize(20).font('Helvetica-Bold').fillColor('#C41230').text('BLOOD ISSUE REPORT', { align: 'center' });
      doc.moveDown();
      
      // Report Number
      doc.fontSize(12).font('Helvetica').fillColor('#333').text(`Report Number: ${report.reportNumber}`, { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').fillColor('#666').text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'center' });
      doc.moveDown(2);

      // Divider
      doc.strokeColor('#C41230').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(2);

      // Patient Information
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('PATIENT INFORMATION');
      doc.moveDown();
      doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Patient Name: ${report.patientName}`);
      doc.text(`Patient ID: ${report.patientId}`);
      doc.moveDown();

      // Hospital Information
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('HOSPITAL INFORMATION');
      doc.moveDown();
      doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Hospital Name: ${report.hospitalName}`);
      doc.text(`Blood Bank: ${report.bloodBankName || 'N/A'}`);
      doc.moveDown();

      // Blood Information
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('BLOOD INFORMATION');
      doc.moveDown();
      doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Blood Group: ${report.bloodGroup}`);
      doc.text(`Units: ${report.units}`);
      doc.text(`Blood Bag Number: ${report.bloodBagNumber || 'N/A'}`);
      doc.moveDown();

      // Medical Information
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('MEDICAL INFORMATION');
      doc.moveDown();
      doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Doctor Name: ${report.doctorName || 'N/A'}`);
      doc.text(`Hospital Staff: ${report.hospitalStaffName || 'N/A'}`);
      doc.moveDown();

      // Issue Information
      doc.fontSize(14).font('Helvetica-Bold').fillColor('#333').text('ISSUE INFORMATION');
      doc.moveDown();
      doc.fontSize(11).font('Helvetica').fillColor('#555').text(`Issue Date: ${report.issueDate}`);
      doc.text(`Status: ${report.status}`);
      doc.moveDown();

      // Divider
      doc.strokeColor('#C41230').lineWidth(2).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
      doc.moveDown(2);

      // QR Code placeholder
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('QR CODE', { align: 'center' });
      doc.moveDown();
      doc.fontSize(10).font('Helvetica').fillColor('#666').text(`QR Code: ${report.qrCode}`, { align: 'center' });
      doc.moveDown();

      // Footer
      doc.fontSize(9).font('Helvetica').fillColor('#999').text('This is an official blood issue report. Please verify with hospital authorities.', { align: 'center' });
      doc.moveDown();
      doc.fontSize(9).font('Helvetica').fillColor('#999').text('Hospital Resource and Blood Bank Management System', { align: 'center' });

      doc.end();
    } catch (err) {
      console.error("Generate PDF error:", err);
      res.status(500).json({ message: "Server error occurred while generating PDF." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Doctors Endpoints
// Get all doctors
app.get("/api/doctors", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const doctors = await Doctors.find({});
      console.log('MongoDB doctors count:', doctors.length);
      if (doctors && doctors.length > 0) {
        res.status(200).json(doctors);
      } else {
        // Return sample data if database is empty
        console.log('MongoDB doctors empty, returning sample data');
        res.status(200).json(getSampleDoctors());
      }
    } catch (err) {
      console.error("Get doctors error:", err);
      res.status(500).json({ message: "Server error occurred while fetching doctors." });
    }
  } else {
    // Fallback to localStorage-like JSON file
    const doctorsPath = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsPath)) {
      const data = JSON.parse(fs.readFileSync(doctorsPath, "utf8"));
      if (data.length > 0) {
        res.status(200).json(data);
      } else {
        res.status(200).json(getSampleDoctors());
      }
    } else {
      res.status(200).json(getSampleDoctors());
    }
  }
});

// Sample doctors data
const getSampleDoctors = () => [
  {
    _id: "doc1",
    name: "Dr. Rajesh Kumar",
    specialization: "Cardiology",
    hospital: "AIIMS, New Delhi",
    department: "Cardiac Care",
    phone: "+91-9876543210",
    email: "rajesh.kumar@aiims.gov.in",
    availability: "Available",
    consultationFee: 500,
    patientsTreated: 1250,
    rating: 4.8,
    photo: "https://randomuser.me/api/portraits/men/1.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "09:00", endTime: "17:00" },
      tuesday: { available: true, startTime: "09:00", endTime: "17:00" },
      wednesday: { available: true, startTime: "09:00", endTime: "17:00" },
      thursday: { available: true, startTime: "09:00", endTime: "17:00" },
      friday: { available: true, startTime: "09:00", endTime: "17:00" },
      saturday: { available: true, startTime: "09:00", endTime: "14:00" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Amit Sharma", condition: "Hypertension", lastVisit: "2024-01-15" },
      { id: 2, name: "Priya Singh", condition: "Arrhythmia", lastVisit: "2024-01-14" },
      { id: 3, name: "Vikram Patel", condition: "Heart Failure", lastVisit: "2024-01-13" }
    ],
    todayAppointments: 8
  },
  {
    _id: "doc2",
    name: "Dr. Priya Sharma",
    specialization: "Neurology",
    hospital: "Apollo Hospital, Delhi",
    department: "Neurology",
    phone: "+91-9876543211",
    email: "priya.sharma@apollo.com",
    availability: "Available",
    consultationFee: 600,
    patientsTreated: 980,
    rating: 4.7,
    photo: "https://randomuser.me/api/portraits/women/2.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "08:00", endTime: "16:00" },
      tuesday: { available: true, startTime: "08:00", endTime: "16:00" },
      wednesday: { available: true, startTime: "08:00", endTime: "16:00" },
      thursday: { available: true, startTime: "08:00", endTime: "16:00" },
      friday: { available: true, startTime: "08:00", endTime: "16:00" },
      saturday: { available: false, startTime: "", endTime: "" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Rahul Verma", condition: "Migraine", lastVisit: "2024-01-15" },
      { id: 2, name: "Anita Gupta", condition: "Epilepsy", lastVisit: "2024-01-14" }
    ],
    todayAppointments: 5
  },
  {
    _id: "doc3",
    name: "Dr. Amit Verma",
    specialization: "Orthopedics",
    hospital: "Fortis Hospital, Mumbai",
    department: "Orthopedics",
    phone: "+91-9876543212",
    email: "amit.verma@fortis.com",
    availability: "On Leave",
    consultationFee: 550,
    patientsTreated: 1100,
    rating: 4.6,
    photo: "https://randomuser.me/api/portraits/men/3.jpg",
    availabilitySchedule: {
      monday: { available: false, startTime: "", endTime: "" },
      tuesday: { available: false, startTime: "", endTime: "" },
      wednesday: { available: false, startTime: "", endTime: "" },
      thursday: { available: false, startTime: "", endTime: "" },
      friday: { available: false, startTime: "", endTime: "" },
      saturday: { available: false, startTime: "", endTime: "" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Suresh Kumar", condition: "Fracture", lastVisit: "2024-01-10" },
      { id: 2, name: "Meena Devi", condition: "Arthritis", lastVisit: "2024-01-08" }
    ],
    todayAppointments: 0
  },
  {
    _id: "doc4",
    name: "Dr. Sunita Gupta",
    specialization: "Pediatrics",
    hospital: "Lilavati Hospital, Mumbai",
    department: "Pediatrics",
    phone: "+91-9876543213",
    email: "sunita.gupta@lilavati.com",
    availability: "Available",
    consultationFee: 400,
    patientsTreated: 1500,
    rating: 4.9,
    photo: "https://randomuser.me/api/portraits/women/4.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
      thursday: { available: true, startTime: "09:00", endTime: "18:00" },
      friday: { available: true, startTime: "09:00", endTime: "18:00" },
      saturday: { available: true, startTime: "09:00", endTime: "13:00" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Baby Aarav", condition: "Fever", lastVisit: "2024-01-15" },
      { id: 2, name: "Baby Diya", condition: "Cold", lastVisit: "2024-01-14" },
      { id: 3, name: "Kabir Singh", condition: "Vaccination", lastVisit: "2024-01-13" },
      { id: 4, name: "Ananya Roy", condition: "Growth Check", lastVisit: "2024-01-12" }
    ],
    todayAppointments: 12
  },
  {
    _id: "doc5",
    name: "Dr. Vikram Singh",
    specialization: "General Medicine",
    hospital: "Max Hospital, Delhi",
    department: "General Medicine",
    phone: "+91-9876543214",
    email: "vikram.singh@max.com",
    availability: "In Surgery",
    consultationFee: 350,
    patientsTreated: 2000,
    rating: 4.5,
    photo: "https://randomuser.me/api/portraits/men/5.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "08:00", endTime: "20:00" },
      tuesday: { available: true, startTime: "08:00", endTime: "20:00" },
      wednesday: { available: true, startTime: "08:00", endTime: "20:00" },
      thursday: { available: true, startTime: "08:00", endTime: "20:00" },
      friday: { available: true, startTime: "08:00", endTime: "20:00" },
      saturday: { available: true, startTime: "09:00", endTime: "17:00" },
      sunday: { available: true, startTime: "09:00", endTime: "17:00" }
    },
    assignedPatients: [
      { id: 1, name: "Ramesh Iyer", condition: "Diabetes", lastVisit: "2024-01-15" },
      { id: 2, name: "Lakshmi Nair", condition: "Hypertension", lastVisit: "2024-01-14" },
      { id: 3, name: "Krishnan Raj", condition: "Thyroid", lastVisit: "2024-01-13" }
    ],
    todayAppointments: 15
  },
  {
    _id: "doc6",
    name: "Dr. Anjali Desai",
    specialization: "Dermatology",
    hospital: "Jaslok Hospital, Mumbai",
    department: "Dermatology",
    phone: "+91-9876543215",
    email: "anjali.desai@jaslok.com",
    availability: "Available",
    consultationFee: 450,
    patientsTreated: 850,
    rating: 4.7,
    photo: "https://randomuser.me/api/portraits/women/6.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "10:00", endTime: "19:00" },
      tuesday: { available: true, startTime: "10:00", endTime: "19:00" },
      wednesday: { available: true, startTime: "10:00", endTime: "19:00" },
      thursday: { available: true, startTime: "10:00", endTime: "19:00" },
      friday: { available: true, startTime: "10:00", endTime: "19:00" },
      saturday: { available: true, startTime: "10:00", endTime: "15:00" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Pooja Mehta", condition: "Acne", lastVisit: "2024-01-15" },
      { id: 2, name: "Rajesh Kothari", condition: "Eczema", lastVisit: "2024-01-14" }
    ],
    todayAppointments: 7
  },
  {
    _id: "doc7",
    name: "Dr. Deepak Mehta",
    specialization: "Oncology",
    hospital: "Tata Memorial Hospital, Mumbai",
    department: "Oncology",
    phone: "+91-9876543216",
    email: "deepak.mehta@tata.com",
    availability: "Available",
    consultationFee: 800,
    patientsTreated: 750,
    rating: 4.9,
    photo: "https://randomuser.me/api/portraits/men/7.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
      thursday: { available: true, startTime: "09:00", endTime: "18:00" },
      friday: { available: true, startTime: "09:00", endTime: "18:00" },
      saturday: { available: false, startTime: "", endTime: "" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Sunil Kumar", condition: "Lymphoma", lastVisit: "2024-01-15" },
      { id: 2, name: "Kavita Singh", condition: "Breast Cancer", lastVisit: "2024-01-14" }
    ],
    todayAppointments: 6
  },
  {
    _id: "doc8",
    name: "Dr. Meera Nair",
    specialization: "Gynecology",
    hospital: "Columbia Asia Hospital, Bangalore",
    department: "Gynecology",
    phone: "+91-9876543217",
    email: "meera.nair@columbia.com",
    availability: "Available",
    consultationFee: 500,
    patientsTreated: 1300,
    rating: 4.8,
    photo: "https://randomuser.me/api/portraits/women/8.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "08:00", endTime: "17:00" },
      tuesday: { available: true, startTime: "08:00", endTime: "17:00" },
      wednesday: { available: true, startTime: "08:00", endTime: "17:00" },
      thursday: { available: true, startTime: "08:00", endTime: "17:00" },
      friday: { available: true, startTime: "08:00", endTime: "17:00" },
      saturday: { available: true, startTime: "09:00", endTime: "14:00" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Rebecca Thomas", condition: "Pregnancy", lastVisit: "2024-01-15" },
      { id: 2, name: "Anjum Begum", condition: "PCOD", lastVisit: "2024-01-14" },
      { id: 3, name: "Lakshmi Devi", condition: "Menopause", lastVisit: "2024-01-13" }
    ],
    todayAppointments: 10
  },
  {
    _id: "doc9",
    name: "Dr. Ravi Chandra",
    specialization: "Cardiology",
    hospital: "Narayana Health, Bangalore",
    department: "Cardiology",
    phone: "+91-9876543218",
    email: "ravi.chandra@narayana.com",
    availability: "On Leave",
    consultationFee: 600,
    patientsTreated: 1100,
    rating: 4.6,
    photo: "https://randomuser.me/api/portraits/men/9.jpg",
    availabilitySchedule: {
      monday: { available: false, startTime: "", endTime: "" },
      tuesday: { available: false, startTime: "", endTime: "" },
      wednesday: { available: false, startTime: "", endTime: "" },
      thursday: { available: false, startTime: "", endTime: "" },
      friday: { available: false, startTime: "", endTime: "" },
      saturday: { available: false, startTime: "", endTime: "" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Mohan Das", condition: "Heart Attack", lastVisit: "2024-01-05" },
      { id: 2, name: "Sita Devi", condition: "Angina", lastVisit: "2024-01-03" }
    ],
    todayAppointments: 0
  },
  {
    _id: "doc10",
    name: "Dr. Kavita Reddy",
    specialization: "Pediatrics",
    hospital: "Rainbow Hospital, Hyderabad",
    department: "Pediatrics",
    phone: "+91-9876543219",
    email: "kavita.reddy@rainbow.com",
    availability: "Available",
    consultationFee: 400,
    patientsTreated: 1450,
    rating: 4.9,
    photo: "https://randomuser.me/api/portraits/women/10.jpg",
    availabilitySchedule: {
      monday: { available: true, startTime: "09:00", endTime: "18:00" },
      tuesday: { available: true, startTime: "09:00", endTime: "18:00" },
      wednesday: { available: true, startTime: "09:00", endTime: "18:00" },
      thursday: { available: true, startTime: "09:00", endTime: "18:00" },
      friday: { available: true, startTime: "09:00", endTime: "18:00" },
      saturday: { available: true, startTime: "09:00", endTime: "13:00" },
      sunday: { available: false, startTime: "", endTime: "" }
    },
    assignedPatients: [
      { id: 1, name: "Baby Arjun", condition: "Vaccination", lastVisit: "2024-01-15" },
      { id: 2, name: "Baby Ishaan", condition: "Fever", lastVisit: "2024-01-14" },
      { id: 3, name: "Baby Aadhya", condition: "Growth Check", lastVisit: "2024-01-13" },
      { id: 4, name: "Baby Vihaan", condition: "Cold", lastVisit: "2024-01-12" }
    ],
    todayAppointments: 14
  }
];

// Add doctor
app.post("/api/doctors", async (req, res) => {
  const { doctor } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const newDoctor = new Doctors(doctor);
      await newDoctor.save();
      res.status(201).json({ message: "Doctor added successfully.", doctor: newDoctor });
    } catch (err) {
      console.error("Add doctor error:", err);
      res.status(500).json({ message: "Server error occurred while adding doctor." });
    }
  } else {
    // Fallback to JSON file
    const doctorsPath = path.join(__dirname, "doctors.json");
    let doctorsData = [];
    if (fs.existsSync(doctorsPath)) {
      doctorsData = JSON.parse(fs.readFileSync(doctorsPath, "utf8"));
    }
    doctorsData.push({ ...doctor, _id: generateCustomId() });
    fs.writeFileSync(doctorsPath, JSON.stringify(doctorsData, null, 2));
    res.status(201).json({ message: "Doctor added successfully." });
  }
});

// Update doctor
app.put("/api/doctors/:id", async (req, res) => {
  const { id } = req.params;
  const { doctor } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const updatedDoctor = await Doctors.findByIdAndUpdate(id, doctor, { new: true });
      if (!updatedDoctor) {
        return res.status(404).json({ message: "Doctor not found." });
      }
      res.status(200).json({ message: "Doctor updated successfully.", doctor: updatedDoctor });
    } catch (err) {
      console.error("Update doctor error:", err);
      res.status(500).json({ message: "Server error occurred while updating doctor." });
    }
  } else {
    // Fallback to JSON file
    const doctorsPath = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsPath)) {
      let doctorsData = JSON.parse(fs.readFileSync(doctorsPath, "utf8"));
      const index = doctorsData.findIndex(doc => doc._id === id);
      if (index !== -1) {
        doctorsData[index] = { ...doctorsData[index], ...doctor };
        fs.writeFileSync(doctorsPath, JSON.stringify(doctorsData, null, 2));
      }
    }
    res.status(200).json({ message: "Doctor updated successfully." });
  }
});

// Delete doctor
app.delete("/api/doctors/:id", async (req, res) => {
  const { id } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const doctor = await Doctors.findByIdAndDelete(id);
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found." });
      }
      res.status(200).json({ message: "Doctor deleted successfully." });
    } catch (err) {
      console.error("Delete doctor error:", err);
      res.status(500).json({ message: "Server error occurred while deleting doctor." });
    }
  } else {
    // Fallback to JSON file
    const doctorsPath = path.join(__dirname, "doctors.json");
    if (fs.existsSync(doctorsPath)) {
      let doctorsData = JSON.parse(fs.readFileSync(doctorsPath, "utf8"));
      doctorsData = doctorsData.filter(doc => doc._id !== id);
      fs.writeFileSync(doctorsPath, JSON.stringify(doctorsData, null, 2));
    }
    res.status(200).json({ message: "Doctor deleted successfully." });
  }
});

// ==================== ADMIN ANALYTICS API ENDPOINTS ====================

// Get overall statistics
app.get("/api/admin/stats", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const patientCount = await Patient.countDocuments();
      const hospitalStaffCount = await HospitalStaff.countDocuments();
      const bloodBankStaffCount = await BloodBankStaff.countDocuments();
      const donorCount = await Donor.countDocuments();
      const userProfileCount = await UserProfile.countDocuments();
      const bloodRequestCount = await BloodRequest.countDocuments();
      const bloodInventoryCount = await BloodInventory.countDocuments();
      const bloodBankCount = await BloodBank.countDocuments();
      const doctorCount = await Doctors.countDocuments();

      // Count administrators from UserProfile
      const adminCount = await UserProfile.countDocuments({ role: 'administrator' });

      // Blood request status breakdown
      const bloodRequestsByStatus = await BloodRequest.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]);

      // Blood inventory summary
      const bloodInventorySummary = await BloodInventory.aggregate([
        { $group: { _id: "$bloodGroup", totalUnits: { $sum: "$units" } } }
      ]);

      res.status(200).json({
        patients: patientCount,
        donors: donorCount,
        hospitalStaff: hospitalStaffCount,
        bloodBankStaff: bloodBankStaffCount,
        administrators: adminCount,
        bloodRequests: bloodRequestCount,
        bloodInventory: bloodInventoryCount,
        bloodBanks: bloodBankCount,
        doctors: doctorCount,
        bloodRequestsByStatus: bloodRequestsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        bloodInventorySummary: bloodInventorySummary.reduce((acc, item) => {
          acc[item._id] = item.totalUnits;
          return acc;
        }, {})
      });
    } catch (err) {
      console.error("Get admin stats error:", err);
      res.status(500).json({ message: "Server error occurred while fetching admin statistics." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// ==================== ADMIN USER MANAGEMENT API ENDPOINTS ====================

// Get all users with optional role filter
app.get("/api/admin/users", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { role, search, status, page = 1, limit = 10 } = req.query;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    let users = [];
    let totalCount = 0;

    // Build query based on role
    const searchQuery = search ? {
      $or: [
        { 'profile.fullName': { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { 'profile.phone': { $regex: search, $options: 'i' } }
      ]
    } : {};

    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!role || role === 'all') {
      // Get users from all collections
      const [patients, donors, hospitalStaff, bloodBankStaff, userProfiles] = await Promise.all([
        Patient.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
        Donor.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
        HospitalStaff.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
        BloodBankStaff.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 }),
        UserProfile.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 })
      ]);

      // Map to common format
      users = [
        ...patients.map(u => ({ ...u.toObject(), role: 'patient', name: u.profile?.fullName || u.name || u.profile?.name || '' })),
        ...donors.map(u => ({ ...u.toObject(), role: 'donor', name: u.profile?.fullName || u.name || u.profile?.name || '' })),
        ...hospitalStaff.map(u => ({ ...u.toObject(), role: 'hospital_staff', name: u.profile?.fullName || '' })),
        ...bloodBankStaff.map(u => ({ ...u.toObject(), role: 'blood_bank_staff', name: u.profile?.fullName || '' })),
        ...userProfiles.filter(u => u.role === 'administrator').map(u => ({ ...u.toObject(), role: 'administrator', name: u.fullName || '' }))
      ];

      totalCount = await Patient.countDocuments(searchQuery) + 
                  await Donor.countDocuments(searchQuery) + 
                  await HospitalStaff.countDocuments(searchQuery) + 
                  await BloodBankStaff.countDocuments(searchQuery) + 
                  await UserProfile.countDocuments({ ...searchQuery, role: 'administrator' });
    } else {
      // Get users from specific collection
      // Handle both singular and plural role names
      const normalizedRole = role?.replace(/s$/, ''); // Remove trailing 's' to normalize
      
      switch (normalizedRole) {
        case 'patient':
          users = await Patient.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
          users = users.map(u => ({ 
            ...u.toObject(), 
            role: 'patient', 
            name: u.profile?.fullName || u.name || u.profile?.name || '' 
          }));
          totalCount = await Patient.countDocuments(searchQuery);
          break;
        case 'donor':
          users = await Donor.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
          users = users.map(u => ({ 
            ...u.toObject(), 
            role: 'donor', 
            name: u.profile?.fullName || u.name || u.profile?.name || '' 
          }));
          totalCount = await Donor.countDocuments(searchQuery);
          break;
        case 'hospital_staff':
          users = await HospitalStaff.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
          users = users.map(u => ({ ...u.toObject(), role: 'hospital_staff', name: u.profile?.fullName || '' }));
          totalCount = await HospitalStaff.countDocuments(searchQuery);
          break;
        case 'blood_bank_staff':
          users = await BloodBankStaff.find(searchQuery).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
          users = users.map(u => ({ ...u.toObject(), role: 'blood_bank_staff', name: u.profile?.fullName || '' }));
          totalCount = await BloodBankStaff.countDocuments(searchQuery);
          break;
        case 'administrator':
          users = await UserProfile.find({ ...searchQuery, role: 'administrator' }).skip(skip).limit(parseInt(limit)).sort({ createdAt: -1 });
          users = users.map(u => ({ ...u.toObject(), role: 'administrator', name: u.fullName || '' }));
          totalCount = await UserProfile.countDocuments({ ...searchQuery, role: 'administrator' });
          break;
        default:
          users = [];
          totalCount = 0;
      }
    }

    res.status(200).json({
      users,
      totalCount,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalCount / parseInt(limit))
    });
  } catch (err) {
    console.error("Get users error:", err);
    res.status(500).json({ message: "Server error occurred while fetching users." });
  }
});

// Get user counts by role
app.get("/api/admin/users/counts", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    const [patientCount, donorCount, hospitalStaffCount, bloodBankStaffCount, adminCount] = await Promise.all([
      Patient.countDocuments(),
      Donor.countDocuments(),
      HospitalStaff.countDocuments(),
      BloodBankStaff.countDocuments(),
      UserProfile.countDocuments({ role: 'administrator' })
    ]);

    res.status(200).json({
      patients: patientCount,
      donors: donorCount,
      hospitalStaff: hospitalStaffCount,
      bloodBankStaff: bloodBankStaffCount,
      administrators: adminCount
    });
  } catch (err) {
    console.error("Get user counts error:", err);
    res.status(500).json({ message: "Server error occurred while fetching user counts." });
  }
});

// Get single user by ID
app.get("/api/admin/users/:id", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;
  const { role } = req.query;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    let user = null;

    switch (role) {
      case 'patient':
        user = await Patient.findById(id);
        if (user) user = { ...user.toObject(), role: 'patient' };
        break;
      case 'donor':
        user = await Donor.findById(id);
        if (user) user = { ...user.toObject(), role: 'donor' };
        break;
      case 'hospital_staff':
        user = await HospitalStaff.findById(id);
        if (user) user = { ...user.toObject(), role: 'hospital_staff' };
        break;
      case 'blood_bank_staff':
        user = await BloodBankStaff.findById(id);
        if (user) user = { ...user.toObject(), role: 'blood_bank_staff' };
        break;
      case 'administrator':
        user = await UserProfile.findById(id);
        if (user) user = { ...user.toObject(), role: 'administrator' };
        break;
      default:
        // Try all collections
        user = await Patient.findById(id);
        if (user) {
          user = { ...user.toObject(), role: 'patient' };
        } else {
          user = await Donor.findById(id);
          if (user) {
            user = { ...user.toObject(), role: 'donor' };
          } else {
            user = await HospitalStaff.findById(id);
            if (user) {
              user = { ...user.toObject(), role: 'hospital_staff' };
            } else {
              user = await BloodBankStaff.findById(id);
              if (user) {
                user = { ...user.toObject(), role: 'blood_bank_staff' };
              } else {
                user = await UserProfile.findById(id);
                if (user) {
                  user = { ...user.toObject(), role: 'administrator' };
                }
              }
            }
          }
        }
    }

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ message: "Server error occurred while fetching user." });
  }
});

// Create new user
app.post("/api/admin/users", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { role, ...userData } = req.body;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    let newUser;

    switch (role) {
      case 'patient':
        newUser = new Patient(userData);
        break;
      case 'donor':
        newUser = new Donor(userData);
        break;
      case 'hospital_staff':
        newUser = new HospitalStaff(userData);
        break;
      case 'blood_bank_staff':
        newUser = new BloodBankStaff(userData);
        break;
      case 'administrator':
        newUser = new UserProfile({ ...userData, role: 'administrator' });
        break;
      default:
        return res.status(400).json({ message: "Invalid role specified." });
    }

    await newUser.save();
    res.status(201).json({ ...newUser.toObject(), role });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: "Server error occurred while creating user." });
  }
});

// Update user
app.put("/api/admin/users/:id", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;
  const { role, ...updateData } = req.body;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    let updatedUser;

    switch (role) {
      case 'patient':
        updatedUser = await Patient.findByIdAndUpdate(id, updateData, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'patient' };
        break;
      case 'donor':
        updatedUser = await Donor.findByIdAndUpdate(id, updateData, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'donor' };
        break;
      case 'hospital_staff':
        updatedUser = await HospitalStaff.findByIdAndUpdate(id, updateData, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'hospital_staff' };
        break;
      case 'blood_bank_staff':
        updatedUser = await BloodBankStaff.findByIdAndUpdate(id, updateData, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'blood_bank_staff' };
        break;
      case 'administrator':
        updatedUser = await UserProfile.findByIdAndUpdate(id, updateData, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'administrator' };
        break;
      default:
        return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error occurred while updating user." });
  }
});

// Delete user
app.delete("/api/admin/users/:id", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;
  const { role } = req.query;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    let deletedUser;

    switch (role) {
      case 'patient':
        deletedUser = await Patient.findByIdAndDelete(id);
        break;
      case 'donor':
        deletedUser = await Donor.findByIdAndDelete(id);
        break;
      case 'hospital_staff':
        deletedUser = await HospitalStaff.findByIdAndDelete(id);
        break;
      case 'blood_bank_staff':
        deletedUser = await BloodBankStaff.findByIdAndDelete(id);
        break;
      case 'administrator':
        deletedUser = await UserProfile.findByIdAndDelete(id);
        break;
      default:
        // Try all collections
        deletedUser = await Patient.findByIdAndDelete(id);
        if (!deletedUser) {
          deletedUser = await Donor.findByIdAndDelete(id);
          if (!deletedUser) {
            deletedUser = await HospitalStaff.findByIdAndDelete(id);
            if (!deletedUser) {
              deletedUser = await BloodBankStaff.findByIdAndDelete(id);
              if (!deletedUser) {
                deletedUser = await UserProfile.findByIdAndDelete(id);
              }
            }
          }
        }
    }

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "User deleted successfully." });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error occurred while deleting user." });
  }
});

// Update user status (activate/suspend)
app.patch("/api/admin/users/:id/status", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { id } = req.params;
  const { status, role } = req.body;

  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    let updatedUser;

    switch (role) {
      case 'patient':
        updatedUser = await Patient.findByIdAndUpdate(id, { status }, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'patient' };
        break;
      case 'donor':
        updatedUser = await Donor.findByIdAndUpdate(id, { status }, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'donor' };
        break;
      case 'hospital_staff':
        updatedUser = await HospitalStaff.findByIdAndUpdate(id, { status }, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'hospital_staff' };
        break;
      case 'blood_bank_staff':
        updatedUser = await BloodBankStaff.findByIdAndUpdate(id, { status }, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'blood_bank_staff' };
        break;
      case 'administrator':
        updatedUser = await UserProfile.findByIdAndUpdate(id, { status }, { new: true });
        if (updatedUser) updatedUser = { ...updatedUser.toObject(), role: 'administrator' };
        break;
      default:
        return res.status(400).json({ message: "Invalid role specified." });
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update user status error:", err);
    res.status(500).json({ message: "Server error occurred while updating user status." });
  }
});

// Get recent blood requests
app.get("/api/admin/recent-requests", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const limit = parseInt(req.query.limit) || 10;

  if (isDbConnected) {
    try {
      const recentRequests = await BloodRequest.find({})
        .sort({ createdAt: -1 })
        .limit(limit);
      res.status(200).json(recentRequests);
    } catch (err) {
      console.error("Get recent requests error:", err);
      res.status(500).json({ message: "Server error occurred while fetching recent requests." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Get blood requests by date range
app.get("/api/admin/requests-by-date", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  const { startDate, endDate } = req.query;

  if (isDbConnected) {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      const requests = await BloodRequest.find({
        createdAt: { $gte: start, $lte: end }
      }).sort({ createdAt: -1 });

      res.status(200).json(requests);
    } catch (err) {
      console.error("Get requests by date error:", err);
      res.status(500).json({ message: "Server error occurred while fetching requests by date." });
    }
  } else {
    res.status(200).json([]);
  }
});

// Hospital Staff Endpoints
// Get hospital staff by clerkId
app.get("/api/hospital-staff/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      let staff = await HospitalStaff.findOne({ clerkId });
      if (!staff) {
        staff = new HospitalStaff({
          clerkId,
          email: req.query.email || "",
          profile: {},
          notifications: [],
        });
        await staff.save();
      }
      res.status(200).json(staff);
    } catch (err) {
      console.error("Get hospital staff error:", err);
      res.status(500).json({ message: "Server error occurred while retrieving hospital staff data." });
    }
  } else {
    // Fallback to JSON file
    const staffPath = path.join(__dirname, "hospitalStaff.json");
    let staffData = [];
    if (fs.existsSync(staffPath)) {
      staffData = JSON.parse(fs.readFileSync(staffPath, "utf8"));
    }
    let staff = staffData.find(s => s.clerkId === clerkId);
    if (!staff) {
      staff = {
        clerkId,
        email: req.query.email || "",
        profile: {},
        notifications: [],
      };
      staffData.push(staff);
      fs.writeFileSync(staffPath, JSON.stringify(staffData, null, 2));
    }
    res.status(200).json(staff);
  }
});

// Update hospital staff profile
app.put("/api/hospital-staff/:clerkId", async (req, res) => {
  const { clerkId } = req.params;
  const { profile } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;

  if (isDbConnected) {
    try {
      const staff = await HospitalStaff.findOne({ clerkId });
      if (!staff) {
        return res.status(404).json({ message: "Hospital staff not found." });
      }
      staff.profile = { ...staff.profile, ...profile };
      await staff.save();
      res.status(200).json({ message: "Hospital staff profile updated successfully.", staff });
    } catch (err) {
      console.error("Update hospital staff profile error:", err);
      res.status(500).json({ message: "Server error occurred while updating hospital staff profile." });
    }
  } else {
    // Fallback to JSON file
    const staffPath = path.join(__dirname, "hospitalStaff.json");
    if (fs.existsSync(staffPath)) {
      let staffData = JSON.parse(fs.readFileSync(staffPath, "utf8"));
      const index = staffData.findIndex(s => s.clerkId === clerkId);
      if (index !== -1) {
        staffData[index].profile = { ...staffData[index].profile, ...profile };
        fs.writeFileSync(staffPath, JSON.stringify(staffData, null, 2));
      }
    }
    res.status(200).json({ message: "Hospital staff profile updated successfully." });
  }
});

// Appointment API Endpoints
// Create new appointment
app.post("/api/appointments", async (req, res) => {
  console.log("POST /api/appointments - Request received:", req.body);
  const isDbConnected = mongoose.connection.readyState === 1;
  console.log("MongoDB connected:", isDbConnected);
  
  if (isDbConnected) {
    try {
      const appointmentNumber = `APT-${Date.now()}`;
      const appointment = new PatientAppointment({
        ...req.body,
        appointmentNumber,
        timeline: [{
          status: "Pending",
          updatedBy: req.body.createdBy || "",
          updatedByName: req.body.patientName || "Patient",
          timestamp: new Date().toISOString(),
          notes: "Appointment created"
        }]
      });
      await appointment.save();
      console.log("Appointment saved successfully:", appointment);
      
      // Send notification to hospital staff
      try {
        const hospitalStaff = await HospitalStaff.findOne({ _id: req.body.hospitalId });
        if (hospitalStaff && hospitalStaff._id) {
          const notification = new Notification({
            userId: hospitalStaff._id,
            userRole: "hospitalstaff",
            title: "New Appointment Request",
            message: `New appointment request from ${req.body.patientName} for ${req.body.department}`,
            type: "info",
            requestId: appointment._id,
            priority: req.body.priority === "Emergency" ? "High" : "Normal"
          });
          await notification.save();
        }
      } catch (notificationError) {
        console.error('Error sending hospital notification:', notificationError);
      }
      
      res.status(201).json({ message: "Appointment created successfully.", appointment });
    } catch (err) {
      console.error("Create appointment error:", err);
      res.status(500).json({ message: "Server error occurred while creating appointment.", error: err.message });
    }
  } else {
    console.log("MongoDB offline, returning error");
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Get all appointments
app.get("/api/appointments", async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointments = await PatientAppointment.find({}).sort({ createdAt: -1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get appointments error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointments." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Get appointment by ID
app.get("/api/appointments/:appointmentId", async (req, res) => {
  const { appointmentId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointment = await PatientAppointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }
      res.status(200).json(appointment);
    } catch (err) {
      console.error("Get appointment error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointment." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Get appointments by patient
app.get("/api/appointments/patient/:patientId", async (req, res) => {
  const { patientId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointments = await PatientAppointment.find({ patientId }).sort({ createdAt: -1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get patient appointments error:", err);
      res.status(500).json({ message: "Server error occurred while fetching patient appointments." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Get appointments by hospital
app.get("/api/appointments/hospital/:hospitalId", async (req, res) => {
  const { hospitalId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointments = await PatientAppointment.find({ hospitalId }).sort({ createdAt: -1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get hospital appointments error:", err);
      res.status(500).json({ message: "Server error occurred while fetching hospital appointments." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Get appointments by hospital name
app.get("/api/appointments/hospital-name/:hospitalName", async (req, res) => {
  const { hospitalName } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointments = await PatientAppointment.find({ hospitalName }).sort({ createdAt: -1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get hospital appointments by name error:", err);
      res.status(500).json({ message: "Server error occurred while fetching hospital appointments." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Get appointments by status
app.get("/api/appointments/status/:status", async (req, res) => {
  const { status } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointments = await PatientAppointment.find({ status }).sort({ createdAt: -1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get appointments by status error:", err);
      res.status(500).json({ message: "Server error occurred while fetching appointments by status." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Update appointment status (approve/reject/complete/cancel)
app.put("/api/appointments/:appointmentId/status/:status", async (req, res) => {
  const { appointmentId, status } = req.params;
  const { approvedBy, approvedByName, rejectionReason, completedBy, completedByName, prescription, followUpDate } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointment = await PatientAppointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }
      
      appointment.status = status;
      
      if (status === "Approved") {
        appointment.approvedBy = approvedBy || "";
        appointment.approvedByName = approvedByName || "";
        appointment.approvedDate = new Date().toISOString().split('T')[0];
        
        // Send notification to patient
        try {
          if (appointment.patientId) {
            const patientNotification = new Notification({
              userId: appointment.patientId,
              userRole: "patient",
              title: "Appointment Approved",
              message: `Your appointment #${appointment.appointmentNumber} has been approved for ${appointment.appointmentDate} at ${appointment.appointmentTime}`,
              type: "success",
              requestId: appointment._id,
              priority: "High"
            });
            await patientNotification.save();
          }
        } catch (notificationError) {
          console.error('Error sending patient notification:', notificationError);
        }
      } else if (status === "Rejected") {
        appointment.rejectionReason = rejectionReason || "";
        
        // Send notification to patient
        try {
          if (appointment.patientId) {
            const patientNotification = new Notification({
              userId: appointment.patientId,
              userRole: "patient",
              title: "Appointment Rejected",
              message: `Your appointment #${appointment.appointmentNumber} has been rejected. Reason: ${rejectionReason}`,
              type: "error",
              requestId: appointment._id,
              priority: "High"
            });
            await patientNotification.save();
          }
        } catch (notificationError) {
          console.error('Error sending patient notification:', notificationError);
        }
      } else if (status === "Completed") {
        appointment.completedBy = completedBy || "";
        appointment.completedByName = completedByName || "";
        appointment.completedDate = new Date().toISOString().split('T')[0];
        if (prescription) {
          appointment.prescription = prescription;
        }
        if (followUpDate) {
          appointment.followUpDate = followUpDate;
        }
        
        // Send notification to patient
        try {
          if (appointment.patientId) {
            const patientNotification = new Notification({
              userId: appointment.patientId,
              userRole: "patient",
              title: "Appointment Completed",
              message: `Your appointment #${appointment.appointmentNumber} has been completed. Prescription is now available.`,
              type: "success",
              requestId: appointment._id,
              priority: "High"
            });
            await patientNotification.save();
          }
        } catch (notificationError) {
          console.error('Error sending patient notification:', notificationError);
        }
      }
      
      // Add timeline entry
      appointment.timeline.push({
        status: status,
        updatedBy: approvedBy || completedBy || "",
        updatedByName: approvedByName || completedByName || "",
        timestamp: new Date().toISOString(),
        notes: status === "Rejected" ? rejectionReason : ""
      });
      
      await appointment.save();
      res.status(200).json({ message: `Appointment ${status} successfully.`, appointment });
    } catch (err) {
      console.error("Update appointment status error:", err);
      res.status(500).json({ message: "Server error occurred while updating appointment status.", error: err.message });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Cancel appointment
app.put("/api/appointments/:appointmentId/cancel", async (req, res) => {
  const { appointmentId } = req.params;
  const { cancelledBy, cancellationReason } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointment = await PatientAppointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }
      
      appointment.status = "Cancelled";
      appointment.timeline.push({
        status: "Cancelled",
        updatedBy: cancelledBy || "",
        updatedByName: appointment.patientName,
        timestamp: new Date().toISOString(),
        notes: cancellationReason || "Cancelled by patient"
      });
      
      await appointment.save();
      
      // Send notification to hospital staff
      try {
        const hospitalStaff = await HospitalStaff.findOne({ _id: appointment.hospitalId });
        if (hospitalStaff && hospitalStaff._id) {
          const notification = new Notification({
            userId: hospitalStaff._id,
            userRole: "hospitalstaff",
            title: "Appointment Cancelled",
            message: `Appointment #${appointment.appointmentNumber} has been cancelled by patient`,
            type: "warning",
            requestId: appointment._id,
            priority: "Normal"
          });
          await notification.save();
        }
      } catch (notificationError) {
        console.error('Error sending hospital notification:', notificationError);
      }
      
      res.status(200).json({ message: "Appointment cancelled successfully.", appointment });
    } catch (err) {
      console.error("Cancel appointment error:", err);
      res.status(500).json({ message: "Server error occurred while cancelling appointment." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Add doctor remarks to appointment
app.put("/api/appointments/:appointmentId/remarks", async (req, res) => {
  const { appointmentId } = req.params;
  const { remarks, doctorId, doctorName } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointment = await PatientAppointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({ message: "Appointment not found." });
      }
      
      appointment.doctorRemarks = remarks;
      appointment.doctorId = doctorId || "";
      appointment.doctorName = doctorName || "";
      
      await appointment.save();
      res.status(200).json({ message: "Doctor remarks added successfully.", appointment });
    } catch (err) {
      console.error("Add doctor remarks error:", err);
      res.status(500).json({ message: "Server error occurred while adding doctor remarks." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

// Razorpay Payment Integration
// Create order for Razorpay
app.post("/api/payment/create-order", async (req, res) => {
  const { amount, currency = "INR" } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    // In production, you would use Razorpay SDK to create order
    // For now, we'll create a mock order
    const order = {
      id: "order_" + generateCustomId(),
      amount: amount * 100, // Amount in paisa
      currency: currency,
      status: "created",
      createdAt: new Date().toISOString()
    };
    
    res.status(200).json(order);
  } catch (err) {
    console.error("Create payment order error:", err);
    res.status(500).json({ message: "Server error occurred while creating payment order." });
  }
});

// Verify Razorpay payment
app.post("/api/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    // In production, you would verify the signature using Razorpay SDK
    // const crypto = require('crypto');
    // const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    //   .update(razorpay_order_id + "|" + razorpay_payment_id)
    //   .digest('hex');
    
    // For now, we'll do a simple verification
    const isValid = true; // In production: expectedSignature === razorpay_signature
    
    if (isValid) {
      res.status(200).json({ signatureIsValid: true });
    } else {
      res.status(400).json({ signatureIsValid: false, message: "Invalid signature" });
    }
  } catch (err) {
    console.error("Verify payment error:", err);
    res.status(500).json({ message: "Server error occurred while verifying payment." });
  }
});

// Update blood request with payment details
app.put("/api/blood-requests/:requestId/payment", async (req, res) => {
  const { requestId } = req.params;
  const { paymentStatus, paymentId, paymentAmount, homeDelivery, deliveryAddress, status } = req.body;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    // Find the blood request in BloodRequest collection
    const bloodRequest = await BloodRequest.findById(requestId);
    
    if (!bloodRequest) {
      return res.status(404).json({ message: "Blood request not found." });
    }
    
    // Update the blood request with payment details
    bloodRequest.paymentStatus = paymentStatus;
    bloodRequest.paymentId = paymentId;
    bloodRequest.paymentAmount = paymentAmount;
    bloodRequest.homeDelivery = homeDelivery;
    bloodRequest.deliveryAddress = deliveryAddress;
    if (status) {
      bloodRequest.status = status;
    }
    
    await bloodRequest.save();
    res.status(200).json({ message: "Blood request updated successfully.", bloodRequest });
  } catch (err) {
    console.error("Update blood request payment error:", err);
    res.status(500).json({ message: "Server error occurred while updating blood request." });
  }
});

// Generate invoice PDF
app.get("/api/appointments/:appointmentId/invoice", async (req, res) => {
  const { appointmentId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    // Generate PDF using PDFKit
    const doc = new PDFDocument();
    const filename = `invoice_${appointment.appointmentNumber}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Invoice content
    doc.fontSize(20).text('INVOICE', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Appointment ID: ${appointment.appointmentNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Patient Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${appointment.patientName}`);
    doc.text(`Email: ${appointment.patientEmail}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Appointment Details:', { underline: true });
    doc.fontSize(12).text(`Doctor: ${appointment.doctorName}`);
    doc.text(`Hospital: ${appointment.hospitalName}`);
    doc.text(`Date: ${appointment.appointmentDate}`);
    doc.text(`Time: ${appointment.appointmentTime}`);
    doc.text(`Department: ${appointment.department}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Payment Details:', { underline: true });
    doc.fontSize(12).text(`Consultation Fee: ₹500`);
    doc.text(`Payment Status: ${appointment.paymentStatus || 'Pending'}`);
    doc.text(`Payment Method: Online`);
    doc.moveDown();
    
    doc.fontSize(16).text(`Total: ₹500`, { align: 'right' });
    doc.moveDown();
    doc.fontSize(10).text('Thank you for choosing HemoCare!', { align: 'center' });
    
    doc.end();
  } catch (err) {
    console.error("Generate invoice error:", err);
    res.status(500).json({ message: "Server error occurred while generating invoice." });
  }
});

// Generate prescription PDF
app.get("/api/appointments/:appointmentId/prescription", async (req, res) => {
  const { appointmentId } = req.params;
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (!isDbConnected) {
    return res.status(500).json({ message: "MongoDB offline." });
  }

  try {
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found." });
    }

    if (!appointment.prescription) {
      return res.status(400).json({ message: "No prescription available for this appointment." });
    }

    // Generate PDF using PDFKit
    const doc = new PDFDocument();
    const filename = `prescription_${appointment.appointmentNumber}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    doc.pipe(res);
    
    // Prescription content
    doc.fontSize(20).text('PRESCRIPTION', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Appointment ID: ${appointment.appointmentNumber}`);
    doc.text(`Date: ${appointment.appointmentDate}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Patient Information:', { underline: true });
    doc.fontSize(12).text(`Name: ${appointment.patientName}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Doctor Information:', { underline: true });
    doc.fontSize(12).text(`Dr. ${appointment.doctorName}`);
    doc.text(`Hospital: ${appointment.hospitalName}`);
    doc.moveDown();
    
    doc.fontSize(14).text('Prescription:', { underline: true });
    doc.moveDown();
    
    if (appointment.prescription.diagnosis) {
      doc.fontSize(12).text('Diagnosis:', { continued: true });
      doc.text(` ${appointment.prescription.diagnosis}`);
      doc.moveDown();
    }
    
    if (appointment.prescription.medicines && appointment.prescription.medicines.length > 0) {
      doc.fontSize(12).text('Medicines:', { underline: true });
      appointment.prescription.medicines.forEach((med, index) => {
        doc.text(`${index + 1}. ${med.name}`);
        doc.text(`   Dosage: ${med.dosage}`);
        doc.text(`   Duration: ${med.duration}`);
        doc.moveDown();
      });
    }
    
    if (appointment.prescription.notes) {
      doc.fontSize(12).text('Notes:', { continued: true });
      doc.text(` ${appointment.prescription.notes}`);
      doc.moveDown();
    }
    
    if (appointment.followUpDate) {
      doc.fontSize(12).text(`Follow-up Date: ${appointment.followUpDate}`);
    }
    
    doc.moveDown();
    doc.fontSize(10).text('This is a computer-generated prescription.', { align: 'center' });
    
    doc.end();
  } catch (err) {
    console.error("Generate prescription error:", err);
    res.status(500).json({ message: "Server error occurred while generating prescription." });
  }
});

// Get today's appointments for a hospital
app.get("/api/appointments/hospital/:hospitalId/today", async (req, res) => {
  const { hospitalId } = req.params;
  const today = new Date().toISOString().split('T')[0];
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    try {
      const appointments = await Appointment.find({ 
        hospitalId,
        appointmentDate: today,
        status: { $in: ["Pending", "Approved"] }
      }).sort({ appointmentTime: 1 });
      res.status(200).json(appointments);
    } catch (err) {
      console.error("Get today's appointments error:", err);
      res.status(500).json({ message: "Server error occurred while fetching today's appointments." });
    }
  } else {
    res.status(500).json({ message: "MongoDB offline." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
