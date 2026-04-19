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
  const [isLoading, setIsLoading] = useState(false);
  
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

  // Check server connection on component mount
  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch("http://127.0.0.1:5000/test");
        const data = await response.json();
        console.log("Server status:", data);
        
        // Add a system message if server is not ready
        if (!data.data_file) {
          const warningMessage = {
            id: Date.now(),
            text: "Warning: Data file not found on server. Please check if the CSV file exists at the specified path.",
            sender: "bot",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages([warningMessage]);
          setIsStarted(true);
        }
      } catch (error) {
        console.error("Server connection error:", error);
        const errorMessage = {
          id: Date.now(),
          text: "Cannot connect to the server. Please make sure the Flask server is running on http://127.0.0.1:5000",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([errorMessage]);
        setIsStarted(true);
      }
    };
    
    checkServer();
  }, []);

  // FIXED CHATBOT FUNCTION with better error handling
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

    try {
      console.log("Sending message to server:", userInput);
      
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ message: userInput }),
        mode: 'cors' // Explicitly set CORS mode
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Response data:", data);

      const botMessage = {
        id: Date.now() + 1,
        text: data.reply || "No response from server",
        sender: "bot",
        mapsLink: data.mapLink,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);

    } catch (error) {
      console.error("Fetch error:", error);
      
      let errorText = "Error connecting to server.";
      if (error.message.includes('Failed to fetch')) {
        errorText = "Cannot reach the server. Please make sure the Flask server is running on http://127.0.0.1:5000";
      } else if (error.message.includes('HTTP error')) {
        errorText = `Server error: ${error.message}`;
      }

      const botMessage = {
        id: Date.now() + 1,
        text: errorText,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMessage]);
    } finally {
      setIsLoading(false);
    }

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
                  <p>Example: "How crowded is Rawalpindi right now?"</p>
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