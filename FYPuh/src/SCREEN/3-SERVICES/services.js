import "./services.css";
function Services() {
 
  const services = [
    {
      id: 1,
      title: "Real-Time Crowd Density Monitoring",
      description: "Live estimation of crowd levels (Quiet, Moderate, Busy) using passive LTE signal analysis.",
      icon: "📊"
    },
    {
      id: 2,
      title: "Privacy-Preserving Crowd Analytics",
      description: "No personal data collection, no device tracking, and no signal decoding—fully privacy compliant.",
      icon: "🔒"
    },
    {
      id: 3,
      title: "Smart City Decision Support",
      description: "Actionable insights for city planners, municipalities, and authorities to manage congestion and public spaces.",
      icon: "🏙️"
    },
    {
      id: 4,
      title: "Public Transport & Traffic Optimization",
      description: "Helps optimize bus routes, schedules, and traffic flow based on real crowd busyness data.",
      icon: "🚌"
    },
    {
      id: 5,
      title: "Event & Public Safety Management",
      description: "Crowd monitoring for events, religious gatherings, protests, and emergencies to prevent overcrowding.",
      icon: "👥"
    },
    {
      id: 6,
      title: "Real-Time Heatmap Visualization",
      description: "Web-based platform displaying live crowd heatmaps for different locations across Pakistan.",
      icon: "🗺️"
    },
    {
      id: 7,
      title: "Low-Cost IoT-Based Deployment",
      description: "Affordable monitoring using RTL-SDR and Raspberry Pi without expensive infrastructure like CCTV.",
      icon: "💰"
    },
    {
      id: 8,
      title: "Crowd Data Collection for Research",
      description: "Generation of anonymized, aggregate datasets for academic and smart city research.",
      icon: "🔬"
    },
    {
      id: 9,
      title: "Emergency Response Support",
      description: "Enables faster, data-driven decisions during evacuations, disasters, or security incidents.",
      icon: "🚨"
    },
    {
      id: 10,
      title: "Scalable & PTA-Compliant Solution",
      description: "Designed to scale city-wide while adhering to Pakistan Telecommunication Authority (PTA) regulations.",
      icon: "⚖️"
    }
  ];

  return (
    <div className="services-page">
      {/* Header Section */}
        <h1 >OUR SERVICES</h1>
        <p className="services-subtitle">
          Advanced crowd analytics solutions for smarter cities and safer public spaces
        </p>
      
      
      {/* Main Services Section */}
      <div className="services-container">
        <div className="services-grid">
          {services.map((service) => (
            <div key={service.id} className="service-card">
              <div className="service-icon">{service.icon}</div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
      

      
      {/* Call to Action */}
 
    </div>
  );
}

export default Services;