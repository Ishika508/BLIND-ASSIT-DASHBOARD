import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye, EyeOff, Mail, Lock, User, Phone, Wifi,
  ChevronRight, ArrowLeft, Loader2, Check,
  ShieldCheck, Heart, Building2, Monitor,
  Activity, MapPin, Bell, Headphones,
  BarChart2, Users, Cpu, FileText,
  AlertCircle,
} from 'lucide-react';
import {
  registerUser, loginUser, setSession,
  validatePiId, ROLES, ROLE_CONFIG,
} from '../utils/auth';

// Icon map for role capabilities
const CAP_ICONS = [
  <Activity className="w-3.5 h-3.5" />,
  <Headphones className="w-3.5 h-3.5" />,
  <Bell className="w-3.5 h-3.5" />,
  <FileText className="w-3.5 h-3.5" />,
  <MapPin className="w-3.5 h-3.5" />,
  <BarChart2 className="w-3.5 h-3.5" />,
];

const ROLE_ICONS = {
  'Personal Caretaker': <ShieldCheck className="w-5 h-5" />,
  'Family Member':      <Heart className="w-5 h-5" />,
  'Hospital Staff':     <Building2 className="w-5 h-5" />,
  'IT Supervisor':      <Monitor className="w-5 h-5" />,
};

const SLIDE = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: [0.16, 1, 0.3, 1] } },
  exit:    { opacity: 0, y: -8, transition: { duration: 0.18 } },
};

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode]       = useState('login');
  const [step, setStep]       = useState(1);
  const [showPw, setShowPw]   = useState(false);
  const [showCPw, setShowCPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [activeRole, setActiveRole] = useState(ROLES.PERSONAL_CARETAKER);

  const [form, setForm] = useState({
    name: '', email: '', phone: '', password: '', confirm: '',
    role: ROLES.PERSONAL_CARETAKER, piId: '',
  });
  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setError(''); };

  // Keep activeRole preview in sync with form
  useEffect(() => { setActiveRole(form.role); }, [form.role]);

  // ── Login ──────────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!form.email || !form.password) { setError('Please enter your email and password.'); return; }
    setLoading(true);
    await tick(600);
    const res = loginUser({ email: form.email, password: form.password });
    if (!res.ok) { setError(res.error); setLoading(false); return; }
    setSession(res.user, (res.user.piIds || [])[0] || '');
    router.push('/dashboard');
  };

  // ── Signup step 1 ─────────────────────────────────────────────────────────
  const handleStep1 = () => {
    if (!form.name.trim())  { setError('Full name is required.'); return; }
    if (!form.email.trim()) { setError('Email address is required.'); return; }
    if (!/\S+@\S+\.\S+/.test(form.email)) { setError('Please enter a valid email address.'); return; }
    if (!form.phone.trim()) { setError('Phone number is required.'); return; }
    if (!form.password)     { setError('Password is required.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    setError(''); setStep(2);
  };

  // ── Signup step 2 ─────────────────────────────────────────────────────────
  const handleSignup = async () => {
    if (!form.piId.trim()) { setError('Please enter your Raspberry Pi Device ID.'); return; }
    if (!validatePiId(form.piId)) { setError('Invalid format. Device ID should be: BLIND-XXXX (e.g. BLIND-AB12)'); return; }
    setLoading(true);
    await tick(800);
    const res = registerUser({
      name: form.name, email: form.email, phone: form.phone,
      password: form.password, role: form.role, piId: form.piId,
    });
    if (!res.ok) { setError(res.error); setLoading(false); return; }
    setSession(res.user, form.piId.trim().toUpperCase());
    router.push('/dashboard');
  };

  const switchMode = (m) => { setMode(m); setStep(1); setError(''); setForm(f => ({ ...f, password: '', confirm: '' })); };
  const rc = ROLE_CONFIG[activeRole];

  return (
    <div className="min-h-screen flex" style={{ background: '#f8f7ff', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>

      {/* ── LEFT PANEL ─────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[480px] flex-shrink-0 relative overflow-hidden"
        style={{ background: '#0f0e1a' }}>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', transform: 'translate(-30%, -30%)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', transform: 'translate(20%, 20%)' }} />

        {/* Content */}
        <div className="relative flex flex-col h-full p-10">

          {/* Logo */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>Blind Assist</div>
              <div className="text-white/40 text-xs">Monitoring Portal</div>
            </div>
          </div>

          {/* Dynamic role preview */}
          <div className="flex-1">
            <div className="mb-4">
              <div className="text-white/40 text-xs font-medium uppercase tracking-widest mb-2">
                {mode === 'signup' && step === 2 ? 'Selected role' : 'Role preview'}
              </div>
              <AnimatePresence mode="wait">
                <motion.div key={activeRole}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}>

                  {/* Role header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: rc.gradient }}>
                      <span className="text-white">{ROLE_ICONS[activeRole]}</span>
                    </div>
                    <div>
                      <div className="text-white font-bold text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        {activeRole}
                      </div>
                      <div className="text-xs" style={{ color: rc.color }}>Dashboard access</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-white/50 text-sm leading-relaxed mb-5">
                    {rc.description}
                  </p>

                  {/* Capabilities */}
                  <div className="space-y-2.5">
                    {rc.capabilities.map((cap, i) => (
                      <div key={cap} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${rc.color}22` }}>
                          <span style={{ color: rc.color }}>{CAP_ICONS[i]}</span>
                        </div>
                        <span className="text-white/60 text-sm">{cap}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-white/25 text-xs">
              Blind Assistance System · University Project
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ──────────────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-[420px]">

          {/* Tab toggle */}
          <div className="flex rounded-2xl p-1 mb-8"
            style={{ background: '#ede9fe', border: '1px solid #ddd6fe' }}>
            {['login', 'signup'].map(m => (
              <button key={m} onClick={() => switchMode(m)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: mode === m ? 'white' : 'transparent',
                  color: mode === m ? '#4f46e5' : '#9ca3af',
                  boxShadow: mode === m ? '0 1px 4px rgba(99,102,241,0.15)' : 'none',
                  fontFamily: "'Nunito', sans-serif",
                }}>
                {m === 'login' ? 'Log In' : 'Create Account'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* ── LOGIN ────────────────────────────────────────────────────── */}
            {mode === 'login' && (
              <motion.div key="login" {...SLIDE} className="space-y-5">
                <div className="mb-2">
                  <h1 className="text-2xl font-bold" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e1b4b' }}>
                    Welcome back
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>
                    Sign in to your caretaker account to continue monitoring.
                  </p>
                </div>

                <Input icon={<Mail className="w-4 h-4" />} label="Email address" placeholder="you@example.com" value={form.email} onChange={v => set('email', v)} type="email" />
                <div>
                  <PasswordInput label="Password" placeholder="Your password" value={form.password} onChange={v => set('password', v)} show={showPw} toggle={() => setShowPw(!showPw)} />
                </div>

                <ErrorBox msg={error} />

                <button className="submit-btn" onClick={handleLogin} disabled={loading}>
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</>
                    : <><span>Sign In</span><ChevronRight className="w-4 h-4" /></>
                  }
                </button>

                <p className="text-center text-sm" style={{ color: '#6b7280' }}>
                  Don't have an account?{' '}
                  <button onClick={() => switchMode('signup')} className="font-semibold" style={{ color: '#6366f1' }}>
                    Create one
                  </button>
                </p>

                {/* Info box */}
                <div className="rounded-2xl p-4 mt-2" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#16a34a' }} />
                    <p className="text-xs leading-relaxed" style={{ color: '#15803d' }}>
                      Your credentials are stored securely on your device. Each session is verified before accessing live patient data.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── SIGNUP STEP 1 — Personal details ────────────────────────── */}
            {mode === 'signup' && step === 1 && (
              <motion.div key="s1" {...SLIDE} className="space-y-4">
                <div className="mb-1">
                  <StepIndicator current={1} />
                  <h1 className="text-2xl font-bold mt-4" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e1b4b' }}>
                    Personal details
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>
                    Tell us who you are. This information will appear on your caretaker profile.
                  </p>
                </div>

                <Input icon={<User className="w-4 h-4" />} label="Full name" placeholder="Dr. Jane Smith" value={form.name} onChange={v => set('name', v)} />
                <Input icon={<Mail className="w-4 h-4" />} label="Email address" placeholder="you@example.com" value={form.email} onChange={v => set('email', v)} type="email" />
                <Input icon={<Phone className="w-4 h-4" />} label="Phone number" placeholder="+91 98765 43210" value={form.phone} onChange={v => set('phone', v)} type="tel" />
                <PasswordInput label="Create password" placeholder="Min. 6 characters" value={form.password} onChange={v => set('password', v)} show={showPw} toggle={() => setShowPw(!showPw)} />
                <PasswordInput label="Confirm password" placeholder="Repeat your password" value={form.confirm} onChange={v => set('confirm', v)} show={showCPw} toggle={() => setShowCPw(!showCPw)} />

                <ErrorBox msg={error} />

                <button className="submit-btn" onClick={handleStep1}>
                  <span>Continue</span><ChevronRight className="w-4 h-4" />
                </button>

                <p className="text-center text-sm" style={{ color: '#6b7280' }}>
                  Already have an account?{' '}
                  <button onClick={() => switchMode('login')} className="font-semibold" style={{ color: '#6366f1' }}>
                    Sign in
                  </button>
                </p>
              </motion.div>
            )}

            {/* ── SIGNUP STEP 2 — Role + Pi ID ────────────────────────────── */}
            {mode === 'signup' && step === 2 && (
              <motion.div key="s2" {...SLIDE} className="space-y-5">
                <div className="mb-1">
                  <StepIndicator current={2} />
                  <h1 className="text-2xl font-bold mt-4" style={{ fontFamily: "'Nunito', sans-serif", color: '#1e1b4b' }}>
                    Role & device
                  </h1>
                  <p className="text-sm mt-1.5" style={{ color: '#6b7280' }}>
                    Select your role to customise your dashboard, then link your Raspberry Pi device.
                  </p>
                </div>

                {/* Role selector */}
                <div>
                  <label className="block text-xs font-semibold mb-2.5 uppercase tracking-wider" style={{ color: '#6b7280' }}>
                    Your role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {Object.values(ROLES).map(r => {
                      const c = ROLE_CONFIG[r];
                      const selected = form.role === r;
                      return (
                        <button key={r} onClick={() => set('role', r)}
                          className="p-3.5 rounded-2xl text-left transition-all relative"
                          style={{
                            background: selected ? c.bg : 'white',
                            border: `2px solid ${selected ? c.color : '#e8e6f9'}`,
                            boxShadow: selected ? `0 0 0 3px ${c.color}20` : 'none',
                          }}>
                          {selected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                              style={{ background: c.color }}>
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                          )}
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center mb-2.5"
                            style={{ background: selected ? c.gradient : '#f1f0fb' }}>
                            <span style={{ color: selected ? 'white' : c.dark }}>{ROLE_ICONS[r]}</span>
                          </div>
                          <div className="text-sm font-bold leading-tight" style={{ color: selected ? c.dark : '#374151', fontFamily: "'Nunito', sans-serif" }}>{r}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Capabilities preview */}
                <AnimatePresence mode="wait">
                  <motion.div key={form.role}
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden">
                    <div className="rounded-2xl p-4" style={{ background: rc.bg, border: `1px solid ${rc.border}` }}>
                      <p className="text-xs font-semibold mb-2" style={{ color: rc.dark }}>
                        {form.role} dashboard includes:
                      </p>
                      <div className="grid grid-cols-2 gap-1.5">
                        {rc.capabilities.map((cap, i) => (
                          <div key={cap} className="flex items-center gap-1.5 text-xs" style={{ color: rc.dark }}>
                            <Check className="w-3 h-3 flex-shrink-0" style={{ color: rc.color }} />
                            <span className="truncate">{cap}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Pi ID */}
                <div>
                  <Input
                    icon={<Wifi className="w-4 h-4" />}
                    label="Raspberry Pi Device ID"
                    placeholder="BLIND-AB12"
                    value={form.piId}
                    onChange={v => set('piId', v.toUpperCase())}
                    hint="Found on the label affixed to your Raspberry Pi device. Format: BLIND-XXXX"
                  />
                </div>

                <ErrorBox msg={error} />

                <div className="flex gap-3">
                  <button onClick={() => { setStep(1); setError(''); }}
                    className="flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all"
                    style={{ border: '1.5px solid #e8e6f9', color: '#6b7280', background: 'white', fontFamily: "'Nunito', sans-serif" }}>
                    <ArrowLeft className="w-4 h-4" /> Back
                  </button>
                  <button className="submit-btn flex-1" onClick={handleSignup} disabled={loading}>
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</>
                      : <><span>Create Account</span><ChevronRight className="w-4 h-4" /></>
                    }
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=Nunito:wght@600;700;800;900&display=swap');

        .field-base {
          width: 100%;
          padding: 11px 14px 11px 42px;
          border: 1.5px solid #e8e6f9;
          border-radius: 12px;
          background: white;
          color: #1e1b4b;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
        }
        .field-base:focus {
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .field-base::placeholder { color: #9ca3af; }

        .submit-btn {
          width: 100%;
          padding: 13px 20px;
          border-radius: 12px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 700;
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: transform 0.15s, box-shadow 0.18s, opacity 0.15s;
          box-shadow: 0 4px 14px rgba(99,102,241,0.3);
        }
        .submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(0); }
        .submit-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Input({ icon, label, placeholder, value, onChange, type = 'text', hint }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6b7280' }}>{label}</label>}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>{icon}</div>
        <input type={type} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} className="field-base" />
      </div>
      {hint && <p className="text-xs mt-1.5" style={{ color: '#9ca3af' }}>{hint}</p>}
    </div>
  );
}

function PasswordInput({ label, placeholder, value, onChange, show, toggle }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: '#6b7280' }}>{label}</label>}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: '#9ca3af' }}>
          <Lock className="w-4 h-4" />
        </div>
        <input type={show ? 'text' : 'password'} placeholder={placeholder} value={value}
          onChange={e => onChange(e.target.value)} className="field-base pr-11" />
        <button type="button" onClick={toggle}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
          style={{ color: '#9ca3af' }}
          onMouseEnter={e => e.currentTarget.style.color = '#6366f1'}
          onMouseLeave={e => e.currentTarget.style.color = '#9ca3af'}>
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  if (!msg) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm"
      style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}>
      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
      <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{msg}</span>
    </motion.div>
  );
}

function StepIndicator({ current }) {
  return (
    <div className="flex items-center gap-2">
      {[1, 2].map(n => (
        <div key={n} className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all"
            style={{
              background: n < current ? '#6366f1' : n === current ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f1f0fb',
              color: n <= current ? 'white' : '#9ca3af',
              fontFamily: "'Nunito', sans-serif",
            }}>
            {n < current ? <Check className="w-3.5 h-3.5" /> : n}
          </div>
          {n < 2 && (
            <div className="w-10 h-0.5 rounded-full transition-all"
              style={{ background: n < current ? '#6366f1' : '#e8e6f9' }} />
          )}
        </div>
      ))}
      <span className="ml-1 text-xs" style={{ color: '#9ca3af', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        Step {current} of 2
      </span>
    </div>
  );
}

function tick(ms) { return new Promise(r => setTimeout(r, ms)); }