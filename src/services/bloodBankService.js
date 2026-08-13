import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:5000/api';

export const bloodBankService = {
  getBloodBanks: async () => {
    const response = await axios.get(`${API_BASE_URL}/blood-banks`);
    return response.data;
  },

  getBloodBankById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/blood-banks/${id}`);
    return response.data;
  },

  createBloodBank: async (bankData) => {
    const response = await axios.post(`${API_BASE_URL}/blood-banks`, bankData);
    return response.data;
  },

  updateBloodBank: async (id, bankData) => {
    const response = await axios.put(`${API_BASE_URL}/blood-banks/${id}`, bankData);
    return response.data;
  },

  deleteBloodBank: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/blood-banks/${id}`);
    return response.data;
  }
};

export default bloodBankService;