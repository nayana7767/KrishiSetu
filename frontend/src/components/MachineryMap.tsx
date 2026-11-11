import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface MapPin {
  id: number;
  name: string;
  category: string;
  price_per_hour: number;
  price_per_acre?: number;
  district: string;
  taluk: string;
  village: string;
  latitude: number;
  longitude: number;
  has_operator: boolean;
  image_url?: string;
  provider_name: string;
  provider_phone: string;
}

interface MachineryMapProps {
  pins: MapPin[];
  onSelectMachine: (id: number) => void;
}

export const MachineryMap: React.FC<MachineryMapProps> = ({ pins, onSelectMachine }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map centered around Mandya / Mysuru, Karnataka
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current).setView([12.5218, 76.8951], 10);

      // OpenStreetMap Standard Tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Custom Farm Machinery Pin Icon
    const customIcon = L.divIcon({
      className: 'custom-farm-pin',
      html: `
        <div style="background-color: #047857; color: white; border: 2px solid #f59e0b; border-radius: 50%; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.3); font-size: 18px;">
          🚜
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18],
    });

    // Add pins to map
    pins.forEach((pin) => {
      if (pin.latitude && pin.longitude) {
        const marker = L.marker([pin.latitude, pin.longitude], { icon: customIcon }).addTo(map);

        const popupContent = document.createElement('div');
        popupContent.className = 'p-2 space-y-2 text-stone-900 font-sans';
        popupContent.style.minWidth = '220px';
        popupContent.innerHTML = `
          <div style="font-weight: bold; font-size: 14px; color: #065f46;">${pin.name}</div>
          <div style="font-size: 11px; color: #6b7280;">📍 ${pin.village}, ${pin.taluk}, ${pin.district}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; padding: 4px 8px; background: #ecfdf5; border-radius: 8px;">
            <span style="font-size: 11px; font-weight: bold; color: #047857;">₹${pin.price_per_hour}/hr</span>
            <span style="font-size: 10px; color: #065f46;">${pin.has_operator ? '✓ Operator' : 'No Operator'}</span>
          </div>
          <div style="font-size: 11px; color: #4b5563; margin-top: 4px;">Owner: <strong>${pin.provider_name}</strong></div>
          <button id="book-btn-${pin.id}" style="width: 100%; margin-top: 8px; background-color: #047857; color: white; font-weight: bold; font-size: 12px; padding: 6px 12px; border-radius: 8px; border: none; cursor: pointer;">
            Book This Machinery
          </button>
        `;

        marker.bindPopup(popupContent);

        // Handle button click in popup
        marker.on('popupopen', () => {
          const btn = document.getElementById(`book-btn-${pin.id}`);
          if (btn) {
            btn.onclick = () => onSelectMachine(pin.id);
          }
        });

        markersRef.current.push(marker);
      }
    });

    // Adjust bounds if multiple pins
    if (pins.length > 0) {
      const group = L.featureGroup(markersRef.current);
      map.fitBounds(group.getBounds().pad(0.2));
    }
  }, [pins]);

  return (
    <div className="relative w-full h-[520px] rounded-3xl overflow-hidden border-2 border-stone-200 shadow-md">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      <div className="absolute top-4 right-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-stone-200 text-xs text-stone-700 max-w-xs">
        <p className="font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
          <span>🚜 Karnataka OpenStreetMap Farm Radar</span>
        </p>
        <p className="text-[11px] text-stone-500">
          Showing available tractors, harvesters & rotavators. Click on any green pin to view transparent rates and book.
        </p>
      </div>
    </div>
  );
};
