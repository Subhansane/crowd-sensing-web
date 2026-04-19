import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import logo from "../images/logo1.png";  
import { FaPlus, FaHistory, FaCalendarAlt, FaTrash, FaMapMarkerAlt, FaBars, FaTimes } from "react-icons/fa";

export default function CrowdSenseSearch() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [pastChats, setPastChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('crowdsense_chats') || '[]');
    setPastChats(savedChats);
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

  useEffect(() => {
    return () => {
      saveChat();
    };
  }, []);

  // ✅ FIXED CHATBOT FUNCTION
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

    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: userInput })
      });

      const data = await res.json();

      const botMessage = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "bot",
        mapsLink: data.mapLink,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {

      const botMessage = {
        id: Date.now() + 1,
        text: "Error connecting to server.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    }

    if (!isStarted) {
      setIsStarted(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
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

            {!isStarted && (
              <img src={logo} className="chat-logo" alt="CrowdSense Logo" />
            )}
            
            {!isStarted && messages.length === 0 && (
              <div className="starting-message">
                <p>Welcome to CrowdSense! Ask about crowd density at any location.</p>
                <p>Example: "How crowded is Rawalpindi right now?"</p>
              </div>
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
              />
              <button 
                className="chat-send-btn"
                onClick={sendMessage}
                disabled={text.trim() === ""}
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


//

import React, { useState, useEffect, useRef } from "react";
import "./chatbot.css";
import logo from "../images/logo1.png";  
import { FaPlus, FaHistory, FaCalendarAlt, FaTrash, FaMapMarkerAlt, FaBars, FaTimes } from "react-icons/fa";

export default function CrowdSenseSearch() {
  const [text, setText] = useState("");
  const [messages, setMessages] = useState([]);
  const [isStarted, setIsStarted] = useState(false);
  const [pastChats, setPastChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(Date.now());
  const [isSaving, setIsSaving] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  
  const messagesEndRef = useRef(null);

  // Load past chats from localStorage on component mount
  useEffect(() => {
    const savedChats = JSON.parse(localStorage.getItem('crowdsense_chats') || '[]');
    setPastChats(savedChats);
  }, []);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Save chat when messages change
  const saveChat = () => {
    if (messages.length > 0 && !isSaving) {
      setIsSaving(true);
      const chatData = {
        id: currentChatId,
        timestamp: Date.now(),
        messages: [...messages],
        preview: messages[0]?.text?.substring(0, 50) || "New Chat"
      };
      
      // Update past chats
      const updatedChats = pastChats.filter(chat => chat.id !== currentChatId);
      updatedChats.unshift(chatData);
      
      // Keep only last 7 days of chats
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const filteredChats = updatedChats.filter(chat => chat.timestamp > sevenDaysAgo);
      
      setPastChats(filteredChats);
      localStorage.setItem('crowdsense_chats', JSON.stringify(filteredChats));
      setIsSaving(false);
    }
  };

  // Save chat when component unmounts
  useEffect(() => {
    return () => {
      saveChat();
    };
  }, []);

  const sendMessage = () => {
    if (text.trim() === "") return;
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: text,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // Generate Google Maps link
    const googleMapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(text)}`;
    
    // Add bot response with Google Maps link
    const botMessage = {
      id: Date.now() + 1,
      text: `Here's the Google Maps link for ${text}:`,
      sender: "bot",
      mapsLink: googleMapsLink,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, botMessage]);
    setText("");
    
    // Mark as started
    if (!isStarted) {
      setIsStarted(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const startNewChat = () => {
    // Save current chat before starting new one
    saveChat();
    
    // Reset everything for new chat
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
    
    // If we're deleting the current chat, start a new one
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
      {/* Simple Top Navigation Bar */}
      <div className="chat-navbar">
        <div className="nav-buttons">
          <button 
            className="nav-btn new-chat-btn"
            onClick={startNewChat}
            title="New Chat"
          >
            <FaPlus />
            <span className="btn-text">New Chat</span>
          </button>
          
          <button 
            className="nav-btn sidebar-toggle-btn"
            onClick={toggleSidebar}
            title={showSidebar ? "Hide Sidebar" : "Show Sidebar"}
          >
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
        {/* Fixed Left Sidebar */}
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
                      title="Delete chat"
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Chat Container */}
        <div className={`chat-main ${!showSidebar ? 'full-width' : ''}`}>
          <div className="chat-content">
            {/* Logo - disappears when chat starts */}
            {!isStarted && (
              <img 
                src={logo} 
                className="chat-logo" 
                alt="CrowdSense Logo" 
              />
            )}
            
            {/* Starting line when user first enters */}
            {!isStarted && messages.length === 0 && (
              <div className="starting-message">
                <p>Welcome to CrowdSense! Ask about crowd density at any location.</p>
                <p>For example: "How crowded is Rawalpindi right now?" or "Ayub park crowd density"</p>
              </div>
            )}
            
            {/* Messages display area */}
            {messages.length > 0 && (
              <div className="messages-container">
                {messages.map((msg) => (
                  <div 
                    key={msg.id} 
                    className={`message ${msg.sender}`}
                  >
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
                {/* Empty div for auto-scroll */}
                <div ref={messagesEndRef} />
              </div>
            )}
            
            {/* Input area */}
            <div className="chat-input-wrapper">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask crowd density at any location..."
                className="dash-input"
              />
              <button 
                className="chat-send-btn" 
                onClick={sendMessage}
                disabled={text.trim() === ""}
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