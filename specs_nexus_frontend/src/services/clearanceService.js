import axios from 'axios';
const API_URL = 'https://specs-nexus-production.up.railway.app';

export async function getClearance(userId, token) {
  const response = await axios.get(`${API_URL}/clearance/${userId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}
