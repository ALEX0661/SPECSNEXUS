import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const OfficerAuthGuard = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = !!localStorage.getItem('officerAccessToken');

  if (!isAuthenticated) {
    return <Navigate to="/officer-login" state={{ from: location.pathname }} replace />;
  }

  return children;
};

export default OfficerAuthGuard;