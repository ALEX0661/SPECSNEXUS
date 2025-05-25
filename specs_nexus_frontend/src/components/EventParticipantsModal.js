import React, { useState, useMemo } from 'react';
import StatusModal from './StatusModal'; // Import StatusModal
import '../styles/EventParticipantsModal.css';

const EventParticipantsModal = ({ show, participants = [], onClose, isLoading = false }) => {
  const [searchTerm, setSearchTerm] = useState('');
  // State for controlling StatusModal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });

  // Filter participants based on search term
  const filteredParticipants = useMemo(() => {
    if (!searchTerm) return participants;
    const lowerSearch = searchTerm.toLowerCase();
    return participants.filter(p => 
      p.full_name.toLowerCase().includes(lowerSearch) || 
      p.email.toLowerCase().includes(lowerSearch) ||
      p.block.toLowerCase().includes(lowerSearch) ||
      p.year.toString().includes(lowerSearch)
    );
  }, [participants, searchTerm]);

  // Early return after hooks
  if (!show) return null;

  // Create mailto link
  const bccEmails = participants.map(p => p.email).join(',');
  const subject = encodeURIComponent("Message to Event Participants");
  const mailtoLink = `mailto:?bcc=${encodeURIComponent(bccEmails)}&subject=${subject}`;

  // Copy emails to clipboard
  const handleCopyEmails = async () => {
    try {
      await navigator.clipboard.writeText(bccEmails);
      setStatusModal({
        isOpen: true,
        title: 'Emails Copied',
        message: 'Emails copied to clipboard!',
        type: 'success',
      });
    } catch (err) {
      console.error('Failed to copy emails:', err);
      setStatusModal({
        isOpen: true,
        title: 'Copy Failed',
        message: 'Failed to copy emails. Please try again.',
        type: 'error',
      });
    }
  };

  // Close StatusModal
  const closeStatusModal = () => {
    setStatusModal(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="ep-modal-overlay">
      <div className="ep-modal-container">
        <button 
          className="ep-modal-close" 
          onClick={onClose} 
          aria-label="Close modal"
        >
          ×
        </button>
        <h2>Event Participants</h2>
        
        <div className="ep-search-container">
          <input
            type="text"
            placeholder="Search by name, email, block, or year..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="ep-search-input"
            aria-label="Search participants"
          />
        </div>

        <div className="ep-participant-stats">
          <p>Total Participants: {participants.length}</p>
          <p>Showing: {filteredParticipants.length}</p>
        </div>

        {isLoading ? (
          <div className="ep-loading">Loading participants...</div>
        ) : filteredParticipants.length > 0 ? (
          <div className="ep-participants-list">
            {filteredParticipants.map((participant) => (
              <div key={participant.id} className="ep-participant-item">
                <div className="ep-participant-header">
                  <h3 className="ep-participant-name">{participant.full_name}</h3>
                  <a 
                    href={`mailto:${participant.email}`} 
                    className="ep-participant-email-link"
                    title={`Email ${participant.full_name}`}
                  >
                    Email
                  </a>
                </div>
                <div className="ep-participant-details">
                  <span>{participant.block} - {participant.year}</span>
                  <span className="ep-participant-email">{participant.email}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="ep-no-results">No participants found.</p>
        )}

        <div className="ep-modal-actions">
          <button 
            className="ep-copy-emails-btn" 
            onClick={handleCopyEmails}
            disabled={!participants.length}
          >
            Copy All Emails
          </button>
          <a 
            href={mailtoLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className={participants.length ? '' : 'disabled'}
          >
            <button 
              className="ep-send-email-btn"
              disabled={!participants.length}
            >
              Send Group Email
            </button>
          </a>
        </div>
      </div>

      {/* Render StatusModal */}
      <StatusModal
        isOpen={statusModal.isOpen}
        onClose={closeStatusModal}
        title={statusModal.title}
        message={statusModal.message}
        type={statusModal.type}
      />
    </div>
  );
};

// Error boundary component
class EventParticipantsModalWithBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="ep-modal-overlay">
          <div className="ep-modal-container">
            <h2>Error</h2>
            <p>Something went wrong displaying the participants. Please try again.</p>
            <button 
              className="ep-send-email-btn" 
              onClick={this.props.onClose}
            >
              Close
            </button>
          </div>
        </div>
      );
    }
    return <EventParticipantsModal {...this.props} />;
  }
}

export default EventParticipantsModalWithBoundary;