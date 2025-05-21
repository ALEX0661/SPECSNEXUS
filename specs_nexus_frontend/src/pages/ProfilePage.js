// ProfilePage.js
import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import { getProfile } from '../services/userService';
import ProfileCard from '../components/ProfileCard';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem('accessToken'); // Retrieve auth token

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  // Render loading state
  if (isLoading) {
    return <div className="loading">Loading Profile...</div>;
  }

  // Render error state
  if (!user) {
    return <div className="error-message">Unable to load profile data. Please try again later.</div>;
  }

  // Render profile content within layout
  return (
    <Layout user={user}>
      <div className="profile-section">
        <ProfileCard user={user} />
      </div>
    </Layout>
  );
};

export default ProfilePage;