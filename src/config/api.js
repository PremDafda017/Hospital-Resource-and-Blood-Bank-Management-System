// Central API base URL for frontend service calls.
// Override with REACT_APP_API_URL when needed.
const isLocal =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1"].includes(window.location.hostname);

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (isLocal
    ? "http://127.0.0.1:5000/api"
    : "https://hospital-resource-and-blood-bank.onrender.com/api");

export default API_BASE_URL;
