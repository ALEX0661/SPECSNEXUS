import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import '../styles/Layout.css';

const Layout = ({ user, children }) => {
  // Make sure we have a valid user object to prevent errors
  const validUser = user || { full_name: 'User', student_number: '' };
  
  return (
    <div className="layout-container">
      <Sidebar user={validUser} />
      <div className="main-content">
        <Header />
        <div className="page-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;