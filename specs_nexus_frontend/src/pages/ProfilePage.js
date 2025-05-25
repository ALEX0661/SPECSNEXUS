import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import Layout from '../components/Layout';
import { getProfile, updateProfile } from '../services/userService';
import ProfileCard from '../components/ProfileCard';
import StatusModal from '../components/StatusModal';
import Loading from '../components/Loading';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: 'success',
    title: '',
    message: ''
  });
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate(); // Initialize navigate

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

  const handleUpdateProfile = async (updatedData) => {
    try {
      const updatedUser = await updateProfile(token, updatedData);
      setUser(updatedUser);
      setModalState({
        isOpen: true,
        type: 'success',
        title: 'Profile Updated',
        message: 'Your profile has been successfully updated.'
      });
    } catch (error) {
      console.error('Failed to update user profile:', error);
      setModalState({
        isOpen: true,
        type: 'error',
        title: 'Profile Update Failed',
        message: 'Failed to update profile. Please try again.'
      });
    }
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  if (isLoading) {
    return <Loading message="Loading Profile..." />;
  }

  if (!user) {
    navigate('/'); // Redirect to login page
    return null; // Prevent rendering anything else
  }

  return (
    <Layout user={user}>
      <div className="profile-section">
        <ProfileCard user={user} onUpdate={handleUpdateProfile} />
        <StatusModal
          isOpen={modalState.isOpen}
          onClose={closeModal}
          type={modalState.type}
          title={modalState.title}
          message={modalState.message}
        />
      </div>
    </Layout>
  );
};

export default ProfilePage;