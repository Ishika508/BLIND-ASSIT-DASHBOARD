import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { BarChart2, TrendingUp, Activity } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(8,15,30,0.95)',
      border: '1px solid rgba(34,211,238,0.25)',
      borderRadius: 8, padding: '8px 12px',
    }}>
      <p className="text-[10px] font-mono text-slate-400 mb-1">{label}</p>
      {payload.map(p => (
        <p key={p.name} className="text-xs font-mono" style={{ color: p.color }}>
          {p.name}: <span className="font-semibold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function ChartsPanel({ history }) {
  const [activeTab, setActiveTab] = useState('detections');

  const tabs = [
    { id: 'detections', label: 'Detections', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'distance',   label: 'Distance',   icon: <TrendingUp className="w-3.5 h-3.5" /> },
    { id: 'alerts',     label: 'Alerts',     icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">Analytics</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500">Last {history?.length || 0} samples</div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 flex-shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all ${
              activeTab === t.id
                ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0">
        {activeTab === 'detections' && (
          <motion.div
            key="detections"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="detections" name="Detections" fill="rgba(34,211,238,0.6)" radius={[3,3,0,0]} />
                <Bar dataKey="alerts" name="Alerts" fill="rgba(239,68,68,0.6)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeTab === 'distance' && (
          <motion.div
            key="distance"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="distanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} unit="m" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="distance" name="Distance (m)" stroke="#22d3ee" strokeWidth={2} fill="url(#distanceGrad)" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeTab === 'alerts' && (
          <motion.div
            key="alerts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(34,211,238,0.06)" />
                <XAxis dataKey="time" tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fill: '#475569', fontSize: 9, fontFamily: 'JetBrains Mono' }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="alerts" name="Alerts" stroke="#ef4444" strokeWidth={2} dot={{ fill: '#ef4444', r: 3 }} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="detections" name="Detections" stroke="#f59e0b" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>
    </div>
  );
}
