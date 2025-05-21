import React, { useState, useEffect } from 'react';
import OfficerSidebar from './OfficerSidebar';
import Header from './Header';
import '../styles/OfficerLayout.css';

const OfficerLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [officer, setOfficer] = useState({});

  // Handle window resize to determine if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      
      // Auto collapse sidebar on mobile, expand on desktop
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Initial check
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Clean up
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load officer data from local storage
  useEffect(() => {
    const officerInfo = JSON.parse(localStorage.getItem('officerInfo'));
    if (officerInfo) setOfficer(officerInfo);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Calculate content margin based on sidebar state and device
  const contentStyle = isMobile 
    ? { marginLeft: 0 } // No margin on mobile, sidebar will overlay
    : { marginLeft: isSidebarOpen ? '220px' : '60px' };

  return (
    <div className={`layout-container ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <OfficerSidebar 
        officer={officer} 
        isSidebarOpen={isSidebarOpen} 
        setIsSidebarOpen={setIsSidebarOpen}
        isMobile={isMobile} 
      />
      <div className="main-content" style={contentStyle}>
        <Header 
          toggleSidebar={toggleSidebar} 
          isSidebarOpen={isSidebarOpen}
          isMobile={isMobile}
        />
        <div className="content-wrapper">
          {children}
        </div>
      </div>
    </div>
  );
};

export default OfficerLayout;