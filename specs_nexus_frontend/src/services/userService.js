import axios from 'axios';

const API_URL = 'https://specs-nexus-production.up.railway.app';

export async function getProfile(token) {
  const response = await axios.get(`${API_URL}/auth/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateProfile(token, profileData) {
  const response = await axios.put(`${API_URL}/auth/profile`, profileData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  return response.data;
}