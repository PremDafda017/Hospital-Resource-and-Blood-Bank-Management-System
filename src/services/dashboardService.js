import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

export const dashboardService = {
  getStats: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/stats`);
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/activity`);
    return response.data;
  },

  getAlerts: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/alerts`);
    return response.data;
  },

  getBloodStockLevels: async () => {
    const response = await axios.get(`${API_BASE_URL}/dashboard/blood-stock`);
    return response.data;
  }
};

export default dashboardService;