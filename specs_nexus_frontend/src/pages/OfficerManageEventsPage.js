import React, { useEffect, useState } from 'react';
import OfficerLayout from '../components/OfficerLayout';
import {
  getOfficerEvents,
  createOfficerEvent,
  updateOfficerEvent,
  deleteOfficerEvent
} from '../services/officerEventService';
import EventParticipantsModal from '../components/EventParticipantsModal';
import OfficerEventModal from '../components/OfficerEventModal';
import { getEventParticipants } from '../services/officerEventService';
import '../styles/OfficerManageEventsPage.css';

const OfficerManageEventsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
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
        const data = await getOfficerEvents(token);
        setEvents(data);
      } catch (error) {
        console.error("Failed to fetch events:", error);
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

  const getRegistrationStatusBadge = (status) => {
    switch (status) {
      case 'open':
        return <span className="status-badge status-open">Registration Open</span>;
      case 'not_started':
        return <span className="status-badge status-not-started">Not Started Yet</span>;
      case 'closed':
        return <span className="status-badge status-closed">Registration Closed</span>;
      default:
        return null;
    }
  };

  if (!officer) {
    return <div>Loading Officer Info...</div>;
  }

  return (
    <OfficerLayout officer={officer}>
      <div className="officer-manage-events-page">
        <div className="events-header">
          <h1>Manage Events</h1>
          <button className="add-event-btn" onClick={handleAddNewEvent}>
            ADD NEW EVENT
          </button>
        </div>
        <div className="events-grid">
          {events.map((evt) => (
            <div key={evt.id} className="event-card">
              <div className="event-image-container">
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
                  onClick={() => handleViewParticipants(evt.id)}
                  style={{ cursor: 'pointer' }}
                />
                {getRegistrationStatusBadge(evt.registration_status)}
              </div>
              <div className="event-content">
                <h3>{evt.title}</h3>
                <p className="event-date"><i className="fas fa-calendar-alt"></i> {formatDate(evt.date)}</p>
                <p className="event-location"><i className="fas fa-map-marker-alt"></i> {evt.location}</p>
                <p className="event-participants"><i className="fas fa-users"></i> {evt.participant_count} Attendees</p>
                
                {evt.registration_start && (
                  <p className="event-registration"><i className="fas fa-clock"></i> Registration starts: {formatDate(evt.registration_start)}</p>
                )}
                
                {evt.registration_end && (
                  <p className="event-registration"><i className="fas fa-hourglass-end"></i> Registration ends: {formatDate(evt.registration_end)}</p>
                )}
                
                <p className="event-details">
                  {evt.description.length > 100
                    ? evt.description.slice(0, 100) + '...'
                    : evt.description}
                </p>
                <div className="card-actions">
                  <button onClick={() => handleEdit(evt)}>Edit</button>
                  <button onClick={() => handleDelete(evt.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
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