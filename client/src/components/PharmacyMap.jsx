import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { AlertTriangle, Compass, RotateCcw } from 'lucide-react';

// Custom modern SVG marker icons
const createUserIcon = () =>
  L.divIcon({
    className: 'medlocate-user-marker',
    html: `
      <div style="position: relative; width: 24px; height: 24px;">
        <div style="
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          background: rgba(2, 132, 199, 0.25);
          animation: pulse 2s infinite;
        "></div>
        <div style="
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #0284c7;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(2, 132, 199, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="width: 6px; height: 6px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

const createPharmacyIcon = (isSelected = false, isEmergency = false, verified = false) => {
  const bgColor = isEmergency ? '#e11d48' : isSelected ? '#0f766e' : '#0d9488';
  const size = isSelected ? 36 : 30;
  const anchor = isSelected ? 18 : 15;

  return L.divIcon({
    className: 'medlocate-pharmacy-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${bgColor};
        border-radius: 10px;
        border: 2.5px solid #ffffff;
        box-shadow: 0 6px 14px rgba(0, 0, 0, ${isSelected ? '0.35' : '0.2'});
        display: flex;
        align-items: center;
        justify-content: center;
        color: #ffffff;
        font-family: sans-serif;
        font-weight: 800;
        font-size: ${isSelected ? '18px' : '15px'};
        transition: transform 0.2s ease;
        ${isSelected ? 'transform: scale(1.15);' : ''}
      ">
        +
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [anchor, anchor],
    popupAnchor: [0, -anchor]
  });
};

export const PharmacyMap = ({
  userLat = 13.0827,
  userLng = 80.2707,
  radius = 5,
  pharmacies = [],
  onSelectPharmacy,
  onReserve,
  selectedPharmacyId,
  isEmergency = false
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const markersMapRef = useRef({});
  const [tileError, setTileError] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Fix React 18 strict mode / fast-refresh duplicate initialization
    if (mapContainerRef.current._leaflet_id) {
      mapContainerRef.current._leaflet_id = null;
    }

    if (!mapInstanceRef.current) {
      const defaultLat = userLat || 13.0827; // Chennai fallback
      const defaultLng = userLng || 80.2707;

      const map = L.map(mapContainerRef.current, {
        center: [defaultLat, defaultLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true
      });

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      });

      tileLayer.on('tileerror', () => {
        setTileError(true);
      });

      tileLayer.addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;

      // Ensure container size is calculated accurately on initial paint
      setTimeout(() => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      }, 250);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers, Radius Circle, & Dynamic Centering
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();
    markersMapRef.current = {};

    const centerLat = userLat || 13.0827;
    const centerLng = userLng || 80.2707;

    // 1. Add User Location Marker
    const userMarker = L.marker([centerLat, centerLng], { icon: createUserIcon() })
      .bindPopup(
        `
        <div style="font-family: system-ui, sans-serif; font-size: 12px; padding: 2px;">
          <strong style="color: #0369a1;">📍 Search Origin / Current Location</strong>
          <p style="color: #64748b; margin: 2px 0 0 0; font-size: 11px;">
            ${userLat ? 'Coordinates detected from browser' : 'Defaulting to Chennai Central'}
          </p>
        </div>
        `
      )
      .addTo(markersLayer);

    // 2. Add / Update Search Radius Circle
    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    if (radius && radius > 0) {
      radiusCircleRef.current = L.circle([centerLat, centerLng], {
        radius: radius * 1000,
        color: isEmergency ? '#f43f5e' : '#0d9488',
        fillColor: isEmergency ? '#f43f5e' : '#14b8a6',
        fillOpacity: 0.07,
        weight: 1.5,
        dashArray: '4, 6'
      }).addTo(map);
    }

    const bounds = L.latLngBounds();
    bounds.extend([centerLat, centerLng]);

    // 3. Render Pharmacy Markers
    pharmacies.forEach((item) => {
      const p = item.pharmacy || item;
      const coords = p.location?.coordinates || [p.longitude, p.latitude];
      if (!coords || coords.length < 2 || isNaN(coords[0]) || isNaN(coords[1])) return;

      const lng = parseFloat(coords[0]);
      const lat = parseFloat(coords[1]);
      const pId = p.id || p._id;
      const isSelected = pId === selectedPharmacyId;

      const marker = L.marker([lat, lng], {
        icon: createPharmacyIcon(isSelected, isEmergency, p.verified)
      }).addTo(markersLayer);

      markersMapRef.current[pId] = marker;
      bounds.extend([lat, lng]);

      // Click on marker selects the card in parent component
      marker.on('click', () => {
        if (onSelectPharmacy) {
          onSelectPharmacy(item);
        }
      });

      // Construct rich popup content
      const popupDiv = document.createElement('div');
      popupDiv.style.cssText = 'font-family: system-ui, -apple-system, sans-serif; min-width: 210px; padding: 3px;';

      const verifiedBadge = p.verified
        ? '<span style="background: #ccfbf1; color: #0f766e; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block;">✓ Verified</span>'
        : '<span style="background: #ffedd5; color: #9a3412; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; display: inline-block;">Pending Verification</span>';

      const ratingBadge = p.rating ? `<span style="color: #f59e0b; font-weight: 700; font-size: 11px; margin-left: 6px;">★ ${p.rating}</span>` : '';

      popupDiv.innerHTML = `
        <div style="margin-bottom: 4px;">
          <h4 style="margin: 0 0 3px 0; font-size: 13px; font-weight: 700; color: #0f172a;">${p.name}</h4>
          <div>${verifiedBadge} ${ratingBadge}</div>
        </div>
        <p style="margin: 4px 0 6px 0; font-size: 11px; color: #64748b; line-height: 1.3;">${p.address}</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 8px; margin-bottom: 8px;">
          <div style="display: flex; justify-content: space-between; font-size: 11px; color: #334155;">
            <span>Stock: <strong style="color: #0f172a;">${item.quantity !== undefined ? `${item.quantity} units` : 'Available'}</strong></span>
            ${item.price ? `<span>Price: <strong style="color: #0d9488;">₹${item.price}</strong></span>` : ''}
          </div>
          <div style="font-size: 11px; color: #0d9488; font-weight: 600; margin-top: 3px;">
            Distance: ${item.distanceKm !== undefined ? `${item.distanceKm} km` : 'Nearby'}
          </div>
        </div>
      `;

      if (onReserve) {
        const reserveBtn = document.createElement('button');
        reserveBtn.innerText = 'Reserve Medicine for Pickup';
        reserveBtn.style.cssText = `
          width: 100%;
          background: #0d9488;
          color: #ffffff;
          border: none;
          padding: 7px 10px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s ease;
        `;
        reserveBtn.onmouseover = () => { reserveBtn.style.background = '#0f766e'; };
        reserveBtn.onmouseout = () => { reserveBtn.style.background = '#0d9488'; };
        reserveBtn.onclick = () => {
          onReserve(item);
        };
        popupDiv.appendChild(reserveBtn);
      }

      marker.bindPopup(popupDiv);

      if (isSelected) {
        marker.openPopup();
      }
    });

    // 4. Smooth Pan/Zoom when selected pharmacy changes
    if (selectedPharmacyId && markersMapRef.current[selectedPharmacyId]) {
      const selectedMarker = markersMapRef.current[selectedPharmacyId];
      const targetLatLng = selectedMarker.getLatLng();
      map.flyTo(targetLatLng, 14, { duration: 0.8 });
      selectedMarker.openPopup();
    } else if (pharmacies.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else {
      map.setView([centerLat, centerLng], 12);
    }
  }, [userLat, userLng, radius, pharmacies, selectedPharmacyId, isEmergency]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([userLat || 13.0827, userLng || 80.2707], 13);
      mapInstanceRef.current.invalidateSize();
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] md:min-h-[520px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 flex flex-col">
      {/* Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full flex-1 z-10" />

      {/* Recenter Control Button */}
      <button
        type="button"
        onClick={handleRecenter}
        title="Re-center map to origin"
        className="absolute top-3 right-3 z-20 bg-white/95 hover:bg-white text-slate-700 p-2 rounded-xl shadow-md border border-slate-200 transition-all flex items-center space-x-1 text-xs font-semibold"
      >
        <RotateCcw className="w-3.5 h-3.5 text-teal-600" />
        <span className="hidden sm:inline">Center Chennai</span>
      </button>

      {/* Fallback Warning if Tiles Fail */}
      {tileError && (
        <div className="absolute top-3 left-3 right-14 z-20 bg-amber-50/95 border border-amber-300 rounded-xl p-2.5 text-xs text-amber-900 shadow-sm flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Map tiles could not be loaded from OpenStreetMap. Displaying local pharmacy markers & distances.
          </span>
        </div>
      )}

      {/* Modern Legend Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-200 text-xs shadow-sm flex items-center justify-between pointer-events-none flex-wrap gap-2">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 ring-2 ring-sky-200" />
            <span className="text-slate-700 font-semibold text-[11px]">Your Location</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3.5 h-3.5 rounded-md bg-teal-600 text-white text-[9px] flex items-center justify-center font-bold">
              +
            </span>
            <span className="text-slate-700 font-semibold text-[11px]">In-Stock Pharmacy</span>
          </div>
          {isEmergency && (
            <div className="flex items-center space-x-1.5">
              <span className="w-3.5 h-3.5 rounded-md bg-rose-600 text-white text-[9px] flex items-center justify-center font-bold">
                +
              </span>
              <span className="text-rose-700 font-bold text-[11px]">Emergency Availability</span>
            </div>
          )}
        </div>

        <div className="text-[10px] text-slate-400 font-medium">
          OpenStreetMap &bull; Leaflet WGS84
        </div>
      </div>
    </div>
  );
};

export default PharmacyMap;
