import "./home.css";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Import carousel images
import carousel1 from "../images/img1.jpg";
import carousel2 from "../images/bg1.avif";
import carousel3 from "../images/img.png";

function Home() {
  const navigate = useNavigate();
  
  // Carousel state
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Carousel images data - using 3 images
  const carouselImages = [
    {
      id: 1,
      src: carousel1,
    },
    {
      id: 2,
      src: carousel2,
    },
    {
      id: 3,
      src: carousel3,
    }
  ];

  // Auto-rotate carousel every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
    }, 3000); // 3 seconds
    
    return () => clearInterval(interval);
  }, [carouselImages.length]);

  // Check if user is logged in and get user type
  const getUserType = () => {
    const sessionUser = sessionStorage.getItem('currentUser');
    
    if (sessionUser) {
      try {
        const userData = JSON.parse(sessionUser);
        
        // Check for guest user (using isGuest property or guest_ prefix)
        if (userData.isGuest === true || 
            userData.email?.includes('guest_') || 
            userData.username?.includes('guest_')) {
          return 'guest';
        }
        
        // If not a guest and has email/username, it's a privileged user
        if (userData.email || userData.username) {
          return 'privileged';
        }
      } catch (error) {
        console.log('Error parsing session user data');
      }
    }
    
    // Check local storage for users
    const localUsers = JSON.parse(localStorage.getItem('crowdsense_users') || '[]');
    if (localUsers.length > 0) {
      // Find the most recent logged in user
      const latestUser = localUsers.reduce((latest, current) => {
        const latestTime = latest.lastLogin ? new Date(latest.lastLogin).getTime() : 0;
        const currentTime = current.lastLogin ? new Date(current.lastLogin).getTime() : 0;
        return currentTime > latestTime ? current : latest;
      });
      
      // Check if login was recent (within 24 hours)
      if (latestUser.lastLogin && 
          (Date.now() - new Date(latestUser.lastLogin).getTime()) < 24 * 60 * 60 * 1000) {
        
        // Check if it's a guest user
        if (latestUser.isGuest === true || 
            latestUser.email?.includes('guest_') || 
            latestUser.username?.includes('guest_')) {
          return 'guest';
        }
        
        // If not a guest and has email/username, it's a privileged user
        if (latestUser.email || latestUser.username) {
          return 'privileged';
        }
      }
    }
    
    return null; // Not logged in
  };

  const handleStartClick = () => {
    const userType = getUserType();
    
    if (userType === 'privileged') {
      // Privileged user goes to heat map
      navigate("/dash");
    } else if (userType === 'guest') {
      // Guest user goes to chatbot
      navigate("/chatbot");
    } else {
      // Not logged in goes to sign up page
      navigate("/login");
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className="home-container">
      <div className="home-hero">
        <div className="home-hero-left">
          <h1 className="home-title">Busyness Map</h1>
          <p className="home-subtitle">The Crowd's Signal for a Smarter World</p>
          <button className="home-start-btn" onClick={handleStartClick}>
            Let's Start Sensing
          </button>
        </div>

        <div className="home-hero-right">
          {/* Auto Carousel Slider */}
          <div className="auto-carousel">
           
            {/* Carousel Track */}
            <div className="carousel-track">
              {carouselImages.map((image, index) => (
                <div 
                  key={image.id}
                  className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}
                >
                  <img 
                    src={image.src} 
                    alt={image.alt}
                    className="carousel-image"
                  />
                </div>
              ))}
            </div>
            
            {/* Dots Indicator */}
            <div className="carousel-dots">
              {carouselImages.map((_, index) => (
                <div 
                  key={index}
                  className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                />
              ))}
            </div>              
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;