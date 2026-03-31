import { useEffect, useRef, useState } from 'react';

const BASE_LAT = 23.0225;
const BASE_LNG = 72.5714;

export default function MapPanel({ gps = null }) {
  const ref = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [coords, setCoords] = useState({ lat: BASE_LAT, lng: BASE_LNG });
  const hasGps = gps && typeof gps.lat === 'number' && typeof gps.lng === 'number';
  const lat = gps?.lat;
  const lng = gps?.lng;

  useEffect(() => {
    if (!hasGps) return;
    setCoords({ lat, lng });
  }, [hasGps, lat, lng]);

  useEffect(() => {
    if (!hasGps) return;
    if (!ref.current || mapRef.current) return;
    const init = async () => {
      try {
        const L = (await import('leaflet')).default;
        const icon = L.divIcon({
          html: `<div style="width:16px;height:16px;border-radius:50%;background:#f97316;border:3px solid white;box-shadow:0 0 12px rgba(249,115,22,0.8)"></div>`,
          className: '', iconSize: [16, 16], iconAnchor: [8, 8],
        });
        const map = L.map(ref.current, { center: [coords.lat, coords.lng], zoom: 16, zoomControl: false, attributionControl: false });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { opacity: 0.5 }).addTo(map);
        L.circle([coords.lat, coords.lng], { radius: 60, color: '#f97316', fillColor: '#f97316', fillOpacity: 0.08, weight: 1 }).addTo(map);
        markerRef.current = L.marker([coords.lat, coords.lng], { icon }).addTo(map);
        mapRef.current = map;
        setReady(true);
      } catch (e) { console.error(e); }
    };
    init();
    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [hasGps, coords.lat, coords.lng]);

  useEffect(() => {
    if (!hasGps) return;
    if (!mapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([coords.lat, coords.lng]);
    mapRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 1 });
  }, [hasGps, coords]);

  if (!hasGps) {
    return (
      <div className="relative w-full h-full rounded-xl overflow-hidden flex items-center justify-center"
        style={{ minHeight: 120, background: 'rgba(15,15,26,0.8)', border: '1px dashed rgba(148,163,184,0.5)', color: 'rgba(248,250,252,0.8)' }}>
        GPS Not Available
      </div>
    );
  }

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