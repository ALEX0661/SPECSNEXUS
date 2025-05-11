import React from 'react';
import '../styles/EventCard.css';

const EventCard = ({ event, onClick }) => {
  // Function to determine registration status badge color
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'open':
        return 'status-badge status-open';
      case 'not_started':
        return 'status-badge status-not-started';
      case 'closed':
        return 'status-badge status-closed';
      default:
        return 'status-badge';
    }
  };

  // Function to format the registration status text
  const getStatusText = (status) => {
    switch (status) {
      case 'open':
        return 'Registration Open';
      case 'not_started':
        return 'Not Started Yet';
      case 'closed':
        return 'Registration Closed';
      default:
        return 'Unknown Status';
    }
  };

  // Function to format the date display
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

  // Check if user is registered for this event
  const isParticipating = event.is_participant === true;

  return (
    <div className="event-card" onClick={() => onClick(event)}>
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
        <div className={getStatusBadgeClass(event.registration_status)}>
          {getStatusText(event.registration_status)}
        </div>
        
        {/* Add registered badge if user is participating */}
        {isParticipating && (
          <div className="registered-badge">
            <i className="fas fa-check-circle"></i> Registered
          </div>
        )}
      </div>
      <div className="event-content">
        <h3 className="event-title">{event.title}</h3>
        <p className="event-date"><i className="fas fa-calendar-alt"></i> {formatDate(event.date)}</p>
        <p className="event-location"><i className="fas fa-map-marker-alt"></i> {event.location}</p>
        <p className="event-participants"><i className="fas fa-users"></i> {event.participant_count} Attendees</p>
        {event.registration_start && (
          <p className="event-registration"><i className="fas fa-clock"></i> Registration starts: {formatDate(event.registration_start)}</p>
        )}
        {event.registration_end && (
          <p className="event-registration"><i className="fas fa-hourglass-end"></i> Registration ends: {formatDate(event.registration_end)}</p>
        )}
      </div>
    </div>
  );
};

export default EventCard;