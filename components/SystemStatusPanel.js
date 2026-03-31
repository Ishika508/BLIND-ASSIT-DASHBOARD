import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle, Radar, Zap, Target, Cpu } from 'lucide-react';

export default function SystemStatusPanel({ data }) {
  const isWarning = data?.status === 'WARNING';
  const connected = data?.connected === true;
  const hasObject = !!data?.object && data.object !== 'none';
  const color = isWarning ? 'amber' : 'green';
  const colorMap = {
    amber: { text: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10', glow: 'rgba(245,158,11,0.3)', dot: '#f59e0b' },
    green:  { text: 'text-green-400',  border: 'border-green-500/30',  bg: 'bg-green-500/10',  glow: 'rgba(34,197,94,0.25)', dot: '#22c55e'  },
  };
  const c = colorMap[color];

  const distancePercent = data?.distance
    ? Math.min(100, Math.max(0, 100 - (data.distance / 6) * 100))
    : 0;

  return (
    <div className="glass-card rounded-2xl p-5 h-full relative overflow-hidden">
      {/* Background glow based on status */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-1000"
        style={{ background: `radial-gradient(ellipse at top right, ${c.glow} 0%, transparent 60%)` }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative">
        <div className="flex items-center gap-2">
          <Radar className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">System Status</span>
        </div>
        <div className="text-xs font-mono text-slate-500">
          {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Main Status */}
      <AnimatePresence mode="wait">
        <motion.div
          key={data?.status}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={`flex items-center gap-3 p-4 rounded-xl border ${c.border} ${c.bg} mb-4 relative`}
        >
          <div className="relative">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: isWarning
                  ? 'linear-gradient(135deg, rgba(245,158,11,0.3), rgba(245,158,11,0.1))'
                  : 'linear-gradient(135deg, rgba(34,197,94,0.3), rgba(34,197,94,0.1))',
                border: `1px solid ${isWarning ? 'rgba(245,158,11,0.4)' : 'rgba(34,197,94,0.4)'}`,
                boxShadow: `0 0 20px ${c.glow}`,
              }}
            >
              {isWarning
                ? <AlertTriangle className="w-6 h-6 text-amber-400" />
                : <CheckCircle className="w-6 h-6 text-green-400" />
              }
            </div>
            {/* Pulse ring */}
            <div
              className="absolute inset-0 rounded-xl animate-ping opacity-20"
              style={{ border: `2px solid ${c.dot}` }}
            />
          </div>

          <div>
            <div className={`text-2xl font-display font-bold ${c.text} tracking-wider`}
              style={{ fontFamily: 'Syne, sans-serif', textShadow: `0 0 20px ${c.dot}` }}
            >
              {data?.status || 'LOADING'}
            </div>
            <div className="text-xs text-slate-400 font-mono mt-0.5">
              {isWarning ? 'Attention Required' : 'All Systems Normal'}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatBox
          icon={<Target className="w-3.5 h-3.5" />}
          label="Detected Object"
          value={hasObject ? data?.object : 'No Data'}
          valueClass={hasObject ? 'text-amber-300' : 'text-slate-400'}
        />
        <StatBox
          icon={<Zap className="w-3.5 h-3.5" />}
          label="Proc. Speed"
          value={`${data?.processing_speed || 0} FPS`}
          valueClass="text-cyan-300"
        />
        <StatBox
          icon={<Cpu className="w-3.5 h-3.5" />}
          label="Confidence"
          value={`${data?.confidence || 0}%`}
          valueClass="text-cyan-300"
        />
        <StatBox
          icon={<Radar className="w-3.5 h-3.5" />}
          label="Data Source"
          value={connected ? 'LIVE' : 'Hardware Not Connected'}
          valueClass={connected ? 'text-green-300' : 'text-slate-400'}
        />
      </div>

      {/* Distance bar */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-mono text-slate-400">Obstacle Distance</span>
          <span className={`text-xs font-mono font-semibold ${isWarning ? 'text-amber-400' : 'text-green-400'}`}>
            {data?.distance ?? '--'}
          </span>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${distancePercent}%`,
              background: isWarning
                ? 'linear-gradient(90deg, #ef4444, #f59e0b)'
                : 'linear-gradient(90deg, #22c55e, #06b6d4)',
              boxShadow: `0 0 8px ${isWarning ? 'rgba(245,158,11,0.6)' : 'rgba(34,197,94,0.6)'}`,
            }}
            animate={{ width: `${distancePercent}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        <div className="flex justify-between text-[10px] font-mono text-slate-600 mt-1">
          <span>VERY CLOSE</span>
          <span>FAR</span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ icon, label, value, valueClass }) {
  return (
    <div className="bg-[#080f1e] rounded-xl p-3 border border-[rgba(34,211,238,0.08)]">
      <div className="flex items-center gap-1.5 text-slate-500 mb-1">
        {icon}
        <span className="text-[10px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-sm font-display font-semibold ${valueClass} capitalize`}
        style={{ fontFamily: 'Syne, sans-serif' }}
      >
        {value}
      </div>
    </div>
  );
}
