import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import { getAnnouncements } from '../services/announcementService';
import AnnouncementCard from '../components/AnnouncementCard';
import AnnouncementModal from '../components/AnnouncementModal';
import Layout from '../components/Layout';
import '../styles/AnnouncementsPage.css';

const AnnouncementsPage = () => {
  const [user, setUser] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    async function fetchAnnouncements() {
      try {
        const announcementsData = await getAnnouncements(token);
        setAnnouncements(announcementsData);
      } catch (error) {
        console.error('Failed to fetch announcements:', error);
      }
    }
    fetchAnnouncements();
  }, [token]);

  const handleCardClick = (announcement) => {
    setSelectedAnnouncement(announcement);
  };

  const closeModal = () => {
    setSelectedAnnouncement(null);
  };

  if (!user) {
    return <div className="announcements-page"><p>Loading announcements...</p></div>;
  }

  return (
    <Layout user={user}>
      <div className="announcements-page">
        <h1>Announcements</h1>
        <div className="announcements-grid">
          {announcements.map((announcement) => (
            <AnnouncementCard
              key={announcement.id}
              announcement={announcement}
              onClick={handleCardClick}
            />
          ))}
        </div>
        {selectedAnnouncement && (
          <AnnouncementModal
            announcement={selectedAnnouncement}
            onClose={closeModal}
          />
        )}
      </div>
    </Layout>
  );
};

export default AnnouncementsPage;
