import axios from 'axios';

const API_URL = 'https://specs-nexus-production.up.railway.app';

export async function officerLogin(credentials) {
  const response = await axios.post(`${API_URL}/officers/login`, credentials);
  return response.data;
}
