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
    const gps =
      json.gps && typeof json.gps === "object"
        ? json.gps
        : json.lat != null && json.lng != null
          ? { lat: json.lat, lng: json.lng }
          : null;

    return {
      status:        json.status        ?? "SAFE",
      object:        json.object        ?? null,
      distance:      json.distance      ?? null,
      audio_message: json.audio_message ?? "Path is clear",
      timestamp:     json.timestamp     ?? new Date().toLocaleTimeString(),
      processing_speed: json.processing_speed ?? null,
      confidence:    json.confidence    ?? null,
      battery:       json.battery       ?? null,
      gps,
      connected: true,
      source: "live",
    };
  } catch {
    // Pi unreachable: return a disconnected-safe payload with nullable fields.
    return {
      status: "DISCONNECTED",
      object: null,
      distance: null,
      battery: null,
      gps: null,
      audio_message: "Waiting for Raspberry Pi...",
      timestamp: new Date().toLocaleTimeString(),
      processing_speed: null,
      confidence: null,
      connected: false,
      source: "disconnected",
    };
  }
}

// ── Keep these exports so other components don't break ───────────────────
export function generateSensorData()          { return null; }
export function generateObstacleHistory()     { return []; }
export function randomLogEvent() { return null; }