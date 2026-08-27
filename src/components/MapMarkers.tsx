import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Property } from "../data/properties";
import { AiMatch } from "../types";
import { getGumacaSchools } from "../utils/schoolDistances";

interface MapMarkersProps {
  map: L.Map | null;
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenDetails?: (property: Property) => void;
  aiMatches?: AiMatch[];
  showSchoolsOnMap: boolean;
  isEntranceEditingMode: boolean;
  activeSchoolRouteFilter: string;
  selectedSchoolId?: string;
  dismissedSchoolId: string | null;
  hoveredProperty: Property | null;
  triggerArrowHighlight: (lat: number, lng: number, title: string, desc?: string, zoom?: number) => void;
  getLatLngForProperty: (p: Property) => [number, number];
  setClickedStreet: (info: any) => void;
}

export default function MapMarkers({
  map,
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenDetails,
  aiMatches,
  showSchoolsOnMap,
  isEntranceEditingMode,
  activeSchoolRouteFilter,
  selectedSchoolId,
  dismissedSchoolId,
  hoveredProperty,
  triggerArrowHighlight,
  getLatLngForProperty,
  setClickedStreet,
}: MapMarkersProps) {
  const markersRef = useRef<L.Marker[]>([]);
  const routeLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Add School Markers when showSchoolsOnMap is enabled
    if (showSchoolsOnMap) {
      const activeSchools = getGumacaSchools();
      activeSchools.forEach((sch) => {
        // Skip standard school markers in school editor mode as all schools are rendered as draggable pins
        if (isEntranceEditingMode) {
          return;
        }
        const schoolIcon = L.divIcon({
          className: "custom-school-marker-pin !bg-transparent !border-none",
          html: `
            <div class="cursor-pointer group flex flex-col items-center transition-transform hover:scale-110 active:scale-95">
              <div class="relative flex items-center justify-center">
                <div class="w-8 h-8 bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-amber-300 rounded-full border-2 border-amber-400 shadow-xl flex items-center justify-center font-bold">
                  <span class="text-xs">🎓</span>
                </div>
              </div>
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-amber-400 -mt-0.5 drop-shadow-sm"></div>
              <div class="bg-indigo-950/95 text-amber-300 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-amber-400 shadow-xl mt-0.5 whitespace-nowrap flex items-center gap-1">
                <span>🎓 ${sch.shortName || sch.name}</span>
              </div>
            </div>
          `,
          iconSize: [160, 52],
          iconAnchor: [80, 42]
        });

        const marker = L.marker([sch.lat, sch.lng], {
          icon: schoolIcon,
          title: sch.name
        }).addTo(map);

        marker.bindPopup(`
          <div class="p-2 font-sans min-w-[200px]">
            <div class="flex items-center gap-1.5 mb-1">
              <span class="text-sm">🎓</span>
              <strong class="text-xs font-bold text-stone-900">${sch.name}</strong>
            </div>
            <p class="text-[11px] text-stone-600 m-0 mb-1.5">${sch.desc}</p>
            <div class="bg-indigo-50 border border-indigo-200 p-1.5 rounded-lg text-[10px] text-indigo-900 font-mono flex items-center justify-between">
              <span>📍 GPS: ${sch.lat.toFixed(6)}, ${sch.lng.toFixed(6)}</span>
            </div>
          </div>
        `);

        marker.on("click", () => {
          triggerArrowHighlight(sch.lat, sch.lng, sch.name, sch.desc, 20);
        });

        markersRef.current.push(marker);
      });
    }

    // Add Property Markers
    properties.forEach(property => {
      const [lat, lng] = getLatLngForProperty(property);
      const isSelected = selectedProperty?.id === property.id;
      const matchScore = aiMatches?.find(m => m.id === property.id)?.score;

      const priceTag = `₱${(property.price / 1000).toFixed(1)}k`;

      const markerIcon = L.divIcon({
        className: "custom-property-pin",
        html: `
          <div class="cursor-pointer transition-transform transform ${isSelected ? 'scale-125 z-50' : 'hover:scale-110'}">
            <div class="${isSelected ? 'bg-amber-500 text-stone-900 border-2 border-stone-900 ring-4 ring-amber-500/30' : 'bg-stone-900 text-white border-2 border-white'} font-bold text-[11px] px-2 py-1 rounded-xl shadow-lg flex items-center gap-1 whitespace-nowrap">
              <span>${priceTag}</span>
              ${matchScore ? `<span class="bg-amber-400 text-stone-900 text-[9px] px-1 rounded-md">${matchScore}%</span>` : ''}
            </div>
            <div class="w-2 h-2 ${isSelected ? 'bg-amber-500' : 'bg-stone-900'} rotate-45 mx-auto -mt-1 shadow-xs"></div>
          </div>
        `,
        iconSize: [70, 32],
        iconAnchor: [35, 32]
      });

      const marker = L.marker([lat, lng], {
        icon: markerIcon,
        title: property.title
      }).addTo(map);

      // Custom popup HTML matching user's requested map popup layout
      const popupDiv = document.createElement("div");
      popupDiv.className = "font-sans p-0.5";
      popupDiv.innerHTML = `
        <div class="flex gap-3 items-center">
          <img
            src="${property.image}"
            alt="${property.title}"
            class="w-16 h-16 object-cover rounded-2xl border border-stone-100 shrink-0 shadow-2xs"
          />
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-stone-900 text-sm leading-snug truncate m-0">
              ${property.title}
            </h4>
            <p class="text-xs text-stone-500 m-0 mt-0.5 truncate font-normal">
              ${property.neighborhood || property.address || 'Barangay Tabing Dagat'}, ${property.city || 'Gumaca'}
            </p>
            <div class="mt-1.5 inline-block bg-stone-100 text-stone-900 font-bold text-xs px-2.5 py-0.5 rounded-md border border-stone-200/60">
              ₱${property.price.toLocaleString()} / month
            </div>
          </div>
        </div>
        <button
          id="leaflet-popup-btn-${property.id}"
          class="w-full mt-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 rounded-2xl py-2 px-3 text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
        >
          Tingnan ang detalye
        </button>
      `;

      marker.bindPopup(popupDiv, {
        className: "custom-leaflet-property-popup",
        maxWidth: 320
      });

      marker.on("popupopen", () => {
        setClickedStreet(null);
        onSelectProperty(property);
        setTimeout(() => {
          const btn = document.getElementById(`leaflet-popup-btn-${property.id}`);
          if (btn) {
            btn.onclick = (e) => {
              e.stopPropagation();
              if (onOpenDetails) {
                onOpenDetails(property);
              }
            };
          }
        }, 50);
      });

      marker.on("click", () => {
        setClickedStreet(null);
        onSelectProperty(property);
      });

      markersRef.current.push(marker);
    });

    // Manage Route Layer for connecting lines from Selected Property to Schools / Selected School Pinpoint
    if (routeLayerRef.current) {
      try {
        routeLayerRef.current.clearLayers();
        routeLayerRef.current.remove();
      } catch (e) {}
    }
    routeLayerRef.current = L.layerGroup().addTo(map);

    const rawSchoolId = (activeSchoolRouteFilter && activeSchoolRouteFilter !== "none" && activeSchoolRouteFilter !== "all")
      ? activeSchoolRouteFilter
      : (selectedSchoolId && selectedSchoolId !== "none" && selectedSchoolId !== "all")
        ? selectedSchoolId
        : null;

    const targetSchoolId = (
      rawSchoolId &&
      rawSchoolId !== dismissedSchoolId &&
      (selectedProperty || hoveredProperty || (activeSchoolRouteFilter && activeSchoolRouteFilter !== "none"))
    ) ? rawSchoolId : null;

    if (targetSchoolId) {
      const activeSchools = getGumacaSchools();
      const selectedSchoolObj = activeSchools.find(s =>
        s.id === targetSchoolId ||
        s.id.includes(targetSchoolId) ||
        targetSchoolId.includes(s.id) ||
        s.name.toLowerCase().includes(targetSchoolId.toLowerCase())
      );

      if (selectedSchoolObj) {
        const lineStrokeColor = "#2563eb"; // Vibrant Blue Route Line as requested

        // 1. Add Prominent School Bouncing Arrow Pinpoint Marker
        const schoolIcon = L.divIcon({
          className: "custom-selected-school-arrow-pin !bg-transparent !border-none",
          html: `
            <div class="cursor-pointer group flex flex-col items-center z-50 transition-transform hover:scale-110 active:scale-95">
              <!-- Distinct SVG School Pinhead Badge with Pulsing Ring -->
              <div class="relative flex items-center justify-center">
                <!-- Pulsing Outer Ring -->
                <div class="absolute -inset-2 bg-indigo-500/50 rounded-full animate-ping"></div>
                
                <!-- Circle SVG Pin Container -->
                <div class="relative w-11 h-11 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 text-amber-300 rounded-full border-2 border-amber-400 shadow-2xl flex items-center justify-center p-2">
                  <!-- Graduation Cap SVG Icon -->
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-300 drop-shadow-md animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.7 2.21a1.25 1.25 0 0 1 1.6 0l9.25 7.4a1.25 1.25 0 0 1-.22 2.05l-2.08.99v4.6a2.25 2.25 0 0 1-1.35 2.07l-5.65 2.38a2.25 2.25 0 0 1-1.7 0l-5.65-2.38A2.25 2.25 0 0 1 4.5 17.25v-4.6l-2.08-.99a1.25 1.25 0 0 1-.22-2.05l9.5-7.4Z" />
                  </svg>
                </div>
              </div>
              
              <!-- Pointer Tip -->
              <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400 -mt-0.5 drop-shadow-md"></div>
            </div>
          `,
          iconSize: [160, 56],
          iconAnchor: [80, 42]
        });

        const schoolMarker = L.marker([selectedSchoolObj.lat, selectedSchoolObj.lng], {
          icon: schoolIcon,
          zIndexOffset: 10000,
          title: selectedSchoolObj.name
        }).addTo(map);

        routeLayerRef.current.addLayer(schoolMarker);
        markersRef.current.push(schoolMarker);

        // 2. Draw Direct Route Lines from Selected/Hovered Properties to this School
        const targetProperties = selectedProperty 
          ? [selectedProperty] 
          : hoveredProperty 
            ? [hoveredProperty] 
            : properties.filter(p => p.id === activeSchoolRouteFilter || activeSchoolRouteFilter === "all");

        targetProperties.forEach(property => {
          const [propLat, propLng] = getLatLngForProperty(property);

          // Create direct route line
          const routeLine = L.polyline([[propLat, propLng], [selectedSchoolObj.lat, selectedSchoolObj.lng]], {
            color: lineStrokeColor,
            weight: 3,
            opacity: 0.9,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "8, 8",
            interactive: false
          });

          routeLayerRef.current?.addLayer(routeLine);

          // Add distance label at midpoint
          const midLat = (propLat + selectedSchoolObj.lat) / 2;
          const midLng = (propLng + selectedSchoolObj.lng) / 2;

          const dLat = (propLat - selectedSchoolObj.lat) * 111000;
          const dLng = (propLng - selectedSchoolObj.lng) * 111000 * Math.cos(((propLat + selectedSchoolObj.lat) / 2) * Math.PI / 180);
          const distanceMeters = Math.round(Math.sqrt(dLat * dLat + dLng * dLng));
          const distanceKm = (distanceMeters / 1000).toFixed(1);

          const distanceIcon = L.divIcon({
            className: "route-distance-label",
            html: `
              <div class="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-md border-2 border-white shadow-md whitespace-nowrap flex items-center gap-1">
                <span class="font-black">${distanceKm} km</span>
                <span class="text-[8px]">to ${selectedSchoolObj.shortName || selectedSchoolObj.name}</span>
              </div>
            `,
            iconSize: [120, 24],
            iconAnchor: [60, 12]
          });

          const distanceMarker = L.marker([midLat, midLng], {
            icon: distanceIcon,
            interactive: false,
            zIndexOffset: 5000
          });

          routeLayerRef.current?.addLayer(distanceMarker);
        });
      }
    }

    return () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (routeLayerRef.current) {
        routeLayerRef.current.clearLayers();
        routeLayerRef.current.remove();
      }
    };
  }, [
    map,
    properties,
    selectedProperty,
    aiMatches,

    showSchoolsOnMap,
    isEntranceEditingMode,
    activeSchoolRouteFilter,
    selectedSchoolId,
    dismissedSchoolId,
    hoveredProperty,
    triggerArrowHighlight,
    getLatLngForProperty,
    onSelectProperty,
    onOpenDetails,
    setClickedStreet
  ]);

  return null; // This component doesn't render anything visible
}