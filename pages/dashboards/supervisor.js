// pages/dashboards/supervisor.js
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LogOut, Monitor, Wifi, WifiOff, AlertTriangle, CheckCircle,
  Battery, Activity, Eye, Users, Cpu, BarChart2,
  RefreshCw, Shield, ShieldCheck, Heart, Building2, Clock,
  TrendingUp, Server, Globe, Bell, Settings, Zap
} from 'lucide-react';
import { AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { getSession, clearSession, ROLES, ROLE_CONFIG } from '../../utils/auth';
import { fetchPiData, ts, emptyHistory, distNum, MOCK_DEVICES } from '../../utils/piData';
import { Panel, BigStatCard, BattBar, QuickPill, MiniChart, Loader } from './caretaker';

const C = {
  primary: '#8b5cf6', dark: '#5b21b6', light: '#f5f3ff',
  border: '#ddd6fe', mid: '#a78bfa', grad: 'linear-gradient(135deg,#8b5cf6,#a78bfa)',
};

const ROLE_ICONS_MAP = {
  'Personal Caretaker': <ShieldCheck className="w-4 h-4" />,
  'Family Member':      <Heart className="w-4 h-4" />,
  'Hospital Staff':     <Building2 className="w-4 h-4" />,
  'IT Supervisor':      <Monitor className="w-4 h-4" />,
};

const PREVIEW_ROUTES = {
  'Personal Caretaker': '/dashboards/caretaker',
  'Family Member':      '/dashboards/family',
  'Hospital Staff':     '/dashboards/hospital',
};

export default function SupervisorDashboard() {
  const router = useRouter();
  const [user, setUser]             = useState(null);
  const [data, setData]             = useState(null);
  const [history, setHistory]       = useState(emptyHistory());
  const [logs, setLogs]             = useState([{ type:'info', msg:'Supervisor session started', time: ts() }]);
  const [devices, setDevices]       = useState(MOCK_DEVICES);
  const [activeDevice, setActiveDevice] = useState(MOCK_DEVICES[0]);
  const [previewRole, setPreviewRole] = useState(null);
  const [toasts, setToasts]         = useState([]);
  const [mounted, setMounted]       = useState(false);
  const [activeTab, setActiveTab]   = useState('devices'); // devices | analytics | system

  useEffect(() => {
    setMounted(true);
    const s = getSession();
    if (!s || s.role !== 'IT Supervisor') { router.replace('/'); return; }
    setUser(s);
  }, []);

  const toast = (msg) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3000);
  };

  const addLog = useCallback((type, msg) => {
    setLogs(p => [{ type, msg, time: ts() }, ...p].slice(0, 80));
  }, []);

  const poll = useCallback(async () => {
    const d = await fetchPiData();
    const hasObject = !!d?.object && d.object !== 'none';
    setData(d);
    setHistory(p => [...p.slice(-22), { t: d.timestamp, det: hasObject ? 1 : 0, alert: d.status === 'WARNING' ? 1 : 0, dist: distNum(d.distance), fps: d.processing_speed || 0 }]);
    // Simulate device status fluctuation
    if (Math.random() > 0.9) {
      setDevices(prev => prev.map(dv =>
        dv.piId === activeDevice?.piId
          ? { ...dv, status: d.connected === false ? 'offline' : d.status === 'WARNING' ? 'warning' : 'online', battery: d.battery ?? dv.battery }
          : dv
      ));
    }
    if (hasObject) addLog(d.status === 'WARNING' ? 'warning' : 'info', `[${activeDevice?.piId}] ${d.object} ${d.direction || '--'} — ${d.distance ?? '--'}`);
  }, [addLog, activeDevice]);

  useEffect(() => {
    if (!mounted) return;
    poll(); const t = setInterval(poll, 2000); return () => clearInterval(t);
  }, [poll, mounted]);

  const logout = () => { clearSession(); router.replace('/'); };

  const onlineCount  = devices.filter(d => d.status !== 'offline').length;
  const warningCount = devices.filter(d => d.status === 'warning').length;
  const offlineCount = devices.filter(d => d.status === 'offline').length;
  const connected = data?.connected === true;
  const hasObject = !!data?.object && data.object !== 'none';
  const objectText = hasObject ? data.object : 'No Data';

  const pieData = [
    { name: 'Online',  value: onlineCount - warningCount, color: '#10b981' },
    { name: 'Warning', value: warningCount, color: '#f97316' },
    { name: 'Offline', value: offlineCount, color: '#e5e7eb' },
  ];

  if (!mounted || !user) return <Loader />;

  return (
    <div className="h-screen flex flex-col overflow-hidden"
      style={{ background: 'linear-gradient(160deg,#f5f3ff 0%,#faf5ff 100%)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>

      {/* Topbar */}
      <header className="flex-shrink-0 flex items-center justify-between px-5 h-[62px]"
        style={{ background: 'white', borderBottom: `2px solid ${C.border}`, boxShadow: '0 2px 8px rgba(139,92,246,0.08)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: C.grad }}>
            <Monitor className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm" style={{ color: C.dark, fontFamily: "'Nunito',sans-serif" }}>IT Supervisor Console</div>
            <div className="text-[11px]" style={{ color: C.primary }}>
              {connected
                ? `🟢 LIVE · ${onlineCount}/${devices.length} devices online · ${warningCount} alert${warningCount !== 1 ? 's' : ''}`
                : '🔴 Hardware Not Connected'}
            </div>
          </div>
        </div>

        {/* Role preview switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>
            Preview as:
          </span>
          {Object.values(ROLES).filter(r => r !== 'IT Supervisor').map(role => {
            const rc = ROLE_CONFIG[role];
            return (
              <button key={role}
                onClick={() => {
                  // Open in a new tab so supervisor doesn't lose their session
                  const tempUser = { ...user, role, piIds: [activeDevice?.piId || 'BLIND-AA01'] };
                  sessionStorage.setItem('ba_preview', JSON.stringify(tempUser));
                  window.open(PREVIEW_ROUTES[role] + '?preview=1', '_blank');
                  toast(`Opening ${role} view in new tab`);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:scale-105"
                style={{ background: rc.bg, border: `1.5px solid ${rc.border}`, color: rc.dark, fontFamily: "'Nunito',sans-serif" }}>
                <span style={{ color: rc.color }}>{ROLE_ICONS_MAP[role]}</span>
                {role.split(' ')[0]}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: C.grad }}>
            {(user.name || 'S')[0].toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-semibold" style={{ color: '#1f2937' }}>{user.name}</div>
            <div className="text-[10px]" style={{ color: '#9ca3af' }}>Supervisor</div>
          </div>
          <button onClick={logout} className="p-2 rounded-xl hover:bg-purple-50 transition-all" style={{ color: '#9ca3af' }}><LogOut className="w-4 h-4" /></button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex-shrink-0 flex items-center gap-1 px-5 pt-3">
        {[
          { id: 'devices',   label: 'All Devices',   icon: <Server className="w-3.5 h-3.5" /> },
          { id: 'analytics', label: 'Analytics',     icon: <BarChart2 className="w-3.5 h-3.5" /> },
          { id: 'system',    label: 'System Health', icon: <Cpu className="w-3.5 h-3.5" /> },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all"
            style={{
              background: activeTab === tab.id ? C.light : 'transparent',
              color: activeTab === tab.id ? C.dark : '#9ca3af',
              border: activeTab === tab.id ? `1.5px solid ${C.border}` : '1.5px solid transparent',
              fontFamily: "'Nunito',sans-serif",
            }}>
            <span style={{ color: activeTab === tab.id ? C.primary : '#9ca3af' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main */}
      <main className="flex-1 overflow-hidden p-4 grid gap-4 min-h-0">

        <AnimatePresence mode="wait">

          {/* ── DEVICES TAB ── */}
          {activeTab === 'devices' && (
            <motion.div key="devices" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid gap-4 min-h-0" style={{ gridTemplateColumns: '280px 1fr', gridTemplateRows: 'auto 1fr' }}>

              {/* Summary row */}
              <div className="col-span-2 grid grid-cols-5 gap-3">
                <div className="col-span-2 rounded-2xl p-4 flex items-center gap-4"
                  style={{ background: 'white', border: `1.5px solid ${C.border}` }}>
                  <div style={{ width: 70, height: 70 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={22} outerRadius={34} dataKey="value" strokeWidth={0}>
                          {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <div className="text-xl font-black" style={{ fontFamily: "'Nunito',sans-serif", color: '#1f2937' }}>{devices.length} Total Devices</div>
                    <div className="text-xs mt-0.5 space-y-0.5">
                      <div style={{ color: '#10b981' }}>{onlineCount - warningCount} Online & Safe</div>
                      <div style={{ color: '#f97316' }}>{warningCount} Warning</div>
                      <div style={{ color: '#9ca3af' }}>{offlineCount} Offline</div>
                    </div>
                  </div>
                </div>
                <BigStatCard label="Active Device" icon={<Cpu />} iconColor={C.primary}
                  value={activeDevice?.piId || '—'} valueColor={C.dark} bg={C.light} border={C.border}
                  sub={`User: ${activeDevice?.user}`} />
                <BigStatCard label="Detection Feed" icon={<Eye />} iconColor={C.primary}
                  value={objectText} valueColor={C.dark} bg={C.light} border={C.border}
                  sub={`${data?.status ?? 'DISCONNECTED'} · ${data?.direction ?? '--'}`} />
                <BigStatCard label="Processing" icon={<Zap />} iconColor="#f97316"
                  value={`${data?.processing_speed ?? 'N/A'} FPS`} valueColor="#c2410c" bg="#fff7ed" border="#fed7aa"
                  sub={`Confidence: ${data?.confidence ?? 'N/A'}%`} />
              </div>

              {/* Device list */}
              <div className="overflow-y-auto space-y-2 min-h-0">
                <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>
                  Registered Devices
                </div>
                {devices.map(dv => {
                  const sel = activeDevice?.piId === dv.piId;
                  const statusColors = { online: '#10b981', warning: '#f97316', offline: '#9ca3af' };
                  return (
                    <button key={dv.piId} onClick={() => { setActiveDevice(dv); addLog('info', `Switched to device: ${dv.piId}`); }}
                      className="w-full rounded-2xl p-3.5 text-left transition-all"
                      style={{
                        background: sel ? C.light : 'white',
                        border: `1.5px solid ${sel ? C.primary : '#e5e7eb'}`,
                        boxShadow: sel ? `0 0 0 3px ${C.primary}15` : 'none',
                      }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-bold" style={{ fontFamily: "'Nunito',sans-serif", color: '#1f2937' }}>{dv.piId}</span>
                        <span className="w-2 h-2 rounded-full" style={{ background: statusColors[dv.status] }} />
                      </div>
                      <div className="text-[11px]" style={{ color: '#6b7280' }}>
                        <div>{dv.user} · {dv.role}</div>
                        <div className="flex justify-between mt-0.5">
                          <span>Battery: {dv.battery}%</span>
                          <span>{dv.location} · {dv.uptime}</span>
                        </div>
                      </div>
                      {sel && (
                        <div className="mt-2 flex gap-2 pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
                          <button onClick={e => { e.stopPropagation(); addLog('alert', `Pinged ${dv.piId}`); toast(`Ping sent to ${dv.piId}`); }}
                            className="flex-1 py-1 rounded-lg text-[11px] font-semibold"
                            style={{ background: C.light, color: C.dark, border: `1px solid ${C.border}`, fontFamily: "'Nunito',sans-serif" }}>
                            Ping Device
                          </button>
                          <button onClick={e => { e.stopPropagation(); addLog('info', `Restarted ${dv.piId}`); toast(`Restart command sent`); }}
                            className="flex-1 py-1 rounded-lg text-[11px] font-semibold"
                            style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontFamily: "'Nunito',sans-serif" }}>
                            Restart
                          </button>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right — Live feed + logs */}
              <div className="grid gap-4 min-h-0" style={{ gridTemplateRows: '1fr 1fr' }}>
                <Panel label="Live Detection Feed" icon={<Activity className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                  <div className="h-full flex flex-col gap-3 min-h-0">
                    <MiniChart label="Detections & Alerts" data={history}
                      bars={[{ key: 'det', color: C.primary, name: 'Det' }, { key: 'alert', color: '#ef4444', name: 'Alert' }]} />
                    <MiniChart label="Distance (m)" data={history} area={{ key: 'dist', color: C.primary }} />
                  </div>
                </Panel>
                <Panel label="System Audit Log" icon={<Clock className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                  <div className="h-full overflow-y-auto space-y-1.5 min-h-0">
                    {logs.map((l, i) => (
                      <div key={i} className="flex items-start gap-2 p-2 rounded-xl text-xs"
                        style={{ background: i === 0 ? C.light : 'white', border: `1px solid ${i === 0 ? C.border : '#f3f4f6'}` }}>
                        <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                          style={{ background: l.type === 'alert' ? '#ef4444' : l.type === 'warning' ? '#f97316' : C.primary }} />
                        <span style={{ color: '#9ca3af', flexShrink: 0 }}>{l.time}</span>
                        <span style={{ color: '#374151' }}>{l.msg}</span>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </motion.div>
          )}

          {/* ── ANALYTICS TAB ── */}
          {activeTab === 'analytics' && (
            <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid gap-4 min-h-0" style={{ gridTemplateColumns: '1fr 1fr 1fr', gridTemplateRows: 'auto 1fr' }}>

              <div className="col-span-3 grid grid-cols-4 gap-3">
                {[
                  { label: 'Total Detections', value: history.filter(h => h.det > 0).length, color: C.primary, bg: C.light, border: C.border },
                  { label: 'Total Alerts', value: history.filter(h => h.alert > 0).length, color: '#ef4444', bg: '#fef2f2', border: '#fecaca' },
                  { label: 'Avg FPS', value: (history.reduce((a, b) => a + (b.fps || 0), 0) / history.length).toFixed(0), color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
                  { label: 'Avg Distance', value: (history.reduce((a, b) => a + b.dist, 0) / history.length).toFixed(1) + 'm', color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4" style={{ background: 'white', border: `1.5px solid ${s.border}` }}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>{s.label}</div>
                    <div className="text-2xl font-black" style={{ color: s.color, fontFamily: "'Nunito',sans-serif" }}>{s.value}</div>
                  </div>
                ))}
              </div>

              <Panel label="Detection Timeline" icon={<TrendingUp className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="t" tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 11 }} />
                    <Line type="monotone" dataKey="det" stroke={C.primary} strokeWidth={2.5} dot={false} name="Detections" />
                    <Line type="monotone" dataKey="alert" stroke="#ef4444" strokeWidth={2} dot={false} name="Alerts" />
                  </LineChart>
                </ResponsiveContainer>
              </Panel>

              <Panel label="Distance Profile" icon={<Activity className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="pgrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={C.primary} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={C.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="t" tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fill: '#d1d5db', fontSize: 8 }} tickLine={false} axisLine={false} unit="m" />
                    <Tooltip contentStyle={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, fontSize: 11 }} />
                    <Area type="monotone" dataKey="dist" stroke={C.primary} strokeWidth={2.5} fill="url(#pgrad)" dot={false} name="Distance (m)" />
                  </AreaChart>
                </ResponsiveContainer>
              </Panel>

              <Panel label="Device Status Distribution" icon={<BarChart2 className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                <div className="h-full flex flex-col gap-4 justify-center">
                  {[
                    { label: 'Online & Safe', value: onlineCount - warningCount, total: devices.length, color: '#10b981', bg: '#ecfdf5' },
                    { label: 'Warning Active', value: warningCount, total: devices.length, color: '#f97316', bg: '#fff7ed' },
                    { label: 'Offline', value: offlineCount, total: devices.length, color: '#9ca3af', bg: '#f9fafb' },
                  ].map(s => (
                    <div key={s.label}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span style={{ color: '#6b7280' }}>{s.label}</span>
                        <span className="font-bold" style={{ color: s.color, fontFamily: "'Nunito',sans-serif" }}>{s.value} / {s.total}</span>
                      </div>
                      <div className="h-2.5 rounded-full overflow-hidden" style={{ background: '#f3f4f6' }}>
                        <div style={{ width: `${(s.value / s.total) * 100}%`, background: s.color, height: '100%', borderRadius: 9999, transition: 'width 0.7s' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>
          )}

          {/* ── SYSTEM HEALTH TAB ── */}
          {activeTab === 'system' && (
            <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid gap-4 min-h-0" style={{ gridTemplateColumns: '1fr 1fr', gridTemplateRows: 'auto 1fr' }}>

              <div className="col-span-2 grid grid-cols-4 gap-3">
                {[
                  { label: 'Server Status', value: 'Online', color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', icon: <Globe className="w-4 h-4" /> },
                  { label: 'API Latency', value: '42 ms', color: C.primary, bg: C.light, border: C.border, icon: <Activity className="w-4 h-4" /> },
                  { label: 'Active Sessions', value: `${onlineCount}`, color: '#f97316', bg: '#fff7ed', border: '#fed7aa', icon: <Users className="w-4 h-4" /> },
                  { label: 'Avg Battery', value: `${Math.round(devices.reduce((a, d) => a + d.battery, 0) / devices.length)}%`, color: '#8b5cf6', bg: '#f5f3ff', border: '#ddd6fe', icon: <Battery className="w-4 h-4" /> },
                ].map(s => (
                  <div key={s.label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: 'white', border: `1.5px solid ${s.border}` }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: s.bg }}>
                      <span style={{ color: s.color }}>{s.icon}</span>
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#9ca3af', fontFamily: "'Nunito',sans-serif" }}>{s.label}</div>
                      <div className="text-lg font-black" style={{ color: s.color, fontFamily: "'Nunito',sans-serif" }}>{s.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <Panel label="All Device Battery Levels" icon={<Battery className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                <div className="h-full flex flex-col gap-3 overflow-y-auto min-h-0">
                  {devices.map(dv => (
                    <div key={dv.piId}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-semibold" style={{ color: '#374151' }}>{dv.piId}</span>
                        <span style={{ color: dv.battery > 30 ? '#10b981' : '#ef4444', fontFamily: "'Nunito',sans-serif", fontWeight: 700 }}>{dv.battery}%</span>
                      </div>
                      <BattBar pct={dv.battery} />
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel label="System Audit Log" icon={<Clock className="w-4 h-4" />} color={C.primary} border={C.border} bg={C.light}>
                <div className="h-full overflow-y-auto space-y-1.5 min-h-0">
                  {logs.map((l, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-xl text-xs"
                      style={{ background: i === 0 ? C.light : 'white', border: `1px solid ${i === 0 ? C.border : '#f3f4f6'}` }}>
                      <span className="w-1.5 h-1.5 rounded-full mt-1 flex-shrink-0"
                        style={{ background: l.type === 'alert' ? '#ef4444' : l.type === 'warning' ? '#f97316' : C.primary }} />
                      <span style={{ color: '#9ca3af', flexShrink: 0 }}>{l.time}</span>
                      <span style={{ color: '#374151' }}>{l.msg}</span>
                    </div>
                  ))}
                </div>
              </Panel>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

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

