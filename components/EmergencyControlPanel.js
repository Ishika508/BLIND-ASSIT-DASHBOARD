import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageSquare, BellRing, BellOff, Siren, ShieldAlert, CheckCircle } from 'lucide-react';

export default function EmergencyControlPanel() {
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(null);

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const action = async (id, fn) => {
    setLoading(id);
    await new Promise(r => setTimeout(r, 900));
    fn();
    setLoading(null);
  };

  const handleCall = () => action('call', () => showToast('📞 Calling user device...', 'cyan'));
  const handleVoice = () => action('voice', () => showToast('🎙 Voice message sent to headphones', 'green'));
  const handleBuzzer = () => {
    action('buzzer', () => {
      setBuzzerActive(true);
      showToast('🚨 Buzzer alert activated!', 'red');
      // Simulate buzzer stopping after 5s
      setTimeout(() => setBuzzerActive(false), 5000);
    });
  };
  const handleStop = () => {
    setBuzzerActive(false);
    showToast('✅ Buzzer deactivated', 'green');
  };

  return (
    <div className="glass-card rounded-2xl p-5 h-full relative overflow-hidden">
      {/* Red glow when buzzer active */}
      <AnimatePresence>
        {buzzerActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at center, rgba(239,68,68,0.12) 0%, transparent 70%)',
              border: '1px solid rgba(239,68,68,0.3)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className={`w-4 h-4 ${buzzerActive ? 'text-red-400 animate-pulse' : 'text-cyan-400'}`} />
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">Emergency Controls</span>
        </div>
        {buzzerActive && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-500/15 border border-red-500/30"
          >
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-[10px] font-mono text-red-400 tracking-widest">ALERT ACTIVE</span>
          </motion.div>
        )}
      </div>

      {/* Buzzer status display */}
      <AnimatePresence>
        {buzzerActive && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div
              className="rounded-xl p-3 flex items-center gap-3 mb-0"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.35)',
                boxShadow: '0 0 20px rgba(239,68,68,0.2)',
              }}
            >
              <Siren className="w-5 h-5 text-red-400 animate-bounce" />
              <div>
                <div className="text-sm font-display font-bold text-red-300"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  BUZZER ACTIVE
                </div>
                <div className="text-xs text-red-400/70 font-mono">Alert sound playing through headphones</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <ActionButton
          icon={<Phone className="w-4 h-4" />}
          label="Call User"
          sublabel="Direct call"
          variant="cyan"
          loading={loading === 'call'}
          onClick={handleCall}
        />
        <ActionButton
          icon={<MessageSquare className="w-4 h-4" />}
          label="Voice Message"
          sublabel="Send to headphones"
          variant="green"
          loading={loading === 'voice'}
          onClick={handleVoice}
        />

        {!buzzerActive ? (
          <ActionButton
            icon={<BellRing className="w-4 h-4" />}
            label="Trigger Buzzer"
            sublabel="Emergency alert"
            variant="danger"
            loading={loading === 'buzzer'}
            onClick={handleBuzzer}
            fullWidth
          />
        ) : (
          <ActionButton
            icon={<BellOff className="w-4 h-4" />}
            label="Stop Buzzer"
            sublabel="Deactivate alert"
            variant="amber"
            onClick={handleStop}
            fullWidth
          />
        )}
      </div>

      {/* Info note */}
      <div className="mt-4 p-3 rounded-xl bg-[#080f1e]/70 border border-[rgba(34,211,238,0.08)]">
        <p className="text-[10px] font-mono text-slate-500 leading-relaxed">
          ⚡ Actions are sent directly to the user's Raspberry Pi device. Buzzer and voice messages are delivered via headphones in real-time.
        </p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="absolute bottom-4 left-4 right-4 px-4 py-3 rounded-xl text-sm font-mono flex items-center gap-2"
            style={{
              background: toast.type === 'red'
                ? 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(239,68,68,0.1))'
                : toast.type === 'green'
                ? 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(34,197,94,0.1))'
                : 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(34,211,238,0.1))',
              border: `1px solid ${toast.type === 'red' ? 'rgba(239,68,68,0.4)' : toast.type === 'green' ? 'rgba(34,197,94,0.4)' : 'rgba(34,211,238,0.4)'}`,
            }}
          >
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-current" />
            <span className="text-slate-200">{toast.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ActionButton({ icon, label, sublabel, variant, loading, onClick, fullWidth }) {
  const styles = {
    danger: { btn: 'btn-danger', iconColor: 'text-red-300' },
    cyan:   { btn: 'btn-cyan',   iconColor: 'text-cyan-300' },
    green:  { btn: 'btn-green',  iconColor: 'text-green-300' },
    amber:  { btn: 'btn-amber',  iconColor: 'text-amber-300' },
  };
  const s = styles[variant];

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      disabled={loading}
      className={`${s.btn} rounded-xl p-3.5 text-left transition-all duration-200 ${fullWidth ? 'col-span-2' : ''}`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={s.iconColor}>
          {loading ? (
            <div className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />
          ) : icon}
        </div>
        <span className="text-sm font-display font-semibold" style={{ fontFamily: 'Syne, sans-serif' }}>
          {loading ? 'Sending...' : label}
        </span>
      </div>
      <div className="text-[10px] font-mono text-current opacity-60 pl-6">{sublabel}</div>
    </motion.button>
  );
}
