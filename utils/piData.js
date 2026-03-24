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
    return {
      status:           j.status           ?? 'SAFE',
      object:           j.object           ?? 'none',
      distance:         j.distance         ?? 'clear',
      direction:        j.direction        ?? 'ahead',
      audio_message:    j.audio_message    ?? 'Path is clear',
      timestamp:        j.timestamp        ?? ts(),
      processing_speed: j.processing_speed ?? 28,
      confidence:       j.confidence       ?? 92.0,
      battery:          j.battery          ?? 80,
      source: 'live',
    };
  } catch {
    // Simulated fallback
    const objs = ['person', 'chair', 'wall', 'stairs', 'door', 'none', 'none', 'none'];
    const dirs  = ['ahead', 'left', 'right'];
    const dists = ['very close', 'near', 'far'];
    const obj  = objs[Math.floor(Math.random() * objs.length)];
    const dir  = dirs[Math.floor(Math.random() * dirs.length)];
    const dist = obj !== 'none' ? dists[Math.floor(Math.random() * 2)] : 'far';
    const warn = obj !== 'none' && dist !== 'far';
    return {
      status:           warn ? 'WARNING' : 'SAFE',
      object:           obj,
      distance:         dist,
      direction:        dir,
      audio_message:    obj !== 'none' ? `${obj} ${dir} ${dist}` : 'Path is clear',
      timestamp:        ts(),
      processing_speed: Math.floor(Math.random() * 15) + 22,
      confidence:       parseFloat((Math.random() * 12 + 85).toFixed(1)),
      battery:          Math.floor(Math.random() * 20) + 65,
      source: 'simulated',
    };
  }
}

export function ts() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function distNum(d) {
  if (typeof d === 'number') return d;
  return d === 'very close' ? 0.4 : d === 'near' ? 1.2 : 3.5;
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