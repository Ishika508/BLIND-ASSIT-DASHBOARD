import { useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Shield, Wifi, Activity, Lock, User, Mail, Phone, ChevronRight } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', role: 'Caretaker',
  });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState('');

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      setError('All fields are required.');
      return;
    }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    localStorage.setItem('caretaker', JSON.stringify({ ...form, loginTime: new Date().toISOString() }));
    router.push('/dashboard');
  };

  const inputClass = (field) => `
    w-full bg-[#0d1a2e] border rounded-lg px-4 py-3 pl-11 text-sm text-slate-200 placeholder-slate-500
    outline-none transition-all duration-300 font-mono
    ${focused === field
      ? 'border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.2)]'
      : 'border-[rgba(34,211,238,0.15)] hover:border-[rgba(34,211,238,0.3)]'
    }
  `;

  return (
    <div className="min-h-screen bg-[#050a14] flex items-center justify-center relative overflow-hidden">
      {/* Animated grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `linear-gradient(rgba(34,211,238,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.06) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute top-20 right-20 w-48 h-48 bg-cyan-400/5 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-8 h-8 border-l-2 border-t-2 border-cyan-500/40" />
        <span className="text-xs font-mono text-cyan-500/50 tracking-widest uppercase">Blind Assist OS v2.1</span>
      </div>
      <div className="absolute top-6 right-6">
        <div className="w-8 h-8 border-r-2 border-t-2 border-cyan-500/40" />
      </div>
      <div className="absolute bottom-6 left-6">
        <div className="w-8 h-8 border-l-2 border-b-2 border-cyan-500/40" />
      </div>
      <div className="absolute bottom-6 right-6 flex items-center gap-3">
        <span className="text-xs font-mono text-cyan-500/50 tracking-widest uppercase">System Online</span>
        <div className="w-8 h-8 border-r-2 border-b-2 border-cyan-500/40" />
      </div>

      {/* Status bar top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md px-4"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 relative"
            style={{
              background: 'linear-gradient(135deg, rgba(34,211,238,0.2), rgba(34,211,238,0.05))',
              border: '1px solid rgba(34,211,238,0.3)',
              boxShadow: '0 0 30px rgba(34,211,238,0.15)',
            }}
          >
            <Shield className="w-8 h-8 text-cyan-400" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-[#050a14]" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-display font-bold text-white tracking-tight"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            BLIND ASSIST
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-slate-400 text-sm mt-1 font-mono tracking-wider"
          >
            CARETAKER MONITORING PORTAL
          </motion.p>

          {/* Live indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-2 mt-3"
          >
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-green-400 font-mono tracking-widest">SYSTEM ONLINE</span>
            <Wifi className="w-3.5 h-3.5 text-green-400" />
          </motion.div>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="glass-card rounded-2xl p-8"
          style={{ boxShadow: '0 0 60px rgba(34,211,238,0.07), 0 25px 50px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono text-cyan-400 tracking-widest uppercase">Authentication Required</h2>
            <Lock className="w-4 h-4 text-cyan-500/50" />
          </div>

          <form onSubmit={submit} className="space-y-4">
            {/* Name */}
            <div className="relative">
              <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                name="name" type="text" placeholder="Full Name"
                value={form.name} onChange={handle}
                onFocus={() => setFocused('name')} onBlur={() => setFocused('')}
                className={inputClass('name')}
              />
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                name="email" type="email" placeholder="Email Address"
                value={form.email} onChange={handle}
                onFocus={() => setFocused('email')} onBlur={() => setFocused('')}
                className={inputClass('email')}
              />
            </div>

            {/* Phone */}
            <div className="relative">
              <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                name="phone" type="tel" placeholder="Phone Number"
                value={form.phone} onChange={handle}
                onFocus={() => setFocused('phone')} onBlur={() => setFocused('')}
                className={inputClass('phone')}
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                name="password" type={showPw ? 'text' : 'password'} placeholder="Password"
                value={form.password} onChange={handle}
                onFocus={() => setFocused('password')} onBlur={() => setFocused('')}
                className={inputClass('password') + ' pr-11'}
              />
              <button
                type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3.5 top-3.5 text-slate-500 hover:text-cyan-400 transition-colors"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Role */}
            <div className="relative">
              <Activity className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500 pointer-events-none" />
              <select
                name="role" value={form.role} onChange={handle}
                onFocus={() => setFocused('role')} onBlur={() => setFocused('')}
                className={inputClass('role') + ' appearance-none cursor-pointer'}
              >
                <option value="Caretaker">Caretaker</option>
                <option value="Supervisor">Supervisor</option>
                <option value="Medical Staff">Medical Staff</option>
                <option value="Family Member">Family Member</option>
              </select>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2"
                >
                  ⚠ {error}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-display font-semibold text-sm tracking-wider uppercase
                flex items-center justify-center gap-2 transition-all duration-300 relative overflow-hidden mt-2"
              style={{
                background: loading
                  ? 'linear-gradient(135deg, rgba(34,211,238,0.1), rgba(34,211,238,0.05))'
                  : 'linear-gradient(135deg, rgba(34,211,238,0.25), rgba(34,211,238,0.12))',
                border: '1px solid rgba(34,211,238,0.5)',
                color: '#67e8f9',
                boxShadow: loading ? 'none' : '0 0 20px rgba(34,211,238,0.15)',
                fontFamily: 'Syne, sans-serif',
              }}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Access Dashboard</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Footer info */}
          <div className="mt-6 pt-5 border-t border-[rgba(34,211,238,0.1)] flex items-center justify-between">
            <span className="text-xs text-slate-600 font-mono">v2.1.0 • Raspberry Pi Integration</span>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-xs text-green-400/70 font-mono">Secure Channel</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
