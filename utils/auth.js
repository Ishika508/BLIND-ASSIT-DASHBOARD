// utils/auth.js
// All data stored in localStorage — no backend needed

export const ROLES = {
  PERSONAL_CARETAKER: 'Personal Caretaker',
  FAMILY_MEMBER:      'Family Member',
  HOSPITAL_STAFF:     'Hospital Staff',
  SUPERVISOR:         'IT Supervisor',
};

export const ROLE_CONFIG = {
  'Personal Caretaker': {
    color:       '#f97316',
    dark:        '#c2410c',
    bg:          '#fff7ed',
    border:      '#fed7aa',
    lightBorder: '#ffedd5',
    gradient:    'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    description: 'Monitor a specific individual assigned to your care. You have full access to real-time detection data, audio guidance, emergency controls, and the ability to trigger alerts directly to the user\'s device.',
    capabilities: [
      'Real-time obstacle detection feed',
      'Live audio guidance monitoring',
      'Emergency buzzer & call controls',
      'Personal activity log',
      'Location tracking',
      'Detection analytics',
    ],
  },
  'Family Member': {
    color:       '#ec4899',
    dark:        '#be185d',
    bg:          '#fdf2f8',
    border:      '#fbcfe8',
    lightBorder: '#fce7f3',
    gradient:    'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)',
    description: 'Stay connected with your loved one and monitor their safety from anywhere. You can view detection status, listen to audio guidance updates, and send voice messages to their headphones.',
    capabilities: [
      'Live safety status monitoring',
      'Audio message history',
      'Voice message to headphones',
      'Location visibility',
      'Alert notifications',
      'Daily summary reports',
    ],
  },
  'Hospital Staff': {
    color:       '#3b82f6',
    dark:        '#1d4ed8',
    bg:          '#eff6ff',
    border:      '#bfdbfe',
    lightBorder: '#dbeafe',
    gradient:    'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
    description: 'Clinical monitoring interface for healthcare professionals. Access patient mobility data, obstacle detection logs, and generate reports for medical assessment and care planning.',
    capabilities: [
      'Patient mobility monitoring',
      'Clinical detection reports',
      'Multi-patient overview',
      'Medical log exports',
      'Alert escalation protocols',
      'Integration with care records',
    ],
  },
  'IT Supervisor': {
    color:       '#8b5cf6',
    dark:        '#6d28d9',
    bg:          '#f5f3ff',
    border:      '#ddd6fe',
    lightBorder: '#ede9fe',
    gradient:    'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)',
    description: 'Administrative access across all registered Raspberry Pi devices on the network. Monitor system health, manage device connections, view all users, and oversee the entire blind assistance infrastructure.',
    capabilities: [
      'All devices overview',
      'System health monitoring',
      'User management',
      'Device connection status',
      'Network diagnostics',
      'Full audit logs',
    ],
  },
};

// ── Storage helpers ───────────────────────────────────────────────────────────
function getUsers() {
  try { return JSON.parse(localStorage.getItem('ba_users') || '{}'); }
  catch { return {}; }
}
function saveUsers(u) { localStorage.setItem('ba_users', JSON.stringify(u)); }

export function registerUser({ name, email, password, role, phone, piId }) {
  const users = getUsers();
  if (users[email]) return { ok: false, error: 'An account with this email already exists.' };
  if (password.length < 6) return { ok: false, error: 'Password must be at least 6 characters.' };
  users[email] = {
    name, email, phone, role,
    passwordHash: btoa(unescape(encodeURIComponent(password))),
    piIds: [piId.trim().toUpperCase()],
    createdAt: new Date().toISOString(),
  };
  saveUsers(users);
  return { ok: true, user: { ...users[email], passwordHash: undefined } };
}

export function loginUser({ email, password }) {
  const users = getUsers();
  const user  = users[email];
  if (!user) return { ok: false, error: 'No account found with this email address.' };
  const hash = btoa(unescape(encodeURIComponent(password)));
  if (user.passwordHash !== hash) return { ok: false, error: 'Incorrect password. Please try again.' };
  const { passwordHash, ...safe } = user;
  return { ok: true, user: safe };
}

export function setSession(user, activePiId) {
  sessionStorage.setItem('ba_session', JSON.stringify({
    ...user, activePiId, loginTime: new Date().toISOString(),
  }));
}

export function getSession() {
  try { return JSON.parse(sessionStorage.getItem('ba_session')); }
  catch { return null; }
}

export function clearSession() { sessionStorage.removeItem('ba_session'); }

export function validatePiId(id) {
  return /^BLIND-[A-Z0-9]{4,8}$/i.test((id || '').trim());
}

export function getAllPiIds() {
  const users = getUsers();
  const ids = new Set();
  Object.values(users).forEach(u => (u.piIds || []).forEach(id => ids.add(id)));
  return [...ids];
}