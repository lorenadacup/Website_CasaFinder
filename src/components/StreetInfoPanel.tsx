import React, { useRef, useState } from "react";
import { StreetInfo } from "../utils/streetInfo";
import { X, Navigation, Compass, MapPin, School } from "lucide-react";

interface StreetInfoPanelProps {
  clickedStreet: StreetInfo | null;
  setClickedStreet: (info: StreetInfo | null) => void;
  isPropertyCardDismissed: boolean;
  setIsPropertyCardDismissed: (dismissed: boolean) => void;
  selectedProperty: any;
  copySuccessMsg: string;
  setCopySuccessMsg: (msg: string) => void;
  panToArea: (lat: number, lng: number, zoom?: number) => void;
  getMatchScore: (propertyId: string) => number | undefined;
  onOpenDetails?: (property: any) => void;
}

export default function StreetInfoPanel({
  clickedStreet,
  setClickedStreet,
  isPropertyCardDismissed,
  setIsPropertyCardDismissed,
  selectedProperty,
  copySuccessMsg,
  setCopySuccessMsg,
  panToArea,
  getMatchScore,
  onOpenDetails,
}: StreetInfoPanelProps) {
  // Drag state for the property card
  const cardRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const [cardPos, setCardPos] = useState<{ x: number; y: number } | null>(null);

  const handleDragStart = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    e.preventDefault();
    isDragging.current = true;
    const rect = el.getBoundingClientRect();
    // Get the offset parent rect so we work in container-relative coordinates
    const parentRect = (el.offsetParent ?? document.documentElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Anchor card to its current container-relative top/left immediately,
    // so switching from bottom-based to top-based positioning doesn't cause a jump.
    setCardPos({ x: rect.left - parentRect.left, y: rect.top - parentRect.top });

    const onMove = (ev: PointerEvent) => {
      if (!isDragging.current) return;
      setCardPos({
        x: ev.clientX - dragOffset.current.x - parentRect.left,
        y: ev.clientY - dragOffset.current.y - parentRect.top,
      });
    };

    const onUp = () => {
      isDragging.current = false;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const handleDragMove = () => {};
  const handleDragEnd = () => {};

  // Reset drag position when a new property is selected
  const prevPropertyId = useRef<string | null>(null);
  if (selectedProperty?.id !== prevPropertyId.current) {
    prevPropertyId.current = selectedProperty?.id ?? null;
    if (cardPos !== null) setCardPos(null);
  }

  const matchScore = selectedProperty ? getMatchScore?.(selectedProperty.id) : null;

  const handleCopyCoordinates = () => {
    const coords = `${clickedStreet?.lat}, ${clickedStreet?.lng}`;
    navigator.clipboard.writeText(coords).then(() => {
      setCopySuccessMsg("Coordinates copied to clipboard! 📋");
      setTimeout(() => setCopySuccessMsg(""), 2000);
    }).catch(err => {
      console.error("Failed to copy:", err);
    });
  };

  if (!clickedStreet && (!selectedProperty || isPropertyCardDismissed)) {
    return null;
  }

  return (
    <>
      {/* Street Info Panel */}
      {clickedStreet && (
        <div className="absolute top-4 left-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-stone-900/95 backdrop-blur-md border border-stone-700/60 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-900/80 to-teal-900/80 p-4 flex items-center justify-between border-b border-stone-700/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                <MapPin className="w-5 h-5 text-stone-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Map Location Info 🗺️</h3>
                <p className="text-[10px] text-emerald-300">Click anywhere on map for details</p>
              </div>
            </div>
            <button
              onClick={() => setClickedStreet(null)}
              className="p-1.5 bg-stone-800/60 hover:bg-stone-700/80 rounded-lg text-stone-400 hover:text-stone-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Coordinates */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-stone-400">GPS Coordinates</span>
                <button
                  onClick={handleCopyCoordinates}
                  className="text-[10px] text-emerald-400 hover:text-emerald-300 bg-emerald-900/30 hover:bg-emerald-800/40 px-2 py-0.5 rounded transition-colors"
                >
                  Copy 📋
                </button>
              </div>
              <div className="font-mono text-sm bg-stone-800/50 p-2.5 rounded-lg border border-stone-700/50">
                <div className="text-emerald-300">{clickedStreet.lat}N</div>
                <div className="text-teal-300">{clickedStreet.lng}E</div>
              </div>
            </div>

            {/* Street & Barangay Info */}
            <div className="space-y-3">
              <div>
                <div className="text-xs font-medium text-stone-400 mb-1">Street / Road</div>
                <div className="text-sm text-stone-200 bg-stone-800/50 p-2 rounded-lg border border-stone-700/50">
                  {clickedStreet.street}
                </div>
              </div>
              <div>
                <div className="text-xs font-medium text-stone-400 mb-1">Barangay / Area</div>
                <div className="text-sm text-stone-200 bg-stone-800/50 p-2 rounded-lg border border-stone-700/50">
                  {clickedStreet.barangay}
                </div>
              </div>
            </div>

            {/* Distance to Campuses */}
            <div className="space-y-3">
              <div className="text-xs font-medium text-stone-400">Distance to Campuses</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-indigo-900/30 border border-indigo-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <School className="w-3.5 h-3.5 text-indigo-300" />
                    <span className="text-xs font-medium text-indigo-300">SLSU Tabing Dagat</span>
                  </div>
                  <div className="text-sm font-bold text-white">{clickedStreet.distTabingDagat}m</div>
                  <div className="text-[10px] text-indigo-400 mt-0.5">
                    ~{clickedStreet.walkTabingDagat} min walk
                  </div>
                </div>
                <div className="bg-purple-900/30 border border-purple-700/50 rounded-lg p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <School className="w-3.5 h-3.5 text-purple-300" />
                    <span className="text-xs font-medium text-purple-300">SLSU Villa Nava</span>
                  </div>
                  <div className="text-sm font-bold text-white">{clickedStreet.distVillaNava}m</div>
                  <div className="text-[10px] text-purple-400 mt-0.5">
                    ~{clickedStreet.walkVillaNava} min walk
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => panToArea(parseFloat(clickedStreet.lat), parseFloat(clickedStreet.lng), 20)}
                className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
              >
                <Navigation className="w-4 h-4" />
                Zoom In
              </button>
              <button
                onClick={() => panToArea(parseFloat(clickedStreet.lat), parseFloat(clickedStreet.lng), 15)}
                className="px-3 py-2 bg-stone-800/70 hover:bg-stone-700/90 text-stone-400 hover:text-stone-200 rounded-lg text-sm font-medium flex items-center gap-2 transition-all"
              >
                <Compass className="w-4 h-4" />
                View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Property Card — compact & draggable */}
      {selectedProperty && !isPropertyCardDismissed && (
        <div
          ref={cardRef}
          className="absolute z-40 w-56 bg-stone-900/95 backdrop-blur-md border border-stone-700/60 rounded-xl shadow-2xl overflow-hidden select-none"
          style={cardPos
            ? { left: cardPos.x, top: cardPos.y, bottom: "auto" }
            : { bottom: "1rem", left: "1rem" }
          }
        >
          {/* Drag handle header */}
          <div
            className="bg-gradient-to-r from-amber-900/80 to-orange-900/80 px-3 py-2 flex items-center justify-between border-b border-stone-700/60 cursor-grab active:cursor-grabbing"
            onPointerDown={handleDragStart}
            onPointerMove={handleDragMove}
            onPointerUp={handleDragEnd}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-white truncate">{selectedProperty.title}</span>
            </div>
            <button
              onClick={() => setIsPropertyCardDismissed(true)}
              className="p-1 bg-stone-800/60 hover:bg-stone-700/80 rounded-md text-stone-400 hover:text-stone-200 transition-all shrink-0 ml-1"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* Content */}
          <div className="p-2.5 flex gap-2 items-center">
            <img
              src={selectedProperty.image}
              alt={selectedProperty.title}
              className="w-12 h-12 object-cover rounded-lg border border-stone-700/60 shrink-0"
            />
            <div className="min-w-0 flex-1 space-y-0.5">
              <p className="text-[10px] text-stone-400 truncate">
                {selectedProperty.neighborhood}, {selectedProperty.city}
              </p>
              <div className="flex items-center gap-1 flex-wrap">
                <span className="bg-stone-800 text-stone-300 font-bold text-[10px] px-1.5 py-0.5 rounded border border-stone-700/60">
                  ₱{selectedProperty.price.toLocaleString()}/mo
                </span>
                {matchScore && (
                  <span className="bg-amber-500 text-stone-900 font-black text-[9px] px-1.5 py-0.5 rounded">
                    {matchScore}%
                  </span>
                )}
              </div>
              <div className="flex gap-2 text-[10px] text-stone-400">
                <span>{selectedProperty.beds}bd</span>
                <span>{selectedProperty.baths}ba</span>
                <span>{selectedProperty.sqft}sqm</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-2.5 pb-2.5 flex gap-1.5">
            <button
              onClick={() => onOpenDetails?.(selectedProperty)}
              className="flex-1 bg-gradient-to-r from-indigo-700 to-purple-700 hover:from-indigo-600 hover:to-purple-600 text-white py-1.5 rounded-lg text-[11px] font-medium transition-all"
            >
              View Details
            </button>
            <button
              onClick={() => {
                if (panToArea && selectedProperty) {
                  const [lat, lng] = [selectedProperty.coordinates?.lat ?? 13.9220, selectedProperty.coordinates?.lng ?? 122.0995];
                  panToArea(lat, lng, 18);
                }
              }}
              className="px-2 py-1.5 bg-stone-800/70 hover:bg-stone-700/90 text-stone-400 hover:text-stone-200 rounded-lg text-[11px] transition-all"
            >
              Center
            </button>
          </div>
        </div>
      )}

      {/* Copy Success Toast */}
      {copySuccessMsg && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-emerald-900/90 to-teal-900/90 text-emerald-200 px-4 py-2.5 rounded-lg border border-emerald-700/50 shadow-2xl animate-pulse">
            <div className="text-sm font-medium">{copySuccessMsg}</div>
          </div>
        </div>
      )}
    </>
  );
}