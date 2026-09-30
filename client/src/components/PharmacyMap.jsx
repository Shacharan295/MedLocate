import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

// Custom icons to avoid broken default marker URLs in bundlers
const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      background-color: #0284c7;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 10px rgba(2,132,199,0.7);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9]
});

const pharmacyIcon = L.divIcon({
  className: 'custom-pharmacy-marker',
  html: `
    <div style="
      background-color: #0d9488;
      width: 28px;
      height: 28px;
      border-radius: 8px;
      border: 2px solid #ffffff;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 16px;
    ">+</div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -14]
});

const emergencyPharmacyIcon = L.divIcon({
  className: 'custom-emergency-marker',
  html: `
    <div style="
      background-color: #e11d48;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 14px rgba(225,29,72,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 18px;
    ">+</div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16]
});

export const PharmacyMap = ({
  userLat,
  userLng,
  pharmacies = [],
  onSelectPharmacy,
  onReserve,
  selectedPharmacyId,
  isEmergency = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const centerLat = userLat || 13.0827;
      const centerLng = userLng || 80.2707;

      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        scrollWheelZoom: true
      }).setView([centerLat, centerLng], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers & Centering when results or coordinates change
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    const bounds = L.latLngBounds();

    // Add User Marker
    if (userLat && userLng) {
      const userMarker = L.marker([userLat, userLng], { icon: userIcon })
        .bindPopup('<div class="p-1 text-xs font-semibold">📍 Your Detected Location</div>')
        .addTo(markersLayer);
      bounds.extend([userLat, userLng]);
    }

    // Add Pharmacy Markers
    pharmacies.forEach((item) => {
      const coords = item.pharmacy?.location?.coordinates;
      if (!coords || coords.length < 2) return;

      const [lng, lat] = coords; // GeoJSON [lng, lat] -> Leaflet [lat, lng]
      const isSelected = item.pharmacy?.id === selectedPharmacyId;
      const markerIcon = isEmergency ? emergencyPharmacyIcon : pharmacyIcon;

      const marker = L.marker([lat, lng], { icon: markerIcon }).addTo(markersLayer);
      bounds.extend([lat, lng]);

      // Custom Popup HTML
      const verifiedTag = item.verified
        ? '<span style="color:#0d9488;font-size:10px;font-weight:bold;background:#ccfbf1;padding:2px 6px;border-radius:4px;">✓ Verified</span>'
        : '<span style="color:#ea580c;font-size:10px;font-weight:bold;background:#ffedd5;padding:2px 6px;border-radius:4px;">Pending Verification</span>';

      const popupContent = document.createElement('div');
      popupContent.style.minWidth = '200px';
      popupContent.style.padding = '4px';
      popupContent.innerHTML = `
        <div style="font-family:sans-serif;">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
            <strong style="font-size:13px;color:#0f172a;">${item.pharmacy.name}</strong>
          </div>
          <div style="margin-bottom:6px;">${verifiedTag}</div>
          <p style="font-size:11px;color:#64748b;margin:0 0 6px 0;">${item.pharmacy.address}</p>
          <div style="background:#f8fafc;padding:6px;border-radius:6px;border:1px solid #e2e8f0;margin-bottom:8px;">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#334155;">
              <span>Stock: <strong>${item.quantity} units</strong></span>
              <span>Price: <strong>₹${item.price}</strong></span>
            </div>
            <div style="font-size:11px;color:#0d9488;font-weight:600;margin-top:2px;">
              Distance: ${item.distanceKm} km
            </div>
          </div>
        </div>
      `;

      // Reserve action button inside popup
      const btn = document.createElement('button');
      btn.innerText = 'Reserve Medicine';
      btn.style.cssText = `
        width: 100%;
        background-color: #0d9488;
        color: white;
        border: none;
        padding: 6px 10px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 600;
        cursor: pointer;
      `;
      btn.onclick = () => {
        if (onReserve) onReserve(item);
      };
      popupContent.appendChild(btn);

      marker.bindPopup(popupContent);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // Fit map bounds if markers exist
    if (pharmacies.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (userLat && userLng) {
      map.setView([userLat, userLng], 13);
    }
  }, [userLat, userLng, pharmacies, selectedPharmacyId, isEmergency]);

  return (
    <div className="relative w-full h-full min-h-[350px] lg:min-h-[500px] rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-slate-100">
      <div ref={mapContainerRef} className="w-full h-full z-10" />
      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-xl border border-slate-200 text-[11px] shadow-sm flex items-center space-x-3 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600 ring-2 ring-sky-200" />
          <span className="text-slate-700 font-medium">You</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-3 h-3 rounded bg-teal-600 text-white text-[8px] flex items-center justify-center font-bold">
            +
          </span>
          <span className="text-slate-700 font-medium">Pharmacy with Stock</span>
        </div>
      </div>
    </div>
  );
};

export default PharmacyMap;
