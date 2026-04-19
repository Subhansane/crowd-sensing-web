import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./access.css";
import pic from "../images/logo1.png";

export default function AccessInfo() {
  const navigate = useNavigate();
  const [emailCopied, setEmailCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText("Crowdsense@privilege.com");
    setEmailCopied(true);
    setTimeout(() => setEmailCopied(false), 2000);
  };

  const handleGuestAccess = () => {
    navigate("/chatbot");
  };

  const handlePrivilegeLogin = () => {
    navigate("/login");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <div className="access-info-container">
      <div className="access-card">
        <button className="back-button" onClick={handleBack}>
          ← Back to Home
        </button>

        <div className="logo-container">
          <img src={pic} alt="Crowd Sense" className="logo" />
          <h1 className="title">Access Options</h1>
          <p className="subtitle">Choose how you want to use Crowd Sense</p>
        </div>

        <div className="access-options">
          {/* Guest Access Section */}
          <div className="access-section guest-section">
            <div className="section-header">
              <div className="icon">👤</div>
              <h2>Guest Access</h2>
              <span className="badge free">FREE</span>
            </div>
            
            <div className="section-content">
              <h3>Try Our ChatBot Now</h3>
              <p className="description">
                Experience our intelligent chatbot without creating an account. 
                Get instant answers to your questions about crowd management, 
                urban planning, and smart city solutions.
              </p>
              
              <div className="features">
                <div className="feature">
                  <span className="check">✓</span>
                  <span>Access to basic chatbot features</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span>No registration required</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span>Instant access</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span>Sample queries and responses</span>
                </div>
              </div>
              
              <div className="limitations">
                <h4>Limitations:</h4>
                <ul>
                  <li>⏱️ Session expires after 1 hour</li>
                  <li>📊 No access to analytics dashboard</li>
                  <li>🔒 No data export capabilities</li>
                  <li>📈 Limited to 20 queries per session</li>
                </ul>
              </div>
              
              <button className="action-btn guest-btn" onClick={handleGuestAccess}>
                🚀 Try ChatBot as Guest
              </button>
              
              <p className="note">
                Note: Guest access is perfect for testing and exploration. 
                For full features, consider privileged access.
              </p>
            </div>
          </div>

          {/* Privileged Access Section */}
          <div className="access-section privilege-section">
            <div className="section-header">
              <div className="icon">🔒</div>
              <h2>Privileged Access</h2>
              <span className="badge premium">PREMIUM</span>
            </div>
            
            <div className="section-content">
              <h3>Unlock Full Platform Features</h3>
              <p className="description">
                Get verified access to our complete suite of tools for 
                advanced crowd monitoring, analytics, and management.
              </p>
              
              <div className="features">
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Full Dashboard Access</strong> - Real-time heatmaps and analytics</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Advanced ChatBot</strong> - Unlimited queries with priority</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Data Export</strong> - Download reports in CSV/JSON formats</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Historical Data</strong> - Access to past crowd patterns</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Custom Alerts</strong> - Set up notifications for crowd thresholds</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Priority Support</strong> - Dedicated assistance</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>API Access</strong> - Integrate with your systems</span>
                </div>
                <div className="feature">
                  <span className="check">✓</span>
                  <span><strong>Multi-location Monitoring</strong> - Track multiple areas simultaneously</span>
                </div>
              </div>
              
              <div className="verification-process">
                <h4>How to Get Privileged Access:</h4>
                <div className="steps">
                  <div className="step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                      <h5>Contact Us</h5>
                      <p>Email us at:</p>
                      <div className="email-container">
                        <code className="email">Crowdsense@privilege.com</code>
                        <button 
                          className="copy-btn" 
                          onClick={copyToClipboard}
                          title="Copy email address"
                        >
                          {emailCopied ? '✓ Copied!' : '📋 Copy'}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                      <h5>Verification Process</h5>
                      <p>Our team will verify your request and purpose for using Crowd Sense.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">3</div>
                    <div className="step-content">
                      <h5>Receive Credentials</h5>
                      <p>Once approved, you'll receive login credentials via email.</p>
                    </div>
                  </div>
                  
                  <div className="step">
                    <div className="step-number">4</div>
                    <div className="step-content">
                      <h5>Access Full Platform</h5>
                      <p>Use the provided credentials to login and access all features.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="privilege-benefits">
                <h4>Who Should Apply:</h4>
                <div className="benefit-cards">
                  <div className="benefit-card">
                    <div className="benefit-icon">🏢</div>
                    <h5>Municipal Authorities</h5>
                    <p>City planners and government officials</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">🎪</div>
                    <h5>Event Organizers</h5>
                    <p>Large event and festival planners</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">🏬</div>
                    <h5>Commercial Spaces</h5>
                    <p>Shopping malls and business centers</p>
                  </div>
                  <div className="benefit-card">
                    <div className="benefit-icon">🚉</div>
                    <h5>Transport Hubs</h5>
                    <p>Airports, train stations, bus terminals</p>
                  </div>
                </div>
              </div>
              
              <button className="action-btn privilege-btn" onClick={handlePrivilegeLogin}>
                🔐 Login with Privileged Credentials
              </button>
              
              <p className="note">
                Already have privileged credentials? Use the button above to login.
                Forgot your password? <a href="/forgot">Reset here</a>.
              </p>
            </div>
          </div>
        </div>

        <div className="comparison-section">
          <h3>Quick Comparison</h3>
          <div className="comparison-table">
            <table>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Guest Access</th>
                  <th>Privileged Access</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>ChatBot Access</td>
                  <td>✓ Limited</td>
                  <td>✓ Unlimited</td>
                </tr>
                <tr>
                  <td>Dashboard/Heatmaps</td>
                  <td>✗ Not Available</td>
                  <td>✓ Full Access</td>
                </tr>
                <tr>
                  <td>Data Export</td>
                  <td>✗ Not Available</td>
                  <td>✓ CSV/JSON/PDF</td>
                </tr>
                <tr>
                  <td>Historical Data</td>
                  <td>✗ Not Available</td>
                  <td>✓ 30+ Days</td>
                </tr>
                <tr>
                  <td>Real-time Updates</td>
                  <td>✗ Delayed</td>
                  <td>✓ Live</td>
                </tr>
                <tr>
                  <td>Custom Alerts</td>
                  <td>✗ Not Available</td>
                  <td>✓ Configurable</td>
                </tr>
                <tr>
                  <td>API Access</td>
                  <td>✗ Not Available</td>
                  <td>✓ Available</td>
                </tr>
                <tr>
                  <td>Support</td>
                  <td>Basic</td>
                  <td>Priority 24/7</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="footer-note">
          <p>
            <strong>Need help deciding?</strong> Contact us at{' '}
            <a href="mailto:support@crowdsense.com">support@crowdsense.com</a> 
            or call +92 300 1234567
          </p>
        </div>
      </div>
    </div>
  );
}