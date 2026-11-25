import axios from 'axios';
import { API_BASE_URL } from '../config/api';

export const donorService = {
  getDonors: async () => {
    const response = await axios.get(`${API_BASE_URL}/donors`);
    return response.data;
  },

  getDonorById: async (id) => {
    const response = await axios.get(`${API_BASE_URL}/donors/${id}`);
    return response.data;
  },

  createDonor: async (donorData) => {
    const response = await axios.post(`${API_BASE_URL}/donors`, donorData);
    return response.data;
  },

  updateDonor: async (id, donorData) => {
    const response = await axios.put(`${API_BASE_URL}/donors/${id}`, donorData);
    return response.data;
  },

  deleteDonor: async (id) => {
    const response = await axios.delete(`${API_BASE_URL}/donors/${id}`);
    return response.data;
  }
};

export default donorService;