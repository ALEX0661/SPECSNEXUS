import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import ProfileCard from '../components/ProfileCard';
import Layout from '../components/Layout';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const userData = await getProfile(token);
        setUser(userData);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        setError('Failed to load profile data. Please try again later.');
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [token]);

  if (loading) {
    return (
      <Layout user={{ full_name: 'Loading...', student_number: '...' }}>
        <div className="profile-page">
          <div className="loading-spinner">Loading profile data...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout user={{ full_name: 'Error', student_number: '...' }}>
        <div className="profile-page">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout user={user}>
      <div className="profile-page">
        <ProfileCard user={user} />
      </div>
    </Layout>
  );
};

export default ProfilePage;