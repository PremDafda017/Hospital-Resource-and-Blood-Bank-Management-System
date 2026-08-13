import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

export const authService = {
  login: async (credentials) => {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  },

  logout: async () => {
    const response = await axios.post(`${API_BASE_URL}/auth/logout`);
    return response.data;
  },

  verifyOTP: async (code) => {
    const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, { code });
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await axios.get(`${API_BASE_URL}/auth/me`);
    return response.data;
  }
};

export default authService;