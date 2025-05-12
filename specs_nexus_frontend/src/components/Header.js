import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../styles/Header.css';

const Header = () => {
  const location = useLocation();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  
  // Update the page title based on the current route
  const getPageTitle = () => {
    const path = location.pathname;
    // Remove the slash and capitalize the first letter
    if (path === '/') return 'Home';
    if (path === '/dashboard') return 'Dashboard';
    return path.substring(1).charAt(0).toUpperCase() + path.substring(2);
  };
  
  // Update the date and time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000); // Update every minute
    
    return () => {
      clearInterval(timer);
    };
  }, []);
  
  // Format the date and time
  const formatDateTime = () => {
    const options = { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return currentDateTime.toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="header">
      <h1 className="page-title">{getPageTitle()}</h1>
      <div className="datetime">{formatDateTime()}</div>
    </div>
  );
};

export default Header;