import { motion, AnimatePresence } from 'framer-motion';
import { Headphones, Volume2, Radio, Mic } from 'lucide-react';
import { useState, useEffect } from 'react';

const messageHistory = [];

export default function AudioGuidancePanel({ data }) {
  const [history, setHistory] = useState([]);
  const [waveActive, setWaveActive] = useState(false);

  useEffect(() => {
    if (data?.audio_message) {
      setWaveActive(true);
      setHistory(prev => {
        const updated = [{ msg: data.audio_message, time: new Date().toLocaleTimeString(), id: Date.now() }, ...prev].slice(0, 6);
        return updated;
      });
      const t = setTimeout(() => setWaveActive(false), 2000);
      return () => clearTimeout(t);
    }
  }, [data?.audio_message]);

  const isWarning = data?.status === 'WARNING';

  return (
    <div className="glass-card rounded-2xl p-5 h-full relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none rounded-2xl"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(34,211,238,0.05) 0%, transparent 60%)' }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Headphones className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">Audio Guidance</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-500">Live Headphone Feed</span>
          <Radio className="w-3.5 h-3.5 text-cyan-500/50 animate-pulse" />
        </div>
      </div>

      {/* Main message display */}
      <div
        className="relative rounded-xl p-5 mb-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(8,15,30,0.9), rgba(13,26,46,0.8))',
          border: `1px solid ${isWarning ? 'rgba(245,158,11,0.3)' : 'rgba(34,211,238,0.2)'}`,
          boxShadow: isWarning
            ? '0 0 20px rgba(245,158,11,0.1), inset 0 0 30px rgba(0,0,0,0.3)'
            : '0 0 20px rgba(34,211,238,0.08), inset 0 0 30px rgba(0,0,0,0.3)',
        }}
      >
        {/* Audio waveform bars */}
        <div className="flex items-center justify-center gap-1 mb-4 h-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              style={{
                background: isWarning
                  ? 'linear-gradient(to top, rgba(245,158,11,0.8), rgba(245,158,11,0.3))'
                  : 'linear-gradient(to top, rgba(34,211,238,0.8), rgba(34,211,238,0.3))',
              }}
              animate={{
                height: waveActive
                  ? [8, Math.random() * 28 + 8, 8]
                  : [4, 6, 4],
                opacity: waveActive ? [0.6, 1, 0.6] : 0.3,
              }}
              transition={{
                duration: waveActive ? 0.4 + Math.random() * 0.3 : 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.04,
              }}
            />
          ))}
        </div>

        {/* Message */}
        <AnimatePresence mode="wait">
          <motion.div
            key={data?.audio_message}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Volume2 className={`w-4 h-4 ${isWarning ? 'text-amber-400' : 'text-cyan-400'}`} />
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
                Now Playing via Headphones
              </span>
            </div>
            <p
              className="text-lg font-display font-semibold leading-snug"
              style={{
                fontFamily: 'Syne, sans-serif',
                color: isWarning ? '#fcd34d' : '#67e8f9',
                textShadow: isWarning
                  ? '0 0 20px rgba(245,158,11,0.5)'
                  : '0 0 20px rgba(34,211,238,0.4)',
              }}
            >
              "{data?.audio_message || 'Initializing audio system...'}"
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Scanning line */}
        {waveActive && (
          <motion.div
            className="absolute left-0 right-0 h-0.5"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)' }}
            animate={{ top: ['0%', '100%'] }}
            transition={{ duration: 1, ease: 'linear', repeat: 2 }}
          />
        )}
      </div>

      {/* History */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Mic className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">Previous Messages</span>
        </div>
        <div className="space-y-1.5 max-h-40 overflow-y-auto">
          {history.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1 - idx * 0.15, x: 0 }}
              className="flex items-center gap-3 py-1.5 px-2 rounded-lg bg-[#080f1e]/60 border border-[rgba(34,211,238,0.06)]"
            >
              <span className="text-[10px] font-mono text-slate-600 whitespace-nowrap">{item.time}</span>
              <span className="text-xs text-slate-400 truncate">"{item.msg}"</span>
            </motion.div>
          ))}
          {history.length === 0 && (
            <div className="text-xs text-slate-600 font-mono text-center py-3">Waiting for audio output...</div>
          )}
        </div>
      </div>
    </div>
  );
}
