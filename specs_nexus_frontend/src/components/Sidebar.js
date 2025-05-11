import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/Sidebar.css';

const Sidebar = ({ user }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to logout?")) {

      localStorage.removeItem('accessToken');

      navigate('/'); 
    }
  };

  return (
    <div className="sidebar">
      <div className="user-info">
        <h3>{user.full_name || "User Name"}</h3>
        <p>{user.student_number || "Student Number"}</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/dashboard">Dashboard</Link></li>
          <li><Link to="/profile">Profile</Link></li>
          <li><Link to="/events">Events</Link></li>
          <li><Link to="/announcements">Announcements</Link></li>
          <li><Link to="/membership">Membership</Link></li>
          {user.is_admin && <li><Link to="/admin-events">Admin Events</Link></li>}
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
