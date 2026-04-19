import { useState, useEffect } from "react";
import "./login.css";
import pic from "../images/logo1.png";
import { useNavigate } from "react-router-dom";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  
  const [errors, setErrors] = useState({
    username: [],
    email: [],
    password: []
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showEmailError, setShowEmailError] = useState(false);
  const [showPasswordError, setShowPasswordError] = useState(false);
  const [showUsernameError, setShowUsernameError] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalErrors, setModalErrors] = useState([]);
  
  // Modal for user type information
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);

  // Check if user is coming as guest
  useEffect(() => {
    const guestUser = sessionStorage.getItem('guestUser');
    
    if (guestUser) {
      sessionStorage.removeItem('guestUser');
      console.log('Guest user session detected');
    }
  }, [navigate]);

  // Check if modal should be shown
  useEffect(() => {
    // Check if user is already logged in as privileged user
    const currentUser = sessionStorage.getItem('currentUser');
    if (currentUser) {
      const userData = JSON.parse(currentUser);
      // Check if it's a guest user (by checking if username contains 'guest_')
      const isGuest = userData.username?.includes('guest_') || 
                     userData.email?.includes('guest_');
      
      // Only show modal for non-logged-in users or guest users
      // Don't show for privileged users
      if (!isGuest) {
        // User is privileged, don't show modal
        setShowUserTypeModal(false);
      } else {
        // User is guest or not logged in, show modal
        setShowUserTypeModal(true);
      }
    } else {
      // No user logged in, show modal
      setShowUserTypeModal(true);
    }
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      return ['Please enter a valid email address'];
    }
    return [];
  };

  const validatePassword = (password) => {
    const errors = [];

    if (password.length > 15) {
      errors.push('Password must be 15 characters or less');
    }

    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/;
    if (!specialCharRegex.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one capital letter (A-Z)');
    }

    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number (0-9)');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one small letter (a-z)');
    }

    return errors;
  };

  const showErrorsInModal = (errorMessages) => {
    setModalErrors(errorMessages);
    setShowErrorModal(true);
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
    setModalErrors([]);
  };

  const closeUserTypeModal = () => {
    setShowUserTypeModal(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      closeErrorModal();
    }
    if (e.target.classList.contains('user-type-modal-overlay')) {
      closeUserTypeModal();
    }
  };

  // FIXED: Enhanced checkCredentialsInDB function with better debugging
  const checkCredentialsInDB = async (username, email, password) => {
    try {
      setIsChecking(true);
      
      // Try to fetch from db.json via json-server
      try {
        const response = await fetch('http://localhost:3000/users');
        if (response.ok) {
          const users = await response.json();
          console.log('Users from server:', users); // Debug log
          
          // Try to find user by username OR email
          const user = users.find(user => {
            // Check if user matches by username OR email AND password
            const usernameMatch = user.username === username;
            const emailMatch = user.email === email;
            const passwordMatch = user.password === password;
            
            console.log(`Checking user: ${user.username}, usernameMatch: ${usernameMatch}, emailMatch: ${emailMatch}, passwordMatch: ${passwordMatch}`); // Debug log
            
            return (usernameMatch || emailMatch) && passwordMatch;
          });
          
          if (user) {
            console.log('User found:', user); // Debug log
            
            // Update last login time
            await fetch(`http://localhost:3000/users/${user.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                lastLogin: new Date().toISOString()
              }),
            });
            
            console.log('Login successful:', user);
            return { success: true, user: user };
          }
          
          console.log('No user found with matching credentials'); // Debug log
          return { success: false, message: 'Invalid credentials' };
        }
      } catch (error) {
        console.log('Server not reachable, checking localStorage...', error);
      }
      
      // Fallback to localStorage - ENHANCED VERSION
      const localUsers = JSON.parse(localStorage.getItem('crowdsense_users') || '[]');
      console.log('Local users:', localUsers); // Debug log
      
      const user = localUsers.find(user => {
        // Check if user matches by username OR email AND password
        const usernameMatch = user.username === username;
        const emailMatch = user.email === email;
        const passwordMatch = user.password === password;
        
        console.log(`Checking local user: ${user.username}, usernameMatch: ${usernameMatch}, emailMatch: ${emailMatch}, passwordMatch: ${passwordMatch}`); // Debug log
        
        return (usernameMatch || emailMatch) && passwordMatch;
      });
      
      if (user) {
        console.log('User found in localStorage:', user); // Debug log
        
        const updatedUsers = localUsers.map(u => 
          u.id === user.id ? { ...u, lastLogin: new Date().toISOString() } : u
        );
        localStorage.setItem('crowdsense_users', JSON.stringify(updatedUsers));
        
        console.log('Login successful from localStorage:', user);
        return { success: true, user: user };
      }
      
      console.log('No user found in localStorage with matching credentials'); // Debug log
      return { success: false, message: 'Invalid credentials' };
      
    } catch (error) {
      console.error('Error checking credentials:', error);
      return { success: false, message: 'Login failed. Please try again.' };
    } finally {
      setIsChecking(false);
    }
  };

  const checkServerStatus = async () => {
    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'HEAD',
        headers: { 'Content-Type': 'application/json' }
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field] && errors[field].length > 0) {
      setErrors(prev => ({
        ...prev,
        [field]: []
      }));
    }
    
    if (field === 'email') {
      setShowEmailError(false);
    }
    if (field === 'password') {
      setShowPasswordError(false);
    }
    if (field === 'username') {
      setShowUsernameError(false);
    }
  };

  // FIXED: Enhanced handleSubmit function with better debugging
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData); // Debug log
    
    // Check if ALL THREE fields are provided
    const allFieldsFilled = formData.username && formData.email && formData.password;

    if (!allFieldsFilled) {
      const newErrors = {
        username: [],
        email: [],
        password: []
      };
      
      const errorMessages = [];
      
      if (!formData.username) {
        newErrors.username = ['Username is required'];
        setShowUsernameError(true);
        errorMessages.push('Username is required');
      }
      
      if (!formData.email) {
        newErrors.email = ['Email is required'];
        setShowEmailError(true);
        errorMessages.push('Email is required');
      }
      
      if (!formData.password) {
        newErrors.password = ['Password is required'];
        setShowPasswordError(true);
        errorMessages.push('Password is required');
      }
      
      setErrors(newErrors);
      if (errorMessages.length > 0) {
        showErrorsInModal(errorMessages);
      }
      return;
    }

    // Validate email
    const emailErrors = validateEmail(formData.email);
    const passwordErrors = validatePassword(formData.password);

    const newErrors = {
      username: [],
      email: emailErrors,
      password: passwordErrors
    };

    setErrors(newErrors);
    
    setShowEmailError(emailErrors.length > 0);
    setShowPasswordError(passwordErrors.length > 0);

    const allErrorMessages = [...emailErrors, ...passwordErrors];
    
    const isValid = Object.values(newErrors).every(errorArray => errorArray.length === 0);
    
    if (!isValid) {
      showErrorsInModal(allErrorMessages);
      return;
    }
    
    try {
      console.log('Attempting to check credentials...'); // Debug log
      const result = await checkCredentialsInDB(
        formData.username,
        formData.email, 
        formData.password
      );
      
      console.log('Credentials check result:', result); // Debug log
      
      if (result.success) {
        const userData = {
          username: result.user?.username,
          email: result.user?.email || formData.email,
          isGuest: false // Explicitly set for regular users
        };
        
        console.log('Setting user data in sessionStorage:', userData); // Debug log
        sessionStorage.setItem('currentUser', JSON.stringify(userData));
        
        if (onLogin) {
          onLogin(userData);
        }
        
        const isServerRunning = await checkServerStatus();
        
        alert(`Login Successful! Welcome back ${result.user?.username}!
        
        Data source: ${isServerRunning ? 'db.json database' : 'local storage'}`);
        
        console.log('Navigating to /dash'); // Debug log
        navigate("/dash");
        
        console.log('Login successful, user data:', result.user);
      } else {
        setErrors(prev => ({
          ...prev,
          username: ['Invalid credentials'],
          email: ['Invalid credentials'],
          password: ['Invalid credentials']
        }));
        setShowUsernameError(true);
        setShowEmailError(true);
        setShowPasswordError(true);
        showErrorsInModal(['Invalid credentials. Please check your username, email and password.']);
      }
    } catch (error) {
      console.error('Login error:', error);
      showErrorsInModal(['Login failed. Please try again later.']);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGuestAccess = () => {
    console.log('Guest button clicked in Login component');
    
    const guestUser = {
      username: 'guest_' + Date.now(),
      email: `guest_${Date.now()}@example.com`,
      id: 'guest_' + Date.now(),
      isGuest: true, // Explicitly mark as guest
      createdAt: new Date().toISOString()
    };
    
    console.log('Guest user created:', guestUser);
    
    const localUsers = JSON.parse(localStorage.getItem('crowdsense_users') || '[]');
    localUsers.push(guestUser);
    localStorage.setItem('crowdsense_users', JSON.stringify(localUsers));
    console.log('Saved to localStorage');
    
    sessionStorage.setItem('guestUser', JSON.stringify(guestUser));
    
    const currentUserData = {
      username: guestUser.username,
      email: guestUser.email,
      isGuest: true // Explicitly mark as guest
    };
    sessionStorage.setItem('currentUser', JSON.stringify(currentUserData));
    console.log('Set currentUser in sessionStorage:', currentUserData);
    
    if (onLogin) {
      onLogin(currentUserData);
    }
    
    alert('Welcome as a Guest User! You can explore the chatbot features.');
    
    console.log('Attempting to navigate to /chatbot');
    
    try {
      navigate("/chatbot", { replace: true });
      console.log('Navigate function called successfully');
      
      setTimeout(() => {
        if (window.location.pathname !== '/chatbot') {
          console.log('Navigate may have failed, trying direct navigation');
          window.location.href = '/chatbot';
        }
      }, 50);
    } catch (error) {
      console.error('Navigation error:', error);
      window.location.href = '/chatbot';
    }
  };

  const [dbStatus, setDbStatus] = useState('Checking...');
  
  useEffect(() => {
    const checkDbStatus = async () => {
      try {
        const response = await fetch('http://localhost:3000/users');
        if (response.ok) {
          const users = await response.json();
          setDbStatus(`Connected (${users.length} users registered)`);
        } else {
          setDbStatus('Using local storage');
        }
      } catch (error) {
        setDbStatus('Using local storage');
      }
    };
    
    checkDbStatus();
  }, []);

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <div className="cardinal-card">
            <button 
          className="back-button"
           onClick={() => navigate("/")}
        >
          ← Back
        </button>
          <div className="cardinal-logo-box">
            <img src={pic} alt="CrowdSense" />
          </div>
          <h2 className="cardinal-title">Login</h2>
          
          {/* Username Field */}
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input  
              type="text" 
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Enter your username"
              className="cardinal-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input  
              type="email" 
              id="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Enter your email"
              className="cardinal-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <div className="password-input-container">
              <input 
                type={showPassword ? "text" : "password"}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                maxLength={15}
                placeholder="Enter password (min 8 chars)"
                className="cardinal-input"
              />
              <button 
                type="button" 
                className="password-toggle" 
                onClick={togglePasswordVisibility}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <div className="character-count">
              {formData.password.length}/15
            </div>
          </div>
          
          <button 
            type="submit" 
            className="cardinal-btn"
            disabled={isChecking} 
          >
            {isChecking ? 'Checking...' : 'Login'}
          </button>

          <div className="separator">
            <span>OR</span>
          </div>
          
          <div className="guest-access-container">
            <button 
              type="button" 
              className="guest-btn"
              onClick={handleGuestAccess}
            >
              Continue as Guest
            </button>
            <p className="guest-note">
              Explore chatbot without creating an account. Some features may be limited.
            </p>
          </div>

          <div className="login-links">
            <p className="login-right-text" onClick={() => navigate("/forgot")}>Forgot password?</p>
          </div>
        </div>
        
        {/* Error Modal */}
        {showErrorModal && (
          <div 
            className="modal-overlay"
            onClick={handleBackdropClick}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h3>Please Fix Errors</h3>
                <button 
                  className="modal-close-btn"
                  onClick={closeErrorModal}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <ul className="error-list">
                  {modalErrors.map((error, index) => (
                    <li key={index} className="error-item">
                      ⚠️ {error}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* User Type Information Modal */}
      {showUserTypeModal && (
        <div 
          className="modal-overlay user-type-modal-overlay"
          onClick={handleBackdropClick}
        >
          <div className="modal-content user-type-modal">
            <div className="modal-header">
              <h3>📋 User Types & Features</h3>
              <button 
                className="modal-close-btn"
                onClick={closeUserTypeModal}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <div className="user-type-info">
                {/* Privileged User Section */}
                <div className="user-type-section privilege-section">
                  <h4 className="privilege-title">
                    👑 Privileged User
                  </h4>
                  <div className="features-list">
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Access to HeatMap Dashboard</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Full ChatBot capabilities</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Data analysis tools</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Export functionality</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Priority support</span>
                    </div>
                  </div>
                  <p className="privilege-note">
                    <strong>To become a Privileged User:</strong><br/>
                    Contact us at: <span className="contact-email">crowdsense.privilege@crowdsense.com</span>
                  </p>
                </div>

                {/* Guest User Section */}
                <div className="user-type-section guest-section">
                  <h4 className="guest-title">
                    👤 Guest User
                  </h4>
                  <div className="features-list">
                    <div className="feature-item">
                      <span className="feature-icon">✅</span>
                      <span className="feature-text">Basic ChatBot access</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">⛔</span>
                      <span className="feature-text text-muted">No HeatMap Dashboard</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">⛔</span>
                      <span className="feature-text text-muted">Limited data features</span>
                    </div>
                    <div className="feature-item">
                      <span className="feature-icon">⛔</span>
                      <span className="feature-text text-muted">No export options</span>
                    </div>
                  </div>
                  <p className="guest-note-modal">
                    <strong>Note:</strong> Guest accounts are temporary and have limited features. 
                    You can explore basic functionality without registration.
                  </p>
                </div>
              </div>
              
              <div className="modal-footer">
                <button 
                  className="modal-understand-btn"
                  onClick={closeUserTypeModal}
                >
                  I Understand, Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}