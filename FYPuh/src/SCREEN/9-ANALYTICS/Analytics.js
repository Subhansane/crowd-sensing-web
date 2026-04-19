import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend,
} from "recharts";
import {
  subscribeToAreaDensity,
  subscribeToAllReadings,
  computeHourlyStats,
  findPeakAndLowHours,
} from "../../utils/firebaseService";
import "./analytics.css";

function Analytics() {
  const [areas, setAreas] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedArea, setSelectedArea] = useState("all");
  const [hourlyStats, setHourlyStats] = useState([]);
  const [peakHour, setPeakHour] = useState(null);
  const [lowHour, setLowHour] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Subscribe to live area data
  useEffect(() => {
    const unsub = subscribeToAreaDensity((data) => {
      setAreas(data);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  // Subscribe to all readings
  useEffect(() => {
    const unsub = subscribeToAllReadings((data) => {
      setReadings(data);
    });
    return unsub;
  }, []);

  // Recompute hourly stats whenever readings or selected area changes
  useEffect(() => {
    const filtered =
      selectedArea === "all"
        ? readings
        : readings.filter((r) => r.areaId === selectedArea);
    const stats = computeHourlyStats(filtered);
    setHourlyStats(stats);
    const { peakHour: ph, lowHour: lh } = findPeakAndLowHours(stats);
    setPeakHour(ph);
    setLowHour(lh);
  }, [readings, selectedArea]);

  const getStatusColor = (density) => {
    if (density > 70) return "#ef4444";
    if (density > 40) return "#f59e0b";
    return "#22c55e";
  };

  const getStatusLabel = (density) => {
    if (density > 70) return "Critical";
    if (density > 40) return "High";
    return "Normal";
  };

  const overallAvg = areas.length
    ? Math.round(areas.reduce((s, a) => s + a.density, 0) / areas.length)
    : 0;

  const totalUsers = areas.reduce((s, a) => s + (a.userCount || 0), 0);

  if (isLoading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics data…</p>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      <header className="analytics-header">
        <h1>📊 Crowd Analytics Dashboard</h1>
        <p>Real-time crowd density insights and historical trends</p>
      </header>

      {/* Summary cards */}
      <div className="analytics-cards">
        <div className="analytics-card">
          <div className="card-icon">👥</div>
          <div className="card-content">
            <small>Total Live Users</small>
            <h2>{totalUsers}</h2>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">📍</div>
          <div className="card-content">
            <small>Active Areas</small>
            <h2>{areas.length}</h2>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">📈</div>
          <div className="card-content">
            <small>Avg. Density</small>
            <h2>{overallAvg}%</h2>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">⏰</div>
          <div className="card-content">
            <small>Peak Hour</small>
            <h2>{peakHour ? peakHour.label : "—"}</h2>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">🌙</div>
          <div className="card-content">
            <small>Low Traffic Hour</small>
            <h2>{lowHour ? lowHour.label : "—"}</h2>
          </div>
        </div>
        <div className="analytics-card">
          <div className="card-icon">📋</div>
          <div className="card-content">
            <small>Total Readings</small>
            <h2>{readings.length}</h2>
          </div>
        </div>
      </div>

      {/* Per-area live stats */}
      <section className="analytics-section">
        <h2>Area-wise Live Statistics</h2>
        <div className="area-stats-grid">
          {areas.map((area) => (
            <div key={area.id} className="area-stat-card">
              <div className="area-stat-header" style={{ borderColor: getStatusColor(area.density) }}>
                <h3>{area.name}</h3>
                <span
                  className="status-badge"
                  style={{ background: getStatusColor(area.density) }}
                >
                  {getStatusLabel(area.density)}
                </span>
              </div>
              <div className="area-stat-body">
                <div className="stat-row">
                  <span>Density</span>
                  <span style={{ color: getStatusColor(area.density), fontWeight: 700 }}>
                    {area.density}%
                  </span>
                </div>
                <div className="density-bar">
                  <div
                    className="density-fill"
                    style={{
                      width: `${area.density}%`,
                      background: getStatusColor(area.density),
                    }}
                  />
                </div>
                <div className="stat-row">
                  <span>Users</span>
                  <span>{area.userCount || Math.floor(area.density * 5)}</span>
                </div>
                <div className="stat-row">
                  <span>Info</span>
                  <span>{area.info}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hourly breakdown chart */}
      <section className="analytics-section">
        <div className="section-header">
          <h2>Hourly Density Breakdown</h2>
          <select
            className="area-filter-select"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="all">All Areas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        {readings.length === 0 ? (
          <div className="no-data-message">
            <p>📭 No historical data yet.</p>
            <p>Readings will appear here as the system collects crowd data.</p>
          </div>
        ) : (
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={hourlyStats} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} interval={2} />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v) => [`${v}%`, "Avg Density"]} />
                <Bar dataKey="avgDensity" name="Avg Density" fill="#667eea" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Trend chart — current density across all areas */}
      <section className="analytics-section">
        <h2>Current Density by Area</h2>
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={areas} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} unit="%" />
              <Tooltip formatter={(v) => [`${v}%`, "Density"]} />
              <Legend />
              <Line
                type="monotone"
                dataKey="density"
                name="Density"
                stroke="#667eea"
                strokeWidth={2}
                dot={{ r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Peak / Low hours summary */}
      {readings.length > 0 && (
        <section className="analytics-section peak-low-section">
          <div className="peak-card peak">
            <span className="peak-icon">⏰</span>
            <div>
              <small>Peak Hour</small>
              <h3>{peakHour ? `${peakHour.label} — ${peakHour.avgDensity}% avg` : "Insufficient data"}</h3>
            </div>
          </div>
          <div className="peak-card low">
            <span className="peak-icon">🌙</span>
            <div>
              <small>Low Traffic Hour</small>
              <h3>{lowHour ? `${lowHour.label} — ${lowHour.avgDensity}% avg` : "Insufficient data"}</h3>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Analytics;
