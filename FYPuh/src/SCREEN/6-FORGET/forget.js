import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./forget.css";

function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Email input, 2: Code verification, 3: New password
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [userEnteredCode, setUserEnteredCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [codeExpiry, setCodeExpiry] = useState(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);

  // Check if user is logged in on component mount
  useEffect(() => {
    const checkUserLoginStatus = () => {
      // Check sessionStorage (where login.js stores the user)
      const sessionUser = sessionStorage.getItem('currentUser');
      
      // Check localStorage for login flag
      const isLoggedInFlag = localStorage.getItem('isLoggedIn') === 'true';
      
      // Check localStorage for crowdsense_users
      const localUsers = JSON.parse(localStorage.getItem('crowdsense_users') || '[]');
      const hasRecentLogin = localUsers.some(user => {
        if (!user.lastLogin) return false;
        const loginTime = new Date(user.lastLogin).getTime();
        const timeSinceLogin = Date.now() - loginTime;
        return timeSinceLogin < 24 * 60 * 60 * 1000; // 24 hours
      });
      
      // User is considered logged in if any of these conditions are true
      const loggedIn = !!(sessionUser || isLoggedInFlag || hasRecentLogin);
      setIsUserLoggedIn(loggedIn);
    };
    
    checkUserLoginStatus();
  }, []);

  // Handle back button click
  const handleBackClick = () => {
    if (isUserLoggedIn) {
      // User is logged in, navigate to dashboard
      navigate("/dash");
    } else {
      // User is not logged in, navigate to login screen
      navigate("/login");
    }
  };

  // Generate a random 6-digit verification code
  const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Simulate sending email (in real app, connect to backend)
  const sendVerificationEmail = async (email, code) => {
    // This is a simulation - in real app, make API call to backend
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    return true; // Return success
  };

  // Handle email submission
  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes("@") || !email.includes(".")) {
      setMessage({ text: "Please enter a valid email address", type: "error" });
      return;
    }
    
    // If user is logged in, pre-fill email with their current email
    if (isUserLoggedIn) {
      try {
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          if (userData.email) {
            // Compare with entered email
            if (email.toLowerCase() !== userData.email.toLowerCase()) {
              setMessage({ 
                text: "This email doesn't match your account email. Please use your registered email.", 
                type: "error" 
              });
              return;
            }
          }
        }
      } catch (error) {
        console.log("Error checking user data:", error);
      }
    }
    
    setIsLoading(true);
    
    // Generate verification code
    const code = generateVerificationCode();
    setVerificationCode(code);
    
    // Set expiry time (10 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);
    setCodeExpiry(expiryTime);
    
    // Send verification email
    const emailSent = await sendVerificationEmail(email, code);
    
    if (emailSent) {
      setMessage({ 
        text: `Verification code sent to ${email}`, 
        type: "success" 
      });
      setStep(2); // Move to code verification step
      
      // For DEMO ONLY - Show code in alert (remove in production!)
      alert(`DEMO: Your verification code is: ${code}\n\n(In production, this would be sent to your email)`);
    } else {
      setMessage({ 
        text: "Failed to send verification code. Please try again.", 
        type: "error" 
      });
    }
    
    setIsLoading(false);
  };

  // Verify the entered code
  const handleVerifyCode = (e) => {
    e.preventDefault();
    
    if (!userEnteredCode) {
      setMessage({ text: "Please enter the verification code", type: "error" });
      return;
    }
    
    if (userEnteredCode.length !== 6) {
      setMessage({ text: "Code must be 6 digits", type: "error" });
      return;
    }
    
    // Check if code is expired
    const now = new Date();
    if (codeExpiry && now > codeExpiry) {
      setMessage({ text: "Verification code has expired. Please request a new one.", type: "error" });
      return;
    }
    
    // Check if code matches
    if (userEnteredCode === verificationCode) {
      setMessage({ text: "Code verified successfully!", type: "success" });
      setStep(3); // Move to password reset step
    } else {
      setMessage({ text: "Invalid verification code. Please try again.", type: "error" });
    }
  };

  // Handle password reset
  const handleResetPassword = (e) => {
    e.preventDefault();
    
    if (!newPassword || !confirmPassword) {
      setMessage({ text: "Please fill in all fields", type: "error" });
      return;
    }
    
    if (newPassword.length < 8) {
      setMessage({ text: "Password must be at least 8 characters long", type: "error" });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: "Passwords do not match", type: "error" });
      return;
    }
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      setMessage({ 
        text: "Password must contain: at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character", 
        type: "error" 
      });
      return;
    }
    
    // In real app, make API call to update password
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setMessage({ 
        text: "Password reset successful! You can now login with your new password.", 
        type: "success" 
      });
      
      // Update user data in storage if logged in
      if (isUserLoggedIn) {
        try {
          // Update in localStorage (crowdsense_users)
          const localUsers = JSON.parse(localStorage.getItem('crowdsense_users') || '[]');
          const updatedUsers = localUsers.map(user => {
            if (user.email === email) {
              return { ...user, password: newPassword, lastUpdated: new Date().toISOString() };
            }
            return user;
          });
          localStorage.setItem('crowdsense_users', JSON.stringify(updatedUsers));
          
          // Update in sessionStorage
          const sessionUser = sessionStorage.getItem('currentUser');
          if (sessionUser) {
            const userData = JSON.parse(sessionUser);
            if (userData.email === email) {
              sessionStorage.setItem('currentUser', JSON.stringify({ ...userData, passwordUpdated: true }));
            }
          }
          
          console.log("Password updated successfully for logged in user");
        } catch (error) {
          console.log("Error updating password in storage:", error);
        }
      }
      
      // Redirect based on login status
      setTimeout(() => {
        if (isUserLoggedIn) {
          navigate("/dash");
        } else {
          navigate("/login");
        }
      }, 2000);
    }, 1500);
  };

  // Resend verification code
  const handleResendCode = async () => {
    const newCode = generateVerificationCode();
    setVerificationCode(newCode);
    
    // Update expiry time
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 10);
    setCodeExpiry(expiryTime);
    
    // Resend email
    const emailSent = await sendVerificationEmail(email, newCode);
    
    if (emailSent) {
      setMessage({ 
        text: `New verification code sent to ${email}`, 
        type: "success" 
      });
      
      // For DEMO ONLY
      alert(`DEMO: Your new verification code is: ${newCode}`);
    }
  };

  // Format time remaining for code expiry
  const getTimeRemaining = () => {
    if (!codeExpiry) return "";
    
    const now = new Date();
    const diffMs = codeExpiry.getTime() - now.getTime();
    
    if (diffMs <= 0) return "Expired";
    
    const diffMins = Math.floor(diffMs / 60000);
    const diffSecs = Math.floor((diffMs % 60000) / 1000);
    
    return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
  };

  // Auto-fill email if user is logged in (when component mounts)
  useEffect(() => {
    if (isUserLoggedIn && step === 1) {
      try {
        const sessionUser = sessionStorage.getItem('currentUser');
        if (sessionUser) {
          const userData = JSON.parse(sessionUser);
          if (userData.email) {
            setEmail(userData.email);
            setMessage({ 
              text: "You're logged in. Password reset will update your current account.", 
              type: "info" 
            });
          }
        }
      } catch (error) {
        console.log("Error auto-filling email:", error);
      }
    }
  }, [isUserLoggedIn, step]);

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <button 
          className="back-button"
          onClick={handleBackClick}
        >
          ← Back to {isUserLoggedIn ? "Heatmap" : "Login"}
        </button>
        
        <h2>Reset Your Password</h2>
        
        {/* Show logged in status */}
        {isUserLoggedIn && (
          <div className="logged-in-notice">
            <span className="logged-in-badge">✓ Logged In</span>
            <p className="logged-in-text">You're resetting the password for your current account.</p>
          </div>
        )}
        
        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${step >= 1 ? 'active' : ''}`}>
            <span className="step-number">1</span>
            <span className="step-label">Enter Email</span>
          </div>
          <div className={`step ${step >= 2 ? 'active' : ''}`}>
            <span className="step-number">2</span>
            <span className="step-label">Verify Code</span>
          </div>
          <div className={`step ${step >= 3 ? 'active' : ''}`}>
            <span className="step-number">3</span>
            <span className="step-label">New Password</span>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        {/* Step 1: Email Input */}
        {step === 1 && (
          <form onSubmit={handleSubmitEmail} className="forgot-form">
            <p className="instruction">
              {isUserLoggedIn 
                ? "Your account email is pre-filled below. We'll send a verification code to reset your password."
                : "Enter your email address and we'll send you a verification code to reset your password."}
            </p>
            
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your Email"
                required
                disabled={isLoading || (isUserLoggedIn && step === 1)}
                className={isUserLoggedIn ? "prefilled-email" : ""}
              />
              {isUserLoggedIn && (
                <small className="prefilled-note">(Your account email - cannot be changed)</small>
              )}
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Verification Code"}
            </button>
          </form>
        )}

        {/* Step 2: Code Verification */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode} className="forgot-form">
            <p className="instruction">
              Enter the 6-digit verification code sent to <strong>{email}</strong>
              {codeExpiry && (
                <div className="timer">
                  Code expires in: <span className="time-remaining">{getTimeRemaining()}</span>
                </div>
              )}
            </p>
            
            <div className="form-group">
              <label htmlFor="verificationCode">Verification Code</label>
              <input
                type="text"
                id="verificationCode"
                value={userEnteredCode}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setUserEnteredCode(value);
                }}
                placeholder="Enter the 6-digit code"
                maxLength={6}
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="button-group">
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify Code"}
              </button>
              
              <button 
                type="button" 
                className="resend-btn"
                onClick={handleResendCode}
                disabled={isLoading}
              >
                Resend Code
              </button>
            </div>
            
            {!isUserLoggedIn && (
              <p className="change-email">
                Wrong email?{" "}
                <button 
                  type="button" 
                  className="text-btn"
                  onClick={() => {
                    setStep(1);
                    setMessage({ text: "", type: "" });
                  }}
                >
                  Change email address
                </button>
              </p>
            )}
          </form>
        )}

        {/* Step 3: New Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="forgot-form">
            <p className="instruction">
              {isUserLoggedIn 
                ? "Create a new password for your current account."
                : "Create a new password for your account."}
            </p>
            
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                disabled={isLoading}
              />
              <div className="password-requirements">
                Password must contain:
                <ul>
                  <li>At least 8 characters</li>
                  <li>One uppercase letter</li>
                  <li>One lowercase letter</li>
                  <li>One number</li>
                  <li>One special character</li>
                </ul>
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;