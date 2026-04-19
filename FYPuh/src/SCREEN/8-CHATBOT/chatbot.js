import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import logo from "../images/logo1.png";  
import { FaPlus, FaHistory, FaCalendarAlt, FaTrash, FaMapMarkerAlt, FaBars, FaTimes } from "react-icons/fa";
import { subscribeToAreaDensity, subscribeToAllReadings } from "../../utils/firebaseService";
import { processMessage } from "../../utils/crowdDataService";

export default function CrowdSenseSearch() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [pastChats, setPastChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [areas, setAreas] = useState([]);
  const [readings, setReadings] = useState([]);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('crowdsense_chats') || '[]');
    setPastChats(savedChats);
  }, []);

  // Subscribe to Firebase area and readings data for the NLP engine
  useEffect(() => {
    const unsubAreas = subscribeToAreaDensity(setAreas);
    const unsubReadings = subscribeToAllReadings(setReadings);
    return () => {
      unsubAreas();
      unsubReadings();
    };
  }, []);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const saveChat = () => {
    if (messages.length > 0 && !isSaving) {
      setIsSaving(true);
      const chatData = {
        id: currentChatId,
        timestamp: Date.now(),
        messages: [...messages],
        preview: messages[0]?.text?.substring(0, 50) || "New Chat"
      };
      
      const updatedChats = pastChats.filter(chat => chat.id !== currentChatId);
      updatedChats.unshift(chatData);
      
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const filteredChats = updatedChats.filter(chat => chat.timestamp > sevenDaysAgo);
      
      setPastChats(filteredChats);
      localStorage.setItem('crowdsense_chats', JSON.stringify(filteredChats));
      setIsSaving(false);
    }
  };

  // Show a welcome message on first load
  useEffect(() => {
    const welcomeMessage = {
      id: Date.now(),
      text: "👋 Welcome to CrowdSense! I can answer questions about crowd density, peak hours, and user counts. Type **help** to see what I can do!",
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages([welcomeMessage]);
    setIsStarted(true);
  }, []);

  // Process message using local NLP engine backed by Firebase data
  const sendMessage = async () => {
    if (text.trim() === "") return;

    const userInput = text;

    const userMessage = {
      id: Date.now(),
      text: userInput,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setText("");
    setIsLoading(true);

    // Small delay to simulate thinking
    await new Promise((resolve) => setTimeout(resolve, 400));

    const reply = processMessage(userInput, areas, readings, messages);

    const botMessage = {
      id: Date.now() + 1,
      text: reply,
      sender: "bot",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, botMessage]);
    setIsLoading(false);

    if (!isStarted) {
      setIsStarted(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      sendMessage();
    }
  };

  const startNewChat = () => {
    saveChat();
    setMessages([]);
    setIsStarted(false);
    setCurrentChatId(Date.now());
    setText("");
  };

  const loadPastChat = (chatId) => {
    const chatToLoad = pastChats.find(chat => chat.id === chatId);
    if (chatToLoad) {
      setMessages(chatToLoad.messages);
      setCurrentChatId(chatId);
      setIsStarted(true);
    }
  };

  const deleteChat = (chatId, e) => {
    e.stopPropagation();
    const updatedChats = pastChats.filter(chat => chat.id !== chatId);
    setPastChats(updatedChats);
    localStorage.setItem('crowdsense_chats', JSON.stringify(updatedChats));
    
    if (chatId === currentChatId) {
      startNewChat();
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  return (
    <div className="chat-screen">
      <div className="chat-navbar">
        <div className="nav-buttons">
          <button className="nav-btn new-chat-btn" onClick={startNewChat}>
            <FaPlus />
            <span className="btn-text">New Chat</span>
          </button>
          
          <button className="nav-btn sidebar-toggle-btn" onClick={toggleSidebar}>
            {showSidebar ? <FaTimes /> : <FaBars />}
            <span className="btn-text">{showSidebar ? "Hide Sidebar" : "Show Sidebar"}</span>
          </button>
          
          <div className="mobile-title">
            <h2>CrowdSense</h2>
          </div>
        </div>
        
        <div className="desktop-title">
          <h2>CrowdSense Chat</h2>
        </div>
      </div>

      <div className="chat-layout">

        <div className={`chat-sidebar ${showSidebar ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-title">
              <FaHistory className="sidebar-icon" />
              <h3>Chat History</h3>
            </div>
            <div className="sidebar-info">
              <FaCalendarAlt className="calendar-icon" />
              <span>Last 7 days</span>
              <span className="chat-count">{pastChats.length} chats</span>
            </div>
          </div>
          
          <div className="sidebar-content">
            {pastChats.length === 0 ? (
              <div className="empty-history">
                <p>No past chats yet</p>
                <small>Your chats will appear here</small>
              </div>
            ) : (
              <div className="chat-history-list">
                {pastChats.map((chat) => (
                  <div 
                    key={chat.id}
                    className={`chat-history-item ${chat.id === currentChatId ? 'active' : ''}`}
                    onClick={() => loadPastChat(chat.id)}
                  >
                    <div className="chat-item-content">
                      <div className="chat-item-header">
                        <span className="chat-date">{formatDate(chat.timestamp)}</span>
                        <span className="chat-time">{formatTime(chat.timestamp)}</span>
                      </div>
                      <p className="chat-preview">
                        <FaMapMarkerAlt className="location-icon" />
                        {chat.preview}...
                      </p>
                    </div>
                    <button 
                      className="delete-chat-btn"
                      onClick={(e) => deleteChat(chat.id, e)}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`chat-main ${!showSidebar ? 'full-width' : ''}`}>
          <div className="chat-content">

            {!isStarted && messages.length === 0 && (
              <>
                <img src={logo} className="chat-logo" alt="CrowdSense Logo" />
                <div className="starting-message">
                  <p>Welcome to CrowdSense! Ask about crowd density at any location.</p>
                  <p>Example: "How crowded is Raja Bazaar right now?"</p>
                </div>
              </>
            )}
            
            {messages.length > 0 && (
              <div className="messages-container">
                {messages.map((msg) => (
                  <div key={msg.id} className={`message ${msg.sender}`}>
                    <div className="message-content">
                      <div className="message-text">{msg.text}</div>

                      {msg.mapsLink && (
                        <div className="maps-link-container">
                          <a 
                            href={msg.mapsLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="maps-link"
                          >
                            Open in Google Maps
                          </a>
                        </div>
                      )}

                      <div className="message-time">{msg.timestamp}</div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="message bot">
                    <div className="message-content">
                      <div className="message-text">Thinking...</div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask crowd density at any location..."
                className="dash-input"
                disabled={isLoading}
              />
              <button 
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={text.trim() === "" || isLoading}
              >
                ➤
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}