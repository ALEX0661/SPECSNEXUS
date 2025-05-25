import axios from 'axios';
const API_URL = 'https://specs-nexus-production.up.railway.app';

export async function getDashboardAnalytics(token, params = {}) {
  const response = await axios.get(`${API_URL}/analytics/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params
  });
  return response.data;
}