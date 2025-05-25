import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chatbot.css';

const allowedRoutes = ['/dashboard', '/profile', '/events', '/announcements', '/membership'];

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am SPECS Assistance. How may I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Handle resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close chatbot on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post("https://specs-nexus-production.up.railway.app/chat/", { message: userMessage.text });
      const botResponse = response.data.response;
      setMessages(prev => [...prev, { sender: 'bot', text: botResponse }]);
    } catch (error) {
      console.error("Error from chat endpoint:", error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Sorry, I'm having trouble processing your request." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  if (!allowedRoutes.includes(location.pathname)) {
    return null;
  }

  return (
    <>
      <button
        className="chatbot-button"
        onClick={toggleChat}
        aria-label="Toggle chatbot"
        aria-expanded={isOpen}
      >
        <i className="fas fa-robot"></i>
      </button>
      {isOpen && (
        <div className="chatbot-container" role="dialog" aria-label="SPECS Assistance Chatbot">
          <div className="chatbot-header">
            <div className="header-text">
              <span className="specs-text">SPECS</span>
              <span className="assistance-text"> Assistance</span>
            </div>
            <button
              className="closed-button"
              onClick={toggleChat}
              aria-label="Close chatbot"
            >
              ×
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble-wrapper ${msg.sender}`}>
                <div className="sender-name">{msg.sender === 'bot' ? 'ai' : 'Student'}</div>
                <div className={`chat-bubble ${msg.sender}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble-wrapper bot">
                <div className="sender-name">ai</div>
                <div className="chat-bubble bot">Typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message..."
              onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
              disabled={loading}
              aria-label="Chat message input"
              autoComplete="off"
            />
            <button onClick={sendMessage} disabled={loading} aria-label="Send message">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;