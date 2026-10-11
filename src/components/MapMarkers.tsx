import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { Property } from "../data/properties";
import { AiMatch } from "../types";
import { getGumacaSchools } from "../utils/schoolDistances";
import { DEFAULT_ARROW_MARKERS } from "../utils/mapConstants";

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
  // Track the last route key that was fitted — prevents re-fitting when user zooms in
  const lastFittedRouteRef = useRef<string | null>(null);

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

    // Cancellation flag — set to true in cleanup so async OSRM results don't draw after re-render
    const cancelled = { value: false };

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

      // First try matching a school
      const selectedSchoolObj = activeSchools.find(s =>
        s.id === targetSchoolId ||
        s.id.includes(targetSchoolId) ||
        targetSchoolId.includes(s.id) ||
        s.name.toLowerCase().includes(targetSchoolId.toLowerCase())
      );

      // Fall back to DEFAULT_ARROW_MARKERS for non-school destinations
      const arrowEntry = !selectedSchoolObj
        ? DEFAULT_ARROW_MARKERS[targetSchoolId as keyof typeof DEFAULT_ARROW_MARKERS]
        : null;

      const destLat = selectedSchoolObj?.lat ?? arrowEntry?.lat ?? null;
      const destLng = selectedSchoolObj?.lng ?? arrowEntry?.lng ?? null;
      const destName = selectedSchoolObj?.name ?? arrowEntry?.title ?? targetSchoolId;
      const isSchool = !!selectedSchoolObj;

      if (destLat !== null && destLng !== null) {
        const lineStrokeColor = "#2563eb";

        // Destination pin — school style for schools, map-pin style for other destinations
        const destIcon = L.divIcon({
          className: "custom-selected-dest-pin !bg-transparent !border-none",
          html: isSchool ? `
            <div class="cursor-pointer group flex flex-col items-center z-50 transition-transform hover:scale-110 active:scale-95">
              <div class="relative flex items-center justify-center">
                <div class="absolute -inset-2 bg-indigo-500/50 rounded-full animate-ping"></div>
                <div class="relative w-11 h-11 bg-gradient-to-br from-indigo-800 via-indigo-900 to-slate-950 text-amber-300 rounded-full border-2 border-amber-400 shadow-2xl flex items-center justify-center p-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-amber-300 drop-shadow-md animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.7 2.21a1.25 1.25 0 0 1 1.6 0l9.25 7.4a1.25 1.25 0 0 1-.22 2.05l-2.08.99v4.6a2.25 2.25 0 0 1-1.35 2.07l-5.65 2.38a2.25 2.25 0 0 1-1.7 0l-5.65-2.38A2.25 2.25 0 0 1 4.5 17.25v-4.6l-2.08-.99a1.25 1.25 0 0 1-.22-2.05l9.5-7.4Z" />
                  </svg>
                </div>
              </div>
              <div class="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-amber-400 -mt-0.5 drop-shadow-md"></div>
            </div>
          ` : `
            <div class="cursor-pointer group flex flex-col items-center z-50 transition-transform hover:scale-110 active:scale-95">
              <div class="relative flex items-center justify-center">
                <div class="absolute -inset-2 bg-pink-500/40 rounded-full animate-ping"></div>
                <div class="relative w-10 h-10 bg-gradient-to-br from-pink-600 via-rose-700 to-pink-900 text-white rounded-full border-2 border-white shadow-2xl flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-white drop-shadow-md animate-bounce" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              </div>
              <div class="w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-white -mt-0.5 drop-shadow-md"></div>
              <div class="bg-stone-900/90 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md mt-0.5 whitespace-nowrap max-w-[120px] truncate shadow-lg">${destName}</div>
            </div>
          `,
          iconSize: isSchool ? [160, 56] : [140, 64],
          iconAnchor: isSchool ? [80, 42] : [70, 46]
        });

        const destMarker = L.marker([destLat, destLng], {
          icon: destIcon,
          zIndexOffset: 10000,
          title: destName
        }).addTo(map);

        routeLayerRef.current.addLayer(destMarker);
        markersRef.current.push(destMarker);

        // Draw route lines from selected/hovered properties to destination
        const targetProperties = selectedProperty
          ? [selectedProperty]
          : hoveredProperty
            ? [hoveredProperty]
            : properties.filter(p => p.id === activeSchoolRouteFilter || activeSchoolRouteFilter === "all");

        // Fit map bounds once per unique property+destination combo — skip if user already zoomed in
        if (targetProperties.length > 0) {
          const firstProp = targetProperties[0];
          const [fp0, fp1] = getLatLngForProperty(firstProp);
          const routeKey = `${fp0},${fp1}->${destLat},${destLng}`;

          if (lastFittedRouteRef.current !== routeKey) {
            lastFittedRouteRef.current = routeKey;
            const bounds = L.latLngBounds([fp0, fp1], [destLat, destLng]);
            targetProperties.slice(1).forEach(p => {
              const [la, lo] = getLatLngForProperty(p);
              bounds.extend([la, lo]);
            });
            map.fitBounds(bounds, { padding: [60, 60], maxZoom: 18, animate: true });
          }
        }

        // Helper: build the distance label icon
        const buildDistanceIcon = (label: string) => L.divIcon({
          className: "route-distance-label",
          html: `
            <div class="bg-indigo-600 text-white font-mono text-[10px] px-1.5 py-0.5 rounded-md border-2 border-white shadow-md whitespace-nowrap flex items-center gap-1">
              <span class="font-black">${label}</span>
            </div>
          `,
          iconSize: [72, 24],
          iconAnchor: [36, 12]
        });

        // Helper: draw a fallback straight-line route and distance label
        const drawFallbackRoute = (
          propLat: number, propLng: number,
          layer: L.LayerGroup
        ) => {
          // Outline
          layer.addLayer(L.polyline([[propLat, propLng], [destLat, destLng]], {
            color: "#ffffff",
            weight: 8,
            opacity: 0.4,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "10, 10",
            interactive: false
          }));
          // Main line
          layer.addLayer(L.polyline([[propLat, propLng], [destLat, destLng]], {
            color: "#3b82f6",
            weight: 5,
            opacity: 0.8,
            lineCap: "round",
            lineJoin: "round",
            dashArray: "10, 10",
            interactive: false
          }));
          const midLat = (propLat + destLat) / 2;
          const midLng = (propLng + destLng) / 2;
          const dLat = (propLat - destLat) * 111000;
          const dLng = (propLng - destLng) * 111000 * Math.cos(((propLat + destLat) / 2) * Math.PI / 180);
          const distanceKm = (Math.sqrt(dLat * dLat + dLng * dLng) / 1000).toFixed(1);
          layer.addLayer(L.marker([midLat, midLng], {
            icon: buildDistanceIcon(`~${distanceKm} km`),
            interactive: false,
            zIndexOffset: 5000
          }));
        };

        // Fetch road route from OSRM and draw it; fall back to straight line on error
        const drawOsrmRoute = async (
          propLat: number, propLng: number,
          layer: L.LayerGroup,
          cancelled: { value: boolean }
        ) => {
          try {
            // Step 1: Snap both property and destination to nearest road nodes
            const [snapPropRes, snapDestRes] = await Promise.all([
              fetch(`https://router.project-osrm.org/nearest/v1/driving/${propLng},${propLat}?number=1`),
              fetch(`https://router.project-osrm.org/nearest/v1/driving/${destLng},${destLat}?number=1`),
            ]);
            if (cancelled.value) return;

            const [snapPropData, snapDestData] = await Promise.all([
              snapPropRes.json(),
              snapDestRes.json(),
            ]);
            if (cancelled.value) return;

            // Use snapped coords if available, otherwise fall back to original
            const snappedProp = snapPropData?.waypoints?.[0]?.location;
            const snappedDest = snapDestData?.waypoints?.[0]?.location;
            const startLng = snappedProp ? snappedProp[0] : propLng;
            const startLat = snappedProp ? snappedProp[1] : propLat;
            const endLng   = snappedDest ? snappedDest[0] : destLng;
            const endLat   = snappedDest ? snappedDest[1] : destLat;

            // Step 2: Route between snapped points
            const url =
              `https://router.project-osrm.org/route/v1/driving/` +
              `${startLng},${startLat};${endLng},${endLat}` +
              `?overview=full&geometries=geojson&steps=false&alternatives=false&continue_straight=true`;

            const res = await fetch(url);
            if (cancelled.value) return;
            if (!res.ok) throw new Error("OSRM non-200");

            const data = await res.json();
            if (cancelled.value) return;

            const route = data?.routes?.[0];
            if (!route) throw new Error("No route returned");

            // Road geometry — array of [lng, lat] from GeoJSON, convert to [lat, lng] for Leaflet
            const coords: [number, number][] = route.geometry.coordinates.map(
              ([lng, lat]: [number, number]) => [lat, lng]
            );

            // Outline layer for contrast on satellite background
            layer.addLayer(L.polyline(coords, {
              color: "#ffffff",
              weight: 8,
              opacity: 0.5,
              lineCap: "round",
              lineJoin: "round",
              interactive: false
            }));

            // Main route line on top
            layer.addLayer(L.polyline(coords, {
              color: "#3b82f6",
              weight: 5,
              opacity: 0.95,
              lineCap: "round",
              lineJoin: "round",
              interactive: false
            }));

            // OSRM returns distance in metres
            const roadKm = (route.distance / 1000).toFixed(1);
            const walkMin = Math.round(route.duration / 60); // OSRM foot profile gives walking duration

            // Place label at the midpoint coord of the route geometry
            const midIdx = Math.floor(coords.length / 2);
            const [midLat, midLng] = coords[midIdx] ?? [(propLat + destLat) / 2, (propLng + destLng) / 2];

            layer.addLayer(L.marker([midLat, midLng], {
              icon: buildDistanceIcon(`${roadKm} km · ${walkMin} min`),
              interactive: false,
              zIndexOffset: 5000
            }));

          } catch {
            if (!cancelled.value) drawFallbackRoute(propLat, propLng, layer);
          }
        };

        // Fetch each property's route (cancelled flag is hoisted above)
        targetProperties.forEach(property => {
          const [propLat, propLng] = getLatLngForProperty(property);
          if (routeLayerRef.current) {
            drawOsrmRoute(propLat, propLng, routeLayerRef.current, cancelled);
          }
        });
      }
    }

    return () => {
      cancelled.value = true;
      lastFittedRouteRef.current = null;
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