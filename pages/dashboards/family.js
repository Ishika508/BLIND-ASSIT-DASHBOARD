// pages/dashboards/family.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  LogOut, Heart, Phone, MessageSquare, Bell, BellOff,
  CheckCircle, AlertTriangle, Headphones, MapPin,
  Clock, Battery, Wifi, WifiOff, Activity, Eye,
  Send, Smile
} from 'lucide-react';
import { getSession, clearSession } from '../../utils/auth';
import { fetchPiData, ts, emptyHistory, distNum } from '../../utils/piData';
import { Panel, BigStatCard, BattBar, QuickPill, MiniChart, Loader } from './caretaker';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MapView = dynamic(() => import('../../components/dashboards/MapView'), { ssr: false });

const C = {
  primary: '#ec4899', dark: '#9d174d', light: '#fdf2f8',
  border: '#fbcfe8', mid: '#f472b6', grad: 'linear-gradient(135deg,#ec4899,#f472b6)',
};

const QUICK_MESSAGES = [
  'Are you okay?', 'Come home soon', 'Be careful',
  'Call me when free', 'I am nearby', 'Stop and wait', 'Turn back',
];

export default function FamilyDashboard() {
  const router = useRouter();
  const [user, setUser]       = useState(null);
  const [data, setData]       = useState(null);
  const [logs, setLogs]       = useState([{ type:'info', msg:'Monitoring started', time: ts() }]);
  const [history, setHistory] = useState(emptyHistory());
  const [buzzer, setBuzzer]   = useState(false);
  const [calling, setCalling] = useState(false);
  const [msgModal, setMsgModal] = useState(false);
  const [sentMsg, setSentMsg] = useState(null);
  const [toasts, setToasts]   = useState([]);
  const [mounted, setMounted] = useState(false);
  const [safeStreak, setSafeStreak] = useState(0);

  useEffect(() => {
    setMounted(true);
    const s = getSession();
    if (!s || s.role !== 'Family Member') { router.replace('/'); return; }
    setUser(s);
  }, []);

  const toast = (msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const addLog = useCallback((type, msg) => {
    setLogs(p => [{ type, msg, time: ts() }, ...p].slice(0, 50));
  }, []);

  const poll = useCallback(async () => {
    const d = await fetchPiData();
    setData(d);
    setHistory(p => [...p.slice(-22), { t: d.timestamp, det: d.object !== 'none' ? 1 : 0, dist: distNum(d.distance) }]);
    if (d.object !== 'none') addLog(d.status === 'WARNING' ? 'warning' : 'info', `${d.object} detected ${d.direction}`);
    if (d.status === 'SAFE') setSafeStreak(p => p + 1);
    else setSafeStreak(0);
  }, [addLog]);

  useEffect(() => {
    if (!mounted) return;
    poll(); const t = setInterval(poll, 2000); return () => clearInterval(t);
  }, [poll, mounted]);

  const isWarn = data?.status === 'WARNING';
  const logout = () => { clearSession(); router.replace('/'); };

  if (!mounted || !user) return <Loader />;

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg, #fdf2f8 0%, #fff 60%)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Warning banner */}
      <AnimatePresence>
        {isWarn && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden flex-shrink-0"
            style={{ background: C.grad, color: 'white' }}>
            <div className="flex items-center justify-center gap-3 py-2.5 text-sm font-bold" style={{ fontFamily: "'Nunito',sans-serif" }}>
              <Heart className="w-4 h-4 animate-pulse" />
              Your loved one needs attention — {data?.object} detected {data?.direction}
              <Heart className="w-4 h-4 animate-pulse" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Topbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 h-[62px]"
        style={{ background: 'white', borderBottom: `2px solid ${C.border}`, boxShadow: '0 2px 8px rgba(236,72,153,0.07)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.grad }}>
            <Heart className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: C.dark, fontFamily: "'Nunito',sans-serif" }}>Family Monitor</div>
            <div className="text-[11px]" style={{ color: C.primary }}>
              {isWarn ? 'Attention needed!' : safeStreak > 5 ? `Safe for ${safeStreak * 2}s` : 'Monitoring...'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <QuickPill icon={<Phone className="w-3.5 h-3.5" />} label={calling ? 'Calling...' : 'Call'}
            color="#10b981" bg="#ecfdf5" border="#a7f3d0"
            onClick={() => { setCalling(true); toast('Calling your loved one...'); setTimeout(() => setCalling(false), 6000); }} active={calling} />
          <QuickPill icon={<MessageSquare className="w-3.5 h-3.5" />} label="Send Message"
            color={C.primary} bg={C.light} border={C.border} onClick={() => setMsgModal(true)} />
          <QuickPill icon={buzzer ? <BellOff className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
            label={buzzer ? 'Stop Alert' : 'Alert'} color={buzzer ? '#ef4444' : C.primary}
            bg={buzzer ? '#fef2f2' : C.light} border={buzzer ? '#fecaca' : C.border}
            onClick={() => { setBuzzer(!buzzer); addLog(!buzzer ? 'alert' : 'info', !buzzer ? 'Alert sent' : 'Alert stopped'); toast(!buzzer ? 'Alert sent to device!' : 'Alert stopped'); }}
            active={buzzer} pulse={buzzer} />
          <div className="w-px h-6 mx-1" style={{ background: C.border }} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: C.grad }}>
              {(user.name || 'F')[0].toUpperCase()}
            </div>
            <span className="text-xs font-semibold hidden sm:block" style={{ color: '#374151' }}>{user.name}</span>
          </div>
          <button onClick={logout} className="p-2 rounded-xl hover:bg-pink-50 transition-all" style={{ color: '#9ca3af' }}><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden p-4 grid gap-4 min-h-0" style={{ gridTemplateRows: 'auto 1fr' }}>

        {/* Stat row */}
        <div className="grid grid-cols-5 gap-3">
          {/* Big safety status */}
          <div className="col-span-2 rounded-2xl p-5 flex items-center gap-4"
            style={{ background: isWarn ? '#fff1f2' : '#ecfdf5', border: `2px solid ${isWarn ? '#fecdd3' : '#a7f3d0'}` }}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: isWarn ? '#fee2e2' : '#d1fae5' }}>
              {isWarn
                ? <AlertTriangle className="w-7 h-7" style={{ color: '#ef4444' }} />
                : <CheckCircle className="w-7 h-7" style={{ color: '#10b981' }} />}
            </div>
            <div>
              <div className="text-xl font-black" style={{ fontFamily: "'Nunito',sans-serif", color: isWarn ? '#b91c1c' : '#065f46' }}>
                {isWarn ? 'Needs Attention' : 'Safe & Clear'}
              </div>
              <div className="text-sm mt-0.5" style={{ color: isWarn ? '#ef4444' : '#10b981' }}>
                {isWarn ? `${data?.object} ${data?.direction} · ${data?.distance}` : `Path is clear · ${safeStreak > 0 ? `${safeStreak} safe readings` : 'Monitoring'}`}
              </div>
            </div>
          </div>
          <BigStatCard label="Hearing Now" icon={<Headphones />} iconColor="#8b5cf6"
            value={data?.audio_message || '—'} valueColor="#6d28d9" bg="#f5f3ff" border="#ddd6fe" sub={`Last: ${data?.timestamp || '—'}`} small />
          <BigStatCard label="Detected Object" icon={<Eye />} iconColor={C.primary}
            value={data?.object !== 'none' ? data?.object : 'Nothing'} valueColor={C.dark} bg={C.light} border={C.border}
            sub={`Direction: ${data?.direction ?? '—'}`} />
          <BigStatCard label="Battery" icon={<Battery />} iconColor={data?.battery > 30 ? '#10b981' : '#ef4444'}
            value={<BattBar pct={data?.battery ?? 0} />} valueColor="#1f2937" bg="white" border="#e5e7eb"
            sub={`${data?.battery ?? 0}% remaining`} />
        </div>

        {/* Panels */}
        <div className="grid gap-4 min-h-0" style={{ gridTemplateColumns: '1.2fr 1fr 0.9fr', gridTemplateRows: '1fr' }}>

          {/* Map */}
          <Panel label="Live Location" icon={<MapPin className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
            <MapView accentColor={C.primary} />
          </Panel>

          {/* Last sent message + quick messages */}
          <Panel label="Messages to Device" icon={<MessageSquare className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
            <div className="h-full flex flex-col gap-3 min-h-0">
              {sentMsg && (
                <div className="p-3 rounded-2xl flex items-center gap-2"
                  style={{ background: C.light, border: `1px solid ${C.border}` }}>
                  <Send className="w-4 h-4 flex-shrink-0" style={{ color: C.primary }} />
                  <div>
                    <div className="text-xs font-bold" style={{ color: C.dark }}>Last sent</div>
                    <div className="text-sm" style={{ color: '#374151' }}>{sentMsg}</div>
                  </div>
                </div>
              )}
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>Quick send</p>
              <div className="flex flex-wrap gap-2 overflow-y-auto">
                {QUICK_MESSAGES.map(q => (
                  <button key={q} onClick={() => {
                    setSentMsg(q); addLog('info', `Sent: "${q}"`); toast(`"${q}" sent to headphones`);
                  }}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:scale-105 active:scale-95"
                    style={{ background: C.light, color: C.dark, border: `1px solid ${C.border}` }}>
                    {q}
                  </button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto min-h-0 space-y-1 mt-1">
                <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>Message log</p>
                {logs.filter(l => l.msg.startsWith('Sent:')).map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs p-2 rounded-lg" style={{ background: '#fdf2f8' }}>
                    <span style={{ color: '#9ca3af' }}>{l.time}</span>
                    <span style={{ color: '#374151' }}>{l.msg}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Activity */}
          <Panel label="Activity Log" icon={<Clock className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
            <div className="h-full overflow-y-auto space-y-1.5 min-h-0">
              {logs.map((l, i) => (
                <div key={i} className="flex items-start gap-2 p-2 rounded-xl text-xs"
                  style={{ background: i === 0 ? C.light : 'white', border: `1px solid ${i === 0 ? C.border : '#f3f4f6'}` }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                    style={{ background: l.type === 'alert' ? '#ef4444' : l.type === 'warning' ? C.primary : '#10b981' }} />
                  <span style={{ color: '#9ca3af', flexShrink: 0 }}>{l.time}</span>
                  <span style={{ color: '#374151' }}>{l.msg}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </main>

      {/* Message modal */}
      <AnimatePresence>
        {msgModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
            onClick={e => e.target === e.currentTarget && setMsgModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-sm rounded-3xl p-6 bg-white shadow-2xl">
              <div className="font-bold text-lg mb-4" style={{ fontFamily: "'Nunito',sans-serif", color: '#1f2937' }}>
                Custom Message
              </div>
              <textarea placeholder="Write your message..." value={sentMsg || ''}
                onChange={e => setSentMsg(e.target.value)}
                className="w-full p-3 rounded-xl text-sm outline-none resize-none mb-4"
                style={{ border: `1.5px solid ${C.border}`, minHeight: 90, fontFamily: "'Plus Jakarta Sans',sans-serif" }} />
              <button onClick={() => { addLog('info', `Sent: "${sentMsg}"`); toast(`"${sentMsg}" sent!`); setMsgModal(false); }}
                className="w-full py-3 rounded-xl font-bold text-sm text-white"
                style={{ background: C.grad, fontFamily: "'Nunito',sans-serif" }}>
                Send to Headphones
              </button>
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
              style={{ background: 'white', border: `1.5px solid ${C.border}`, color: '#1f2937', fontFamily: "'Plus Jakarta Sans',sans-serif", minWidth: 200 }}>
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}