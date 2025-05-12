import React, { useEffect, useState } from 'react';
import { getProfile } from '../services/userService';
import { getEvents, joinEvent, leaveEvent } from '../services/eventService';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import Layout from '../components/Layout';
import '../styles/EventsPage.css';

const EventsPage = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, registered
  const token = localStorage.getItem('accessToken');

  // Store user ID in localStorage for use in other components
  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const userData = await getProfile(token);
        setUser(userData);
        // Store userId in localStorage for participation checks
        if (userData && userData.id) {
          localStorage.setItem('userId', userData.id);
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const eventsData = await getEvents(token);
      setEvents(eventsData);
      
      // If we have a selected event, update it with the latest data
      if (selectedEvent) {
        const updatedEvent = eventsData.find(e => e.id === selectedEvent.id);
        if (updatedEvent) {
          setSelectedEvent(updatedEvent);
        }
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const handleCardClick = (event) => {
    setSelectedEvent(event);
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  const handleParticipate = async (eventId) => {
    try {
      await joinEvent(eventId, token);
      await fetchEvents(); // Refresh events after joining
    } catch (error) {
      console.error('Failed to join event:', error);
      alert('Failed to register for the event. Please try again.');
    }
  };

  const handleNotParticipate = async (eventId) => {
    try {
      await leaveEvent(eventId, token);
      await fetchEvents(); // Refresh events after leaving
    } catch (error) {
      console.error('Failed to leave event:', error);
      alert('Failed to cancel registration. Please try again.');
    }
  };

  const filterEvents = () => {
    if (filter === 'all') {
      return events;
    } else if (filter === 'upcoming') {
      const now = new Date();
      return events.filter(event => new Date(event.date) > now);
    } else if (filter === 'registered') {
      return events.filter(event => event.is_participant === true);
    }
    return events;
  };

  const filteredEvents = filterEvents();

  if (loading && !events.length) {
    return (
      <Layout user={user}>
        <div className="events-page loading">
          <div className="loader"></div>
          <p>Loading events...</p>
        </div>
      </Layout>
    );
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

        <div className="events-grid">
          {filteredEvents.length > 0 ? (
            filteredEvents.map((event) => (
              <EventCard key={event.id} event={event} onClick={handleCardClick} />
            ))
          ) : (
            <div className="no-events-message">
              <i className="fas fa-calendar-times"></i>
              <p>No events found for the selected filter.</p>
            </div>
          )}
        </div>
        
        {selectedEvent && (
          <EventModal
            event={selectedEvent}
            onClose={closeModal}
            onParticipate={handleParticipate}
            onNotParticipate={handleNotParticipate}
          />
        )}
      </div>
    </Layout>
  );
};

export default EventsPage;