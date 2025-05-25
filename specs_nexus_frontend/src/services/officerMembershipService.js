import axios from 'axios';
const API_URL = 'https://specs-nexus-production.up.railway.app';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error)
);

export async function getOfficerMemberships(token) {
  const response = await apiClient.get(`/membership/officer/list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createOfficerMembership(formData, token) {
  const response = await apiClient.post(`/membership/officer/create`, formData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function verifyOfficerMembership(membershipId, action, denialReason, token) {
  const payload = { action };
  if (denialReason) {
    payload.denial_reason = denialReason;
  }
  const response = await apiClient.put(`/membership/officer/verify/${membershipId}`, payload, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function getOfficerRequirements(token) {
  const response = await apiClient.get(`/membership/officer/requirements`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function updateOfficerRequirement(requirement, payload, token) {
  const response = await apiClient.put(
    `/membership/officer/requirements/${encodeURIComponent(requirement)}`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function deleteOfficerRequirement(requirement, token) {
  const response = await apiClient.delete(
    `/membership/officer/requirements/${encodeURIComponent(requirement)}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
}

export async function uploadOfficerQRCode(paymentType, file, token) {
  const data = new FormData();
  data.append("file", file);
  data.append("payment_type", paymentType);
  const response = await apiClient.post(
    `/membership/officer/upload_qrcode`,
    data,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}

export async function getQRCode(paymentType, token) {
  const response = await apiClient.get(`/membership/qrcode?payment_type=${paymentType}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createOfficerRequirement(formData, token) {
  const response = await apiClient.post(
    `/membership/officer/requirement/create`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
}