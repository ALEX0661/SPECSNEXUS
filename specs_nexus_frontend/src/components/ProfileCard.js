import React from 'react';
import '../styles/ProfilePage.css';

const ProfileCard = ({ user }) => {
  return (
    <div className="profile-card">
      <div className="profile-info">
        <div className="profile-row">
          <div className="profile-label">Student Number:</div>
          <div className="profile-value">{user.student_number}</div>
        </div>
        <div className="profile-row">
          <div className="profile-label">Full Name:</div>
          <div className="profile-value">{user.full_name}</div>
        </div>
        <div className="profile-row">
          <div className="profile-label">Year and Block:</div>
          <div className="profile-value">{user.year} {user.block}</div>
        </div>
        <div className="profile-row">
          <div className="profile-label">Email Address (Domain):</div>
          <div className="profile-value">{user.email}</div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;