import React from "react";
import { Map, Navigation, Compass, Search, Maximize2, Minimize2 } from "lucide-react";
import { MapMode } from "../utils/mapConstants";

interface MapControlsProps {
  mapMode: MapMode;
  setMapMode: (mode: MapMode) => void;
  showLandmarks: boolean;
  setShowLandmarks: (show: boolean) => void;
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
  locateUser: () => void;
  userExactGps: { lat: number; lng: number; accuracy: number } | null;
}

export default function MapControls({
  mapMode,
  setMapMode,
  showLandmarks,
  setShowLandmarks,
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
  locateUser,
  userExactGps,
}: MapControlsProps) {
  return (
    <>
      {/* Map Controls Bar */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex flex-col sm:flex-row items-center gap-2 bg-stone-900/90 backdrop-blur-sm border border-stone-700/60 rounded-xl px-4 py-2.5 shadow-2xl">
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center">
          {/* Search Bar */}
          <div className="relative flex-1 min-w-[280px]">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Search properties, landmarks, or barangays..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-stone-800/80 border border-stone-700/60 rounded-lg text-stone-100 placeholder-stone-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30 transition-all"
              />
            </div>
          </div>

          {/* Map Mode Toggle */}
          <div className="flex items-center gap-2 bg-stone-800/50 border border-stone-700/40 rounded-lg p-1">
            <button
              onClick={() => setMapMode("satellite")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mapMode === "satellite"
                ? "bg-gradient-to-r from-emerald-900/80 to-teal-900/80 text-emerald-300 border border-emerald-600/40 shadow-inner"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50"
                }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setMapMode("streets")}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${mapMode === "streets"
                ? "bg-gradient-to-r from-sky-900/80 to-blue-900/80 text-sky-300 border border-sky-600/40 shadow-inner"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-700/50"
                }`}
            >
              Streets
            </button>
          </div>

          {/* Toggle Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowLandmarks(!showLandmarks)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${showLandmarks
                ? "bg-gradient-to-r from-emerald-900/70 to-teal-900/70 text-emerald-300 border border-emerald-600/40"
                : "bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
                }`}
            >
              <Map className="w-4 h-4" />
              Landmarks
            </button>

            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${showGrid
                ? "bg-gradient-to-r from-amber-900/70 to-orange-900/70 text-amber-300 border border-amber-600/40"
                : "bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
                }`}
            >
              <Compass className="w-4 h-4" />
              Grid
            </button>

            <button
              onClick={toggleFullscreen}
              className="px-3 py-2 rounded-lg bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40 text-sm font-medium flex items-center gap-2 transition-all"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              {isFullscreen ? "Exit Full" : "Fullscreen"}
            </button>

            <button
              onClick={locateUser}
              disabled={isLocatingUser}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${isLocatingUser
                ? "bg-blue-900/70 text-blue-300 border border-blue-600/40"
                : userExactGps
                  ? "bg-gradient-to-r from-blue-900/70 to-indigo-900/70 text-blue-300 border border-blue-600/40"
                  : "bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
                }`}
            >
              <Navigation className="w-4 h-4" />
              {isLocatingUser ? "Locating..." : userExactGps ? "Located" : "Locate Me"}
            </button>
          </div>

          {/* Mobile Quick Jump (Only on mobile) */}
          <div className="block sm:hidden">
            <button
              onClick={() => setIsMobileQuickJumpOpen(!isMobileQuickJumpOpen)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${isMobileQuickJumpOpen
                ? "bg-gradient-to-r from-purple-900/70 to-violet-900/70 text-purple-300 border border-purple-600/40"
                : "bg-stone-800/60 text-stone-400 hover:text-stone-200 hover:bg-stone-700/60 border border-stone-700/40"
                }`}
            >
              Quick Jump
            </button>
          </div>
        </div>
      </div>
    </>
  );
}