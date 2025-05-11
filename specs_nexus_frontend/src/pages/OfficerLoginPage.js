import React from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerLoginForm from '../components/OfficerLoginForm';
import { officerLogin } from '../services/officerAuthService';
import '../styles/OfficerLoginPage.css';

const OfficerLoginPage = () => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (credentials) => {
    try {
      const data = await officerLogin(credentials);

      localStorage.setItem('officerAccessToken', data.access_token);
      localStorage.setItem('officerInfo', JSON.stringify(data.officer));

      navigate('/officer-dashboard');
    } catch (err) {
      console.error("Officer login failed:", err);
      alert("Invalid credentials, please try again.");
    }
  };

  return (
    <div className="officer-login-page">
      <div className="login-container">
        <OfficerLoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
};

export default OfficerLoginPage;
