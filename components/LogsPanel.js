import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, AlertTriangle, Info, AlertCircle, Filter, Trash2 } from 'lucide-react';

export default function LogsPanel({ newLog }) {
  const [logs, setLogs] = useState([
    { id: 1, type: 'info',    msg: 'System initialized successfully',      time: formatTime() },
    { id: 2, type: 'info',    msg: 'Raspberry Pi connection established',   time: formatTime() },
    { id: 3, type: 'info',    msg: 'Camera module active — 30fps',          time: formatTime() },
    { id: 4, type: 'info',    msg: 'Ultrasonic sensor calibrated',          time: formatTime() },
    { id: 5, type: 'warning', msg: 'Person detected at 1.5m',               time: formatTime() },
    { id: 6, type: 'info',    msg: 'Audio guidance: Path is clear',         time: formatTime() },
  ]);
  const [filter, setFilter] = useState('all');
  const endRef = useRef(null);

  useEffect(() => {
    if (newLog) {
      setLogs(prev => [
        ...prev,
        { id: Date.now(), type: newLog.type, msg: newLog.msg, time: formatTime() },
      ].slice(-80));
    }
  }, [newLog]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.type === filter);

  const typeConfig = {
    info:    { icon: <Info className="w-3 h-3" />,          color: 'text-cyan-400',   dot: '#22d3ee', label: 'INFO' },
    warning: { icon: <AlertTriangle className="w-3 h-3" />, color: 'text-amber-400',  dot: '#f59e0b', label: 'WARN' },
    alert:   { icon: <AlertCircle className="w-3 h-3" />,   color: 'text-red-400',    dot: '#ef4444', label: 'ALERT' },
  };

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">System Logs</span>
          <span className="text-[10px] font-mono text-slate-600 bg-slate-800/50 rounded px-1.5 py-0.5">
            {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="text-slate-600 hover:text-slate-400 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 mb-3 flex-shrink-0">
        {['all', 'info', 'warning', 'alert'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-lg transition-all ${
              filter === f
                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-500 hover:text-slate-300 border border-transparent hover:border-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Log list */}
      <div className="flex-1 overflow-y-auto space-y-1 min-h-0 pr-1">
        <AnimatePresence initial={false}>
          {filtered.map((log, idx) => {
            const tc = typeConfig[log.type] || typeConfig.info;
            return (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="log-item flex items-start gap-2.5 py-1.5 px-2 rounded-lg hover:bg-[#080f1e]/50 group"
              >
                <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: tc.dot }} />
                  <div className={`${tc.color} flex-shrink-0`}>{tc.icon}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-[10px] font-mono ${tc.color} mr-2`}>[{tc.label}]</span>
                  <span className="text-xs text-slate-300 font-mono">{log.msg}</span>
                </div>
                <span className="text-[9px] font-mono text-slate-600 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {log.time}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {/* Bottom status */}
      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[rgba(34,211,238,0.08)] flex-shrink-0">
        <span className="text-[10px] font-mono text-slate-600">
          Streaming from Raspberry Pi
        </span>
        <div className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-mono text-green-400/60">Live</span>
        </div>
      </div>
    </div>
  );
}

function formatTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}
