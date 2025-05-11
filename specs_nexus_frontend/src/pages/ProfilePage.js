import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import ProfileCard from '../components/ProfileCard';
import Layout from '../components/Layout';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
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

  if (!user) {
    return <div className="profile-page"><p>Loading profile...</p></div>;
  }

  return (
    <Layout user={user}>
      <ProfileCard user={user} />
    </Layout>
  );
};

export default ProfilePage;
