// Chatbot NLP engine for crowd sensing queries
// Processes natural-language questions about crowd density, peak hours, etc.

import { computeHourlyStats, findPeakAndLowHours } from "./firebaseService";

// ---------------------------------------------------------------------------
// Intent detection helpers
// ---------------------------------------------------------------------------

function normalize(text) {
  return text.toLowerCase().trim();
}

function matchesAny(text, patterns) {
  return patterns.some((p) => text.includes(p));
}

function extractArea(text, areas) {
  const lower = normalize(text);
  return areas.find(
    (a) =>
      lower.includes(normalize(a.name)) ||
      lower.includes(a.id.replace("_", " "))
  ) || null;
}

// ---------------------------------------------------------------------------
// Intent handlers
// ---------------------------------------------------------------------------

function handleUserCount(area) {
  if (!area) return "Please specify a location. Available areas: Raja Bazaar, Saddar, Sixth Road, Ayub Park.";
  const status = area.density > 70 ? "critically crowded" : area.density > 40 ? "moderately busy" : "relatively clear";
  return `📍 **${area.name}** currently has approximately **${area.userCount || Math.floor(area.density * 5)} users**.\nDensity: ${area.density}% (${status}).`;
}

function handleCurrentDensity(area, allAreas) {
  if (area) {
    const emoji = area.density > 70 ? "🔴" : area.density > 40 ? "🟡" : "🟢";
    return `${emoji} **${area.name}** current density: **${area.density}%**\nStatus: ${area.density > 70 ? "High" : area.density > 40 ? "Moderate" : "Low"}`;
  }
  // No specific area — return all
  const lines = allAreas.map((a) => {
    const emoji = a.density > 70 ? "🔴" : a.density > 40 ? "🟡" : "🟢";
    return `${emoji} ${a.name}: ${a.density}%`;
  });
  return `**Current Crowd Density:**\n${lines.join("\n")}`;
}

function handleMostCrowded(allAreas) {
  const sorted = [...allAreas].sort((a, b) => b.density - a.density);
  const top3 = sorted.slice(0, 3);
  const lines = top3.map((a, i) => `${i + 1}. 🔴 ${a.name}: ${a.density}%`);
  return `**Most crowded areas right now:**\n${lines.join("\n")}`;
}

function handleLeastCrowded(allAreas) {
  const sorted = [...allAreas].sort((a, b) => a.density - b.density);
  const top3 = sorted.slice(0, 3);
  const lines = top3.map((a, i) => `${i + 1}. 🟢 ${a.name}: ${a.density}%`);
  return `**Least crowded areas right now:**\n${lines.join("\n")}`;
}

function handlePeakHours(area, readings) {
  const filtered = area ? readings.filter((r) => r.areaId === area.id) : readings;
  if (filtered.length === 0) {
    return area
      ? `No historical data found for ${area.name} yet.`
      : "No historical data available yet. Readings will appear as the system collects data.";
  }
  const hourlyStats = computeHourlyStats(filtered);
  const { peakHour } = findPeakAndLowHours(hourlyStats);
  if (!peakHour) return "Not enough data to determine peak hours.";
  const label = area ? `**${area.name}**` : "all areas";
  return `⏰ **Peak hour** for ${label}: **${peakHour.label}** with average density of **${peakHour.avgDensity}%**.`;
}

function handleLowHours(area, readings) {
  const filtered = area ? readings.filter((r) => r.areaId === area.id) : readings;
  if (filtered.length === 0) {
    return area
      ? `No historical data found for ${area.name} yet.`
      : "No historical data available yet.";
  }
  const hourlyStats = computeHourlyStats(filtered);
  const { lowHour } = findPeakAndLowHours(hourlyStats);
  if (!lowHour) return "Not enough data to determine low traffic hours.";
  const label = area ? `**${area.name}**` : "all areas";
  return `🌙 **Low traffic hour** for ${label}: **${lowHour.label}** with average density of **${lowHour.avgDensity}%**.`;
}

function handleAverageDensity(area, allAreas, readings) {
  if (area) {
    const areaReadings = readings.filter((r) => r.areaId === area.id);
    if (areaReadings.length === 0) return `No historical data for ${area.name} yet. Current density: ${area.density}%.`;
    const avg = Math.round(areaReadings.reduce((s, r) => s + (r.density || 0), 0) / areaReadings.length);
    return `📊 **Average density** for **${area.name}**: **${avg}%** (based on ${areaReadings.length} readings).`;
  }
  const overallAvg = Math.round(allAreas.reduce((s, a) => s + a.density, 0) / (allAreas.length || 1));
  return `📊 **Overall average density** across all areas: **${overallAvg}%**.`;
}

function handleHelp() {
  return `**CrowdSense Chatbot** — Here's what you can ask:\n
📍 "How many users are in Raja Bazaar?"
📊 "What is the density in Saddar?"
🔴 "Which areas are most crowded right now?"
🟢 "Which areas are least crowded?"
⏰ "What are peak hours for Sixth Road?"
🌙 "What are low traffic hours?"
📈 "What's the average density in Ayub Park?"
💬 "Show me density trends for Raja Bazaar"`;
}

// ---------------------------------------------------------------------------
// Main process function — call this from the chatbot component
// ---------------------------------------------------------------------------

/**
 * Process a user message and return a bot reply.
 * @param {string} userMessage - Raw user input
 * @param {Array}  areas       - Current area objects with density/userCount
 * @param {Array}  readings    - All historical readings from Firebase
 * @param {Array}  history     - Previous messages for context [{sender, text}]
 * @returns {string} Bot reply text
 */
export function processMessage(userMessage, areas = [], readings = [], history = []) {
  const text = normalize(userMessage);

  const area = extractArea(text, areas);

  // Intents (ordered from most specific to most general)
  if (matchesAny(text, ["how many", "number of users", "user count", "users in", "people in"])) {
    return handleUserCount(area);
  }

  if (matchesAny(text, ["peak hour", "peak time", "busiest hour", "busiest time", "rush hour"])) {
    return handlePeakHours(area, readings);
  }

  if (matchesAny(text, ["low hour", "low traffic", "quiet time", "off-peak", "least busy hour", "low time"])) {
    return handleLowHours(area, readings);
  }

  if (matchesAny(text, ["most crowded", "highest density", "most busy", "busiest area", "crowded right now"])) {
    return handleMostCrowded(areas);
  }

  if (matchesAny(text, ["least crowded", "lowest density", "least busy", "quietest area", "empty area"])) {
    return handleLeastCrowded(areas);
  }

  if (matchesAny(text, ["average density", "avg density", "mean density", "average crowd"])) {
    return handleAverageDensity(area, areas, readings);
  }

  if (matchesAny(text, ["density", "crowd", "crowded", "how busy", "status", "current", "now", "right now"])) {
    return handleCurrentDensity(area, areas);
  }

  if (matchesAny(text, ["trend", "history", "historical", "over time", "chart"])) {
    return area
      ? `📈 Density trends for **${area.name}** are displayed on the Analytics page. Current density: ${area.density}%.`
      : "Visit the **Analytics** page to see density trends for all areas over time.";
  }

  if (matchesAny(text, ["help", "what can you do", "commands", "what can i ask"])) {
    return handleHelp();
  }

  if (matchesAny(text, ["hello", "hi", "hey", "good morning", "good evening", "greetings"])) {
    return "👋 Hello! I'm the CrowdSense assistant. Ask me about crowd density, peak hours, or user counts at any location. Type **help** to see what I can do!";
  }

  return `I'm not sure how to answer that. Try asking about crowd density, peak hours, or user counts.\nType **help** to see available commands.`;
}
