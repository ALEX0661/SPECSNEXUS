import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaCalendarAlt, FaBullhorn, FaUsers, FaTools, FaSignOutAlt, FaUserCircle, FaBars } from 'react-icons/fa';
import '../styles/OfficerSidebar.css';

const OfficerSidebar = ({ officer, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('officerAccessToken');
      localStorage.removeItem('officerInfo');
      navigate('/officer-login');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`} aria-label="Officer Sidebar">
      <div className="sidebar-header">
        <button
          className="sidebar-toggle"
          onClick={toggleSidebar}
          aria-label={isSidebarOpen ? 'Close sidebar' : 'Open sidebar'}
        >
          <FaBars />
        </button>
      </div>
      <div className="user-info">
        <FaUserCircle className="profile-icon" aria-hidden="true" />
        <h3>{officer?.full_name || 'Officer Name'}</h3>
        <p>{officer?.position || 'Officer Position'}</p>
      </div>
      <nav aria-label="Sidebar navigation">
        <ul>
          <li>
            <Link to="/officer-dashboard">
              <FaTachometerAlt aria-hidden="true" /> Dashboard
            </Link>
          </li>
          <li>
            <Link to="/officer-manage-events">
              <FaCalendarAlt aria-hidden="true" /> Manage Events
            </Link>
          </li>
          <li>
            <Link to="/officer-manage-announcements">
              <FaBullhorn aria-hidden="true" /> Manage Announcements
            </Link>
          </li>
          <li>
            <Link to="/officer-manage-membership">
              <FaUsers aria-hidden="true" /> Manage Membership
            </Link>
          </li>
          {officer?.position?.toLowerCase() === 'admin' && (
            <li>
              <Link to="/admin-manage-officers">
                <FaTools aria-hidden="true" /> Manage Officers
              </Link>
            </li>
          )}
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout} aria-label="Logout">
        <FaSignOutAlt style={{ marginRight: '8px' }} aria-hidden="true" />
        Logout
      </button>
    </div>
  );
};

export default OfficerSidebar;