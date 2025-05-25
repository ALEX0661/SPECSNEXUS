import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { getProfile } from '../services/userService';
import { getEvents, joinEvent, leaveEvent } from '../services/eventService';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import StatusModal from '../components/StatusModal';
import Layout from '../components/Layout';
import Loading from '../components/Loading';
import '../styles/EventsPage.css';

const backendBaseUrl = "https://specs-nexus-production.up.railway.app";

const EventsPage = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEventsLoading, setIsEventsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'success'
  });
  const token = localStorage.getItem('accessToken');
  const navigate = useNavigate(); // Initialize navigate

  useEffect(() => {
    async function fetchProfile() {
      try {
        const userData = await getProfile(token);
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  useEffect(() => {
    async function fetchEvents() {
      setIsEventsLoading(true);
      try {
        const eventsData = await getEvents(token);
        setEvents(eventsData);
        if (selectedEvent) {
          const updatedEvent = eventsData.find(e => e.id === selectedEvent.id);
          if (updatedEvent) {
            setSelectedEvent(updatedEvent);
          }
        }
      } catch (error) {
        console.error('Failed to fetch events:', error);
      } finally {
        setIsEventsLoading(false);
      }
    }
    fetchEvents();
  }, [token]);

  const handleCardClick = async (event) => {
    try {
      const res = await fetch(`${backendBaseUrl}/events/${event.id}/participants`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const participants = await res.json();
      setSelectedEvent({ ...event, participants });
    } catch (error) {
      console.error('Failed to fetch participants:', error);
      setSelectedEvent(event);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const closeStatusModal = () => {
    setStatusModal({ isOpen: false, title: '', message: '', type: 'success' });
  };

  const handleParticipate = async (eventId) => {
    try {
      await joinEvent(eventId, token);
      const updatedEvents = await getEvents(token);
      setEvents(updatedEvents);
      closeModal();
      setStatusModal({
        isOpen: true,
        title: 'Registration Successful',
        message: 'You have successfully registered for the event!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to join event:', error);
      setStatusModal({
        isOpen: true,
        title: 'Registration Failed',
        message: 'There was an error registering for the event. Please try again.',
        type: 'error'
      });
    }
  };

  const handleNotParticipate = async (eventId) => {
    try {
      await leaveEvent(eventId, token);
      const updatedEvents = await getEvents(token);
      setEvents(updatedEvents);
      closeModal();
      setStatusModal({
        isOpen: true,
        title: 'Cancellation Successful',
        message: 'You have successfully cancelled your registration for the event!',
        type: 'success'
      });
    } catch (error) {
      console.error('Failed to leave event:', error);
      setStatusModal({
        isOpen: true,
        title: 'Cancellation Failed',
        message: 'There was an error cancelling your registration. Please try again.',
        type: 'error'
      });
    }
  };

  const filterEvents = () => {
    if (filter === 'all') {
      return events;
    } else if (filter === 'upcoming') {
      const now = new Date();
      return events.filter((event) => new Date(event.date) > now);
    } else if (filter === 'registered') {
      return events.filter((event) => event.is_participant === true);
    }
    return events;
  };

  const filteredEvents = filterEvents();

  if (isLoading) {
    return <Loading message="Loading Events..." />;
  }

  if (!user) {
    navigate('/'); // Redirect to login page
    return null; // Prevent rendering anything else
  }

  return (
    <Layout user={user}>
      <div className="events-page">
        <div className="events-header">
          <h1>Community Events</h1>
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
              className={`filter-btn ${filter === 'registered' ? 'active' : ''}`}
              onClick={() => setFilter('registered')}
            >
              My Events
            </button>
          </div>
        </div>

        <div className="events-section">
          {isEventsLoading ? (
            <Loading message="Loading Events.." />
          ) : filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} onClick={handleCardClick} />
              ))}
            </div>
          ) : (
            <p className="no-events-message">No upcoming events found.</p>
          )}
        </div>

        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={closeModal}
            onParticipate={handleParticipate}
            onNotParticipate={handleNotParticipate}
            show={!!selectedEvent}
          />
        )}

        <StatusModal
          isOpen={statusModal.isOpen}
          onClose={closeStatusModal}
          title={statusModal.title}
          message={statusModal.message}
          type={statusModal.type}
        />
      </div>
    </Layout>
  );
};

export default EventsPage;