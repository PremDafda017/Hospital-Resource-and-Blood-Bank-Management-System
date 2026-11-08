// Central Authentication and Role Management Utility
// Ensures the database role is the single source of truth for dashboard redirection.

const API_LOCAL = "http://127.0.0.1:5000";
const API_REMOTE = "https://hospital-resource-and-blood-bank.onrender.com";

const fetchWithTimeout = async (url, options = {}, timeoutMs = 2800) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    return null;
  }
};

/**
 * Maps a canonical user role to its designated dashboard URL.
 * Supports: patient, donor, hospital_staff, blood_bank_staff, administrator
 */
export function roleToDashboardPath(role) {
  switch ((role || "").toLowerCase().trim()) {
    case "patient":
      return "/patient-dashboard";
    case "donor":
      return "/donor-dashboard";
    case "hospital_staff":
    case "hospital":
    case "doctor":
      return "/hospital-dashboard";
    case "blood_bank_staff":
    case "bloodbank_staff":
    case "blood_bank":
    case "bloodbank":
      return "/bloodbank-dashboard";
    case "administrator":
    case "super_admin":
    case "superadmin":
    case "admin":
      return "/admin-dashboard";
    default:
      return "/";
  }
}

/**
 * Purges all authentication tokens, roles, and session metadata from localStorage.
 * Prevents stale roles from leaking into subsequent logins.
 */
export function clearAuthSession() {
  localStorage.removeItem("userFullName");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("userRole");
  localStorage.removeItem("clerkId");
  localStorage.removeItem("pendingEmail");
  localStorage.removeItem("pendingFullName");
  localStorage.removeItem("pendingRole");
}

/**
 * Persists an authenticated user session to localStorage.
 */
export function persistAuthSession({ clerkId, fullName, email, role }) {
  if (clerkId)  localStorage.setItem("clerkId", clerkId);
  if (fullName) localStorage.setItem("userFullName", fullName);
  if (email)    localStorage.setItem("userEmail", email);
  if (role)     localStorage.setItem("userRole", role.toLowerCase().trim());
}

/**
 * Fetches the user's profile from the database (local first, then remote).
 * Queries multiple endpoints to guarantee role resolution.
 */
export async function fetchUserProfileFromDatabase({ clerkId, email }) {
  const bases = [API_LOCAL, API_REMOTE];

  // 1. Try by clerkId
  if (clerkId) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/users/profile/${encodeURIComponent(clerkId)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && data.role) return data;
        } catch (_) {}
      }
    }
  }

  // 2. Try by email
  if (email) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/users/profile-by-email?email=${encodeURIComponent(email)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && data.role) return data;
        } catch (_) {}
      }
    }
  }

  // 3. Try patient-specific record
  if (clerkId) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/patient/${encodeURIComponent(clerkId)}?email=${encodeURIComponent(email || "")}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && (data.bloodRequests?.length || (data.profile && Object.keys(data.profile).length > 0))) {
            return {
              clerkId,
              fullName: data.profile?.fullName || "",
              email: data.email || email || "",
              role: "patient",
            };
          }
        } catch (_) {}
      }
    }
  }

  // 4. Try donor-specific record
  if (clerkId) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/donor/${encodeURIComponent(clerkId)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && (data._id || data.profile)) {
            return {
              clerkId,
              fullName: data.profile?.fullName || "",
              email: data.email || email || "",
              role: "donor",
            };
          }
        } catch (_) {}
      }
    }
  }

  return null;
}

/**
 * Accurately resolves a user's role using database as single source of truth.
 * Does NOT assign a default donor role to every user.
 */
export async function resolveUserRole({ clerkId, email, clerkUser }) {
  // 1. Query the database first
  const dbProfile = await fetchUserProfileFromDatabase({ clerkId, email });
  if (dbProfile && dbProfile.role) {
    return {
      role: dbProfile.role.toLowerCase().trim(),
      profile: dbProfile,
      source: "database",
    };
  }

  // 2. Query Clerk's permanently saved user metadata
  const clerkMetaRole =
    clerkUser?.unsafeMetadata?.role ||
    clerkUser?.publicMetadata?.role ||
    window.Clerk?.user?.unsafeMetadata?.role ||
    window.Clerk?.user?.publicMetadata?.role;

  if (clerkMetaRole) {
    return {
      role: String(clerkMetaRole).toLowerCase().trim(),
      profile: dbProfile,
      source: "clerk_metadata",
    };
  }

  // 3. Check if patient-specific data exists in localStorage
  if (clerkId && localStorage.getItem(`patient_profile_${clerkId}`)) {
    return {
      role: "patient",
      profile: dbProfile,
      source: "patient_cache",
    };
  }

  // 4. Check existing session role in localStorage
  const existingStoredRole = localStorage.getItem("userRole");
  if (existingStoredRole && existingStoredRole.trim()) {
    return {
      role: existingStoredRole.toLowerCase().trim(),
      profile: dbProfile,
      source: "session_storage",
    };
  }

  // 5. Check pending registration role
  const pendingRole = localStorage.getItem("pendingRole");
  if (pendingRole && pendingRole.trim()) {
    return {
      role: pendingRole.toLowerCase().trim(),
      profile: dbProfile,
      source: "pending_role",
    };
  }

  return {
    role: null,
    profile: null,
    source: "unresolved",
  };
}

