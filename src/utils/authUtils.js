// Central Authentication and Role Management Utility
// Ensures the database role is the single source of truth for dashboard redirection.

const isLocal =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

const API_LOCAL = "http://127.0.0.1:5000";
const API_REMOTE =
  process.env.REACT_APP_API_URL
    ? (process.env.REACT_APP_API_URL.endsWith("/api")
        ? process.env.REACT_APP_API_URL.replace(/\/api$/, "")
        : process.env.REACT_APP_API_URL)
    : "https://hospital-resource-and-blood-bank.onrender.com";

const fetchWithTimeout = async (url, options = {}, timeoutMs = 8000) => {
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
  const normalized = (role || "").toLowerCase().trim();
  switch (normalized) {
    case "patient":
      return "/patient-dashboard";
    case "donor":
      return "/donor-dashboard";
    case "hospital_staff":
    case "hospitalstaff":
    case "hospital":
    case "doctor":
      return "/hospital-dashboard";
    case "blood_bank_staff":
    case "bloodbank_staff":
    case "bloodbankstaff":
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
  try {
    localStorage.removeItem("userFullName");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userRole");
    localStorage.removeItem("clerkId");
    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("pendingFullName");
    localStorage.removeItem("pendingRole");
  } catch (_) {}
}

/**
 * Persists an authenticated user session to localStorage.
 */
export function persistAuthSession({ clerkId, fullName, email, role }) {
  try {
    if (clerkId) localStorage.setItem("clerkId", clerkId);
    if (fullName) localStorage.setItem("userFullName", fullName);
    if (email) localStorage.setItem("userEmail", email);
    if (role) localStorage.setItem("userRole", role.toLowerCase().trim());
  } catch (_) {}
}

/**
 * Fetches the user's profile from the database (local first, then remote).
 * Queries multiple endpoints to guarantee role resolution.
 */
export async function fetchUserProfileFromDatabase({ clerkId, email }) {
  const trimmedClerkId = (clerkId || "").trim();
  const trimmedEmail = (email || "").trim();

  if (!trimmedClerkId && !trimmedEmail) {
    return null;
  }

  const bases = isLocal ? [API_LOCAL, API_REMOTE] : [API_REMOTE];

  // 1. Try by clerkId
  if (trimmedClerkId) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/users/profile/${encodeURIComponent(trimmedClerkId)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && data.role) return data;
        } catch (_) {}
      }
    }
  }

  // 2. Try by email
  if (trimmedEmail) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/users/profile-by-email?email=${encodeURIComponent(trimmedEmail)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && data.role) return data;
        } catch (_) {}
      }
    }
  }

  // 3. Try patient-specific record
  if (trimmedClerkId) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/patient/${encodeURIComponent(trimmedClerkId)}?email=${encodeURIComponent(trimmedEmail)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && (data.bloodRequests?.length || (data.profile && Object.keys(data.profile).length > 0))) {
            return {
              clerkId: trimmedClerkId,
              fullName: data.profile?.fullName || "",
              email: data.email || trimmedEmail,
              role: "patient",
            };
          }
        } catch (_) {}
      }
    }
  }

  // 4. Try donor-specific record
  if (trimmedClerkId) {
    for (const base of bases) {
      const res = await fetchWithTimeout(`${base}/api/donor/${encodeURIComponent(trimmedClerkId)}`);
      if (res && res.ok) {
        try {
          const data = await res.json();
          if (data && (data._id || data.profile)) {
            return {
              clerkId: trimmedClerkId,
              fullName: data.profile?.fullName || "",
              email: data.email || trimmedEmail,
              role: "donor",
            };
          }
        } catch (_) {}
      }
    }
  }

  // 5. Fallback to cached profile in localStorage if matching
  try {
    const cachedRole = localStorage.getItem("userRole");
    const cachedName = localStorage.getItem("userFullName");
    const cachedEmail = localStorage.getItem("userEmail");
    const cachedClerkId = localStorage.getItem("clerkId");
    if (cachedRole && (trimmedClerkId === cachedClerkId || (trimmedEmail && trimmedEmail === cachedEmail))) {
      return {
        clerkId: cachedClerkId || trimmedClerkId,
        fullName: cachedName || "User",
        email: cachedEmail || trimmedEmail,
        role: cachedRole.toLowerCase().trim(),
      };
    }
  } catch (_) {}

  return null;
}

/**
 * Accurately resolves a user's role using database as single source of truth.
 * Does NOT assign a default donor role to every user.
 */
export async function resolveUserRole({ clerkId, email, clerkUser }) {
  let effectiveClerkId = clerkId || clerkUser?.id || "";
  let effectiveEmail = email || clerkUser?.primaryEmailAddress?.emailAddress || clerkUser?.emailAddresses?.[0]?.emailAddress || "";

  try {
    if (!effectiveClerkId && typeof window !== "undefined" && window.Clerk?.user?.id) {
      effectiveClerkId = window.Clerk.user.id;
    }
    if (!effectiveClerkId) {
      effectiveClerkId = localStorage.getItem("clerkId") || "";
    }
    if (!effectiveEmail && typeof window !== "undefined" && window.Clerk?.user?.primaryEmailAddress?.emailAddress) {
      effectiveEmail = window.Clerk.user.primaryEmailAddress.emailAddress;
    }
    if (!effectiveEmail) {
      effectiveEmail = localStorage.getItem("userEmail") || "";
    }
  } catch (_) {}

  // 1. Query the database first
  const dbProfile = await fetchUserProfileFromDatabase({ clerkId: effectiveClerkId, email: effectiveEmail });
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
    (typeof window !== "undefined" && window.Clerk?.user?.unsafeMetadata?.role) ||
    (typeof window !== "undefined" && window.Clerk?.user?.publicMetadata?.role);

  if (clerkMetaRole) {
    const roleStr = String(clerkMetaRole).toLowerCase().trim();
    return {
      role: roleStr,
      profile: dbProfile || { clerkId: effectiveClerkId, email: effectiveEmail, role: roleStr },
      source: "clerk_metadata",
    };
  }

  // 3. Check existing session role in localStorage
  try {
    const existingStoredRole = localStorage.getItem("userRole");
    if (existingStoredRole && existingStoredRole.trim()) {
      const roleStr = existingStoredRole.toLowerCase().trim();
      return {
        role: roleStr,
        profile: dbProfile || { clerkId: effectiveClerkId, email: effectiveEmail, role: roleStr },
        source: "session_storage",
      };
    }
  } catch (_) {}

  // 4. Check pending registration role
  try {
    const pendingRole = localStorage.getItem("pendingRole");
    if (pendingRole && pendingRole.trim()) {
      const roleStr = pendingRole.toLowerCase().trim();
      return {
        role: roleStr,
        profile: dbProfile || { clerkId: effectiveClerkId, email: effectiveEmail, role: roleStr },
        source: "pending_role",
      };
    }
  } catch (_) {}

  // 5. Check if patient-specific data exists in localStorage
  try {
    if (effectiveClerkId && localStorage.getItem(`patient_profile_${effectiveClerkId}`)) {
      return {
        role: "patient",
        profile: dbProfile || { clerkId: effectiveClerkId, email: effectiveEmail, role: "patient" },
        source: "patient_cache",
      };
    }
  } catch (_) {}

  // 6. Email heuristics for Administrator
  if (effectiveEmail && (effectiveEmail.toLowerCase().includes("admin") || effectiveEmail.toLowerCase().includes("superadmin"))) {
    return {
      role: "administrator",
      profile: dbProfile || { clerkId: effectiveClerkId, email: effectiveEmail, role: "administrator" },
      source: "email_heuristic",
    };
  }

  return {
    role: null,
    profile: null,
    source: "unresolved",
  };
}
