import { motion } from 'framer-motion';
import { User, Mail, Phone, Shield, Clock, LogOut } from 'lucide-react';
import { useRouter } from 'next/router';

export default function CaretakerProfileCard({ caretaker }) {
  const router = useRouter();

  const roleColors = {
    Caretaker:      { text: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20' },
    Supervisor:     { text: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20' },
    'Medical Staff':{ text: 'text-green-400',  bg: 'bg-green-500/10',  border: 'border-green-500/20' },
    'Family Member':{ text: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  };

  const rc = roleColors[caretaker?.role] || roleColors['Caretaker'];
  const loginTime = caretaker?.loginTime ? new Date(caretaker.loginTime).toLocaleTimeString() : 'N/A';
  const initials = caretaker?.name?.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase() || 'CA';

  const logout = () => {
    localStorage.removeItem('caretaker');
    router.push('/');
  };

  return (
    <div className="glass-card rounded-2xl p-4 relative overflow-hidden">
      <div className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top left, rgba(34,211,238,0.05) 0%, transparent 60%)' }}
      />

      <div className="flex items-center gap-3 relative">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-display font-bold text-cyan-300"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))',
              border: '1px solid rgba(34,211,238,0.3)',
              fontFamily: 'Syne, sans-serif',
            }}
          >
            {initials}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-[#050a14]" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-white text-sm truncate"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {caretaker?.name || 'Unknown'}
          </div>
          <div className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded mt-0.5 border ${rc.bg} ${rc.border} ${rc.text}`}>
            <Shield className="w-2.5 h-2.5" />
            {caretaker?.role || 'Caretaker'}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex-shrink-0 p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
          title="Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Details */}
      <div className="mt-3 pt-3 border-t border-[rgba(34,211,238,0.08)] grid grid-cols-3 gap-2">
        <ProfileDetail icon={<Mail className="w-3 h-3" />} label="Email" value={caretaker?.email} truncate />
        <ProfileDetail icon={<Phone className="w-3 h-3" />} label="Phone" value={caretaker?.phone} />
        <ProfileDetail icon={<Clock className="w-3 h-3" />} label="Login" value={loginTime} />
      </div>
    </div>
  );
}

function ProfileDetail({ icon, label, value, truncate }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-slate-500 mb-0.5">
        {icon}
        <span className="text-[9px] font-mono uppercase tracking-wider">{label}</span>
      </div>
      <div className={`text-[10px] font-mono text-slate-300 ${truncate ? 'truncate' : ''}`}>
        {value || 'N/A'}
      </div>
    </div>
  );
}
