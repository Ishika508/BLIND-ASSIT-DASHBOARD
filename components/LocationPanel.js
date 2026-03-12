'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, Satellite, Crosshair } from 'lucide-react';

// Static coordinates for demo - Ahmedabad, India
const BASE_LAT = 23.0225;
const BASE_LNG = 72.5714;

export default function LocationPanel({ data }) {
  const mapRef = useRef(null);
  const leafletMapRef = useRef(null);
  const markerRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [coords, setCoords] = useState({ lat: BASE_LAT, lng: BASE_LNG });
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted) return;
    if (typeof window === 'undefined') return;

    // Slight random drift to simulate movement
    const interval = setInterval(() => {
      setCoords(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0003,
        lng: prev.lng + (Math.random() - 0.5) * 0.0003,
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [mounted]);

  useEffect(() => {
    if (!mounted || !mapRef.current || leafletMapRef.current) return;

    const initMap = async () => {
      try {
        const L = (await import('leaflet')).default;

        // Custom marker icon
        const icon = L.divIcon({
          html: `
            <div style="
              width:36px; height:36px;
              background: linear-gradient(135deg, rgba(34,211,238,0.9), rgba(6,182,212,0.7));
              border-radius: 50% 50% 50% 0;
              transform: rotate(-45deg);
              border: 3px solid rgba(34,211,238,0.6);
              box-shadow: 0 0 20px rgba(34,211,238,0.7);
              display:flex; align-items:center; justify-content:center;
            ">
              <div style="
                width:10px; height:10px;
                background:white;
                border-radius:50%;
                transform:rotate(45deg);
              "></div>
            </div>
            <div style="
              position:absolute; top:-6px; left:-6px;
              width:48px; height:48px;
              border-radius:50%;
              border: 2px solid rgba(34,211,238,0.4);
              animation: ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
            "></div>
          `,
          className: '',
          iconSize: [36, 36],
          iconAnchor: [18, 36],
        });

        const map = L.map(mapRef.current, {
          center: [BASE_LAT, BASE_LNG],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          opacity: 0.7,
        }).addTo(map);

        // Add radius circle
        L.circle([BASE_LAT, BASE_LNG], {
          radius: 50,
          color: 'rgba(34,211,238,0.4)',
          fillColor: 'rgba(34,211,238,0.08)',
          fillOpacity: 1,
          weight: 1,
        }).addTo(map);

        const marker = L.marker([BASE_LAT, BASE_LNG], { icon }).addTo(map);
        marker.bindTooltip('👤 User Location', {
          permanent: true,
          direction: 'top',
          className: 'leaflet-custom-tooltip',
          offset: [0, -40],
        });

        leafletMapRef.current = map;
        markerRef.current = marker;
        setMapReady(true);
      } catch (err) {
        console.error('Map init error:', err);
      }
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mounted]);

  useEffect(() => {
    if (!leafletMapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([coords.lat, coords.lng]);
    leafletMapRef.current.panTo([coords.lat, coords.lng], { animate: true, duration: 1 });
  }, [coords]);

  return (
    <div className="glass-card rounded-2xl p-5 h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono text-cyan-400/70 tracking-widest uppercase">Live Location</span>
        </div>
        <div className="flex items-center gap-2">
          <Satellite className="w-3.5 h-3.5 text-green-400" />
          <span className="text-xs font-mono text-green-400">GPS Active</span>
        </div>
      </div>

      {/* Map container */}
      <div className="flex-1 relative rounded-xl overflow-hidden min-h-[200px]"
        style={{ border: '1px solid rgba(34,211,238,0.15)' }}
      >
        <div ref={mapRef} className="absolute inset-0" style={{ zIndex: 1 }} />

        {/* Corner overlays */}
        <div className="absolute top-2 left-2 z-10 pointer-events-none">
          <div className="w-4 h-4 border-l-2 border-t-2 border-cyan-400/60" />
        </div>
        <div className="absolute top-2 right-2 z-10 pointer-events-none">
          <div className="w-4 h-4 border-r-2 border-t-2 border-cyan-400/60" />
        </div>
        <div className="absolute bottom-2 left-2 z-10 pointer-events-none">
          <div className="w-4 h-4 border-l-2 border-b-2 border-cyan-400/60" />
        </div>
        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
          <div className="w-4 h-4 border-r-2 border-b-2 border-cyan-400/60" />
        </div>

        {/* Loading overlay */}
        {!mapReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#0d1a2e] z-20">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
              <div className="text-xs font-mono text-cyan-400/60">Loading map...</div>
            </div>
          </div>
        )}
      </div>

      {/* Coordinates */}
      <div className="flex items-center justify-between mt-3 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Crosshair className="w-3.5 h-3.5 text-slate-500" />
          <span className="text-[10px] font-mono text-slate-500">
            {coords.lat.toFixed(5)}, {coords.lng.toFixed(5)}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3.5 h-3.5 text-cyan-500/50" />
          <span className="text-[10px] font-mono text-cyan-500/50">±3m accuracy</span>
        </div>
      </div>
    </div>
  );
}
