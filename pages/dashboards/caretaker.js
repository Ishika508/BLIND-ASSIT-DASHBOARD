// pages/dashboards/caretaker.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  LogOut, Phone, MessageSquare, Bell, BellOff,
  ShieldCheck, Activity, Eye, Headphones, Battery,
  MapPin, AlertTriangle, CheckCircle, Wifi, WifiOff,
  Mic, MicOff, Volume2, Navigation, Zap, Clock,
  BarChart2, TrendingUp, User
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getSession, clearSession } from '../../utils/auth';
import { fetchPiData, ts, distNum, emptyHistory } from '../../utils/piData';

const MapView = dynamic(() => import('../../components/dashboards/MapView'), { ssr: false });

const C = {
  primary: '#f97316', dark: '#c2410c', light: '#fff7ed',
  border: '#fed7aa', mid: '#fb923c', grad: 'linear-gradient(135deg,#f97316,#fb923c)',
};

export default function CaretakerDashboard() {
  const router = useRouter();
  const [user, setUser]         = useState(null);
  const [data, setData]         = useState(null);
  const [history, setHistory]   = useState(emptyHistory());
  const [logs, setLogs]         = useState([{ type:'info', msg:'System ready', time: ts() }]);
  const [buzzer, setBuzzer]     = useState(false);
  const [buzzerTimer, setBuzzerTimer] = useState(null);
  const [muted, setMuted]       = useState(false);
  const [calling, setCalling]   = useState(false);
  const [toasts, setToasts]     = useState([]);
  const [msgModal, setMsgModal] = useState(false);
  const [msgText, setMsgText]   = useState('');
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = getSession();
    if (!s || s.role !== 'Personal Caretaker') { router.replace('/'); return; }
    setUser(s);
  }, []);

  const toast = (msg, type = 'success') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const addLog = useCallback((type, msg) => {
    setLogs(p => [{ type, msg, time: ts() }, ...p].slice(0, 60));
  }, []);

  const poll = useCallback(async () => {
    const d = await fetchPiData();
    setData(d);
    setHistory(p => [...p.slice(-22), { t: d.timestamp, det: d.object !== 'none' ? 1 : 0, alert: d.status === 'WARNING' ? 1 : 0, dist: distNum(d.distance), fps: d.processing_speed }]);
    if (d.object !== 'none') addLog(d.status === 'WARNING' ? 'warning' : 'info', `${d.object} ${d.direction} — ${d.distance}`);
  }, [addLog]);

  useEffect(() => {
    if (!mounted) return;
    poll();
    const t = setInterval(poll, 2000);
    return () => clearInterval(t);
  }, [poll, mounted]);

  // Auto stop buzzer after 10s
  useEffect(() => {
    if (buzzer) {
      const t = setTimeout(() => { setBuzzer(false); addLog('info', 'Buzzer auto-stopped after 10s'); }, 10000);
      setBuzzerTimer(t);
    } else {
      if (buzzerTimer) clearTimeout(buzzerTimer);
    }
  }, [buzzer]);

  const handleCall = () => {
    setCalling(true);
    addLog('info', 'Voice call initiated to user device');
    toast('📞 Connecting call to user device...');
    setTimeout(() => { setCalling(false); toast('Call ended', 'info'); addLog('info', 'Call ended'); }, 8000);
  };

  const handleSendMsg = () => {
    if (!msgText.trim()) return;
    addLog('info', `Voice message sent: "${msgText}"`);
    toast(`Message sent to headphones`);
    setMsgText(''); setMsgModal(false);
  };

  const handleBuzzer = () => {
    const next = !buzzer;
    setBuzzer(next);
    addLog(next ? 'alert' : 'info', next ? 'Emergency buzzer activated' : 'Buzzer deactivated');
    toast(next ? '🚨 Buzzer ACTIVE on user device' : 'Buzzer stopped', next ? 'warn' : 'success');
  };

  const logout = () => { clearSession(); router.replace('/'); };
  const isWarn = data?.status === 'WARNING';

  if (!mounted || !user) return <Loader />;

  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: isWarn ? '#fffbeb' : '#fff7ed', fontFamily: "'Plus Jakarta Sans',sans-serif", transition: 'background 1s' }}>

      {/* Warning banner */}
      <AnimatePresence>
        {isWarn && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden flex-shrink-0"
            style={{ background: 'linear-gradient(90deg,#f97316,#ef4444)', color: 'white' }}>
            <div className="flex items-center justify-center gap-3 py-2.5 text-sm font-bold" style={{ fontFamily: "'Nunito',sans-serif" }}>
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              OBSTACLE DETECTED — {data?.object?.toUpperCase()} {data?.direction?.toUpperCase()} · {data?.distance?.toUpperCase()}
              <AlertTriangle className="w-4 h-4 animate-bounce" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 h-[62px]"
        style={{ background: 'white', borderBottom: `2px solid ${C.border}`, boxShadow: '0 2px 8px rgba(249,115,22,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.grad }}>
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: C.dark, fontFamily: "'Nunito',sans-serif" }}>Personal Caretaker</div>
            <div className="text-[11px]" style={{ color: C.primary }}>
              {data?.source === 'live' ? `● Live · ${user.piIds?.[0]}` : '○ Simulation Mode'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick action pills */}
          <QuickPill icon={<Phone className="w-3.5 h-3.5" />} label={calling ? 'Calling...' : 'Call'} color="#10b981" bg="#ecfdf5" border="#a7f3d0" onClick={handleCall} active={calling} />
          <QuickPill icon={<MessageSquare className="w-3.5 h-3.5" />} label="Message" color="#6366f1" bg="#ede9fe" border="#ddd6fe" onClick={() => setMsgModal(true)} />
          <QuickPill icon={buzzer ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            label={buzzer ? 'Stop' : 'Buzzer'} color={buzzer ? '#ef4444' : '#f97316'} bg={buzzer ? '#fef2f2' : C.light} border={buzzer ? '#fecaca' : C.border}
            onClick={handleBuzzer} active={buzzer} pulse={buzzer} />

          <div className="w-px h-6 mx-1" style={{ background: C.border }} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
              style={{ background: C.grad }}>{(user.name || 'C')[0].toUpperCase()}</div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold" style={{ color: '#1f2937' }}>{user.name}</div>
              <div className="text-[10px]" style={{ color: '#9ca3af' }}>{user.piIds?.[0]}</div>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-xl transition-all hover:bg-orange-50" style={{ color: '#9ca3af' }}>
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main grid */}
      <main className="flex-1 overflow-hidden p-4 grid gap-4 min-h-0"
        style={{ gridTemplateRows: 'auto 1fr' }}>

        {/* Stat row */}
        <div className="grid grid-cols-5 gap-3">
          <BigStatCard label="Status" icon={isWarn ? <AlertTriangle /> : <CheckCircle />} iconColor={isWarn ? '#f97316' : '#10b981'}
            value={data?.status || '—'} valueColor={isWarn ? '#c2410c' : '#065f46'} bg={isWarn ? '#fff7ed' : '#ecfdf5'} border={isWarn ? '#fed7aa' : '#a7f3d0'}
            sub={isWarn ? `${data?.object} ${data?.direction}` : 'All clear'} />
          <BigStatCard label="Detected" icon={<Eye />} iconColor={C.primary}
            value={data?.object !== 'none' ? data?.object : 'Nothing'} valueColor={C.dark} bg={C.light} border={C.border}
            sub={`${data?.confidence ?? 0}% conf · ${data?.direction ?? '—'}`} />
          <BigStatCard label="Distance" icon={<Navigation />} iconColor={C.primary}
            value={data?.distance || '—'} valueColor={C.dark} bg={C.light} border={C.border}
            sub={`${data?.processing_speed ?? 0} FPS`} />
          <BigStatCard label="Audio Guidance" icon={<Headphones />} iconColor="#8b5cf6"
            value={data?.audio_message || '—'} valueColor="#6d28d9" bg="#f5f3ff" border="#ddd6fe"
            sub={`Last: ${data?.timestamp || '—'}`} small />
          <BigStatCard label="Battery" icon={<Battery />} iconColor={data?.battery > 30 ? '#10b981' : '#ef4444'}
            value={<BattBar pct={data?.battery ?? 0} />} valueColor="#1f2937" bg="white" border="#e5e7eb"
            sub={`${data?.battery ?? 0}% · ${data?.source === 'live' ? 'Live' : 'Simulated'}`} />
        </div>

        {/* Bottom panels */}
        <div className="grid gap-4 min-h-0" style={{ gridTemplateColumns: '1.1fr 1fr 1fr', gridTemplateRows: '1fr' }}>

          {/* Map */}
          <Panel label="Live Location" icon={<MapPin className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
            <MapView accentColor={C.primary} />
          </Panel>

          {/* Charts */}
          <Panel label="Detection Analytics" icon={<BarChart2 className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
            <div className="h-full flex flex-col gap-3 min-h-0">
              <MiniChart label="Detections & Alerts" data={history} bars={[
                { key: 'det', color: C.primary, name: 'Detections' },
                { key: 'alert', color: '#ef4444', name: 'Alerts' },
              ]} />
              <MiniChart label="Distance (m)" data={history} area={{ key: 'dist', color: C.primary }} />
            </div>
          </Panel>

          {/* Logs + controls */}
          <Panel label="Activity Log" icon={<Clock className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
            <div className="h-full flex flex-col min-h-0 gap-2">
              <div className="text-xs font-semibold mb-1" style={{ color: C.dark, fontFamily: "'Nunito',sans-serif" }}>
                {logs.length} events recorded
              </div>
              <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
                {logs.map((l, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-xl text-xs"
                    style={{ background: i === 0 ? C.light : 'white', border: `1px solid ${i === 0 ? C.border : '#f3f4f6'}` }}>
                    <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                      style={{ background: l.type === 'alert' ? '#ef4444' : l.type === 'warning' ? '#f97316' : '#10b981' }} />
                    <span style={{ color: '#9ca3af', flexShrink: 0 }}>{l.time}</span>
                    <span style={{ color: '#374151' }}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>
        </div>
      </main>

      {/* Voice message modal */}
      <AnimatePresence>
        {msgModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setMsgModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md rounded-3xl p-6 bg-white shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: C.light }}>
                  <Headphones className="w-5 h-5" style={{ color: C.primary }} />
                </div>
                <div>
                  <div className="font-bold" style={{ fontFamily: "'Nunito',sans-serif", color: '#1f2937' }}>Send Voice Message</div>
                  <div className="text-xs" style={{ color: '#9ca3af' }}>Will be spoken through user's headphones</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {['Turn left', 'Turn right', 'Stop', 'Come back', 'Call me'].map(q => (
                  <button key={q} onClick={() => setMsgText(q)}
                    className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background: C.light, color: C.dark, border: `1px solid ${C.border}` }}>
                    {q}
                  </button>
                ))}
              </div>
              <textarea value={msgText} onChange={e => setMsgText(e.target.value)}
                placeholder="Type a custom message..."
                className="w-full p-3 rounded-xl text-sm outline-none resize-none mb-4"
                style={{ border: `1.5px solid ${C.border}`, minHeight: 80, fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
              <div className="flex gap-3">
                <button onClick={() => setMsgModal(false)} className="flex-1 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#6b7280', fontFamily: "'Nunito',sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleSendMsg} className="flex-[2] py-2.5 rounded-xl font-bold text-sm text-white"
                  style={{ background: C.grad, fontFamily: "'Nunito',sans-serif" }}>
                  Send to Headphones
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed bottom-5 right-5 z-50 space-y-2">
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div key={t.id} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }}
              className="px-4 py-3 rounded-2xl text-sm font-medium shadow-lg"
              style={{ background: 'white', border: `1.5px solid ${C.border}`, color: '#1f2937', fontFamily: "'Plus Jakarta Sans',sans-serif", minWidth: 220 }}>
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Shared mini-components ────────────────────────────────────────────────────

export function Loader() {
  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7ff' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e0e0ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export function Panel({ label, icon, color, border, bg, children }) {
  return (
    <div className="rounded-3xl flex flex-col overflow-hidden min-h-0"
      style={{ background: 'white', border: `1.5px solid ${border}`, boxShadow: `0 4px 20px ${color}10` }}>
      <div className="flex items-center gap-2 px-4 py-3 flex-shrink-0" style={{ background: bg, borderBottom: `1px solid ${border}` }}>
        <span style={{ color }}>{icon}</span>
        <span className="text-xs font-bold uppercase tracking-wider" style={{ color, fontFamily: "'Nunito',sans-serif" }}>{label}</span>
      </div>
      <div className="flex-1 p-4 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
}

export function BigStatCard({ label, icon, iconColor, value, valueColor, bg, border, sub, small }) {
  return (
    <div className="rounded-2xl p-4" style={{ background: 'white', border: `1.5px solid ${border}`, boxShadow: `0 2px 12px ${iconColor}10` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>{label}</span>
        <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: bg }}>
          <span style={{ color: iconColor }}>{icon}</span>
        </div>
      </div>
      <div className={`font-bold capitalize leading-snug mb-1 ${small ? 'text-xs' : 'text-base'}`}
        style={{ color: valueColor, fontFamily: "'Nunito',sans-serif" }}>{value}</div>
      <div className="text-[11px]" style={{ color: '#9ca3af' }}>{sub}</div>
    </div>
  );
}

export function BattBar({ pct }) {
  const c = pct > 50 ? '#10b981' : pct > 20 ? '#f59e0b' : '#ef4444';
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 h-2.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
        <div style={{ width: `${pct}%`, background: c, height: '100%', borderRadius: 9999, transition: 'width 0.7s' }} />
      </div>
    </div>
  );
}

export function QuickPill({ icon, label, color, bg, border, onClick, active, pulse }) {
  return (
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
      style={{ background: bg, border: `1.5px solid ${border}`, color, fontFamily: "'Nunito',sans-serif",
        boxShadow: pulse ? `0 0 0 4px ${color}30` : 'none', animation: pulse ? 'quickPulse 1s ease-in-out infinite' : 'none' }}>
      {icon} {label}
      <style>{`@keyframes quickPulse{0%,100%{box-shadow:0 0 0 0 ${color}40}50%{box-shadow:0 0 0 6px ${color}00}}`}</style>
    </motion.button>
  );
}

export function MiniChart({ label, data, bars, area }) {
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 flex-shrink-0"
        style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>{label}</p>
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {bars ? (
            <BarChart data={data} margin={{ top: 2, right: 2, left: -26, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="t" tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 11 }} />
              {bars.map(b => <Bar key={b.key} dataKey={b.key} name={b.name} fill={b.color} opacity={0.8} radius={[3,3,0,0]} />)}
            </BarChart>
          ) : (
            <AreaChart data={data} margin={{ top: 2, right: 2, left: -26, bottom: 0 }}>
              <defs>
                <linearGradient id={`ag_${area.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={area.color} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={area.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="t" tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} unit="m" />
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 11 }} />
              <Area type="monotone" dataKey={area.key} stroke={area.color} strokeWidth={2.5} fill={`url(#ag_${area.key})`} dot={false} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}