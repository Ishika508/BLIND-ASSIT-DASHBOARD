// components/dashboards/MapView.js
import { useEffect, useRef, useState } from 'react';

const BASE = { lat: 23.0225, lng: 72.5714 };

export default function MapView({ accentColor = '#6366f1' }) {
  const ref    = useRef(null);
  const mapRef = useRef(null);
  const mRef   = useRef(null);
  const [ready, setReady]   = useState(false);
  const [coords, setCoords] = useState(BASE);

  useEffect(() => {
    const t = setInterval(() => setCoords(p => ({
      lat: p.lat + (Math.random() - 0.5) * 0.0003,
      lng: p.lng + (Math.random() - 0.5) * 0.0003,
    })), 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    (async () => {
      try {
        const L = (await import('leaflet')).default;
        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:${accentColor};border:3px solid white;box-shadow:0 2px 14px ${accentColor}80;"></div>`,
          className: '', iconSize: [16, 16], iconAnchor: [8, 8],
        });
        const map = L.map(ref.current, { center: [BASE.lat, BASE.lng], zoom: 16, zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { opacity: 0.9 }).addTo(map);
        L.circle([BASE.lat, BASE.lng], { radius: 50, color: accentColor, fillColor: accentColor, fillOpacity: 0.08, weight: 2 }).addTo(map);
        mRef.current = L.marker([BASE.lat, BASE.lng], { icon }).addTo(map);
        mapRef.current = map;
        setReady(true);
      } catch (e) { console.error(e); }
    })();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !mRef.current) return;
    mRef.current.setLatLng([coords.lat, coords.lng]);
    mapRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 1 });
  }, [coords]);

  return (
    <div
      className="relative w-full h-full rounded-2xl overflow-hidden"
      style={{ minHeight: 100, zIndex: 0, isolation: 'isolate' }}>
      <div ref={ref} className="absolute inset-0 z-0" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl z-10"
          style={{ background: '#f8f7ff' }}>
          <div style={{ width: 24, height: 24, border: `3px solid ${accentColor}30`, borderTopColor: accentColor, borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}
      <div className="absolute bottom-2 left-2 z-10 text-[10px] px-2.5 py-1.5 rounded-xl font-medium"
        style={{ background: 'white', border: '1px solid #e5e7eb', color: '#6b7280', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
        {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </div>
    </div>
  );
}