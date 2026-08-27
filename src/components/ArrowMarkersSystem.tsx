import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { ARROW_STORAGE_KEY, DEFAULT_ARROW_MARKERS } from "../utils/mapConstants";

interface ArrowMarker {
  lat: number;
  lng: number;
  title: string;
  desc?: string;
  _v?: number;
}

interface ArrowMarkersSystemProps {
  map: L.Map | null;
  arrowMarkers: Record<string, ArrowMarker>;
  setArrowMarkers: (markers: Record<string, ArrowMarker>) => void;
  activeArrowLocation: { lat: number; lng: number; title: string; desc?: string } | null;
  setActiveArrowLocation: (location: { lat: number; lng: number; title: string; desc?: string } | null) => void;
  mapReady: boolean;
}

export default function ArrowMarkersSystem({
  map,
  arrowMarkers,
  setArrowMarkers,
  activeArrowLocation,
  setActiveArrowLocation,
  mapReady,
}: ArrowMarkersSystemProps) {
  const arrowMarkersRef = useRef<Record<string, L.Marker>>({});

  // Build arrow icon for markers
  const buildArrowIcon = (title: string, isDragging = false) => L.divIcon({
    className: "",
    html: `
      <div style="position:relative;display:flex;flex-direction:column;align-items:center;width:44px;height:44px;cursor:${isDragging ? "grabbing" : "grab"};user-select:none;">
        <!-- Label floats above, pointer-events none so it never blocks drag -->
        <div style="position:absolute;bottom:52px;left:50%;transform:translateX(-50%);white-space:nowrap;background:#dc2626;color:#fff;font-weight:800;font-size:10px;padding:3px 10px;border-radius:999px;border:2px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3);pointer-events:none;">
          ${title}
        </div>
        <!-- Ping ring -->
        ${!isDragging ? '<div style="position:absolute;inset:-8px;background:rgba(239,68,68,0.3);border-radius:50%;animation:ping 1.2s cubic-bezier(0,0,0.2,1) infinite;pointer-events:none;"></div>' : ""}
        <!-- Circle drag handle -->
        <div style="width:44px;height:44px;background:#dc2626;border-radius:50%;border:2.5px solid #fff;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;">
          <svg xmlns="http://www.w3.org/2000/svg" style="width:22px;height:22px;stroke-width:3.5;${!isDragging ? "animation:bounce 1s infinite;" : ""}" fill="none" viewBox="0 0 24 24" stroke="#fff">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
          </svg>
        </div>
      </div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 44]
  });

  // Initialize arrow markers from localStorage
  useEffect(() => {
    if (!map) return;

    const savedMarkers = (() => {
      try {
        const saved = localStorage.getItem(ARROW_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const result: Record<string, ArrowMarker> = {};
          
          Object.keys(DEFAULT_ARROW_MARKERS).forEach(key => {
            const defaultMarker = DEFAULT_ARROW_MARKERS[key as keyof typeof DEFAULT_ARROW_MARKERS];
            const savedMarker = parsed[key];
            
            if (savedMarker && savedMarker._v >= defaultMarker._v) {
              result[key] = {
                lat: savedMarker.lat,
                lng: savedMarker.lng,
                title: defaultMarker.title,
                desc: defaultMarker.desc,
                _v: savedMarker._v
              };
            } else {
              result[key] = {
                lat: defaultMarker.lat,
                lng: defaultMarker.lng,
                title: defaultMarker.title,
                desc: defaultMarker.desc,
                _v: defaultMarker._v
              };
            }
          });
          return result;
        }
      } catch (_) {}
      return DEFAULT_ARROW_MARKERS;
    })();

    setArrowMarkers(savedMarkers);
  }, [map, setArrowMarkers]);

  // Render arrow markers on map
  useEffect(() => {
    if (!map || !mapReady) return;

    Object.entries(arrowMarkers).forEach(([arrowId, arrow]) => {
      // If marker already exists on map, just move it — don't recreate
      if (arrowMarkersRef.current[arrowId]) {
        arrowMarkersRef.current[arrowId].setLatLng([arrow.lat, arrow.lng]);
        return;
      }

      const arrowMarker = L.marker([arrow.lat, arrow.lng], {
        icon: buildArrowIcon(arrow.title),
        draggable: true,
        title: arrow.title,
        zIndexOffset: 1000
      }).addTo(map);

      arrowMarker.on("click", () => {
        const { lat, lng } = arrowMarker.getLatLng();
        setActiveArrowLocation({ lat, lng, title: arrow.title, desc: arrow.desc });
        map.flyTo([lat, lng], 20, { animate: true, duration: 1.2 });
      });

      arrowMarker.on("dragstart", () => {
        arrowMarker.setIcon(buildArrowIcon(arrow.title, true));
      });

      arrowMarker.on("drag", () => {
        arrowMarker.setIcon(buildArrowIcon(arrow.title, true));
      });

      arrowMarker.on("dragend", () => {
        const { lat, lng } = arrowMarker.getLatLng();
        const newLat = Number(lat.toFixed(6));
        const newLng = Number(lng.toFixed(6));
        arrowMarker.setIcon(buildArrowIcon(arrow.title, false));
        
        // Update state AND auto-save to localStorage
        setArrowMarkers(prev => {
          const updated = { 
            ...prev, 
            [arrowId]: { 
              ...prev[arrowId], 
              lat: newLat, 
              lng: newLng, 
              _v: DEFAULT_ARROW_MARKERS[arrowId as keyof typeof DEFAULT_ARROW_MARKERS]?._v ?? 1 
            } 
          };
          try {
            // Save only this arrow's position to localStorage
            const existing = JSON.parse(localStorage.getItem(ARROW_STORAGE_KEY) || "{}");
            existing[arrowId] = { lat: newLat, lng: newLng, _v: DEFAULT_ARROW_MARKERS[arrowId as keyof typeof DEFAULT_ARROW_MARKERS]?._v ?? 1 };
            localStorage.setItem(ARROW_STORAGE_KEY, JSON.stringify(existing));
          } catch (_) {}
          return updated;
        });
      });

      arrowMarkersRef.current[arrowId] = arrowMarker;
    });

    // Remove arrows that no longer exist in state
    Object.keys(arrowMarkersRef.current).forEach(id => {
      if (!arrowMarkers[id]) {
        try { arrowMarkersRef.current[id].remove(); } catch (_) {}
        delete arrowMarkersRef.current[id];
      }
    });

    return () => {
      // Cleanup on unmount
      Object.values(arrowMarkersRef.current).forEach(marker => {
        try { marker.remove(); } catch (_) {}
      });
      arrowMarkersRef.current = {};
    };
  }, [map, mapReady, arrowMarkers, setArrowMarkers, setActiveArrowLocation]);

  return null; // This component doesn't render anything visible
}