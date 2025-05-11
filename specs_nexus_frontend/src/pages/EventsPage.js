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
      console.log('Fetched events:', eventsData);
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

  if (loading && !user) {
    return <div className="events-page"><p>Loading events...</p></div>;
  }

  return (
    <Layout user={user}>
      <div className="events-page">
        <h1>Events</h1>
        <div className="events-grid">
          {events.length > 0 ? (
            events.map((event) => (
              <EventCard key={event.id} event={event} onClick={handleCardClick} />
            ))
          ) : (
            <p>No events available at this time.</p>
          )}
        </div>
        
        {/* Modal is now rendered outside of the normal document flow */}
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