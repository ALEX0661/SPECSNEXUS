import React, { useEffect, useState } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import {
  getOfficerEvents,
  createOfficerEvent,
  updateOfficerEvent,
  deleteOfficerEvent,
  getEventParticipants
} from '../services/officerEventService';
import EventParticipantsModal from '../components/EventParticipantsModal';
import OfficerEventModal from '../components/OfficerEventModal';
import '../styles/OfficerManageEventsPage.css';

const OfficerManageEventsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [filter, setFilter] = useState('all'); // all, upcoming, past
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('officerAccessToken');

  useEffect(() => {
    const storedOfficer = localStorage.getItem('officerInfo');
    if (storedOfficer) {
      setOfficer(JSON.parse(storedOfficer));
    }
  }, []);

  useEffect(() => {
    async function fetchAllEvents() {
      try {
        setLoading(true);
        const data = await getOfficerEvents(token);
        setEvents(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setLoading(false);
      }
    }
    if (token) {
      fetchAllEvents();
    }
  }, [token]);

  const handleAddNewEvent = () => {
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEdit = (evt) => {
    setSelectedEvent(evt);
    setShowEventModal(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;
    try {
      await deleteOfficerEvent(eventId, token);
      const updated = await getOfficerEvents(token);
      setEvents(updated);
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Error deleting event");
    }
  };

  const handleViewParticipants = async (eventId) => {
    try {
      const data = await getEventParticipants(eventId);
      setParticipants(data);
      setShowParticipantsModal(true);
    } catch (error) {
      console.error("Failed to fetch participants:", error);
      alert("Error fetching participants");
    }
  };

  const handleCloseEventModal = () => {
    setShowEventModal(false);
  };

  const handleCloseParticipantsModal = () => {
    setShowParticipantsModal(false);
  };

  const handleSave = async (formData, eventId) => {
    try {
      if (eventId) {
        await updateOfficerEvent(eventId, formData, token);
        alert("Event updated successfully!");
      } else {
        await createOfficerEvent(formData, token);
        alert("Event created successfully!");
      }
      setShowEventModal(false);
      const updated = await getOfficerEvents(token);
      setEvents(updated);
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Error saving event");
    }
  };

  const getRegistrationStatusBadge = (status) => {
    const statusConfig = {
      open: { class: 'status-badge status-open', icon: 'fa-door-open', text: 'REGISTRATION OPEN' },
      not_started: { class: 'status-badge status-not-started', icon: 'fa-clock', text: 'OPENS SOON' },
      closed: { class: 'status-badge status-closed', icon: 'fa-lock', text: 'REGISTRATION CLOSED' }
    };
    
    const config = statusConfig[status] || { class: 'status-badge', icon: 'fa-question-circle', text: 'UNKNOWN' };
    
    return (
      <div className={config.class}>
        <i className={`fas ${config.icon}`}></i> {config.text}
      </div>
    );
  };

  const formatEventDate = (dateString) => {
    const date = new Date(dateString);
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return {
      formatted: date.toLocaleDateString(undefined, options),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
    };
  };

  const filterEvents = () => {
    const now = new Date();
    
    if (filter === 'all') {
      return events;
    } else if (filter === 'upcoming') {
      return events.filter(event => new Date(event.date) >= now);
    } else if (filter === 'past') {
      return events.filter(event => new Date(event.date) < now);
    }
    return events;
  };

  const filteredEvents = filterEvents();

  if (loading) {
    return (
      <OfficerLayout officer={officer}>
        <div className="officer-manage-events-page loading">
          <div className="loader"></div>
          <p>Loading events...</p>
        </div>
      </OfficerLayout>
    );
  }

  return (
    <OfficerLayout officer={officer}>
      <div className="officer-manage-events-page">
        <div className="events-header">
          <h1>Manage Events</h1>
          <div className="events-actions">
            <div className="events-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Events
              </button>
              <button 
                className={`filter-btn ${filter === 'upcoming' ? 'active' : ''}`}
                onClick={() => setFilter('upcoming')}
              >
                Upcoming
              </button>
              <button 
                className={`filter-btn ${filter === 'past' ? 'active' : ''}`}
                onClick={() => setFilter('past')}
              >
                Past
              </button>
            </div>
            <button className="add-event-btn" onClick={handleAddNewEvent}>
              <i className="fas fa-plus"></i> ADD NEW EVENT
            </button>
          </div>
        </div>
        
        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((evt) => (
              <div key={evt.id} className="event-card officer-event-card">
                <div className="event-card-inner">
                  {/* Date badge */}
                  <div className="event-date-badge">
                    <div className="event-month">{formatEventDate(evt.date).month}</div>
                    <div className="event-day">{formatEventDate(evt.date).day}</div>
                  </div>
                  
                  {/* Event image */}
                  <div className="event-image-wrapper">
                    <img
                      src={
                        evt.image_url
                          ? (evt.image_url.startsWith("http")
                              ? evt.image_url
                              : `http://localhost:8000${evt.image_url}`)
                          : "/default_event.png"
                      }
                      alt={evt.title}
                      className="event-image"
                    />
                    <div className="image-overlay"></div>
                    {getRegistrationStatusBadge(evt.registration_status)}
                    
                    <div className="participants-badge" onClick={(e) => {
                      e.stopPropagation();
                      handleViewParticipants(evt.id);
                    }}>
                      <i className="fas fa-users"></i> {evt.participant_count}
                    </div>
                  </div>
                  
                  {/* Event content */}
                  <div className="event-content">
                    <h3 className="event-title">{evt.title}</h3>
                    
                    <div className="event-info">
                      <div className="event-info-item">
                        <i className="fas fa-clock event-icon"></i>
                        <span>{formatEventDate(evt.date).time}</span>
                      </div>
                      <div className="event-info-item">
                        <i className="fas fa-map-marker-alt event-icon"></i>
                        <span>{evt.location}</span>
                      </div>
                      
                      {evt.registration_start && (
                        <div className="event-info-item">
                          <i className="fas fa-calendar-plus event-icon"></i>
                          <span>Reg. Opens: {formatEventDate(evt.registration_start).formatted}</span>
                        </div>
                      )}
                      
                      {evt.registration_end && (
                        <div className="event-info-item">
                          <i className="fas fa-calendar-times event-icon"></i>
                          <span>Reg. Closes: {formatEventDate(evt.registration_end).formatted}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="card-actions">
                      <button className="edit-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(evt);
                      }}>
                        <i className="fas fa-edit"></i> Edit
                      </button>
                      <button className="delete-btn" onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(evt.id);
                      }}>
                        <i className="fas fa-trash-alt"></i> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-events-message">
              <i className="fas fa-calendar-times"></i>
              <p>No events found for the selected filter.</p>
              <button className="add-event-btn small" onClick={handleAddNewEvent}>
                <i className="fas fa-plus"></i> Create Your First Event
              </button>
            </div>
          )}
        </div>
        
        <OfficerEventModal
          show={showEventModal}
          onClose={handleCloseEventModal}
          onSave={handleSave}
          initialEvent={selectedEvent}
        />
        <EventParticipantsModal
          show={showParticipantsModal}
          participants={participants}
          onClose={handleCloseParticipantsModal}
        />
      </div>
    </OfficerLayout>
  );
};

export default OfficerManageEventsPage;