// ── Raspberry Pi connection ────────────────────────────────────────────────
export const RASPBERRY_PI_URL = process.env.NEXT_PUBLIC_PI_URL || "http://RASPBERRY_PI_IP:5000";

// Fetch live data from your Raspberry Pi /status endpoint
// Falls back to simulated data only if Pi is unreachable
export async function fetchPiData() {
  try {
    const res = await fetch(`${RASPBERRY_PI_URL}/status`, {
      signal: AbortSignal.timeout(2000),
      cache: "no-store",
    });
    if (!res.ok) throw new Error("Pi offline");
    const json = await res.json();
    return {
      status:        json.status        ?? "SAFE",
      object:        json.object        ?? "none",
      distance:      json.distance      ?? "clear",
      audio_message: json.audio_message ?? "Path is clear",
      timestamp:     json.timestamp     ?? new Date().toLocaleTimeString(),
      processing_speed: json.processing_speed ?? 28,
      confidence:    json.confidence    ?? 92,
      battery:       json.battery       ?? 80,
      source: "live",
    };
  } catch {
    // Pi unreachable — return last known safe state tagged as simulated
    return {
      status: "SAFE", object: "none", distance: "clear",
      audio_message: "Waiting for Pi connection...",
      timestamp: new Date().toLocaleTimeString(),
      processing_speed: 0, confidence: 0, battery: 0,
      source: "simulated",
    };
  }
}

// ── Keep these exports so other components don't break ───────────────────
export function generateSensorData()          { return {}; }
export function generateObstacleHistory(n=20) {
  return Array.from({ length: n }, (_, i) => ({
    time: new Date(Date.now() - (n - i) * 3500)
      .toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    detections: 0, alerts: 0, distance: 0,
  }));
}
export function randomLogEvent() { return null; }