// utils/piData.js
// Shared Pi polling + simulation for all dashboards

export const PI_URL = process.env.NEXT_PUBLIC_PI_URL || 'http://RASPBERRY_PI_IP:5000';

export async function fetchPiData() {
  try {
    const res = await fetch(`${PI_URL}/status`, {
      signal: AbortSignal.timeout(2000), cache: 'no-store',
    });
    if (!res.ok) throw new Error();
    const j = await res.json();
    const gps =
      j.gps && typeof j.gps === 'object'
        ? j.gps
        : j.lat != null && j.lng != null
          ? { lat: j.lat, lng: j.lng }
          : null;

    return {
      status:           j.status           ?? 'SAFE',
      object:           j.object           ?? null,
      distance:         j.distance         ?? null,
      direction:        j.direction        ?? null,
      audio_message:    j.audio_message    ?? 'Path is clear',
      timestamp:        j.timestamp        ?? ts(),
      processing_speed: j.processing_speed ?? null,
      confidence:       j.confidence       ?? null,
      battery:          j.battery          ?? null,
      gps,
      connected: true,
      source: 'live',
    };
  } catch {
    // Safe disconnected payload: no random data, no crashing consumers.
    return {
      status:           'DISCONNECTED',
      object:           null,
      distance:         null,
      direction:        null,
      audio_message:    'Waiting for Raspberry Pi...',
      timestamp:        ts(),
      processing_speed: null,
      confidence:       null,
      battery:          null,
      gps:              null,
      connected:        false,
      source:           'disconnected',
    };
  }
}

export function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function distNum(d) {
  if (typeof d === 'number') return d;
  if (typeof d === 'string') return d === 'very close' ? 0.4 : d === 'near' ? 1.2 : 3.5;
  return 0;
}

export function emptyHistory(n = 18) {
  return Array.from({ length: n }, (_, i) => ({
    t:    new Date(Date.now() - (n - i) * 2000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    det:  0,
    alert: 0,
    dist: 0,
    fps:  0,
  }));
}

// Simulated patient list for hospital dashboard
export const MOCK_PATIENTS = [
  { id: 'P001', name: 'Ravi Sharma',   piId: 'BLIND-AA01', ward: 'Ward 3B', status: 'SAFE',    battery: 82, lastSeen: '2 min ago' },
  { id: 'P002', name: 'Meena Patel',   piId: 'BLIND-BB02', ward: 'Ward 1A', status: 'WARNING', battery: 54, lastSeen: '1 min ago' },
  { id: 'P003', name: 'Arjun Nair',    piId: 'BLIND-CC03', ward: 'Ward 2C', status: 'SAFE',    battery: 91, lastSeen: 'Just now' },
  { id: 'P004', name: 'Sunita Verma',  piId: 'BLIND-DD04', ward: 'Ward 4A', status: 'SAFE',    battery: 37, lastSeen: '5 min ago' },
];

// Simulated device list for supervisor
export const MOCK_DEVICES = [
  { piId: 'BLIND-AA01', user: 'Ravi Sharma',   role: 'Personal Caretaker', status: 'online',  battery: 82, uptime: '6h 14m',  location: 'Nashik' },
  { piId: 'BLIND-BB02', user: 'Meena Patel',   role: 'Hospital Staff',     status: 'warning', battery: 54, uptime: '2h 03m',  location: 'Mumbai' },
  { piId: 'BLIND-CC03', user: 'Arjun Nair',    role: 'Family Member',      status: 'online',  battery: 91, uptime: '11h 50m', location: 'Pune' },
  { piId: 'BLIND-DD04', user: 'Sunita Verma',  role: 'Hospital Staff',     status: 'offline', battery: 37, uptime: '—',       location: 'Nashik' },
  { piId: 'BLIND-EE05', user: 'Vikram Singh',  role: 'Personal Caretaker', status: 'online',  battery: 76, uptime: '3h 22m',  location: 'Delhi' },
];