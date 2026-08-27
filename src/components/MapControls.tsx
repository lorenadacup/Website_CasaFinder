import React from "react";
import { Navigation, Compass, Search, Maximize2, Minimize2, MapPin } from "lucide-react";
import { MapMode, DEFAULT_ARROW_MARKERS } from "../utils/mapConstants";

interface MapControlsProps {
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  isMobileQuickJumpOpen: boolean;
  setIsMobileQuickJumpOpen: (open: boolean) => void;
  isLocatingUser: boolean;
  liveGpsAccuracy: number | null;
  locateUser: () => void;
  userExactGps: { lat: number; lng: number; accuracy: number } | null;
  arrowMarkers?: Record<string, { lat: number; lng: number; title: string; desc?: string }>;
  triggerArrowHighlight?: (lat: number, lng: number, title: string, desc?: string, zoom?: number) => void;
}

export default function MapControls({
  mapMode,
  setMapMode,
  showGrid,
  setShowGrid,
  isFullscreen,
  toggleFullscreen,
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  isMobileQuickJumpOpen,
  setIsMobileQuickJumpOpen,
  isLocatingUser,
  liveGpsAccuracy,
  locateUser,
  userExactGps,
  arrowMarkers = {},
  triggerArrowHighlight,
}: MapControlsProps) {
  return (
    <>
      {/* Map Controls Bar — single compact row */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-1.5 bg-stone-900/90 backdrop-blur-sm border border-stone-700/60 rounded-xl px-2.5 py-1.5 shadow-2xl">

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSearchResults(true)}
            className="w-44 sm:w-56 pl-8 pr-2.5 py-1.5 bg-stone-800/80 border border-stone-700/60 rounded-lg text-stone-100 placeholder-stone-500 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all"
          />
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-stone-700/60" />

        {/* Map Mode Toggle */}
        <div className="flex items-center gap-0.5 bg-stone-800/50 border border-stone-700/40 rounded-lg p-0.5">
          <button
            onClick={() => setMapMode("satellite")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${mapMode === "satellite"
              ? "bg-gradient-to-r from-emerald-900/80 to-teal-900/80 text-emerald-300 border border-emerald-600/40"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50"
              }`}
          >
            Sat
          </button>
          <button
            onClick={() => setMapMode("streets")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${mapMode === "streets"
              ? "bg-gradient-to-r from-sky-900/80 to-blue-900/80 text-sky-300 border border-sky-600/40"
              : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50"
              }`}
          >
            Map
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-stone-700/60" />

        {/* Grid — icon only */}
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid"
          className={`p-1.5 rounded-lg transition-all ${showGrid
            ? "bg-gradient-to-r from-amber-900/70 to-orange-900/70 text-amber-300 border border-amber-600/40"
            : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
            }`}
        >
          <Compass className="w-4 h-4" />
        </button>

        {/* Quick Jump dropdown — shorter */}
        <select
          onChange={(e) => {
            const arrowId = e.target.value;
            if (arrowId && DEFAULT_ARROW_MARKERS[arrowId as keyof typeof DEFAULT_ARROW_MARKERS] && triggerArrowHighlight) {
              const arrow = DEFAULT_ARROW_MARKERS[arrowId as keyof typeof DEFAULT_ARROW_MARKERS];
              triggerArrowHighlight(arrow.lat, arrow.lng, arrow.title, arrow.desc, 18);
            }
            e.target.value = "";
          }}
          className="px-2 py-1.5 rounded-lg bg-stone-800/60 text-stone-400 hover:text-stone-200 border border-stone-700/40 text-xs font-medium transition-all cursor-pointer max-w-[130px]"
        >
          <option value="">📍 Quick Jump</option>
          {Object.entries(DEFAULT_ARROW_MARKERS).map(([arrowId, arrow]) => (
            <option key={arrowId} value={arrowId}>
              {arrow.title}
            </option>
          ))}
        </select>

        {/* Fullscreen — icon only */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          className="p-1.5 rounded-lg bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40 transition-all"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Locate Me */}
        <button
          onClick={locateUser}
          disabled={isLocatingUser}
          title="Locate Me"
          className={`p-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${isLocatingUser
            ? "bg-blue-900/70 text-blue-300 border border-blue-600/40"
            : userExactGps
              ? "bg-gradient-to-r from-blue-900/70 to-indigo-900/70 text-blue-300 border border-blue-600/40"
              : "bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
            }`}
        >
          <Navigation className={`w-4 h-4 ${isLocatingUser ? "animate-pulse" : ""}`} />
          {isLocatingUser
            ? liveGpsAccuracy !== null
              ? <span className="text-xs font-mono">📡{Math.round(liveGpsAccuracy)}m</span>
              : <span className="text-xs">...</span>
            : userExactGps
              ? <span className="text-xs font-mono">±{Math.round(userExactGps.accuracy)}m</span>
              : null}
        </button>

        {/* Mobile Quick Jump */}
        <div className="block sm:hidden">
          <button
            onClick={() => setIsMobileQuickJumpOpen(!isMobileQuickJumpOpen)}
            className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${isMobileQuickJumpOpen
              ? "bg-gradient-to-r from-purple-900/70 to-violet-900/70 text-purple-300 border border-purple-600/40"
              : "bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
              }`}
          >
            Jump
          </button>
        </div>
      </div>
    </>
  );
}