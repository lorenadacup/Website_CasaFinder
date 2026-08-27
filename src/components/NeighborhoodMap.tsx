import React, { useState, useEffect, useRef } from "react";
import L from "leaflet";
import { motion } from "motion/react";
import { getGumacaSchools, parsePropertyLatLng } from "../utils/schoolDistances";
import { getStreetInfoForCoordinates, StreetInfo } from "../utils/streetInfo";
import { GUMACA_CENTER, DEFAULT_ZOOM, GUMACA_LANDMARKS, MapMode, GRID_CONFIG, GOOGLE_SATELLITE_URL, GOOGLE_STREET_URL, MAX_ZOOM, DEFAULT_ARROW_MARKERS } from "../utils/mapConstants";
import { AiMatch } from "../types";
import { Property } from "../data/properties";
import { Map, Navigation, Compass, Search, Maximize2, Minimize2 } from "lucide-react";

// Import new components
import MapControls from "./MapControls";
import MapMarkers from "./MapMarkers";
import SchoolEditingSystem from "./SchoolEditingSystem";
import StreetInfoPanel from "./StreetInfoPanel";
import SearchResults from "./SearchResults";
import ArrowMarkersSystem from "./ArrowMarkersSystem";

interface NeighborhoodMapProps {
  properties: Property[];
  selectedProperty: Property | null;
  onSelectProperty: (property: Property) => void;
  onOpenDetails?: (property: Property) => void;
  aiMatches?: AiMatch[];
  selectedSchoolId?: string;
}

// Convert percentage coordinates or fallback to real Gumaca Lat/Lng
const getLatLngForProperty = (p: Property): [number, number] => {
  if (!p) return GUMACA_CENTER;
  return parsePropertyLatLng(p.coordinates, p.neighborhood, p.id);
};

// Searchable locations database in Gumaca
const createSearchLocations = (properties: Property[]) => [
  { name: "SLSU Villa Nava 🎓", lat: 13.912125, lng: 122.104057, detail: "Brgy. Villa Nava Campus" },
  { name: "SLSU Tabing Dagat Campus 🎓", lat: 13.9230, lng: 122.1014, detail: "Brgy. Tabing Dagat Campus" },
  { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, detail: "College, Gumaca" },
  { name: "Gumaca National High School (GNHS) 🏫", lat: 13.9182, lng: 122.0956, detail: "High School, Mabini/Poblacion" },
  { name: "Gumaca West & East Central Elementary ", lat: 13.918000, lng: 122.099000, detail: "Elementary School, M.H. Del Pilar St." },
  { name: "Holy Child Academy 🏫", lat: 13.921500, lng: 122.099500, detail: "High School / Academy, Town Proper" },
  // All 13 Gumaca Barangays with precise GPS Coordinates
  { name: "📍 Barangay Tabing Dagat", lat: 13.923258, lng: 122.101460, detail: "Coastal Quayside, Nava Blvd & SLSU Campus Area" },
  { name: "📍 Barangay Villa Nava", lat: 13.912125, lng: 122.104057, detail: "Maharlika Hwy East & SLSU Villa Nava Campus" },
  { name: "📍 Barangay Peñafrancia", lat: 13.924800, lng: 122.095500, detail: "Quayside / Coastal West Area" },
  { name: "📍 Barangay Pipisik", lat: 13.925200, lng: 122.097500, detail: "Poblacion Pipisik, EQC & Bus Terminal" },
  { name: "📍 Barangay San Diego", lat: 13.920200, lng: 122.103800, detail: "Puregold & San Diego Road Area" },
  { name: "📍 Barangay Bagong Buhay", lat: 13.919000, lng: 122.098000, detail: "Poblacion Central / West Central" },
  { name: "📍 Barangay Mabini", lat: 13.922000, lng: 122.098500, detail: "Town Proper & Cathedral Area" },
  { name: "📍 Barangay Maunlad", lat: 13.921000, lng: 122.096500, detail: "Grand Terminal & Poblacion West" },
  { name: "📍 Barangay Buensuceso", lat: 13.928000, lng: 122.095000, detail: "Northwest Coastal Area" },
  { name: "📍 Barangay Progreso Purok 1", lat: 13.918000, lng: 122.101000, detail: "Piat & Central South Area" },
  { name: "📍 Barangay Rosario", lat: 13.924000, lng: 122.099000, detail: "Municipal Hall & North Town Center" },
  { name: "Maharlika Highway (Gumaca Section)", lat: 13.9220, lng: 122.1000, detail: "Main Provincial Arterial Highway" },
  { name: "Quayside Boulevard", lat: 13.9255, lng: 122.0968, detail: "Lamon Bay Coastal Road" },
  { name: "Gumaca Municipal Hall & Plaza", lat: 13.9231, lng: 122.0982, detail: "Poblacion Center" },
  { name: "Jollibee Gumaca 🍔🐝", lat: 13.920523, lng: 122.099064, detail: "Fast Food Restaurant, Maharlika Highway" },
  { name: "McDonald's Gumaca 🍟🍔", lat: 13.920751, lng: 122.100299, detail: "Fast Food Restaurant, Maharlika Highway" },
  { name: "Chowking Gumaca 🥢🥟", lat: 13.920489, lng: 122.098769, detail: "Fast Food Restaurant, Maharlika Highway" },
  { name: "Novo Department Store 🛍️🏢", lat: 13.920196, lng: 122.097666, detail: "Department Store & Shopping, Maharlika Highway" },
  { name: "Heritage Site 🏛️", lat: 13.923430, lng: 122.100694, detail: "Gumaca Heritage Site, Tabing Dagat" },
  { name: "San Diego de Alcala Cathedral ⛪", lat: 13.921587, lng: 122.099428, detail: "Historic Parish Church, Town Proper" },
  { name: "Gumaca Public Market 🛒🐟", lat: 13.920509, lng: 122.101597, detail: "Public Market & Commercial Hub, Poblacion" },
  { name: "Puregold Gumaca 🟡🛒", lat: 13.921103, lng: 122.105650, detail: "Supermarket & Mall, Maharlika Highway" },
  { name: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", lat: 13.919680, lng: 122.100656, detail: "Jeep Terminal (Macalelon, Unisan, Lopez)" },
  { name: "Jeep Terminal (Lopez) 🚐", lat: 13.9222, lng: 122.1009, detail: "Jeep Terminal bound for Lopez" },
  { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, detail: "Piat Area, Mabini / Poblacion" },
  { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, detail: "Church / Chapel, Town Proper" },
  { name: "578 Emporium 📍", lat: 13.921341, lng: 122.103364, detail: "Shopping Center & Emporium, Maharlika Highway" },
  ...properties.map(p => {
    const [lat, lng] = getLatLngForProperty(p);
    return {
      name: ` ${p.title}`,
      lat,
      lng,
      detail: `Dorm / Boarding House - ₱${p.price.toLocaleString()}/mo in ${p.neighborhood}`,
      propertyObj: p
    };
  })
];

export default function NeighborhoodMap({
  properties,
  selectedProperty,
  onSelectProperty,
  onOpenDetails,
  aiMatches,
  selectedSchoolId
}: NeighborhoodMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const propertyCardRef = useRef<HTMLDivElement>(null);

  // Map state
  const [clickedStreet, setClickedStreet] = useState<StreetInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [hoveredProperty, setHoveredProperty] = useState<Property | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapMode, setMapMode] = useState<MapMode>("satellite");
  const [showGrid, setShowGrid] = useState(false);
  const [showSchoolsOnMap, setShowSchoolsOnMap] = useState(false);

  // User location state
  const [userExactGps, setUserExactGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(null);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const userGpsMarkerRef = useRef<L.Marker | null>(null);
  const userGpsCircleRef = useRef<L.Circle | null>(null);

  // Arrow markers state
  const [arrowMarkers, setArrowMarkers] = useState<Record<string, { lat: number; lng: number; title: string; desc?: string; _v?: number }>>({});
  const [activeArrowLocation, setActiveArrowLocation] = useState<{ lat: number; lng: number; title: string; desc?: string } | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // School editing state
  const [isEntranceEditingMode, setIsEntranceEditingMode] = useState(false);
  const [selectedEditingSchoolId, setSelectedEditingSchoolId] = useState("slsu-main");
  const [editingCampusLat, setEditingCampusLat] = useState<number>(13.923258);
  const [editingCampusLng, setEditingCampusLng] = useState<number>(122.101460);
  const [entranceSaveToast, setEntranceSaveToast] = useState<string | null>(null);
  const [schoolRevision, setSchoolRevision] = useState(0);

  // School route filter state
  const [activeSchoolRouteFilter, setActiveSchoolRouteFilter] = useState<string>("all");
  const [dismissedSchoolId, setDismissedSchoolId] = useState<string | null>(null);

  // System box state
  const [systemTab, setSystemTab] = useState<"edit" | "add">("edit");
  const [newSchoolName, setNewSchoolName] = useState("");
  const [newSchoolShortName, setNewSchoolShortName] = useState("");
  const [newSchoolType, setNewSchoolType] = useState<'University' | 'College' | 'High School' | 'Elementary'>("College");
  const [newSchoolDesc, setNewSchoolDesc] = useState("");
  const [newSchoolCampusLat, setNewSchoolCampusLat] = useState<number>(13.922000);
  const [newSchoolCampusLng, setNewSchoolCampusLng] = useState<number>(122.099500);

  // UI state
  const [isMobileQuickJumpOpen, setIsMobileQuickJumpOpen] = useState(false);
  const [isPropertyCardDismissed, setIsPropertyCardDismissed] = useState(false);
  const [copySuccessMsg, setCopySuccessMsg] = useState("");

  // Refs for system box scrolling
  const systemBoxScrollRef = useRef<HTMLDivElement | null>(null);
  const addFormSectionRef = useRef<HTMLDivElement | null>(null);

  // Map layers refs
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const gridLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (leafletMapRef.current) {
      leafletMapRef.current.invalidateSize();
      return;
    }

    const map = L.map(mapContainerRef.current, {
      center: GUMACA_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      dragging: true,
      bounceAtZoom: false
    } as any);

    leafletMapRef.current = map;
    setMapReady(true);

    // Create drawing pane
    if (!map.getPane("drawingPane")) {
      map.createPane("drawingPane");
      const dPane = map.getPane("drawingPane");
      if (dPane) {
        dPane.style.zIndex = "1200";
        dPane.style.pointerEvents = "none";
      }
    }

    // Initialize tile layer
    const initialTileUrl = mapMode === "satellite" ? GOOGLE_SATELLITE_URL : GOOGLE_STREET_URL;
    const initialAttr = mapMode === "satellite" ? "Google Maps Satellite | Gumaca, Quezon" : "Google Maps | Gumaca, Quezon";

    const layer = L.tileLayer(initialTileUrl, {
      maxZoom: MAX_ZOOM,
      attribution: initialAttr
    }).addTo(map);

    tileLayerRef.current = layer;

    // Map click handler
    map.on("click", (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      const info = getStreetInfoForCoordinates(lat, lng);
      setClickedStreet(info);
    });

    // Pointer-based fallback click handler
    const container = map.getContainer();
    let pointerStartX = 0;
    let pointerStartY = 0;
    let pointerStartTime = Date.now();

    const handlePointerDown = (e: PointerEvent) => {
      pointerStartX = e.clientX;
      pointerStartY = e.clientY;
      pointerStartTime = Date.now();
    };

    const handlePointerUp = (e: PointerEvent) => {
      const dist = Math.hypot(e.clientX - pointerStartX, e.clientY - pointerStartY);
      const elapsed = Date.now() - pointerStartTime;

      if (dist < 12 && elapsed < 600) {
        const target = e.target as HTMLElement;
        if (target && target.closest(".leaflet-control, button, input, select, .leaflet-popup, .z-30, .z-40, .leaflet-marker-icon, .custom-school-editor-pin, .custom-school-marker-pin")) {
          return;
        }

        const latlng = map.mouseEventToLatLng(e);
        if (latlng && latlng.lat && latlng.lng) {
          const info = getStreetInfoForCoordinates(latlng.lat, latlng.lng);
          setClickedStreet(info);
        }
      }
    };

    container.addEventListener("pointerdown", handlePointerDown);
    container.addEventListener("pointerup", handlePointerUp);

    return () => {
      container.removeEventListener("pointerdown", handlePointerDown);
      container.removeEventListener("pointerup", handlePointerUp);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update tile layer on mapMode change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const targetUrl = mapMode === "satellite" ? GOOGLE_SATELLITE_URL : GOOGLE_STREET_URL;
    const targetAttr = mapMode === "satellite" ? "Google Maps Satellite | Gumaca, Quezon" : "Google Maps | Gumaca, Quezon";

    const newLayer = L.tileLayer(targetUrl, {
      maxZoom: MAX_ZOOM,
      attribution: targetAttr
    }).addTo(map);

    tileLayerRef.current = newLayer;
  }, [mapMode]);

  // Grid overlay effect
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    if (!gridLayerRef.current) {
      gridLayerRef.current = L.layerGroup().addTo(map);
    } else {
      gridLayerRef.current.clearLayers();
    }

    if (showGrid) {
      const { latStart, latEnd, lngStart, lngEnd, step } = GRID_CONFIG;

      for (let lat = latStart; lat <= latEnd; lat += step) {
        const line = L.polyline([[lat, lngStart], [lat, lngEnd]], {
          color: "#f59e0b",
          weight: 1,
          dashArray: "4, 4",
          opacity: 0.6,
          interactive: false
        });
        gridLayerRef.current.addLayer(line);

        const labelIcon = L.divIcon({
          className: "grid-label-lat",
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lat.toFixed(3)}N</div>`,
          iconSize: [50, 14],
          iconAnchor: [0, 7]
        });
        gridLayerRef.current.addLayer(L.marker([lat, lngStart + 0.001], { icon: labelIcon, interactive: false }));
      }

      for (let lng = lngStart; lng <= lngEnd; lng += step) {
        const line = L.polyline([[latStart, lng], [latEnd, lng]], {
          color: "#f59e0b",
          weight: 1,
          dashArray: "4, 4",
          opacity: 0.6,
          interactive: false
        });
        gridLayerRef.current.addLayer(line);

        const labelIcon = L.divIcon({
          className: "grid-label-lng",
          html: `<div class="bg-amber-500/90 text-stone-950 font-mono text-[9px] px-1 font-black rounded shadow-xs select-none opacity-90">${lng.toFixed(3)}E</div>`,
          iconSize: [55, 14],
          iconAnchor: [27, 0]
        });
        gridLayerRef.current.addLayer(L.marker([latStart + 0.001, lng], { icon: labelIcon, interactive: false }));
      }
    }
  }, [showGrid]);

  // School route filter effects
  useEffect(() => {
    if (selectedSchoolId && selectedSchoolId !== "all" && selectedSchoolId !== "none") {
      setActiveSchoolRouteFilter(selectedSchoolId);
    } else {
      setActiveSchoolRouteFilter("none");
    }
  }, [selectedSchoolId, selectedProperty]);

  useEffect(() => {
    setDismissedSchoolId(null);
  }, [selectedSchoolId, selectedProperty]);

  // School editing coordinate sync
  useEffect(() => {
    const activeSchools = getGumacaSchools();
    const sch = activeSchools.find(s => s.id === selectedEditingSchoolId) || activeSchools[0];
    if (sch) {
      setEditingCampusLat(sch.lat);
      setEditingCampusLng(sch.lng);
    }
  }, [selectedEditingSchoolId, schoolRevision]);

  // School coordinates update event listener
  useEffect(() => {
    const handleUpdate = () => {
      setSchoolRevision(r => r + 1);
    };
    window.addEventListener("casafinder_school_coords_updated", handleUpdate);

    return () => {
      window.removeEventListener("casafinder_school_coords_updated", handleUpdate);
    };
  }, []);

  // Selected property card effect
  useEffect(() => {
    if (selectedProperty) {
      setIsPropertyCardDismissed(false);
    }
  }, [selectedProperty]);

  // Map size invalidation
  useEffect(() => {
    const handleInvalidate = () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    };

    handleInvalidate();

    let resizeObserver: ResizeObserver | null = null;
    if (mapContainerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleInvalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
    }

    const t1 = setTimeout(handleInvalidate, 100);
    const t2 = setTimeout(handleInvalidate, 350);
    const t3 = setTimeout(handleInvalidate, 700);

    window.addEventListener("resize", handleInvalidate);
    window.addEventListener("orientationchange", handleInvalidate);

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener("resize", handleInvalidate);
      window.removeEventListener("orientationchange", handleInvalidate);
    };
  }, [isFullscreen]);

  // Helper functions
  const toggleFullscreen = () => {
    setIsFullscreen(prev => !prev);
    setTimeout(() => {
      if (leafletMapRef.current) {
        leafletMapRef.current.invalidateSize();
      }
    }, 200);
  };

  const panToArea = (lat: number, lng: number, zoom: number = 20) => {
    if (leafletMapRef.current) {
      leafletMapRef.current.flyTo([lat, lng], zoom, { animate: true, duration: 1.2 });
    }
  };

  const triggerArrowHighlight = (lat: number, lng: number, title: string, desc?: string, zoom: number = 17, arrowId?: string) => {
    setActiveArrowLocation({ lat, lng, title, desc });
    const id = arrowId || title.replace(/[^a-z0-9]/gi, "-").toLowerCase().slice(0, 40);

    // Get saved position for this arrow
    const savedCoords = (() => {
      try {
        const saved = localStorage.getItem("casafinder_arrow_markers_v1");
        if (saved) {
          const parsed = JSON.parse(saved);
          const defaultVersion = arrowMarkers[id]?._v ?? 1;
          const savedVersion = parsed[id]?._v ?? 0;
          if (parsed[id] && savedVersion >= defaultVersion) {
            return { lat: parsed[id].lat, lng: parsed[id].lng };
          }
        }
      } catch (_) {}
      return null;
    })();

    const finalLat = savedCoords?.lat ?? lat;
    const finalLng = savedCoords?.lng ?? lng;

    // Only show the selected arrow (replace any previous one)
    setArrowMarkers({ [id]: { lat: finalLat, lng: finalLng, title, desc, _v: arrowMarkers[id]?._v ?? 1 } });
    panToArea(finalLat, finalLng, zoom);
  };

  const triggerSLSUHighlight = (zoom: number = 20) => {
    triggerArrowHighlight(
      13.912125,
      122.104057,
      "SLSU Villa Nava 🎓",
      "Southern Luzon State University - Villa Nava Campus, Gumaca, Quezon.",
      zoom,
      "slsu-villa-nava"
    );
  };

  const getMatchScore = (propertyId: string) => {
    return aiMatches?.find(m => m.id === propertyId)?.score;
  };

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      alert("Hindi supported ng iyong browser ang Geolocation.");
      return;
    }
    setIsLocatingUser(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const uLat = position.coords.latitude;
        const uLng = position.coords.longitude;
        const acc = position.coords.accuracy || 25;

        setUserExactGps({ lat: uLat, lng: uLng, accuracy: acc });
        setIsLocatingUser(false);

        if (leafletMapRef.current) {
          const map = leafletMapRef.current;

          const userIcon = L.divIcon({
            className: "user-gps-exact-pin",
            html: `
              <div class="relative flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6" width="32" height="40" class="drop-shadow-lg">
                  <path d="M12 0C7.03 0 3 4.03 3 9c0 5.25 9 15 9 15s9-9.75 9-15c0-4.97-4.03-9-9-9zm0 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                </svg>
              </div>
            `,
            iconSize: [32, 40],
            iconAnchor: [16, 40],
          });

          if (userGpsMarkerRef.current) {
            userGpsMarkerRef.current.setLatLng([uLat, uLng]);
          } else {
            userGpsMarkerRef.current = L.marker([uLat, uLng], { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
          }

          if (userGpsCircleRef.current) {
            userGpsCircleRef.current.remove();
            userGpsCircleRef.current = null;
          }

          map.flyTo([uLat, uLng], 17, { animate: true, duration: 1.2 });
        }
      },
      () => {
        setIsLocatingUser(false);
        alert("Hindi makuha ang iyong lokasyon. Siguraduhing pinayagan ang Location Permission sa iyong browser.");
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const searchResults = createSearchLocations(properties).filter(item =>
    searchQuery.trim() ? (
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.detail.toLowerCase().includes(searchQuery.toLowerCase())
    ) : false
  );

  // System box scroll functions
  const scrollToTopSystemBox = () => {
    systemBoxScrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottomSystemBox = () => {
    if (systemBoxScrollRef.current) {
      systemBoxScrollRef.current.scrollTo({
        top: systemBoxScrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const scrollToAddSectionSystemBox = () => {
    setSystemTab("add");
    setTimeout(() => {
      addFormSectionRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 120);
  };

  return (
    <div
      id="neighborhood-map-container"
      className={`flex flex-col bg-white overflow-hidden shadow-xs transition-all duration-300 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen rounded-none p-0 border-0"
          : "h-full rounded-2xl border border-stone-200"
      }`}
    >
      {/* Map Controls */}
      <MapControls
        mapMode={mapMode}
        setMapMode={setMapMode}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        isMobileQuickJumpOpen={isMobileQuickJumpOpen}
        setIsMobileQuickJumpOpen={setIsMobileQuickJumpOpen}
        isLocatingUser={isLocatingUser}
        locateUser={handleLocateUser}
        userExactGps={userExactGps}
        arrowMarkers={arrowMarkers}
        triggerArrowHighlight={triggerArrowHighlight}
      />

      {/* Search Results */}
      <SearchResults
        searchResults={searchResults}
        showSearchResults={showSearchResults}
        setShowSearchResults={setShowSearchResults}
        setSearchQuery={setSearchQuery}
        triggerArrowHighlight={triggerArrowHighlight}
        panToArea={panToArea}
        setClickedStreet={setClickedStreet}
      />

      {/* Map Container */}
      <div ref={mapContainerRef} className="flex-1 relative z-0" />

      {/* Arrow Markers System */}
      <ArrowMarkersSystem
        map={leafletMapRef.current}
        arrowMarkers={arrowMarkers}
        setArrowMarkers={setArrowMarkers}
        activeArrowLocation={activeArrowLocation}
        setActiveArrowLocation={setActiveArrowLocation}
        mapReady={mapReady}
      />

      {/* Map Markers */}
      <MapMarkers
        map={leafletMapRef.current}
        properties={properties}
        selectedProperty={selectedProperty}
        onSelectProperty={onSelectProperty}
        onOpenDetails={onOpenDetails}
        aiMatches={aiMatches}
        showSchoolsOnMap={showSchoolsOnMap}
        isEntranceEditingMode={isEntranceEditingMode}
        activeSchoolRouteFilter={activeSchoolRouteFilter}
        selectedSchoolId={selectedSchoolId}
        dismissedSchoolId={dismissedSchoolId}
        hoveredProperty={hoveredProperty}
        triggerArrowHighlight={triggerArrowHighlight}
        getLatLngForProperty={getLatLngForProperty}
        setClickedStreet={setClickedStreet}
      />

      {/* School Editing System */}
      <SchoolEditingSystem
        map={leafletMapRef.current}
        isEntranceEditingMode={isEntranceEditingMode}
        selectedEditingSchoolId={selectedEditingSchoolId}
        setSelectedEditingSchoolId={setSelectedEditingSchoolId}
        editingCampusLat={editingCampusLat}
        setEditingCampusLat={setEditingCampusLat}
        editingCampusLng={editingCampusLng}
        setEditingCampusLng={setEditingCampusLng}
        entranceSaveToast={entranceSaveToast}
        setEntranceSaveToast={setEntranceSaveToast}
        schoolRevision={schoolRevision}
        setSchoolRevision={setSchoolRevision}
        setIsEntranceEditingMode={setIsEntranceEditingMode}
        systemTab={systemTab}
        setSystemTab={setSystemTab}
        newSchoolName={newSchoolName}
        setNewSchoolName={setNewSchoolName}
        newSchoolShortName={newSchoolShortName}
        setNewSchoolShortName={setNewSchoolShortName}
        newSchoolType={newSchoolType}
        setNewSchoolType={setNewSchoolType}
        newSchoolDesc={newSchoolDesc}
        setNewSchoolDesc={setNewSchoolDesc}
        newSchoolCampusLat={newSchoolCampusLat}
        setNewSchoolCampusLat={setNewSchoolCampusLat}
        newSchoolCampusLng={newSchoolCampusLng}
        setNewSchoolCampusLng={setNewSchoolCampusLng}
        systemBoxScrollRef={systemBoxScrollRef}
        addFormSectionRef={addFormSectionRef}
        scrollToTopSystemBox={scrollToTopSystemBox}
        scrollToBottomSystemBox={scrollToBottomSystemBox}
        scrollToAddSectionSystemBox={scrollToAddSectionSystemBox}
      />

      {/* Street Info Panel */}
      <StreetInfoPanel
        clickedStreet={clickedStreet}
        setClickedStreet={setClickedStreet}
        isPropertyCardDismissed={isPropertyCardDismissed}
        setIsPropertyCardDismissed={setIsPropertyCardDismissed}
        selectedProperty={selectedProperty}
        copySuccessMsg={copySuccessMsg}
        setCopySuccessMsg={setCopySuccessMsg}
        panToArea={panToArea}
        getMatchScore={getMatchScore}
        onOpenDetails={onOpenDetails}
      />

      {/* Quick Jump Buttons (Fullscreen) */}
      {isFullscreen && (
        <div className="hidden sm:flex bg-stone-100/70 border-b border-stone-200 px-3 py-2 items-center gap-2 overflow-x-auto text-[10px] no-scrollbar">
          <span className="text-stone-400 font-mono shrink-0 mr-1 flex items-center gap-1">
            <Compass className="h-3 w-3 text-stone-400" />
            Quick Jump:
          </span>
          <button
            onClick={() => triggerSLSUHighlight(17)}
            className="bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            SLSU Villa Nava
          </button>
          <button
            onClick={() => {
              const slsu = getGumacaSchools().find(s => s.id === "slsu-main");
              const slsuLat = slsu?.lat || 13.9230;
              const slsuLng = slsu?.lng || 122.1014;
              triggerArrowHighlight(slsuLat, slsuLng, "SLSU Tabing Dagat Campus 🎓", "Southern Luzon State University - Tabing Dagat Campus, Gumaca", 20, "slsu-tabing-dagat");
            }}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            SLSU Tabing Dagat
          </button>
          <button
            onClick={() => triggerArrowHighlight(13.920523, 122.099064, "Jollibee Gumaca 🍔🐝", "Fast Food Restaurant, Maharlika Highway, Gumaca", 20, "jollibee")}
            className="bg-red-50 hover:bg-red-100 text-red-800 border border-red-200/80 px-2.5 py-1 rounded-lg font-bold shrink-0 transition-colors cursor-pointer flex items-center gap-1"
          >
            Jollibee
          </button>
        </div>
      )}
    </div>
  );
}