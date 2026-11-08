import axios from "axios";
import { API_BASE_URL } from "../config/api";

// Patient profile completion API.
// The backend derives the role and profile state from MongoDB; the client
// only supplies the Clerk user id and the profile form data.
export const patientProfileService = {
  getProfileStatus: async (clerkId, role) => {
    const response = await axios.get(`${API_BASE_URL}/patients/profile/status`, {
      params: { clerkId, role },
    });
    return response.data;
  },

  getProfile: async (clerkId, role) => {
    const response = await axios.get(`${API_BASE_URL}/patients/profile`, {
      params: { clerkId, role },
    });
    return response.data;
  },

  completeProfile: async (clerkId, profile) => {
    const response = await axios.post(`${API_BASE_URL}/patients/profile/complete`, {
      clerkId,
      ...profile,
    });
    return response.data;
  },

  updateProfile: async (clerkId, profile) => {
    const response = await axios.put(`${API_BASE_URL}/patients/profile/update`, {
      clerkId,
      ...profile,
    });
    return response.data;
  },
};

export default patientProfileService;
