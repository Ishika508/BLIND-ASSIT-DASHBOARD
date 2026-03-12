import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

import TopNavBar from '../components/TopNavBar';
import SystemStatusPanel from '../components/SystemStatusPanel';
import AudioGuidancePanel from '../components/AudioGuidancePanel';
import EmergencyControlPanel from '../components/EmergencyControlPanel';
import LogsPanel from '../components/LogsPanel';
import ChartsPanel from '../components/ChartsPanel';
import CaretakerProfileCard from '../components/CaretakerProfileCard';

// Location panel needs dynamic import (uses Leaflet / browser APIs)
const LocationPanel = dynamic(() => import('../components/LocationPanel'), { ssr: false });

// ── Pi connection ─────────────────────────────────────────────────────────────
const PI_URL = process.env.NEXT_PUBLIC_PI_URL || 'http://RASPBERRY_PI_IP:5000';

async function fetchPiData() {
  try {
    const res = await fetch(`${PI_URL}/status`, {
      signal: AbortSignal.timeout(2000),
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('offline');
    const json = await res.json();
    return {
      status:           json.status        ?? 'SAFE',
      object:           json.object        ?? 'none',
      distance:         json.distance      ?? 'clear',
      audio_message:    json.audio_message ?? 'Path is clear',
      timestamp:        json.timestamp     ?? new Date().toLocaleTimeString(),
      processing_speed: json.processing_speed ?? 28,
      confidence:       json.confidence    ?? 92,
      battery:          json.battery       ?? 80,
      source: 'live',
    };
  } catch {
    return {
      status: 'SAFE', object: 'none', distance: 'clear',
      audio_message: 'Waiting for Pi connection...',
      timestamp: new Date().toLocaleTimeString(),
      processing_speed: 0, confidence: 0, battery: 0,
      source: 'simulated',
    };
  }
}

// ── Initial empty history ─────────────────────────────────────────────────────
function emptyHistory(n = 20) {
  return Array.from({ length: n }, (_, i) => ({
    time: new Date(Date.now() - (n - i) * 2000)
      .toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    detections: 0,
    alerts: 0,
    distance: 0,
  }));
}

// ── Distance string → number helper ──────────────────────────────────────────
function distanceToNumber(d) {
  if (typeof d === 'number') return d;
  if (d === 'very close') return 0.4;
  if (d === 'near')       return 1.2;
  if (d === 'far')        return 3.5;
  return 0;
}

// ── Animation preset ──────────────────────────────────────────────────────────
const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const router = useRouter();
  const [caretaker, setCaretaker]   = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [history, setHistory]       = useState(emptyHistory(20));
  const [newLog, setNewLog]         = useState(null);
  const [mounted, setMounted]       = useState(false);

  // ── Auth check ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('caretaker');
    if (!stored) { router.push('/'); return; }
    setCaretaker(JSON.parse(stored));
  }, []);

  // ── Poll Pi every 2 seconds (matches your original fetch interval) ──────────
  const poll = useCallback(async () => {
    const data = await fetchPiData();
    setSensorData(data);

    // Append one point to chart history
    setHistory(prev => {
      const entry = {
        time:       data.timestamp,
        detections: data.object !== 'none' ? 1 : 0,
        alerts:     data.status === 'WARNING' ? 1 : 0,
        distance:   distanceToNumber(data.distance),
      };
      return [...prev.slice(-24), entry];
    });

    // Push a log line whenever something is detected
    if (data.object && data.object !== 'none') {
      setNewLog({
        type: data.status === 'WARNING' ? 'warning' : 'info',
        msg:  `${data.object} detected — ${data.distance}`,
      });
    } else if (data.source === 'simulated') {
      setNewLog({ type: 'info', msg: 'Pi offline — running in simulation mode' });
    }
  }, []);

  useEffect(() => {
    // Run once immediately on mount, then every 2 seconds
    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, [poll]);

  // ── Loading screen ──────────────────────────────────────────────────────────
  if (!mounted || !caretaker) {
    return (
      <div className="min-h-screen bg-[#050a14] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
          <span className="text-xs font-mono text-cyan-400/60 tracking-widest">LOADING SYSTEM...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050a14] flex flex-col relative overflow-hidden">

      {/* Grid background */}
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.05) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Top edge glow */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent z-50" />

      <TopNavBar connectionStatus={sensorData?.source} data={sensorData} />

      <div className="flex-1 overflow-hidden p-4 lg:p-5">
  <div className="max-w-[1600px] mx-auto h-full flex flex-col gap-4">

          {/* Row 0 — Caretaker profile */}
          <motion.div custom={0} variants={FADE_UP} initial="hidden" animate="show">
            <CaretakerProfileCard caretaker={caretaker} />
          </motion.div>

          {/* Row 1 — Status + Audio + Emergency */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <motion.div custom={1} variants={FADE_UP} initial="hidden" animate="show" className="h-full min-h-[280px]">
              <SystemStatusPanel data={sensorData} />
            </motion.div>
            <motion.div custom={2} variants={FADE_UP} initial="hidden" animate="show" className="h-full min-h-[280px]">
              <AudioGuidancePanel data={sensorData} />
            </motion.div>
            <motion.div custom={3} variants={FADE_UP} initial="hidden" animate="show" className="h-full min-h-[280px]">
              <EmergencyControlPanel />
            </motion.div>
          </div>

          {/* Row 2 — Map + Logs + Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <motion.div custom={4} variants={FADE_UP} initial="hidden" animate="show" className="h-[360px]">
              <LocationPanel data={sensorData} />
            </motion.div>
            <motion.div custom={5} variants={FADE_UP} initial="hidden" animate="show" className="h-[360px]">
              <LogsPanel newLog={newLog} />
            </motion.div>
            <motion.div custom={6} variants={FADE_UP} initial="hidden" animate="show" className="h-[360px]">
              <ChartsPanel history={history} />
            </motion.div>
          </div>

          {/* Row 3 — Pi integration info banner */}
          <motion.div custom={7} variants={FADE_UP} initial="hidden" animate="show">
            <PiIntegrationBanner source={sensorData?.source} piUrl={PI_URL} />
          </motion.div>

        </div>
      </div>
    </div>
  );
}

// ── Pi Integration Banner ─────────────────────────────────────────────────────
function PiIntegrationBanner({ source, piUrl }) {
  return (
    <div
      className="glass-card rounded-2xl p-5 relative overflow-hidden"
      style={{ border: '1px solid rgba(34,211,238,0.1)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at right, rgba(34,211,238,0.04) 0%, transparent 60%)' }}
      />

      <div className="flex flex-wrap items-start gap-6 relative">

        {/* Left — instructions */}
        <div className="flex-1 min-w-[220px]">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400" />
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase">
              Raspberry Pi Integration
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono leading-relaxed">
            Set your Pi IP in{' '}
            <span className="text-cyan-300 bg-cyan-500/10 px-1 rounded">.env.local</span>:{' '}
            <span className="text-cyan-300 bg-cyan-500/10 px-1 rounded">
              NEXT_PUBLIC_PI_URL=http://YOUR_PI_IP:5000
            </span>
            . Dashboard polls{' '}
            <span className="text-cyan-300">/status</span> every 2 seconds. Falls back to
            simulation mode if the Pi is offline.
          </p>
          <p className="text-xs text-slate-500 font-mono mt-2">
            Currently connecting to:{' '}
            <span className="text-cyan-400">{piUrl}</span>
          </p>
        </div>

        {/* Middle — expected JSON */}
        <div className="flex-1 min-w-[220px]">
          <div className="text-[10px] font-mono text-slate-500 mb-1">
            Expected JSON from Pi at{' '}
            <span className="text-cyan-400">/status</span>
          </div>
          <pre className="text-[10px] font-mono text-cyan-300 bg-[#080f1e] p-3 rounded-xl border border-[rgba(34,211,238,0.1)] overflow-x-auto leading-relaxed">
{`{
  "status":        "WARNING",
  "object":        "person",
  "distance":      "near",
  "audio_message": "person ahead near",
  "timestamp":     "18:45:12"
}`}
          </pre>
        </div>

        {/* Right — live connection badge */}
        <div className="flex-shrink-0 flex flex-col gap-2">
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${
            source === 'live'
              ? 'bg-green-500/10 border border-green-500/25'
              : 'bg-amber-500/10 border border-amber-500/25'
          }`}>
            <span className={`w-2 h-2 rounded-full ${
              source === 'live' ? 'bg-green-400 animate-pulse' : 'bg-amber-400'
            }`} />
            <div>
              <div className={`text-xs font-mono font-semibold ${
                source === 'live' ? 'text-green-400' : 'text-amber-400'
              }`}>
                {source === 'live' ? 'Pi Connected' : 'Simulation Mode'}
              </div>
              <div className="text-[9px] font-mono text-slate-500">
                {source === 'live' ? 'Live sensor data active' : 'Pi offline — using fallback'}
              </div>
            </div>
          </div>

          {/* Polling indicator */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/5 border border-cyan-500/10">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-[10px] font-mono text-cyan-500">Polling every 2s</span>
          </div>
        </div>

      </div>
    </div>
  );
}