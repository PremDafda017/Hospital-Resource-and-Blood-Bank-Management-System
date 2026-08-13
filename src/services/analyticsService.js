import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

export const analyticsService = {
  getBloodDemandPrediction: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/blood-demand`);
    return response.data;
  },

  getPatientTrends: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/patient-trends`);
    return response.data;
  },

  getDonationTrends: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/donation-trends`);
    return response.data;
  },

  getPerformanceMetrics: async () => {
    const response = await axios.get(`${API_BASE_URL}/analytics/performance`);
    return response.data;
  },

  getChartData: async (chartType) => {
    const response = await axios.get(`${API_BASE_URL}/analytics/charts/${chartType}`);
    return response.data;
  }
};

export default analyticsService;