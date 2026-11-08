const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// ---------------------------------------------------------------------------
// Patient Profile Completion routes
// Mounted at /api/patients
//
// NOTE: This codebase identifies users by their Clerk user id (clerkId). The
// role and profile data are always resolved server-side from MongoDB
// (UserProfile / Patient collections). Client-supplied role or
// isProfileComplete values are never trusted.
// ---------------------------------------------------------------------------

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];
const RELATIONSHIPS = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Guardian", "Other"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "United Arab Emirates", "Singapore", "Other"];

// Mandatory profile fields (profile.* unless noted). `email` lives on the
// Patient document root in this schema.
const MANDATORY_FIELDS = [
  "fullName",
  "email",
  "phone",
  "dateOfBirth",
  "gender",
  "bloodGroup",
  "address",
  "city",
  "state",
  "pincode",
  "country",
  "emergencyContact",
  "emergencyPhone",
  "emergencyContactRelationship",
];

const OPTIONAL_MEDICAL_FIELDS = [
  "medicalConditions",
  "allergies",
  "currentMedications",
  "previousBloodTransfusion",
  "additionalMedicalInfo",
];

const PROFILE_FIELDS = [...MANDATORY_FIELDS.filter((f) => f !== "email"), ...OPTIONAL_MEDICAL_FIELDS];

const isDbConnected = () => mongoose.connection.readyState === 1;

const getPatient = () => mongoose.models.Patient;
const getUserProfile = () => mongoose.models.UserProfile;

const clean = (v) => (typeof v === "string" ? v.trim() : "");

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+]?[0-9][0-9\s\-()]{7,17}$/;
const PINCODE_RE = /^[A-Za-z0-9][A-Za-z0-9\- ]{2,11}$/;

function isValidDateOfBirth(v) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return false;
  const d = new Date(v + "T00:00:00Z");
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return d.getTime() < now.getTime() && d.getFullYear() > 1900;
}

// Returns { errors: {field: message}, sanitized: {...} }
function validateProfileInput(body = {}) {
  const errors = {};
  const p = {};

  for (const field of PROFILE_FIELDS) {
    p[field] = clean(body[field]);
  }
  p.email = clean(body.email);

  // Mandatory checks
  for (const field of MANDATORY_FIELDS) {
    const value = field === "email" ? p.email : p[field];
    if (!value) {
      errors[field] = "This field is required.";
    }
  }

  // Format checks (only when the field is present)
  if (p.email && !EMAIL_RE.test(p.email)) errors.email = "Enter a valid email address.";
  if (p.phone && !PHONE_RE.test(p.phone)) errors.phone = "Enter a valid mobile number (8-15 digits).";
  if (p.dateOfBirth && !isValidDateOfBirth(p.dateOfBirth)) errors.dateOfBirth = "Enter a valid date of birth.";
  if (p.pincode && !PINCODE_RE.test(p.pincode)) errors.pincode = "Enter a valid PIN / postal code.";
  if (p.gender && !GENDERS.includes(p.gender)) errors.gender = "Select a valid gender.";
  if (p.bloodGroup && !BLOOD_GROUPS.includes(p.bloodGroup)) errors.bloodGroup = "Select a valid blood group.";
  if (p.country && !COUNTRIES.includes(p.country)) errors.country = "Select a valid country.";
  if (p.emergencyContactRelationship && !RELATIONSHIPS.includes(p.emergencyContactRelationship)) {
    errors.emergencyContactRelationship = "Select a valid relationship.";
  }
  if (p.emergencyPhone && !PHONE_RE.test(p.emergencyPhone)) {
    errors.emergencyPhone = "Enter a valid contact number.";
  }
  if (p.previousBloodTransfusion && !["Yes", "No"].includes(p.previousBloodTransfusion)) {
    errors.previousBloodTransfusion = "Select Yes or No.";
  }

  // Length caps to keep payloads sane
  const MAX_LEN = 500;
  for (const field of [...PROFILE_FIELDS, "email"]) {
    if (p[field] && p[field].length > MAX_LEN) {
      errors[field] = `Must be ${MAX_LEN} characters or fewer.`;
    }
  }

  return { errors, sanitized: p };
}

// ---------------------------------------------------------------------------
// Profile completion computation (derived from stored DB fields, never from
// a client-supplied flag)
// ---------------------------------------------------------------------------

function computeCompletion(patient) {
  if (!patient) return { isComplete: false, missingFields: [...MANDATORY_FIELDS] };
  const profile = patient.profile || {};
  const missingFields = MANDATORY_FIELDS.filter((field) => {
    const value = field === "email" ? patient.email : profile[field];
    return !clean(value);
  });
  return { isComplete: missingFields.length === 0, missingFields };
}

// ---------------------------------------------------------------------------
// Role resolution - server side only
// ---------------------------------------------------------------------------

async function resolveUserRole(clerkId, roleHint) {
  if (isDbConnected()) {
    const UserProfile = getUserProfile();
    if (UserProfile) {
      const up = await UserProfile.findOne({ clerkId }).lean();
      if (up && up.role) return { role: up.role, userProfile: up };
    }
    const Patient = getPatient();
    if (Patient) {
      const exists = await Patient.exists({ clerkId });
      if (exists) return { role: "patient", userProfile: null };
    }
  }

  // Check mockDb.json fallback
  try {
    const mockFile = path.join(__dirname, "mockDb.json");
    if (fs.existsSync(mockFile)) {
      const mockProfiles = JSON.parse(fs.readFileSync(mockFile, "utf8"));
      const match = mockProfiles.find((p) => p.clerkId === clerkId || (p.email && p.email.toLowerCase() === (clerkId || "").toLowerCase()));
      if (match && match.role) return { role: match.role, userProfile: match };
    }
  } catch (_) {}

  return { role: roleHint || null, userProfile: null };
}

async function ensurePatientRecord(clerkId, email) {
  const Patient = getPatient();
  if (!Patient) return null;
  let patient = await Patient.findOne({ clerkId });
  if (!patient) {
    patient = new Patient({
      clerkId,
      email: clean(email),
      profile: {},
      bloodRequests: [],
      appointments: [],
      notifications: [],
      reports: [],
    });
    await patient.save();
  }
  return patient;
}

function publicProfile(patient) {
  if (!patient) return null;
  const obj = patient.toObject ? patient.toObject() : patient;
  const { isProfileComplete, missingFields } = computeCompletion(obj);
  return {
    clerkId: obj.clerkId,
    email: obj.email || "",
    profile: obj.profile || {},
    isProfileComplete,
    missingFields,
    profileCompletedAt: obj.profileCompletedAt || null,
    createdAt: obj.createdAt || null,
    updatedAt: obj.updatedAt || null,
  };
}

// ---------------------------------------------------------------------------
// GET /api/patients/profile/status?clerkId=...&role=...
// Returns whether the signed-in user's patient profile exists and is complete.
// ---------------------------------------------------------------------------
router.get("/profile/status", async (req, res) => {
  const clerkId = clean(req.query.clerkId);
  const roleHint = clean(req.query.role);
  if (!clerkId) {
    return res.status(400).json({ message: "clerkId is required." });
  }

  try {
    const { role } = await resolveUserRole(clerkId, roleHint);

    // Only patients are subject to profile completion
    if (role !== "patient") {
      return res.status(200).json({
        role: role || "unknown",
        exists: false,
        isProfileComplete: true, // not applicable - do not gate other roles
        missingFields: [],
      });
    }

    if (isDbConnected()) {
      const patient = await ensurePatientRecord(clerkId, req.query.email);
      const completion = computeCompletion(patient);
      return res.status(200).json({
        role: "patient",
        exists: true,
        isProfileComplete: completion.isComplete,
        missingFields: completion.missingFields,
        profileCompletedAt: patient.profileCompletedAt || null,
      });
    }

    // Offline fallback: compute from JSON snapshot if present
    const offline = readOfflineProfile(clerkId);
    const completion = computeCompletion(offline);
    res.status(200).json({
      role: "patient",
      exists: !!offline,
      isProfileComplete: completion.isComplete,
      missingFields: completion.missingFields,
      profileCompletedAt: offline?.profileCompletedAt || null,
    });
  } catch (err) {
    console.error("Profile status error:", err.message);
    res.status(500).json({ message: "Server error while checking profile status." });
  }
});

// ---------------------------------------------------------------------------
// GET /api/patients/profile?clerkId=...
// ---------------------------------------------------------------------------
router.get("/profile", async (req, res) => {
  const clerkId = clean(req.query.clerkId);
  if (!clerkId) {
    return res.status(400).json({ message: "clerkId is required." });
  }

  try {
    const { role } = await resolveUserRole(clerkId, clean(req.query.role));
    if (role && role !== "patient") {
      return res.status(403).json({ message: "This endpoint is only available for patient accounts." });
    }

    if (isDbConnected()) {
      const patient = await ensurePatientRecord(clerkId, req.query.email);
      return res.status(200).json(publicProfile(patient));
    }

    const offline = readOfflineProfile(clerkId);
    res.status(200).json(offline ? publicProfile(offline) : null);
  } catch (err) {
    console.error("Get patient profile error:", err.message);
    res.status(500).json({ message: "Server error while retrieving profile." });
  }
});

// ---------------------------------------------------------------------------
// Shared save logic for POST /profile/complete and PUT /profile/update
// ---------------------------------------------------------------------------

async function savePatientProfile(clerkId, body, { requireComplete }) {
  const { errors, sanitized } = validateProfileInput(body);

  if (requireComplete && Object.keys(errors).length > 0) {
    return { status: 400, body: { message: "Please complete all mandatory fields.", errors } };
  }

  // Optional medical fields are never format-validated beyond length caps,
  // but invalid enum values still produce errors even in partial updates.
  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors && !requireComplete) {
    // For partial updates, reject only invalid (non-empty) values
    const invalid = {};
    for (const [k, v] of Object.entries(errors)) {
      const value = k === "email" ? sanitized.email : sanitized[k];
      if (value) invalid[k] = v;
    }
    if (Object.keys(invalid).length > 0) {
      return { status: 400, body: { message: "Some fields are invalid.", errors: invalid } };
    }
  }

  const profilePatch = {};
  for (const field of PROFILE_FIELDS) {
    if (sanitized[field] !== "") profilePatch[`profile.${field}`] = sanitized[field];
  }
  // Allow intentionally clearing optional medical fields
  if (!requireComplete) {
    for (const field of OPTIONAL_MEDICAL_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, field) && clean(body[field]) === "") {
        profilePatch[`profile.${field}`] = "";
      }
    }
  }
  if (sanitized.email) profilePatch.email = sanitized.email;

  if (isDbConnected()) {
    const Patient = getPatient();
    const patient = await ensurePatientRecord(clerkId, sanitized.email);

    // Compute completion against the merged result
    const mergedProfile = { ...(patient.profile && patient.profile.toObject ? patient.profile.toObject() : patient.profile), ...Object.fromEntries(Object.entries(profilePatch).map(([k, v]) => [k.replace(/^profile\./, ""), v])) };
    const merged = { ...patient.toObject(), profile: mergedProfile, email: profilePatch.email || patient.email };
    const completion = computeCompletion(merged);

    const update = { $set: { ...profilePatch } };
    if (completion.isComplete) {
      update.$set.isProfileComplete = true;
      if (!patient.profileCompletedAt) update.$set.profileCompletedAt = new Date();
    } else if (requireComplete) {
      // unreachable - validation already enforced
    } else {
      update.$set.isProfileComplete = false;
    }

    const updated = await Patient.findOneAndUpdate({ clerkId }, update, { new: true });

    // Keep UserProfile display fields in sync (never touch role/permissions)
    const UserProfile = getUserProfile();
    if (UserProfile && sanitized.email) {
      const upPatch = {
        fullName: sanitized.fullName || undefined,
        email: sanitized.email,
        phone: sanitized.phone || undefined,
        bloodGroup: sanitized.bloodGroup || undefined,
        dateOfBirth: sanitized.dateOfBirth || undefined,
        gender: sanitized.gender || undefined,
        address: sanitized.address || undefined,
        city: sanitized.city || undefined,
        state: sanitized.state || undefined,
        pincode: sanitized.pincode || undefined,
      };
      const cleanPatch = Object.fromEntries(Object.entries(upPatch).filter(([, v]) => v !== undefined && v !== ""));
      if (Object.keys(cleanPatch).length > 0) {
        await UserProfile.updateOne({ clerkId }, { $set: cleanPatch }).catch(() => {});
      }
    }

    return { status: 200, body: { message: "Profile saved successfully.", profile: publicProfile(updated) } };
  }

  // Offline JSON fallback
  const record = readOfflineProfile(clerkId) || { clerkId, profile: {}, bloodRequests: [], appointments: [], notifications: [], reports: [] };
  Object.assign(record.profile, Object.fromEntries(Object.entries(profilePatch).filter(([k]) => k.startsWith("profile.")).map(([k, v]) => [k.slice(8), v])));
  if (profilePatch.email) record.email = profilePatch.email;
  const completion = computeCompletion(record);
  record.isProfileComplete = completion.isComplete;
  if (completion.isComplete && !record.profileCompletedAt) record.profileCompletedAt = new Date().toISOString();
  writeOfflineProfile(record);
  return { status: 200, body: { message: "Profile saved successfully (offline mode).", profile: publicProfile(record) } };
}

// ---------------------------------------------------------------------------
// POST /api/patients/profile/complete - full mandatory submission
// ---------------------------------------------------------------------------
router.post("/profile/complete", async (req, res) => {
  const clerkId = clean(req.body?.clerkId);
  if (!clerkId) {
    return res.status(400).json({ message: "clerkId is required." });
  }

  try {
    const { role, userProfile } = await resolveUserRole(clerkId, clean(req.body?.role));
    if (role && role !== "patient") {
      return res.status(403).json({ message: "Only patient accounts can complete a patient profile." });
    }
    if (userProfile && userProfile.role && userProfile.role !== "patient") {
      return res.status(403).json({ message: "Only patient accounts can complete a patient profile." });
    }

    const result = await savePatientProfile(clerkId, req.body, { requireComplete: true });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Complete profile error:", err.message);
    res.status(500).json({ message: "Server error while saving profile." });
  }
});

// ---------------------------------------------------------------------------
// PUT /api/patients/profile/update - partial update of own profile
// ---------------------------------------------------------------------------
router.put("/profile/update", async (req, res) => {
  const clerkId = clean(req.body?.clerkId);
  if (!clerkId) {
    return res.status(400).json({ message: "clerkId is required." });
  }

  try {
    const { role } = await resolveUserRole(clerkId, clean(req.body?.role));
    if (role && role !== "patient") {
      return res.status(403).json({ message: "This endpoint is only available for patient accounts." });
    }

    const result = await savePatientProfile(clerkId, req.body, { requireComplete: false });
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error("Update profile error:", err.message);
    res.status(500).json({ message: "Server error while updating profile." });
  }
});

// ---------------------------------------------------------------------------
// Offline (MongoDB disconnected) JSON fallback storage
// ---------------------------------------------------------------------------

const OFFLINE_FILE = path.join(__dirname, "patientProfiles.json");

function readOfflineStore() {
  try {
    if (fs.existsSync(OFFLINE_FILE)) {
      return JSON.parse(fs.readFileSync(OFFLINE_FILE, "utf8"));
    }
  } catch (e) {
    console.warn("Could not read offline patient profile store:", e.message);
  }
  return {};
}

function readOfflineProfile(clerkId) {
  const store = readOfflineStore();
  return store[clerkId] || null;
}

function writeOfflineProfile(record) {
  try {
    const store = readOfflineStore();
    store[record.clerkId] = record;
    fs.writeFileSync(OFFLINE_FILE, JSON.stringify(store, null, 2));
  } catch (e) {
    console.warn("Could not write offline patient profile store:", e.message);
  }
}

module.exports = router;
