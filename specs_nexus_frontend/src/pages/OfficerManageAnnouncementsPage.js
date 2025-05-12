import React, { useEffect, useState } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import {
  getOfficerAnnouncements,
  createOfficerAnnouncement,
  updateOfficerAnnouncement,
  deleteOfficerAnnouncement
} from '../services/officerAnnouncementService';
import OfficerAnnouncementModal from '../components/OfficerAnnouncementModal';
import '../styles/OfficerManageAnnouncementsPage.css';

const OfficerManageAnnouncementsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('officerAccessToken');

  useEffect(() => {
    const storedOfficer = localStorage.getItem('officerInfo');
    if (storedOfficer) {
      setOfficer(JSON.parse(storedOfficer));
    }
  }, []);

  useEffect(() => {
    async function fetchAllAnnouncements() {
      try {
        setLoading(true);
        const data = await getOfficerAnnouncements(token);
        setAnnouncements(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch announcements:", error);
        setLoading(false);
      }
    }
    if (token) {
      fetchAllAnnouncements();
    }
  }, [token]);

  const handleAddNewAnnouncement = () => {
    setSelectedAnnouncement(null);
    setShowModal(true);
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowModal(true);
  };

  const handleDelete = async (announcementId) => {
    if (!announcementId) {
      alert("Invalid announcement ID");
      return;
    }
    if (!window.confirm("Are you sure you want to permanently delete this announcement?")) return;
    try {
      await deleteOfficerAnnouncement(announcementId, token, true);
      const updated = await getOfficerAnnouncements(token);
      setAnnouncements(updated);
    } catch (error) {
      console.error("Failed to delete announcement:", error);
      alert("Error deleting announcement");
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleSave = async (formData, announcementId) => {
    try {
      if (announcementId) {
        await updateOfficerAnnouncement(announcementId, formData, token);
        alert("Announcement updated successfully!");
      } else {
        await createOfficerAnnouncement(formData, token);
        alert("Announcement created successfully!");
      }
      setShowModal(false);
      const updated = await getOfficerAnnouncements(token);
      setAnnouncements(updated);
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Error saving announcement");
    }
  };

  const formatAnnouncementDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      formatted: date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
    };
  };

  if (loading) {
    return (
      <OfficerLayout officer={officer}>
        <div className="officer-manage-page loading">
          <div className="loader"></div>
          <p>Loading announcements...</p>
        </div>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout officer={officer}>
      <div className="officer-manage-page">
        <div className="officer-manage-header">
          <h1>Manage Announcements</h1>
          <button className="add-announcement-btn" onClick={handleAddNewAnnouncement}>
            <i className="fas fa-plus"></i> ADD NEW ANNOUNCEMENT
          </button>
        </div>

        <div className="announcements-grid">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement.id} className="announcement-manage-card">
                {/* Date badge */}
                <div className="announcement-date-badge">
                  <div className="announcement-month">{formatAnnouncementDate(announcement.date).month}</div>
                  <div className="announcement-day">{formatAnnouncementDate(announcement.date).day}</div>
                </div>

                {/* Announcement image */}
                <div className="announcement-image-wrapper">
                  <img
                    src={
                      announcement.image_url
                        ? (announcement.image_url.startsWith("http")
                            ? announcement.image_url
                            : `http://localhost:8000${announcement.image_url}`)
                        : "/default_announcement.png"
                    }
                    alt={announcement.title}
                    className="announcement-image"
                  />
                  <div className="image-overlay"></div>
                </div>

                {/* Announcement content */}
                <div className="announcement-content">
                  <h3 className="announcement-title">{announcement.title}</h3>

                  <div className="announcement-info">
                    <div className="announcement-info-item">
                      <i className="fas fa-clock announcement-icon"></i>
                      <span>{formatAnnouncementDate(announcement.date).formatted}</span>
                    </div>
                    <div className="announcement-info-item">
                      <i className="fas fa-map-marker-alt announcement-icon"></i>
                      <span>{announcement.location}</span>
                    </div>
                  </div>

                  <p className="announcement-description">
                    {announcement.description}
                  </p>
                </div>

                <div className="management-actions">
                  <button className="btn-edit" onClick={() => handleEdit(announcement)}>
                    <i className="fas fa-edit"></i> Edit
                  </button>
                  <button className="btn-delete" onClick={() => handleDelete(announcement.id)}>
                    <i className="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="no-announcements-message">
              <i className="fas fa-newspaper"></i>
              <p>No announcements found.</p>
              <button className="add-announcement-btn" onClick={handleAddNewAnnouncement}>
                <i className="fas fa-plus"></i> Create Your First Announcement
              </button>
            </div>
          )}
        </div>

        <OfficerAnnouncementModal
          show={showModal}
          onClose={handleCloseModal}
          onSave={handleSave}
          initialAnnouncement={selectedAnnouncement}
        />
      </div>
    </OfficerLayout>
  );
};

export default OfficerManageAnnouncementsPage;
