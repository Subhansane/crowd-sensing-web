import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "./dash.css";
import { FaFileExport, FaCalendar, FaTimes, FaDownload, FaWifi } from "react-icons/fa";
import { subscribeToAreaDensity, DEFAULT_AREAS } from "../../utils/firebaseService";

// This helper function allows the buttons to move the map
function RecenterMap({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function Dash() {
  const [mapConfig, setMapConfig] = useState({ center: [33.5958, 73.0489], zoom: 13 });
  const [locations, setLocations] = useState(
    DEFAULT_AREAS.map((l) => ({ ...l, density: 40, userCount: 0 }))
  );
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);
  const [showExportPanel, setShowExportPanel] = useState(false);
  const [exportForm, setExportForm] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    location: "All Locations",
    dataType: "Crowd Density",
    fileFormat: "CSV",
    timeRange: "Last 24 Hours"
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Handle window resize and map initialization
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      
      // Force map to update when window resizes
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Initialize map on mobile
    if (window.innerWidth <= 768) {
      setTimeout(() => {
        const mapElement = document.querySelector('.Leaflet-container');
        if (mapElement) {
          mapElement.style.height = 'calc(100vh - 200px)';
        }
      }, 500);

    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Subscribe to Firebase real-time density data
  useEffect(() => {
    let simulationInterval = null;

    const unsubscribe = subscribeToAreaDensity((areas) => {
      const hasRealData = areas.some((a) => a.lastUpdated !== null);
      setIsFirebaseConnected(hasRealData);

      if (hasRealData) {
        setLocations(areas);
        if (simulationInterval) {
          clearInterval(simulationInterval);
          simulationInterval = null;
        }
      } else {
        // No real Firebase data yet — run local simulation so the map is still lively
        if (!simulationInterval) {
          simulationInterval = setInterval(() => {
            setLocations((prev) =>
              prev.map((loc) => ({
                ...loc,
                density: Math.floor(Math.random() * 100),
                userCount: Math.floor(Math.random() * 500),
              }))
            );
          }, 3000);
        }
      }
    });

    return () => {
      unsubscribe();
      if (simulationInterval) clearInterval(simulationInterval);
    };
  }, []);

  const getColor = (d) => {
    if (d > 70) return "#ef4444"; // Red
    if (d > 40) return "#f59e0b"; // Orange
    return "#22c55e"; // Green
  };

  const handleExportSubmit = (e) => {
    e.preventDefault();
    const exportData = {
      ...exportForm,
      timestamp: new Date().toLocaleString(),
      locations: exportForm.location === "All Locations" 
        ? locations.map(loc => ({ name: loc.name, density: loc.density }))
        : locations.filter(loc => loc.name === exportForm.location)
    };
    
    console.log("Export Data:", exportData);
    
    // Create downloadable content based on format
    let content = "";
    let filename = "";
    let mimeType = "";
    
    if (exportForm.fileFormat === "CSV") {
      content = "Location,Density%,Status,Timestamp\n";
      exportData.locations.forEach(loc => {
        content += `${loc.name},${loc.density},${getStatus(loc.density)},${new Date().toLocaleString()}\n`;
      });
      filename = `crowd_data_${new Date().getTime()}.csv`;
      mimeType = "text/csv";
    } else if (exportForm.fileFormat === "JSON") {
      content = JSON.stringify(exportData, null, 2);
      filename = `crowd_data_${new Date().getTime()}.json`;
      mimeType = "application/json";
    }
    
    // Create and trigger download
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    alert(`✅ Data exported successfully as ${exportForm.fileFormat}!\n\nFile: ${filename}`);
    setShowExportPanel(false);
  };

  const getStatus = (density) => {
    if (density > 70) return "Critical";
    if (density > 40) return "High";
    return "Normal";
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setExportForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="Dash-container">
      {/* Export Panel Slide-in Sidebar - Now on LEFT side */}
      <div className={`export-sidebar left ${showExportPanel ? 'open' : ''}`}>
        <div className="export-header">
          <h3><FaFileExport /> Export Dataset</h3>
          <button className="close-btn" onClick={() => setShowExportPanel(false)}>
            <FaTimes />
          </button>
        </div>
        
        <form className="export-form" onSubmit={handleExportSubmit}>
          <div className="form-group">
            <label><FaCalendar /> Start Date</label>
            <input 
              type="date" 
              name="startDate"
              value={exportForm.startDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label><FaCalendar /> End Date</label>
            <input 
              type="date" 
              name="endDate"
              value={exportForm.endDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Time Range</label>
            <select 
              name="timeRange"
              value={exportForm.timeRange}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Last 24 Hours">Last 24 Hours</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Custom Range">Custom Range</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Location</label>
            <select 
              name="location"
              value={exportForm.location}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="All Locations">All Locations</option>
              {locations.map(loc => (
                <option key={loc.id} value={loc.name}>{loc.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Data Type</label>
            <select 
              name="dataType"
              value={exportForm.dataType}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="Crowd Density">Crowd Density</option>
              <option value="Movement Patterns">Movement Patterns</option>
              <option value="Peak Hours">Peak Hours</option>
              <option value="Heatmap Data">Heatmap Data</option>
              <option value="Historical Trends">Historical Trends</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>File Format</label>
            <select 
              name="fileFormat"
              value={exportForm.fileFormat}
              onChange={handleInputChange}
              className="form-select"
            >
              <option value="CSV">CSV</option>
              <option value="JSON">JSON</option>
              <option value="Excel">Excel (.xlsx)</option>
              <option value="PDF">PDF Report</option>
            </select>
          </div>
          
          <div className="form-buttons">
            <button type="submit" className="export-submit-btn">
              <FaDownload /> Export Data
            </button>
            <button type="button" className="cancel-btn" onClick={() => setShowExportPanel(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Overlay when sidebar is open */}
      {showExportPanel && <div className="sidebar-overlay" onClick={() => setShowExportPanel(false)}></div>}

      <aside className="Dash-sidebar">
        <div className="Sidebar-header">
          <p>
            <FaWifi style={{ color: isFirebaseConnected ? "#22c55e" : "#94a3b8", marginRight: 6 }} />
            {isFirebaseConnected ? "Live Feed" : "Live Feed (demo)"}
          </p>
        </div>

        <div className="Button-Section">
          <h3>Locations</h3>
          {locations.map(loc => (
            <button 
              key={loc.id} 
              className="map-nav-btn"
              onClick={() => setMapConfig({ center: [loc.lat, loc.lng], zoom: 15 })}
            >
              📍 {loc.name} <span style={{color: getColor(loc.density)}}>●</span>
            </button>
          ))}
          <button className="reset-btn" onClick={() => setMapConfig({ center: [33.5958, 73.0489], zoom: 13 })}>
            View Entire City
          </button>
          
          {/* Export button moved to sidebar */}
          <button 
            className="export-toggle-btn sidebar-export-btn"
            onClick={() => setShowExportPanel(true)}
          >
            <FaFileExport /> Export Dataset
          </button>
        </div>

        <div className="Data-Summary">
          <div className="Stat-Box">
            <small>Avg. Density</small>
            <p>{Math.round(locations.reduce((sum, loc) => sum + loc.density, 0) / locations.length)}%</p>
          </div>
          <div className="Stat-Box">
            <small>Total Users</small>
            <p>{locations.reduce((sum, loc) => sum + (loc.userCount || 0), 0)}</p>
          </div>
          <div className="Stat-Box">
            <small>Active Nodes</small>
            <p>{locations.length}</p>
          </div>
          <div className="Stat-Box">
            <small>Data Source</small>
            <p style={{ fontSize: "0.75rem", color: isFirebaseConnected ? "#22c55e" : "#94a3b8" }}>
              {isFirebaseConnected ? "Firebase" : "Demo"}
            </p>
          </div>
        </div>
      </aside>

      <main className="Dash-main">
        <div className="Map-wrapper">
          <MapContainer 
            center={mapConfig.center} 
            zoom={mapConfig.zoom} 
            className="Leaflet-container"
            style={{ height: isMobile ? '400px' : '100%' }}
          >
            <RecenterMap center={mapConfig.center} zoom={mapConfig.zoom} />
            
            {/* LIGHT MODE WHITE TILES */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; OpenStreetMap'
            />

            {locations.map((loc) => (
              <CircleMarker
                key={`${loc.id}-${loc.density}`}
                center={[loc.lat, loc.lng]}
                radius={15 + (loc.density / 10)}
                pathOptions={{
                  fillColor: getColor(loc.density),
                  color: "#fff",
                  weight: 2,
                  fillOpacity: 0.7
                }}
              >
                <Popup>
                  <strong>{loc.name}</strong><br/>
                  Current Crowd: {loc.density}%<br/>
                  Users: ~{loc.userCount || Math.floor(loc.density * 5)}<br/>
                  Status: {getStatus(loc.density)}
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
      </main>
    </div>
  );
}

export default Dash;