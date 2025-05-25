import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { login } from '../services/authService';
import { FiEye, FiEyeOff } from 'react-icons/fi';

const LoginForm = ({ onLoginSuccess }) => {
  const [emailOrStudentNumber, setEmailOrStudentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!emailOrStudentNumber.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      const response = await login({ emailOrStudentNumber, password });
      localStorage.setItem('accessToken', response.access_token);
      onLoginSuccess(response);
    } catch (err) {
      console.error('Login error:', err);
      setError('Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-form">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <input
            id="emailOrStudentNumber"
            type="text"
            placeholder="Email or Student Number"
            value={emailOrStudentNumber}
            onChange={(e) => setEmailOrStudentNumber(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className="password-container">
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          <span className="password-toggle" onClick={togglePasswordVisibility}>
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </span>
        </div>
        <button 
          type="submit" 
          className="modal-login-button" 
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Log In'}
        </button>
        <div className="officer-login-link">
          <p>
            Are you an officer?{' '}
            <Link to="/officer-login">Log in here</Link>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;