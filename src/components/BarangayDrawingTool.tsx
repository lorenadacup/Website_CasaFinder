/**
 * BarangayDrawingTool — Admin-only polygon drawing tool for barangay boundaries.
 * Click on the map to add vertices; Save to persist to Supabase.
 */

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import {
  saveBarangayPolygon,
  removeBarangayPolygon,
  normalizeBarangayId,
  type BarangayPolygon,
  type BarangayPolygonsMap,
  BARANGAY_COLORS,
} from "./BarangayBoundarySystem";

// ─── Barangay list ────────────────────────────────────────────────────────────

const GUMACA_BARANGAYS = [
  "Barangay Tabing Dagat",
  "Barangay Villa Nava",
  "Barangay Peñafrancia",
  "Barangay Pipisik",
  "Barangay San Diego",
  "Barangay Rizal",
  "Barangay Bagong Buhay",
  "Barangay Mabini",
  "Barangay Maunlad",
  "Barangay Buensuceso",
  "Barangay Progreso Purok 1",
  "Barangay Rosario",
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface BarangayDrawingToolProps {
  map: L.Map | null;
  barangayPolygons: BarangayPolygonsMap;
  setBarangayPolygons: React.Dispatch<React.SetStateAction<BarangayPolygonsMap>>;
  mapReady: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BarangayDrawingTool({
  map,
  barangayPolygons,
  setBarangayPolygons,
  mapReady,
}: BarangayDrawingToolProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedBarangay, setSelectedBarangay] = useState(GUMACA_BARANGAYS[0]);
  const [drawnPoints, setDrawnPoints] = useState<[number, number][]>([]);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Leaflet refs for live preview
  const previewLayerRef = useRef<L.Polygon | null>(null);
  const markerLayersRef = useRef<L.CircleMarker[]>([]);
  const drawPaneRef = useRef<HTMLElement | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const selectedId = normalizeBarangayId(selectedBarangay);
  const color = (BARANGAY_COLORS as Record<string, string>)[selectedId] ?? "#a855f7";
  const existingPolygon = barangayPolygons[selectedId];

  // ─── Drawing pane for clicks ───────────────────────────────────────────────

  useEffect(() => {
    if (!map || !mapReady) return;

    // Create a separate interactive pane for drawing clicks
    if (!map.getPane("drawingInteractivePane")) {
      map.createPane("drawingInteractivePane");
    }
    const pane = map.getPane("drawingInteractivePane");
    if (pane) {
      pane.style.zIndex = "1300";
      pane.style.pointerEvents = "none";
      drawPaneRef.current = pane;
    }
  }, [map, mapReady]);

  // ─── Map click handler ─────────────────────────────────────────────────────

  useEffect(() => {
    if (!map || !mapReady) return;

    const handleClick = (e: L.LeafletMouseEvent) => {
      if (!isDrawing) return;
      const pt: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawnPoints(prev => [...prev, pt]);
    };

    if (isDrawing) {
      map.getContainer().style.cursor = "crosshair";
      map.on("click", handleClick);
    } else {
      map.getContainer().style.cursor = "";
      map.off("click", handleClick);
    }

    return () => {
      map.getContainer().style.cursor = "";
      map.off("click", handleClick);
    };
  }, [map, mapReady, isDrawing]);

  // ─── Live preview rendering ────────────────────────────────────────────────

  useEffect(() => {
    if (!map) return;

    // Remove old preview
    if (previewLayerRef.current) {
      previewLayerRef.current.remove();
      previewLayerRef.current = null;
    }
    markerLayersRef.current.forEach(m => m.remove());
    markerLayersRef.current = [];

    if (drawnPoints.length === 0) return;

    // Draw vertex markers
    drawnPoints.forEach((pt, i) => {
      const marker = L.circleMarker(pt, {
        radius: i === 0 ? 7 : 5,
        color: i === 0 ? "#fbbf24" : color,
        fillColor: i === 0 ? "#fbbf24" : color,
        fillOpacity: 1,
        weight: 2,
        interactive: false,
        pane: "drawingPane",
      } as any).addTo(map);
      markerLayersRef.current.push(marker);
    });

    // Draw polygon preview if 3+ points
    if (drawnPoints.length >= 3) {
      previewLayerRef.current = L.polygon(drawnPoints, {
        color,
        weight: 2,
        opacity: 0.9,
        fillColor: color,
        fillOpacity: 0.2,
        dashArray: "6 4",
        interactive: false,
        pane: "drawingPane",
      } as any).addTo(map);
    }

    return () => {
      if (previewLayerRef.current) {
        previewLayerRef.current.remove();
        previewLayerRef.current = null;
      }
      markerLayersRef.current.forEach(m => m.remove());
      markerLayersRef.current = [];
    };
  }, [drawnPoints, map, color]);

  // Clear preview and markers on unmount
  useEffect(() => {
    return () => {
      if (previewLayerRef.current) previewLayerRef.current.remove();
      markerLayersRef.current.forEach(m => m.remove());
      if (map) map.getContainer().style.cursor = "";
    };
  }, []);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleStartDrawing = () => {
    setDrawnPoints([]);
    setIsDrawing(true);
    showToast("Click sa map para magdagdag ng points");
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
    if (map) map.getContainer().style.cursor = "";
  };

  const handleUndo = () => {
    setDrawnPoints(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setDrawnPoints([]);
    setIsDrawing(false);
  };

  const handleSave = async () => {
    if (drawnPoints.length < 3) {
      showToast("❌ Kailangan ng hindi bababa sa 3 points");
      return;
    }
    setSaving(true);
    try {
      const polygon: BarangayPolygon = {
        name: selectedBarangay,
        color,
        vertices: drawnPoints,
      };
      await saveBarangayPolygon(selectedId, polygon);
      setBarangayPolygons(prev => ({ ...prev, [selectedId]: polygon }));
      setDrawnPoints([]);
      setIsDrawing(false);
      showToast(`✅ Na-save ang boundary ng ${selectedBarangay}`);
    } catch (err) {
      showToast("❌ Error sa pag-save. Subukan ulit.");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!existingPolygon) return;
    setDeleting(true);
    try {
      await removeBarangayPolygon(selectedId);
      setBarangayPolygons(prev => {
        const next = { ...prev };
        delete next[selectedId];
        return next;
      });
      showToast(`🗑️ Na-delete ang boundary ng ${selectedBarangay}`);
    } catch (err) {
      showToast("❌ Error sa pag-delete.");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="absolute bottom-16 right-3 z-40 flex flex-col items-end gap-2">
      {/* Toast */}
      {toast && (
        <div className="bg-stone-900/95 text-white text-xs font-medium px-3 py-2 rounded-xl shadow-xl border border-white/10 max-w-[220px] text-center">
          {toast}
        </div>
      )}

      {/* Panel */}
      {isOpen && (
        <div className="bg-stone-900/95 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl p-3.5 w-64 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wide">🗺️ Boundary Editor</span>
            <button
              type="button"
              onClick={() => { setIsOpen(false); handleClear(); }}
              className="text-stone-400 hover:text-white text-xs cursor-pointer"
            >✕</button>
          </div>

          {/* Barangay selector */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-stone-400 tracking-wide">Barangay</label>
            <select
              value={selectedBarangay}
              onChange={e => { setSelectedBarangay(e.target.value); setDrawnPoints([]); setIsDrawing(false); }}
              className="w-full bg-stone-800 border border-stone-700 text-stone-100 text-xs rounded-lg px-2.5 py-2 outline-none cursor-pointer"
            >
              {GUMACA_BARANGAYS.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className={`text-[10px] font-semibold px-2.5 py-1.5 rounded-lg ${existingPolygon ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-stone-800 text-stone-400 border border-stone-700"}`}>
            {existingPolygon
              ? `✅ May boundary na (${existingPolygon.vertices.length} points)`
              : "⬜ Walang boundary pa"}
          </div>

          {/* Drawing status */}
          {isDrawing && (
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5 text-[10px] text-amber-300 font-medium">
              🖊️ Drawing mode — {drawnPoints.length} point{drawnPoints.length !== 1 ? "s" : ""} na
              {drawnPoints.length >= 3 && " ✓ Pwede nang i-save"}
            </div>
          )}

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-1.5">
            {!isDrawing ? (
              <button
                type="button"
                onClick={handleStartDrawing}
                className="col-span-2 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-stone-900 text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95"
              >
                ✏️ {existingPolygon ? "Redraw Boundary" : "Start Drawing"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleStopDrawing}
                  className="px-3 py-2 bg-stone-700 hover:bg-stone-600 text-stone-200 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  ⏸ Pause
                </button>
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={drawnPoints.length === 0}
                  className="px-3 py-2 bg-stone-700 hover:bg-stone-600 disabled:opacity-40 text-stone-200 text-xs font-bold rounded-xl cursor-pointer transition-all"
                >
                  ↩ Undo
                </button>
              </>
            )}

            {drawnPoints.length >= 3 && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="col-span-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-60 text-white text-xs font-bold rounded-xl cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
              >
                {saving ? "⏳ Nag-se-save..." : `💾 Save ${selectedBarangay.replace("Barangay ", "")}`}
              </button>
            )}

            {drawnPoints.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="col-span-2 px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-400 text-xs font-bold rounded-xl cursor-pointer transition-all"
              >
                🗑 Clear Points
              </button>
            )}

            {existingPolygon && drawnPoints.length === 0 && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="col-span-2 px-3 py-2 bg-red-900/60 hover:bg-red-800/80 disabled:opacity-60 text-red-300 text-xs font-bold rounded-xl cursor-pointer transition-all border border-red-700/40"
              >
                {deleting ? "⏳ Nag-de-delete..." : `❌ Delete Boundary`}
              </button>
            )}
          </div>

          {/* Summary of all saved boundaries */}
          <div className="border-t border-white/10 pt-2.5 space-y-1">
            <p className="text-[10px] font-bold uppercase text-stone-500 tracking-wide">
              Saved Boundaries ({Object.keys(barangayPolygons).length})
            </p>
            <div className="max-h-28 overflow-y-auto space-y-1 pr-0.5">
              {Object.keys(barangayPolygons).length === 0 ? (
                <p className="text-[10px] text-stone-600">Wala pang saved boundaries.</p>
              ) : (
                Object.entries(barangayPolygons).map(([id, poly]) => (
                  <div
                    key={id}
                    className="flex items-center justify-between gap-1.5 px-2 py-1 rounded-lg bg-stone-800/60 text-[10px]"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className="inline-block w-2 h-2 rounded-full shrink-0"
                        style={{ background: (BARANGAY_COLORS as Record<string, string>)[id] ?? "#94a3b8" }}
                      />
                      <span className="text-stone-300 truncate max-w-[130px]">{poly.name.replace("Barangay ", "")}</span>
                    </span>
                    <span className="text-stone-500 shrink-0">{poly.vertices.length}pts</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        title="Barangay Boundary Editor (Admin)"
        className={`w-10 h-10 rounded-xl shadow-xl flex items-center justify-center text-lg transition-all active:scale-95 border ${
          isOpen
            ? "bg-amber-500 border-amber-400 text-stone-900"
            : "bg-stone-900/90 border-stone-700 text-amber-400 hover:bg-stone-800"
        }`}
      >
        🗺️
      </button>
    </div>
  );
}
