// pages/dashboard.js
// Routes to the correct role-specific dashboard

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getSession } from '../utils/auth';

export default function DashboardRouter() {
  const router = useRouter();

  useEffect(() => {
    const s = getSession();
    if (!s) { router.replace('/'); return; }

    const map = {
      'Personal Caretaker': '/dashboards/caretaker',
      'Family Member':      '/dashboards/family',
      'Hospital Staff':     '/dashboards/hospital',
      'IT Supervisor':      '/dashboards/supervisor',
    };
    router.replace(map[s.role] || '/');
  }, []);

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f7ff' }}>
      <div style={{ width: 36, height: 36, border: '3px solid #e0e0ff', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}