// Firebase Realtime Database service for crowd density data
import { database } from "./firebaseConfig";
import {
  ref,
  onValue,
  set,
  push,
  serverTimestamp,
  query,
  orderByChild,
  limitToLast,
} from "firebase/database";

// Default areas with coordinates (Rawalpindi)
export const DEFAULT_AREAS = [
  { id: "raja_bazaar", name: "Raja Bazaar", lat: 33.5958, lng: 73.0489, info: "High Traffic" },
  { id: "saddar", name: "Saddar", lat: 33.6000, lng: 73.0550, info: "Commercial Hub" },
  { id: "sixth_road", name: "Sixth Road", lat: 33.6351, lng: 73.0764, info: "Educational Zone" },
  { id: "ayub_park", name: "Ayub Park", lat: 33.5689, lng: 73.1047, info: "Recreational" },
];

// Subscribe to real-time area density updates
// callback receives an array of area objects with current density
export function subscribeToAreaDensity(callback) {
  const areasRef = ref(database, "crowds/areas");
  const unsubscribe = onValue(areasRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const areas = Object.entries(data).map(([id, area]) => ({
        id,
        name: area.name,
        lat: area.coordinates?.lat || 0,
        lng: area.coordinates?.lng || 0,
        info: area.info || "",
        density: area.currentDensity || 0,
        userCount: area.userCount || 0,
        lastUpdated: area.lastUpdated || null,
      }));
      callback(areas);
    } else {
      // No Firebase data yet — seed with defaults (density = 0)
      callback(
        DEFAULT_AREAS.map((a) => ({ ...a, density: 0, userCount: 0, lastUpdated: null }))
      );
    }
  });
  return unsubscribe;
}

// Subscribe to readings for a specific area
export function subscribeToAreaReadings(areaId, callback, limit = 24) {
  const readingsRef = query(
    ref(database, "crowds/readings"),
    orderByChild("areaId"),
    limitToLast(limit)
  );
  const unsubscribe = onValue(readingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const readings = Object.values(data)
        .filter((r) => r.areaId === areaId)
        .sort((a, b) => a.timestamp - b.timestamp);
      callback(readings);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// Subscribe to all recent readings (for analytics)
export function subscribeToAllReadings(callback, limit = 200) {
  const readingsRef = query(
    ref(database, "crowds/readings"),
    orderByChild("timestamp"),
    limitToLast(limit)
  );
  const unsubscribe = onValue(readingsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const readings = Object.values(data).sort((a, b) => a.timestamp - b.timestamp);
      callback(readings);
    } else {
      callback([]);
    }
  });
  return unsubscribe;
}

// Write a density reading to Firebase
export async function writeDensityReading({ areaId, userCount, density, peakStatus }) {
  const readingsRef = ref(database, "crowds/readings");
  await push(readingsRef, {
    areaId,
    userCount,
    density,
    peakStatus: peakStatus || (density > 70 ? "peak" : density > 40 ? "moderate" : "low"),
    timestamp: Date.now(),
  });

  // Also update the area's current density
  const areaRef = ref(database, `crowds/areas/${areaId}`);
  await set(areaRef, {
    ...DEFAULT_AREAS.find((a) => a.id === areaId),
    currentDensity: density,
    userCount,
    lastUpdated: serverTimestamp(),
  });
}

// Seed the Firebase database with initial area data
export async function seedInitialAreas() {
  for (const area of DEFAULT_AREAS) {
    const areaRef = ref(database, `crowds/areas/${area.id}`);
    await set(areaRef, {
      name: area.name,
      info: area.info,
      coordinates: { lat: area.lat, lng: area.lng },
      currentDensity: Math.floor(Math.random() * 100),
      userCount: Math.floor(Math.random() * 500),
      lastUpdated: serverTimestamp(),
    });
  }
}

// Compute hourly statistics from readings array
export function computeHourlyStats(readings) {
  const hourBuckets = Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    label: `${h.toString().padStart(2, "0")}:00`,
    totalDensity: 0,
    count: 0,
    avgDensity: 0,
  }));

  readings.forEach((r) => {
    const hour = new Date(r.timestamp).getHours();
    hourBuckets[hour].totalDensity += r.density || 0;
    hourBuckets[hour].count += 1;
  });

  hourBuckets.forEach((b) => {
    b.avgDensity = b.count > 0 ? Math.round(b.totalDensity / b.count) : 0;
  });

  return hourBuckets;
}

// Find peak and low traffic hours from hourly stats
export function findPeakAndLowHours(hourlyStats) {
  const withData = hourlyStats.filter((h) => h.count > 0);
  if (withData.length === 0) return { peakHour: null, lowHour: null };

  const peakHour = withData.reduce((max, h) => (h.avgDensity > max.avgDensity ? h : max), withData[0]);
  const lowHour = withData.reduce((min, h) => (h.avgDensity < min.avgDensity ? h : min), withData[0]);

  return { peakHour, lowHour };
}
