import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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