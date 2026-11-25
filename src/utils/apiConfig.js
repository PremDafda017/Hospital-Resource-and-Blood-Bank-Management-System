/**
 * HemoCare Unified API & Real-Time Socket Configuration
 */

const isLocal = 
  typeof window !== "undefined" && 
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL = 
  process.env.REACT_APP_API_URL || 
  (isLocal 
    ? "http://127.0.0.1:5000" 
    : "https://hospital-resource-and-blood-bank.onrender.com");

export const SOCKET_URL = API_BASE_URL;

/**
 * Fetch helper with automatic fallback between local and remote
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, options);
    return res;
  } catch (err) {
    // If local fails and wasn't remote, try fallback to remote
    if (url.includes("127.0.0.1:5000") || url.includes("localhost:5000")) {
      const fallbackUrl = url.replace(/http:\/\/127\.0\.0\.1:5000|http:\/\/localhost:5000/, "https://hospital-resource-and-blood-bank.onrender.com");
      try {
        return await fetch(fallbackUrl, options);
      } catch (_) {}
    }
    throw err;
  }
}

