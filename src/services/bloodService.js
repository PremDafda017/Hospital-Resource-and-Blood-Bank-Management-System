import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const bloodService = {
  getInventory: async () => {
    const response = await axios.get(`${API_BASE_URL}/blood/inventory`);
    return response.data;
  },

  addStock: async (stockData) => {
    const response = await axios.post(`${API_BASE_URL}/blood/stock`, stockData);
    return response.data;
  },

  getStockHistory: async () => {
    const response = await axios.get(`${API_BASE_URL}/blood/history`);
    return response.data;
  },

  createRequest: async (requestData) => {
    const response = await axios.post(`${API_BASE_URL}/blood/requests`, requestData);
    return response.data;
  },

  getRequests: async () => {
    const response = await axios.get(`${API_BASE_URL}/blood/requests`);
    return response.data;
  }
};

export default bloodService;