import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OfficerLoginForm from '../components/OfficerLoginForm';
import '../styles/OfficerLoginPage.css';

const OfficerLoginPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize for responsive behavior
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show login panel by default on mobile
  useEffect(() => {
    if (isMobile) {
      setShowModal(true);
    }
  }, [isMobile]);

  const handleLoginSuccess = () => {
    navigate('/officer-dashboard');
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    if (!isMobile) {
      setShowModal(false);
    }
  };

  return (
    <div className="officer-login-page">
      <header className="officer-site-header">
        <div className="officer-header-content">
          <img src="/images/diamond_design.png" alt="SPECS Logo" className="officer-header-logo" />
          <h1 className="officer-header-title">
            <span className="officer-specs">SPECS</span> <span className="officer-nexus">Nexus</span>
          </h1>
        </div>
        {!isMobile && (
          <button className="officer-login-button" onClick={openModal}>
            Officer Login
          </button>
        )}
      </header>

      <div className="officer-container">
        {isMobile ? (
          <>
            <div className="officer-right-section">
              <img src="/images/specslogo.png" alt="SPECS Seal" className="officer-seal-image" />
            </div>
            <div className="officer-left-section">
              <ul className="officer-acronym">
                <li><span>S</span>ociety of</li>
                <li><span>P</span>rogramming</li>
                <li><span>E</span>nthusiasts in</li>
                <li><span>C</span>omputer</li>
                <li><span>S</span>cience</li>
              </ul>
              <div className="officer-seals">
                <img src="/images/gclogo.png" alt="Gordon College Seal" />
                <img src="/images/ccslogo.png" alt="CCS Seal" />
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="officer-left-section">
              <ul className="officer-acronym">
                <li><span>S</span>ociety of</li>
                <li><span>P</span>rogramming</li>
                <li><span>E</span>nthusiasts in</li>
                <li><span>C</span>omputer</li>
                <li><span>S</span>cience</li>
              </ul>
              <div className="officer-seals">
                <img src="/images/gclogo.png" alt="Gordon College Seal" />
                <img src="/images/ccslogo.png" alt="CCS Seal" />
              </div>
            </div>
            <div className="officer-right-section">
              <img src="/images/specslogo.png" alt="SPECS Seal" className="officer-seal-image" />
            </div>
          </>
        )}
      </div>

      {showModal && (
        <div
          className="officer-login-modal"
          onClick={(e) => {
            if (e.target.classList.contains('officer-login-modal') && !isMobile) closeModal();
          }}
        >
          <div className={`officer-modal-contents ${isMobile ? 'officer-mobile-modal' : ''}`}>
            {!isMobile && <span className="officer-close" onClick={closeModal}>&times;</span>}
            <h2 className="officer-welcome-title">Officer Login</h2>
            <OfficerLoginForm onLoginSuccess={handleLoginSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerLoginPage;