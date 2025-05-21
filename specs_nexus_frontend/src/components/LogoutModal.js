import React from 'react';
import '../styles/LogoutModal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-containers">
        <div className="confirmation-header">
          <h2 className="confirmation-title">Confirm Logout</h2>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="confirmation-content">
          <p>Are you sure you want to log out?</p>
        </div>
        <div className="confirmation-actions">
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;