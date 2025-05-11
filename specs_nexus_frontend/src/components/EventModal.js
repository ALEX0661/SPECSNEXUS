import React from 'react';
import '../styles/EventModal.css';

const EventModal = ({ event, onClose, onParticipate, onNotParticipate }) => {
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getRegistrationStatus = (status) => {
    switch (status) {
      case 'open':
        return 'Registration is currently open';
      case 'not_started':
        return 'Registration has not yet started';
      case 'closed':
        return 'Registration is closed';
      default:
        return 'Unknown registration status';
    }
  };

  // Use the is_participant flag directly from the API
  const isParticipating = event.is_participant === true;

  return (
    <div className="event-modal-overlay" onClick={onClose}>
      <div className="event-modal-container" onClick={e => e.stopPropagation()}>
        {/* Add a prominent registration status badge at the top if registered */}
        {isParticipating && (
          <div className="registered-status-banner">
            <i className="fas fa-check-circle"></i> You are registered for this event
          </div>
        )}
        
        <div className="event-modal-header">
          <h2>{event.title}</h2>
          <button className="close-modal" onClick={onClose}>×</button>
        </div>
        <div className="event-modal-content">
          <div className="event-image-container">
            <img 
              src={
                event.image_url
                  ? (event.image_url.startsWith("http")
                      ? event.image_url
                      : `http://localhost:8000${event.image_url}`)
                  : "/default_event.png"
              } 
              alt={event.title} 
              className="event-image"
            />
          </div>
          
          <div className="event-details">
            <p className="event-date"><i className="fas fa-calendar-alt"></i> {formatDate(event.date)}</p>
            <p className="event-location"><i className="fas fa-map-marker-alt"></i> {event.location}</p>
            <p className="event-participants"><i className="fas fa-users"></i> {event.participant_count} Attendees</p>
            
            {event.registration_start && (
              <p className="event-registration">
                <i className="fas fa-clock"></i> Registration starts: {formatDate(event.registration_start)}
              </p>
            )}
            
            {event.registration_end && (
              <p className="event-registration">
                <i className="fas fa-hourglass-end"></i> Registration ends: {formatDate(event.registration_end)}
              </p>
            )}
            
            <div className="registration-status">
              <span className={`status-indicator status-${event.registration_status}`}></span>
              <span>{getRegistrationStatus(event.registration_status)}</span>
            </div>
            
            <p className="event-description">{event.description}</p>
            
            {event.registration_open ? (
              isParticipating ? (
                <div className="registration-buttons">
                  <button className="btn-registered" disabled>
                    <i className="fas fa-check-circle"></i> Registered for this Event
                  </button>
                  <button 
                    className="btn-not-participate" 
                    onClick={() => onNotParticipate(event.id)}
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <button 
                  className="btn-participate" 
                  onClick={() => onParticipate(event.id)}
                >
                  Register for Event
                </button>
              )
            ) : (
              <button className="btn-disabled">
                {event.registration_status === 'not_started' ? 'Registration Not Open Yet' : 'Registration Closed'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventModal;