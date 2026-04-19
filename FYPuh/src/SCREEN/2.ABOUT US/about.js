import "./about.css";

function About() {  
  return (
    <div className="about-container">
      <div className="about-hero">
         <h1 className="about-title">ABOUT US</h1>
        <p className="about-text">
      Using passive LTE signal analysis, our system estimates crowd density without
      collecting or decoding any personal or device-level data. By leveraging RTL-SDR 
      sensors, Raspberry Pi nodes, and cloud-based analytics,  we transform aggregated
       radio frequency patterns into meaningful crowd insights.
        </p>

        <p className="about-text">
        Our platform, Busyness Map PK, visualizes real-time crowd activity through
        interactive heatmaps, helping authorities, city planners, and the public make informed decisions.
        The solution is designed to be scalable, ethical, and compliant with PTA regulations,
        addressing challenges in traffic management,event safety, and emergency response.
        </p>

        <h2 className="about-title">OUR AIM</h2>

        <p className="about-text">
        Our aim is to develop a low-cost, real-time,and privacy-preserving crowd monitoring system
        using passive LTE signal analysis. We strive to help cities, authorities, and communities
        understand crowd behavior without collecting personal data or compromising individual privacy.
        By combining IoT devices, cloud analytics,and web-based visualization, we aim to support 
        smart city planning, public safety,  traffic management, and emergency response across Pakistan.
        Our goal is to provide an ethical, scalable, and PTA-compliant solution that enables data-driven 
        decision-making for safer and more efficient urban environments.
        </p>
      </div>
    </div>
  );
}
export default About;