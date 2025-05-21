import React, { useState } from 'react';
import '../styles/OfficerMembershipModal.css';

const OfficerDenialReasonModal = ({ show, onClose, onSubmit }) => {
  const [denialReason, setDenialReason] = useState('');
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    { value: '', label: 'Select a reason...' },
    { value: 'Receipt is too blurry', label: 'Receipt is too blurry' },
    { value: 'Not the correct receipt', label: 'Not the correct receipt' },
    { value: 'Invalid payment amount', label: 'Invalid payment amount' },
    { value: 'Payment method not supported', label: 'Payment method not supported' },
    { value: 'Other', label: 'Other (please specify)' },
  ];

  const handleSubmit = (e) => { 
    e.preventDefault();
    const finalReason = selectedReason === 'Other' ? denialReason.trim() : selectedReason;
    if (!finalReason) {
      alert('Please select a reason or provide a custom reason.');
      return;
    }
    onSubmit(finalReason);
    setDenialReason('');
    setSelectedReason('');
  };

  const handleReasonChange = (e) => {
    const value = e.target.value;
    setSelectedReason(value);
    if (value !== 'Other') {
      setDenialReason('');
    }
  };

  if (!show) return null;

  return (
    <div className="officer-membership-modal-overlay">
      <div className="officer-membership-modal-container">
        <button className="officer-membership-modal-close" onClick={onClose}>×</button>
        <h2>Deny Membership Payment</h2>
        <form onSubmit={handleSubmit} className="officer-membership-form">
          <label>Reason for Denial:</label>
          <select
            value={selectedReason}
            onChange={handleReasonChange}
            style={{ width: '100%', padding: '8px', marginBottom: '10px' }}
          >
            {predefinedReasons.map((reason) => (
              <option key={reason.value} value={reason.value}>
                {reason.label}
              </option>
            ))}
          </select>
          <textarea
            value={denialReason}
            onChange={(e) => setDenialReason(e.target.value)}
            placeholder="Enter a custom reason (required if 'Other' is selected)..."
            disabled={selectedReason !== 'Other'}
            rows="4"
            style={{
              width: '100%',
              resize: 'vertical',
              opacity: selectedReason !== 'Other' ? 0.5 : 1,
            }}
          />
          <button type="submit">Submit Denial</button>
        </form>
      </div>
    </div>
  );
};

export default OfficerDenialReasonModal;