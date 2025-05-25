const backendBaseUrl = "https://specs-nexus-production.up.railway.app";

export const getOfficerEvents = async (token, archived = false) => {
  try {
    const response = await fetch(`${backendBaseUrl}/events/officer/list?archived=${archived}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching officer events:', error);
    throw error;
  }
};

export const createOfficerEvent = async (formData, token) => {
  try {
    const response = await fetch(`${backendBaseUrl}/events/officer/create`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

export const updateOfficerEvent = async (eventId, formData, token) => {
  try {
    const response = await fetch(`${backendBaseUrl}/events/officer/update/${eventId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

export const deleteOfficerEvent = async (eventId, token) => {
  try {
    const response = await fetch(`${backendBaseUrl}/events/officer/delete/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};