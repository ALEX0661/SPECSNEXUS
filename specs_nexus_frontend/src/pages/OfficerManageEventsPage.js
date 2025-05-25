import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Added import
import { getOfficerEvents, createOfficerEvent, updateOfficerEvent, deleteOfficerEvent } from '../services/officerEventService';
import EventParticipantsModal from '../components/EventParticipantsModal';
import OfficerEventModal from '../components/OfficerEventModal';
import EventModal from '../components/EventModal';
import StatusModal from '../components/StatusModal';
import ConfirmationModal from '../components/ConfirmationModal';
import OfficerLayout from '../components/OfficerLayout';
import Loading from '../components/Loading';
import '../styles/OfficerManageEventsPage.css';

const backendBaseUrl = "https://specs-nexus-production.up.railway.app";

const OfficerManageEventsPage = () => {
  const [officer, setOfficer] = useState(null);
  const [events, setEvents] = useState([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showArchived, setShowArchived] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success',
  });
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    eventId: null,
    isLoading: false,
  });
  const token = localStorage.getItem('officerAccessToken');
  const navigate = useNavigate(); // Added navigate

  useEffect(() => {
    async function fetchData() {
      try {
        const storedOfficer = localStorage.getItem('officerInfo');
        const officerData = storedOfficer ? JSON.parse(storedOfficer) : null;
        setOfficer(officerData);

        if (token) {
          console.log("Fetching events with showArchived:", showArchived);
          const eventsData = await getOfficerEvents(token, showArchived);
          console.log("Fetched events:", eventsData);
          setEvents(eventsData);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        localStorage.removeItem('officerAccessToken');
        localStorage.removeItem('officerInfo');
        navigate('/officer-login'); // Redirect on error
      } finally {
        setIsLoading(false);
        setIsTransitioning(false);
      }
    }

    fetchData();
  }, [token, showArchived, navigate]); // Added navigate to dependencies

  const handleAddNewEvent = () => {
    console.log("Opening add new event modal");
    setSelectedEvent(null);
    setShowEventModal(true);
  };

  const handleEdit = (evt, e) => {
    e.stopPropagation();
    console.log("Editing event:", evt.id);
    setSelectedEvent(evt);
    setShowEventModal(true);
  };

  const handleArchive = (eventId, e) => {
    e.stopPropagation();
    console.log("Opening archive confirmation for event:", eventId);
    setConfirmationModal({
      isOpen: true,
      title: 'Archive Event',
      message: 'Are you sure you want to archive this event? This action will move the event to archived status.',
      eventId: eventId,
      onConfirm: confirmArchive,
      isLoading: false,
    });
  };

  const confirmArchive = async () => {
    const eventId = confirmationModal.eventId;
    
    setConfirmationModal(prev => ({ ...prev, isLoading: true }));
    
    try {
      console.log("Archiving event:", eventId);
      await deleteOfficerEvent(eventId, token);
      const updated = await getOfficerEvents(token, showArchived);
      setEvents(updated);
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      
      setStatusModal({
        isOpen: true,
        title: 'Event Archived',
        message: 'The event has been successfully archived.',
        type: 'success',
      });
    } catch (error) {
      console.error("Failed to archive event:", error);
      
      setConfirmationModal(prev => ({ ...prev, isOpen: false, isLoading: false }));
      
      setStatusModal({
        isOpen: true,
        title: 'Error Archiving Event',
        message: 'Failed to archive the event. Please try again.',
        type: 'error',
      });
    }
  };

  const handleDetails = (event, e) => {
    e.stopPropagation();
    console.log("Opening details for event:", event.id);
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  const handleParticipants = async (event, e) => {
    e.stopPropagation();
    if (!event?.id) {
      console.error("Invalid event ID");
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Cannot load participants: Invalid event.',
        type: 'error',
      });
      return;
    }
    setShowDetailsModal(false);
    setSelectedEvent(null);
    try {
      console.log("Fetching participants for event:", event.id);
      console.log("API URL:", `${backendBaseUrl}/events/${event.id}/participants`);
      console.log("Token:", token);
      const res = await fetch(`${backendBaseUrl}/events/${event.id}/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Response status:", res.status);
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      const participantsData = await res.json();
      console.log("Participants data:", participantsData);
      setParticipants(participantsData || []);
      setShowParticipantsModal(true);
      console.log("showParticipantsModal set to:", true);
    } catch (error) {
      console.error('Failed to fetch participants:', error.message);
      setParticipants([]);
      setStatusModal({
        isOpen: true,
        title: 'Error',
        message: 'Failed to load participants. Please try again.',
        type: 'error',
      });
      setShowParticipantsModal(true);
    }
  };

  const handleCloseEventModal = () => {
    console.log("Closing event modal");
    setShowEventModal(false);
  };

  const handleCloseDetailsModal = () => {
    console.log("Closing details modal");
    setShowDetailsModal(false);
    setSelectedEvent(null);
  };

  const handleCloseParticipantsModal = () => {
    console.log("Closing participants modal");
    setShowParticipantsModal(false);
    setParticipants([]);
  };

  const handleCloseStatusModal = () => {
    setStatusModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCloseConfirmationModal = () => {
    if (!confirmationModal.isLoading) {
      setConfirmationModal(prev => ({ ...prev, isOpen: false }));
    }
  };

  const handleSave = async (formData, eventId) => {
    try {
      if (eventId) {
        console.log("Updating event:", eventId);
        await updateOfficerEvent(eventId, formData, token);
        setStatusModal({
          isOpen: true,
          title: 'Event Updated',
          message: 'Event updated successfully!',
          type: 'success',
        });
      } else {
        console.log("Creating new event");
        await createOfficerEvent(formData, token);
        setStatusModal({
          isOpen: true,
          title: 'Event Created',
          message: 'Event created successfully!',
          type: 'success',
        });
      }
      setShowEventModal(false);
      const updated = await getOfficerEvents(token, showArchived);
      setEvents(updated);
    } catch (error) {
      console.error("Error saving event:", error);
      setStatusModal({
        isOpen: true,
        title: 'Error Saving Event',
        message: 'Failed to save the event. Please try again.',
        type: 'error',
      });
    }
  };

  const toggleArchived = () => {
    console.log("Toggling archived:", !showArchived);
    setIsTransitioning(true);
    setShowArchived(!showArchived);
  };

  const formatEventDate = (dateString) => {
    if (!dateString) return { day: '', month: '', date: '', time: '', year: '' };
    const date = new Date(dateString);
    const options = { 
      month: 'short', 
      day: 'numeric'
    };
    
    const timeOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      date: date.toLocaleDateString('en-US', options),
      time: date.toLocaleTimeString('en-US', timeOptions),
      year: date.getFullYear()
    };
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (isLoading) return <Loading message="Loading Events..." />;

  if (!officer || !token) {
    navigate('/officer-login'); // Redirect if officer or token is missing
    return null;
  }

  return (
    <OfficerLayout>
      <div className="events-page">
        <div className="events-header">
          <h1>Manage Events</h1>
          <div className="events-controls">
            <div className="events-toggle">
              <button
                className={`toggle-btn ${!showArchived ? 'active' : ''}`}
                onClick={toggleArchived}
              >
                Active Events
              </button>
              <button
                className={`toggle-btn ${showArchived ? 'active' : ''}`}
                onClick={toggleArchived}
              >
                Archived Events
              </button>
            </div>
            <button
              className="add-event-btn"
              onClick={handleAddNewEvent}
            >
              <i className="fas fa-plus"></i> Add New Event
            </button>
          </div>
        </div>

        <div className="events-section">
          {isTransitioning ? (
            <p className="transition-placeholder">Loading...</p>
          ) : events.length > 0 ? (
            <div className={`events-grid ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              {events.map((event) => {
                const eventDate = formatEventDate(event.date);
                return (
                  <div key={event.id} className="event-card">
                    <div className="event-card-inner">
                      <div className="event-date-badge">
                        <div className="event-month">{eventDate.month}</div>
                        <div className="event-day">{eventDate.day}</div>
                      </div>
                      <div className="event-image-wrapper">
                        <img 
                          src={
                            event.image_url
                              ? (event.image_url.startsWith("http")
                                ? event.image_url
                                : `https://specs-nexus-production.up.railway.app${event.image_url}`)
                              : "/default_event.png"
                          } 
                          alt={event.title || 'Event'} 
                          className="event-image"
                        />
                        <div className="image-overlay"></div>
                        <div className="status-badge">
                          <i className="fas fa-users"></i> {event.participant_count || 0} Attendees
                        </div>
                        {!showArchived && (
                          <button 
                            className="participants-icon" 
                            onClick={(e) => handleParticipants(event, e)}
                            title="View Participants"
                          >
                            <i className="fas fa-users"></i>
                          </button>
                        )}
                      </div>
                      <div className="event-content">
                        <h3 className="events-title">{truncateText(event.title, 40)}</h3>
                        <div className="event-info">
                          <div className="event-info-item">
                            <i className="fas fa-clock event-icon"></i>
                            <span>{eventDate.time}</span>
                          </div>
                          <div className="event-info-item">
                            <i className="fas fa-map-marker-alt event-icon"></i>
                            <span>{truncateText(event.location, 25)}</span>
                          </div>
                        </div>
                        <div className="cards-actions">
                          {showArchived ? (
                            <>
                              <button className="details-btn" onClick={(e) => handleDetails(event, e)}>
                                <span>DETAILS</span>
                                <i className="fas fa-info-circle"></i>
                              </button>
                              <button className="participants-btn" onClick={(e) => handleParticipants(event, e)}>
                                <span>PARTICIPANTS</span>
                                <i className="fas fa-users"></i>
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="edit-btn" onClick={(e) => handleEdit(event, e)}>
                                <span>EDIT</span>
                                <i className="fas fa-edit"></i>
                              </button>
                              <button className="archive-btn" onClick={(e) => handleArchive(event.id, e)}>
                                <span>ARCHIVE</span>
                                <i className="fas fa-archive"></i>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className={`no-events-message ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
              No {showArchived ? 'archived' : 'active'} events found. {showArchived ? '' : 'Click \'Add New Event\' to create one.'}
            </p>
          )}
        </div>

        <OfficerEventModal
          show={showEventModal}
          onClose={handleCloseEventModal}
          onSave={handleSave}
          initialEvent={selectedEvent}
        />
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={handleCloseDetailsModal}
            isOfficerView={true}
            show={showDetailsModal}
          />
        )}
        <EventParticipantsModal
          show={showParticipantsModal}
          participants={participants}
          onClose={handleCloseParticipantsModal}
        />
        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={handleCloseStatusModal}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={handleCloseConfirmationModal}
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Archive Event"
          cancelText="Cancel"
          type="danger"
          icon="fa-archive"
          isLoading={confirmationModal.isLoading}
        />
      </div>
    </OfficerLayout>
  );
};

export default OfficerManageEventsPage;