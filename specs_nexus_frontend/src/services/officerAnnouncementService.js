import axios from 'axios';

const backendBaseUrl = "https://specs-nexus-production.up.railway.app";

export const getOfficerAnnouncements = async (token, showArchived = false) => {
  try {
    const response = await fetch(`${backendBaseUrl}/announcements/officer/list?archived=${showArchived}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching announcements:", error);
    throw error;
  }
};

export const createOfficerAnnouncement = async (formData, token) => {
  try {
    const response = await fetch(`${backendBaseUrl}/announcements/officer/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error creating announcement:", error);
    throw error;
  }
};

export const updateOfficerAnnouncement = async (announcementId, formData, token) => {
  try {
    const response = await fetch(`${backendBaseUrl}/announcements/officer/update/${announcementId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error updating announcement:", error);
    throw error;
  }
};

export const deleteOfficerAnnouncement = async (announcementId, token) => {
  try {
    const response = await fetch(`${backendBaseUrl}/announcements/officer/delete/${announcementId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error archiving announcement:", error);
    throw error;
  }
};