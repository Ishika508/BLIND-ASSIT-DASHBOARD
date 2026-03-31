// pages/dashboards/hospital.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import {
  LogOut, Building2, Users, Activity, Eye, Headphones,
  AlertTriangle, CheckCircle, Clock, MapPin,
  Phone, Bell, BellOff, FileText, TrendingUp, BarChart2,
  ChevronRight, Download, RefreshCw
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { getSession, clearSession } from '../../utils/auth';
import { fetchPiData, ts, emptyHistory, distNum, MOCK_PATIENTS } from '../../utils/piData';
import { Panel, BigStatCard, QuickPill, MiniChart, Loader } from './caretaker';

const MapView = dynamic(() => import('../../components/dashboards/MapView'), { ssr: false });

const C = {
  primary: '#3b82f6', dark: '#1d4ed8', light: '#eff6ff',
  border: '#bfdbfe', mid: '#60a5fa', grad: 'linear-gradient(135deg,#3b82f6,#60a5fa)',
};

export default function HospitalDashboard() {
  const router = useRouter();
  const [user, setUser]           = useState(null);
  const [data, setData]           = useState(null);
  const [history, setHistory]     = useState(emptyHistory());
  const [logs, setLogs]           = useState([{ type:'info', msg:'Clinical monitoring active', time: ts() }]);
  const [patients, setPatients]   = useState(MOCK_PATIENTS);
  const [activePatient, setActivePatient] = useState(MOCK_PATIENTS[0]);
  const [buzzer, setBuzzer]       = useState(false);
  const [toasts, setToasts]       = useState([]);
  const [mounted, setMounted]     = useState(false);
  const [reportModal, setReportModal] = useState(false);

  useEffect(() => {
    setMounted(true);
    const s = getSession();
    if (!s || s.role !== 'Hospital Staff') { router.replace('/'); return; }
    setUser(s);
  }, []);

  const toast = (msg, type = 'info') => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const addLog = useCallback((type, msg) => {
    setLogs(p => [{ type, msg, time: ts() }, ...p].slice(0, 60));
  }, []);

  const poll = useCallback(async () => {
    const d = await fetchPiData();
    const hasObject = !!d?.object && d.object !== 'none';
    setData(d);
    setHistory(p => [...p.slice(-22), { t: d.timestamp, det: hasObject ? 1 : 0, alert: d.status === 'WARNING' ? 1 : 0, dist: distNum(d.distance) }]);
    if (hasObject) addLog(d.status === 'WARNING' ? 'warning' : 'info', `[${activePatient?.name}] ${d.object} ${d.direction || '--'} — ${d.distance ?? '--'}`);
    // Simulate random patient status changes
    if (Math.random() > 0.85) {
      setPatients(prev => prev.map(p =>
        p.id === activePatient?.id ? { ...p, status: d.status } : p
      ));
    }
  }, [addLog, activePatient]);

  useEffect(() => {
    if (!mounted) return;
    poll(); const t = setInterval(poll, 2000); return () => clearInterval(t);
  }, [poll, mounted]);

  const logout = () => { clearSession(); router.replace('/'); };
  const isWarn = data?.status === 'WARNING';
  const connected = data?.connected === true;
  const hasObject = !!data?.object && data.object !== 'none';
  const objectText = hasObject ? data.object : 'No Data';
  const warningPatients = patients.filter(p => p.status === 'WARNING').length;

  if (!mounted || !user) return <Loader />;

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: '#f0f7ff', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Topbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 h-[62px]"
        style={{ background: 'white', borderBottom: `2px solid ${C.border}`, boxShadow: '0 2px 8px rgba(59,130,246,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.grad }}>
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: C.dark, fontFamily: "'Nunito',sans-serif" }}>Hospital Clinical Dashboard</div>
            <div className="text-[11px]" style={{ color: C.primary }}>
              {connected
                ? warningPatients > 0
                  ? `🟢 LIVE · ${warningPatients} patient${warningPatients > 1 ? 's' : ''} need attention`
                  : '🟢 LIVE · All patients monitored'
                : '🔴 Hardware Not Connected'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {warningPatients > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold animate-pulse"
              style={{ background: '#fef2f2', border: '1.5px solid #fecaca', color: '#dc2626', fontFamily: "'Nunito',sans-serif" }}>
              <AlertTriangle className="w-3.5 h-3.5" /> {warningPatients} Alert{warningPatients > 1 ? 's' : ''}
            </div>
          )}
          <QuickPill icon={<FileText className="w-3.5 h-3.5" />} label="Report" color={C.primary} bg={C.light} border={C.border}
            onClick={() => setReportModal(true)} />
          <QuickPill icon={<Bell className="w-3.5 h-3.5" />} label="Alert Ward" color="#f97316" bg="#fff7ed" border="#fed7aa"
            onClick={() => { toast('Ward alert sent to nursing station', 'success'); addLog('alert', 'Ward-wide alert triggered'); }} />
          <div className="w-px h-6 mx-1" style={{ background: C.border }} />
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: C.grad }}>
              {(user.name || 'H')[0].toUpperCase()}
            </div>
            <div className="hidden sm:block">
              <div className="text-xs font-semibold" style={{ color: '#1f2937' }}>{user.name}</div>
              <div className="text-[10px]" style={{ color: '#9ca3af' }}>Staff ID · {user.phone}</div>
            </div>
          </div>
          <button onClick={logout} className="p-2 rounded-xl hover:bg-blue-50 transition-all" style={{ color: '#9ca3af' }}><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 overflow-hidden p-4 grid gap-4 min-h-0" style={{ gridTemplateColumns: '260px 1fr', gridTemplateRows: '1fr' }}>

        {/* LEFT — Patient list */}
        <div className="flex flex-col gap-3 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>
              Patients ({patients.length})
            </span>
            <button className="text-xs font-semibold" style={{ color: C.primary }} onClick={() => addLog('info', 'Patient list refreshed')}>
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
            {patients.map(p => {
              const sel = activePatient?.id === p.id;
              return (
                <button key={p.id} onClick={() => { setActivePatient(p); addLog('info', `Switched to patient: ${p.name}`); }}
                  className="w-full rounded-2xl p-3.5 text-left transition-all"
                  style={{
                    background: sel ? C.light : 'white',
                    border: `1.5px solid ${sel ? C.primary : '#e5e7eb'}`,
                    boxShadow: sel ? `0 0 0 3px ${C.primary}15` : 'none',
                  }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold" style={{ color: '#1f2937', fontFamily: "'Nunito',sans-serif" }}>{p.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === 'WARNING' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50'}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="text-[11px] space-y-0.5" style={{ color: '#6b7280' }}>
                    <div>{p.ward} · {p.piId}</div>
                    <div className="flex items-center justify-between">
                      <span>Battery: {p.battery}%</span>
                      <span>{p.lastSeen}</span>
                    </div>
                  </div>
                  {sel && (
                    <div className="mt-2 pt-2 border-t flex gap-2" style={{ borderColor: C.border }}>
                      <button onClick={e => { e.stopPropagation(); toast(`Calling ${p.name}...`); addLog('info', `Called ${p.name}`); }}
                        className="flex-1 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
                        style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0' }}>
                        <Phone className="w-3 h-3" /> Call
                      </button>
                      <button onClick={e => { e.stopPropagation(); toast(`Alert sent to ${p.name}`); addLog('alert', `Alert triggered for ${p.name}`); }}
                        className="flex-1 py-1 rounded-lg text-[11px] font-semibold flex items-center justify-center gap-1"
                        style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca' }}>
                        <Bell className="w-3 h-3" /> Alert
                      </button>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT — Detail panels */}
        <div className="flex flex-col gap-4 min-h-0">

          {/* Stat row for active patient */}
          <div className="grid grid-cols-3 gap-3 flex-shrink-0">
            <BigStatCard label="Patient Status" icon={isWarn ? <AlertTriangle /> : <CheckCircle />}
              iconColor={isWarn ? '#ef4444' : '#10b981'} value={data?.status || '—'}
              valueColor={isWarn ? '#b91c1c' : '#065f46'} bg={isWarn ? '#fef2f2' : '#ecfdf5'} border={isWarn ? '#fecaca' : '#a7f3d0'}
              sub={`Patient: ${activePatient?.name}`} />
            <BigStatCard label="Detection" icon={<Eye />} iconColor={C.primary}
              value={objectText} valueColor={C.dark} bg={C.light} border={C.border}
              sub={`${data?.direction ?? '—'} · ${data?.confidence ?? 0}%`} />
            <BigStatCard label="Audio (Headphones)" icon={<Headphones />} iconColor="#8b5cf6"
              value={data?.audio_message || '—'} valueColor="#6d28d9" bg="#f5f3ff" border="#ddd6fe"
              sub={data?.timestamp || '—'} small />
          </div>

          {/* Panels row */}
          <div className="flex-1 grid gap-4 min-h-0" style={{ gridTemplateColumns: data?.gps ? '1fr 1fr 1fr' : '1fr 1fr', gridTemplateRows: '1fr' }}>

            {data?.gps && (
              <Panel label={`${activePatient?.name} — Location`} icon={<MapPin className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                <MapView accentColor={C.primary} gps={data.gps} />
              </Panel>
            )}

            <Panel label="Detection Analytics" icon={<BarChart2 className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
              <div className="h-full flex flex-col gap-3 min-h-0">
                <MiniChart label="Detections & Alerts" data={history}
                  bars={[{ key: 'det', color: C.primary, name: 'Detections' }, { key: 'alert', color: '#ef4444', name: 'Alerts' }]} />
                <MiniChart label="Distance (m)" data={history} area={{ key: 'dist', color: C.primary }} />
              </div>
            </Panel>

            <Panel label="Clinical Activity Log" icon={<FileText className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
              <div className="h-full overflow-y-auto space-y-1.5 min-h-0">
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
            </Panel>
          </div>
        </div>
      </main>

      {/* Report modal */}
      <AnimatePresence>
        {reportModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
            style={{ background: 'rgba(15,23,42,0.62)', backdropFilter: 'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && setReportModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              className="relative z-[2001] w-full max-w-md rounded-3xl p-6 bg-white shadow-2xl"
              style={{ border: '1px solid #e5e7eb' }}>
              <div className="font-bold text-xl mb-2" style={{ color: '#111827', fontFamily: "'Nunito',sans-serif" }}>Clinical Report</div>
              <div className="text-sm mb-4" style={{ color: '#4b5563' }}>Patient: {activePatient?.name} · {activePatient?.ward}</div>
              <div className="space-y-3 mb-5">
                {[
                  { label: 'Total detections (session)', value: history.filter(h => h.det > 0).length },
                  { label: 'Total alerts (session)', value: history.filter(h => h.alert > 0).length },
                  { label: 'Average distance (m)', value: (history.reduce((a, b) => a + b.dist, 0) / history.length).toFixed(1) },
                  { label: 'Device battery', value: `${data?.battery ?? 0}%` },
                  { label: 'Pi processing speed', value: `${data?.processing_speed ?? 0} FPS` },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2 border-b" style={{ borderColor: '#f3f4f6' }}>
                    <span className="text-sm" style={{ color: '#6b7280' }}>{r.label}</span>
                    <span className="text-sm font-bold" style={{ color: '#1f2937', fontFamily: "'Nunito',sans-serif" }}>{r.value}</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setReportModal(false)} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                  style={{ background: '#f9fafb', border: '1.5px solid #e5e7eb', color: '#6b7280', fontFamily: "'Nunito',sans-serif" }}>Close</button>
                <button onClick={() => { toast('Report exported as PDF'); setReportModal(false); }}
                  className="flex-[2] py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
                  style={{ background: C.grad, fontFamily: "'Nunito',sans-serif" }}>
                  <Download className="w-4 h-4" /> Export Report
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      {!reportModal && (
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
      )}
    </div>
  );
}