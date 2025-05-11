import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/OfficerSidebar.css';

const OfficerSidebar = ({ officer: officerProp }) => {
  const [officer, setOfficer] = useState(officerProp || {});

  useEffect(() => {
    if (!officerProp) {
      const storedOfficer = localStorage.getItem('officerInfo');
      if (storedOfficer) {
        setOfficer(JSON.parse(storedOfficer));
      }
    }
  }, [officerProp]);

  const officerName = officer.full_name || "Officer Name";
  const officerPosition = officer.position || "Officer Position";

  const handleLogout = () => {
    localStorage.removeItem('officerAccessToken');
    localStorage.removeItem('officerInfo');
    window.location.href = '/officer-login';
  };

  return (
    <div className="officer-sidebar">
      <div className="officer-info">
        <h3>{officerName}</h3>
        <p>{officerPosition}</p>
      </div>
      <nav>
        <ul>
          <li><Link to="/officer-dashboard">Dashboard</Link></li>
          <li><Link to="/officer-manage-events">Manage Events</Link></li>
          <li><Link to="/officer-manage-announcements">Manage Announcements</Link></li>
          <li><Link to="/officer-manage-membership">Manage Membership</Link></li>
          {officer.position && officer.position.toLowerCase() === "admin" && (
            <li><Link to="/admin-manage-officers">Manage Officers</Link></li>
          )}
        </ul>
      </nav>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default OfficerSidebar;
