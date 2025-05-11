import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm';
import '../styles/LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLoginSuccess = () => {
    navigate('/dashboard');
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  return (
    <div className="login-page">
      <header className="header">
        <button className="login-button" onClick={openModal}>
          Login
        </button>
      </header>

      {showModal && (
        <div
          className="modal"
          onClick={(e) => {
            if (e.target.classList.contains('modal')) closeModal();
          }}
        >
          <div className="modal-content">
            <span className="close" onClick={closeModal}>
              &times;
            </span>
            <h2 className="welcome-title">Welcome!</h2>
            <LoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
