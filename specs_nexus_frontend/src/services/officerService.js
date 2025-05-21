import axios from 'axios';

const API_URL = 'http://localhost:8000';

export async function getOfficers() {
  const token = localStorage.getItem('officerAccessToken');
  const response = await axios.get(`${API_URL}/officers/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getUsers() {
  const token = localStorage.getItem('officerAccessToken');
  const response = await axios.get(`${API_URL}/officers/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createOfficersBulk(userIds, position) {
  const token = localStorage.getItem('officerAccessToken');
  const formData = new FormData();
  userIds.forEach(id => formData.append('user_ids', id));
  formData.append('position', position);
  const response = await axios.post(`${API_URL}/officers/bulk`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function createOfficer(formData) {
  const token = localStorage.getItem('officerAccessToken');
  const response = await axios.post(`${API_URL}/officers/`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function updateOfficer(officerId, formData) {
  const token = localStorage.getItem('officerAccessToken');
  const response = await axios.put(`${API_URL}/officers/${officerId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function deleteOfficer(officerId) {
  const token = localStorage.getItem('officerAccessToken');
  const response = await axios.delete(`${API_URL}/officers/${officerId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}