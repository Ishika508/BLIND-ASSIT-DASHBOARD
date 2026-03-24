import { useEffect, useRef, useState } from 'react';

const BASE_LAT = 23.0225;
const BASE_LNG = 72.5714;

export default function MapPanel() {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState({ lat: BASE_LAT, lng: BASE_LNG });

  useEffect(() => {
    const t = setInterval(() => {
      setCoords(p => ({ lat: p.lat + (Math.random() - 0.5) * 0.0003, lng: p.lng + (Math.random() - 0.5) * 0.0003 }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!ref.current || mapRef.current) return;
    const init = async () => {
      try {
        const L = (await import('leaflet')).default;
        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#f97316;border:3px solid white;box-shadow:0 0 12px rgba(249,115,22,0.8)"></div>`,
          className: '', iconSize: [16, 16], iconAnchor: [8, 8],
        });
        const map = L.map(ref.current, { center: [BASE_LAT, BASE_LNG], zoom: 16, zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { opacity: 0.5 }).addTo(map);
        L.circle([BASE_LAT, BASE_LNG], { radius: 60, color: '#f97316', fillColor: '#f97316', fillOpacity: 0.08, weight: 1 }).addTo(map);
        markerRef.current = L.marker([BASE_LAT, BASE_LNG], { icon }).addTo(map);
        mapRef.current = map;
        setReady(true);
      } catch (e) { console.error(e); }
    };
    init();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([coords.lat, coords.lng]);
    mapRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 1 });
  }, [coords]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ minHeight: 120 }}>
      <div ref={ref} className="absolute inset-0" style={{ zIndex: 1, filter: 'invert(1) hue-rotate(180deg) brightness(0.7) saturate(0.5)' }} />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center z-10" style={{ background: 'rgba(15,15,26,0.8)' }}>
          <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" />
        </div>
      )}
      <div className="absolute bottom-2 left-2 z-10 text-[10px] px-2 py-1 rounded-lg text-white/60"
        style={{ background: 'rgba(0,0,0,0.5)', fontFamily: 'DM Sans, sans-serif' }}>
        📍 {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
      </div>
    </div>
  );
}