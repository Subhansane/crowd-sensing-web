import { NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import logo from "../images/logo1.png";
import "./navbar.css";

function Navbar({ user, onLogout }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  // Check if user is a guest - enhanced check
  const isGuestUser = user?.isGuest === true || 
                     user?.email?.includes('guest_') || 
                     user?.username?.includes('guest_');

  // Debug logging
  useEffect(() => {
    console.log('Navbar user object:', user);
    console.log('isGuestUser:', isGuestUser);
  }, [user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dialog when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        setShowUserDialog(false);
      }
    };
    if (showUserDialog) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDialog]);

  const handleLogout = () => {
    onLogout();
    setIsMobileMenuOpen(false);
    setShowUserDialog(false);
    navigate("/");
  };

  const handleResetPassword = () => {
    setShowUserDialog(false);
    navigate("/forgot");
  };

  const handleCreateAccount = () => {
    setShowUserDialog(false);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    // REMOVED: Login button from nav links
    // Show HeatMap only for logged-in NON-GUEST users
    ...(user && !isGuestUser ? [{ path: "/dash", label: "HeatMap" }] : []),
    // Show Analytics for logged-in NON-GUEST users
    ...(user && !isGuestUser ? [{ path: "/analytics", label: "Analytics" }] : []),
    // Show ChatBot for all logged-in users (both guest and privileged)
    ...(user ? [{ path: "/chatbot", label: "ChatBot" }] : []),
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-left">
          <img src={logo} alt="Crowd Sense Logo" className="logo" />
          <h2 className="brand">CROWD SENSE</h2>
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-right">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link ${isActive ? "active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
          
          {user && (
            <div className="user-menu" ref={dialogRef}>
              <button 
                className={`user-greeting-btn ${isGuestUser ? 'guest-user' : ''}`}
                onClick={() => setShowUserDialog(!showUserDialog)}
              >
                {isGuestUser ? "👤 Guest" : `Hi, ${user.username || user.email?.split("@")[0]}`}
              </button>
              
              {showUserDialog && (
                <div className="user-dialog">
                  <div className="user-dialog-header">
                    <h4>{isGuestUser ? "Guest Account" : "Account Information"}</h4>
                    {isGuestUser && <span className="guest-badge">GUEST</span>}
                    <button className="dialog-close-btn" onClick={() => setShowUserDialog(false)}>×</button> 
                  </div>
                  <div className="user-dialog-body">
                    <p><strong>Username:</strong> {user.username || "N/A"}</p>
                    <p><strong>Email:</strong> {user.email || "N/A"}</p>
                    <p><strong>User Type:</strong> {isGuestUser ? "Guest User" : "Privilege User"}</p>
                    {isGuestUser && (
                      <div className="guest-info-note">
                        <p className="guest-warning">⚠️ Temporary guest account</p>
                        <p>Some features may be limited. Create an account to get the full experience!</p>
                      </div>
                    )}
                  </div>
                  <div className="user-dialog-footer">
                    {isGuestUser ? (
                      <>
                        <button className="create-account-btn" onClick={handleCreateAccount}>📝 Create Account</button>
                        <button className="logout-dialog-btn" onClick={handleLogout}>🚪 Logout</button> {/* Added logout for guest */}
                        <button className="close-dialog-btn" onClick={() => setShowUserDialog(false)}>Continue as Guest</button>
                      </>
                    ) : (
                      <>
                        <button className="reset-password-btn" onClick={handleResetPassword}>🔐 Reset Password</button>
                        <button className="logout-dialog-btn" onClick={handleLogout}>🚪 Logout</button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* REMOVED: Login button from here */}
        </div>
        
        {/* HAMBURGER BUTTON - FIXED */}
        <button
          className="mobile-menu-button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span className={`hamburger ${isMobileMenuOpen ? "active" : ""}`}>
            <span className="line"></span>
            <span className="line"></span>
            <span className="line"></span>
          </span>
        </button>
      </nav>
      
      {/* MOBILE MENU - FIXED */}
      <div className={`mobile-menu-container ${isMobileMenuOpen ? "active" : ""}`}>
        <div className="mobile-menu-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <h3>CROWD SENSE</h3>
            <button className="close-menu-btn" onClick={() => setIsMobileMenuOpen(false)}>×</button>
          </div>
          <div className="mobile-menu-content">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) => `mobile-nav-link ${isActive ? "active" : ""}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
            
            {user && (
              <div className="mobile-user-section">
                <div className="user-info-card">
                  <h4>{isGuestUser ? "Guest Account" : "Account Info"}</h4>
                  <div className="user-details">
                    <div className="detail-row">
                      <span className="label">Username:</span>
                      <span className="value">{user.username || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">Email:</span>
                      <span className="value">{user.email || "N/A"}</span>
                    </div>
                    <div className="detail-row">
                      <span className="label">User Type:</span>
                      <span className="value">
                        {isGuestUser ? "Guest User" : "Privilege User"}
                      </span>
                    </div>
                    {isGuestUser && (
                      <div className="guest-note">
                        <p>⚠️ Temporary guest account</p>
                        <small>Some features are limited</small>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="mobile-action-buttons">
                  {isGuestUser ? (
                    <>
                      <button className="action-btn create-btn" onClick={() => { 
                        setIsMobileMenuOpen(false); 
                        navigate("/login"); 
                      }}>
                        📝 Create Account
                      </button>
                      <button className="action-btn logout-btn" onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}>
                        🚪 Logout
                      </button>
                      <button className="action-btn guest-continue-btn" onClick={() => setIsMobileMenuOpen(false)}>
                        Continue as Guest
                      </button>
                    </>
                  ) : (
                    <>
                      <button className="action-btn reset-btn" onClick={() => { 
                        setIsMobileMenuOpen(false); 
                        navigate("/forgot"); 
                      }}>
                        🔐 Reset Password
                      </button>
                      <button className="action-btn logout-btn" onClick={() => {
                        setIsMobileMenuOpen(false);
                        handleLogout();
                      }}>
                        🚪 Logout
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* REMOVED: Login button from mobile menu for non-logged in users */}
          </div>
        </div>
      </div>
    </>
  );
}

export default Navbar;