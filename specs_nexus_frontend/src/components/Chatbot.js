import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import '../styles/Chatbot.css';

const allowedRoutes = ['/dashboard', '/profile', '/events', '/announcements', '/membership'];

const Chatbot = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hello! I am SPECS Assistance. How may I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Early return for non-allowed routes (after hooks to follow rules of hooks)
  if (!allowedRoutes.includes(location.pathname)) {
    return null;
  }

  const toggleChat = () => {
    setIsOpen(prev => !prev);
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;
    
    // Add user message and clear input
    const userMessage = { sender: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Get bot response
      const response = await axios.post("http://localhost:8000/chat/", { 
        message: userMessage.text 
      });
      setMessages(prev => [...prev, { sender: 'bot', text: response.data.response }]);
    } catch (error) {
      console.error("Chat API error:", error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: "Sorry, I'm having trouble processing your request." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-wrapper">
      <button 
        className={`chatbot-launcher ${isOpen ? 'active' : ''}`}
        onClick={toggleChat}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
      >
        <span className="chat-icon">💬</span>
      </button>

      {isOpen && (
        <div className="chatbot-dialog" role="dialog" aria-label="Chat window">
          <div className="chatbot-header">
            <h2 className="chatbot-title">SPECS Assistance</h2>
            <button 
              className="chatbot-close"
              onClick={toggleChat}
              aria-label="Close chat"
            >
              &times;
            </button>
          </div>

          <div className="chatbot-content">
            <ul className="chatbot-messages">
              {messages.map((msg, idx) => (
                <li 
                  key={idx}
                  className={`chat-message chat-message--${msg.sender}`}
                  role="listitem"
                >
                  <div className="message-bubble">
                    {msg.text}
                  </div>
                </li>
              ))}
              {loading && (
                <li className="chat-message chat-message--bot">
                  <div className="message-bubble typing-indicator">
                    <span>•</span>
                    <span>•</span>
                    <span>•</span>
                  </div>
                </li>
              )}
              <div ref={messagesEndRef} />
            </ul>

            <div className="chatbot-input-area">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder="Type your message..."
                disabled={loading}
                aria-label="Type your message"
                className="chatbot-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading}
                className="chatbot-send-button"
                aria-label="Send message"
              >
                <svg className="send-icon" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;