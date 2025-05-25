import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { officerLogin } from '../services/officerAuthService';
import '../styles/OfficerLoginPage.css';

const OfficerLoginForm = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    setError('');
    setIsLoading(true);
    try {
      const response = await officerLogin({ email, password });
      localStorage.setItem('officerAccessToken', response.access_token);
      localStorage.setItem('officerInfo', JSON.stringify(response.officer));
      onLoginSuccess();
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="officer-login-form">
      {error && <p className="officer-error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            id="officer-email"
            type="email"
            placeholder="Officer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            className="officer-input"
          />
        </div>
        <div className="officer-password-container">
          <input
            id="officer-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            className="officer-input"
          />
          <span className="officer-password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <button 
          type="submit" 
          className="officer-modal-login-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
        <div className="officer-student-login-link">
          <p>
            Are you a student?{' '}
            <Link to="/">Log in here</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default OfficerLoginForm;