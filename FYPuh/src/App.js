// App.js
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import '../src/SCREEN/global.css';

// Import Components
import Home from './SCREEN/1-HOME/home';
import About from './SCREEN/2.ABOUT US/about';
import Services from './SCREEN/3-SERVICES/services';
import Login from './SCREEN/4-LOGIN/login';
import ForgotPassword from './SCREEN/6-FORGET/forget';
import Dash from './SCREEN/7-DASH/dash';
import ChatBot from './SCREEN/8-CHATBOT/chatbot';
import Analytics from './SCREEN/9-ANALYTICS/Analytics';
import Navbar from './SCREEN/NAVBAR/navbar';

// Page Transition Component
const PageTransition = ({ children, direction = 'right' }) => {
  return (
    <div className={`page-transition ${direction}`}>
      {children}
    </div>
  );
};

// Scroll to Top Component
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [pathname]);
  
  return null;
};

// Protected Route Component - UPDATED
const ProtectedRoute = ({ children, user }) => {
  const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Enhanced user detection function
const getUserFromStorage = () => {
  try {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
    if (!currentUser) return null;
    
    // Enhanced guest detection
    const isGuest = currentUser.isGuest === true || 
                   currentUser.email?.includes('guest_') || 
                   currentUser.username?.includes('guest_');
    
    // Return user with isGuest flag
    return {
      ...currentUser,
      isGuest
    };
  } catch (error) {
    console.error('Error parsing user from storage:', error);
    return null;
  }
};

// Main App Component
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check authentication status on mount - UPDATED
  useEffect(() => {
    const checkAuth = () => {
      try {
        const currentUser = getUserFromStorage();
        if (currentUser) {
          setIsAuthenticated(true);
          setUser(currentUser); // This now includes isGuest flag
        } else {
          setIsAuthenticated(false);
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'currentUser') {
        checkAuth();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on focus in case of same-tab changes
    window.addEventListener('focus', checkAuth);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);
    };
  }, []);

  // Handle login - UPDATED
  const handleLogin = (userData) => {
    // Enhanced guest detection when logging in
    const isGuest = userData.isGuest === true || 
                   userData.email?.includes('guest_') || 
                   userData.username?.includes('guest_');
    
    const userWithGuestFlag = {
      ...userData,
      isGuest
    };
    
    sessionStorage.setItem('currentUser', JSON.stringify(userWithGuestFlag));
    setIsAuthenticated(true);
    setUser(userWithGuestFlag);
  };

  // Handle logout
  const handleLogout = () => {
    sessionStorage.removeItem('currentUser');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  // Get navigation direction from session storage
  const getNavDirection = () => {
    return sessionStorage.getItem('navDirection') || 'right';
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading Crowd Sense...</p>
      </div>
    );
  }

  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        
        {/* Conditionally render Navbar - Pass the enhanced user object */}
        <Routes>
          <Route path="/login" element={null} />
          <Route path="/forgot" element={null} />
          <Route path="*" element={<Navbar user={user} onLogout={handleLogout} />} />
        </Routes>

        <main className="main-content">
          <Routes>
            {/* Public Routes */}
            <Route 
              path="/" 
              element={
                <PageTransition direction={getNavDirection()}>
                  <Home />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/about" 
              element={
                <PageTransition direction={getNavDirection()}>
                  <About />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/services" 
              element={
                <PageTransition direction={getNavDirection()}>
                  <Services />
                </PageTransition>
              } 
            />
            
            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <PageTransition direction={getNavDirection()}>
                  <Login onLogin={handleLogin} />
                </PageTransition>
              } 
            />
            
            <Route 
              path="/forgot" 
              element={
                <PageTransition direction="right">
                  <ForgotPassword />
                </PageTransition>
              } 
            />

            {/* Protected Routes - Pass user prop */}
            <Route 
              path="/chatbot" 
              element={
                <ProtectedRoute user={user}>
                  <PageTransition direction={getNavDirection()}>
                    <ChatBot user={user} />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/dash" 
              element={
                <ProtectedRoute user={user}>
                  <PageTransition direction={getNavDirection()}>
                    <Dash user={user} />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            <Route 
              path="/analytics" 
              element={
                <ProtectedRoute user={user}>
                  <PageTransition direction={getNavDirection()}>
                    <Analytics user={user} />
                  </PageTransition>
                </ProtectedRoute>
              } 
            />

            {/* 404 Route */}
            <Route 
              path="*" 
              element={
                <div className="not-found-container">
                  <div className="not-found-content">
                    <h1>404</h1>
                    <p>Page not found</p>
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = '/'}
                    >
                      Go Back Home
                    </button>
                  </div>
                </div>
              } 
            />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="container">
            <div className="footer-content">
              <div className="footer-brand">
                <h3>CROWD SENSE</h3>
                <p>Smart crowd density monitoring for smarter cities</p>
              </div>
              
              <div className="footer-links">
                <div className="footer-section">
                  <h4>Contact</h4>
                  <p>contact@crowdsense.com</p>
                  <p>+92 300 1234567</p>
                  <p>Rawalpindi, Pakistan</p>
                </div>
              </div>
            </div>
            
            <div className="footer-bottom">
              <p>&copy; {new Date().getFullYear()} Crowd Sense. All rights reserved.</p>
              <p>Bachelor's Project - University Final Year</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;