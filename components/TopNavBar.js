import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, WifiOff, Battery, Clock, Eye } from 'lucide-react';

export default function TopNavBar({ connectionStatus, data }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      className="flex items-center justify-between px-6 py-3 relative z-50 flex-shrink-0"
      style={{
        background: 'linear-gradient(180deg, rgba(5,10,20,0.98) 0%, rgba(8,15,30,0.95) 100%)',
        borderBottom: '1px solid rgba(34,211,238,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
      }}
    >
      {/* Left — Brand */}
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))',
            border: '1px solid rgba(34,211,238,0.3)',
          }}
        >
          <Eye className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-sm font-display font-bold text-white tracking-wide"
            style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '0.1em' }}>
            BLIND ASSIST
          </div>
          <div className="text-[10px] font-mono text-slate-500 tracking-widest">MONITORING SYSTEM</div>
        </div>
        <div className="ml-4 h-6 w-px bg-slate-800" />
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400">LIVE</span>
        </div>
      </div>

      {/* Center — Status indicators */}
      <div className="hidden md:flex items-center gap-6">
        <StatusIndicator
          icon={<Wifi className="w-3.5 h-3.5" />}
          label="Pi Connection"
          value={connectionStatus === 'live' ? 'Connected' : 'Simulated'}
          color={connectionStatus === 'live' ? 'green' : 'amber'}
        />
        <StatusIndicator
          icon={<Activity className="w-3.5 h-3.5" />}
          label="Camera Feed"
          value={`${data?.processing_speed || 0} FPS`}
          color="cyan"
        />
        <StatusIndicator
          icon={<Battery className="w-3.5 h-3.5" />}
          label="Device Battery"
          value={`${data?.battery || 0}%`}
          color={data?.battery > 30 ? 'green' : 'red'}
        />
      </div>

      {/* Right — Clock */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-sm font-mono text-white tracking-widest">
            {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            {time.toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
        </div>
        <div className="w-px h-8 bg-slate-800" />
        <div
          className="w-2 h-2 rounded-full"
          style={{
            background: '#22c55e',
            boxShadow: '0 0 8px rgba(34,197,94,0.8)',
          }}
        />
      </div>
    </div>
  );
}

function StatusIndicator({ icon, label, value, color }) {
  const colors = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    cyan:  'text-cyan-400',
    red:   'text-red-400',
  };
  return (
    <div className="flex items-center gap-2">
      <div className={`${colors[color]}`}>{icon}</div>
      <div>
        <div className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{label}</div>
        <div className={`text-xs font-mono font-medium ${colors[color]}`}>{value}</div>
      </div>
    </div>
  );
}
