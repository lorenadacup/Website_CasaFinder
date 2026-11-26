import { useEffect, useRef } from "react";
import L from "leaflet";
import { getAllBarangayBoundaries, upsertBarangayBoundary, deleteBarangayBoundary } from "../utils/db";

// ─── Constants ────────────────────────────────────────────────────────────────

export const BARANGAY_POLYGON_KEY = "casafinder_barangay_polygons_v1";

// Re-export Supabase functions for use in other components
export { getAllBarangayBoundaries, upsertBarangayBoundary, deleteBarangayBoundary };

export const BARANGAY_COLORS: Record<string, string> = {
  "tabing-dagat":     "#06b6d4",
  "villa-nava":       "#8b5cf6",
  "peñafrancia":      "#f59e0b",
  "pipisik":          "#10b981",
  "san-diego":        "#f97316",
  "bagong-buhay":     "#ec4899",
  "mabini":           "#3b82f6",
  "maunlad":          "#84cc16",
  "buensuceso":       "#ef4444",
  "progreso-purok-1": "#a855f7",
  "rosario":          "#14b8a6",
  "rizal":            "#eab308",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BarangayPolygon {
  name: string;
  color: string;
  vertices: [number, number][];
}

export type BarangayPolygonsMap = Record<string, BarangayPolygon>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function loadBarangayPolygons(): BarangayPolygonsMap {
  try {
    const raw = localStorage.getItem(BARANGAY_POLYGON_KEY);
    if (raw) return JSON.parse(raw) as BarangayPolygonsMap;
  } catch (_) {}
  return {};
}

/** Load boundaries from Supabase and cache to localStorage */
export async function loadBarangayPolygonsFromDB(): Promise<BarangayPolygonsMap> {
  try {
    const data = await getAllBarangayBoundaries();
    const result: BarangayPolygonsMap = {};
    for (const [id, b] of Object.entries(data)) {
      result[id] = { name: b.name, color: b.color || '#94a3b8', vertices: b.vertices };
    }
    // Cache locally
    localStorage.setItem(BARANGAY_POLYGON_KEY, JSON.stringify(result));
    return result;
  } catch (_) {
    return loadBarangayPolygons();
  }
}

/** Save a single boundary to Supabase and localStorage */
export async function saveBarangayPolygon(id: string, polygon: BarangayPolygon): Promise<void> {
  await upsertBarangayBoundary({ id, name: polygon.name, color: polygon.color, vertices: polygon.vertices });
  // Update local cache
  const existing = loadBarangayPolygons();
  existing[id] = polygon;
  localStorage.setItem(BARANGAY_POLYGON_KEY, JSON.stringify(existing));
}

/** Delete a boundary from Supabase and localStorage */
export async function removeBarangayPolygon(id: string): Promise<void> {
  await deleteBarangayBoundary(id);
  const existing = loadBarangayPolygons();
  delete existing[id];
  localStorage.setItem(BARANGAY_POLYGON_KEY, JSON.stringify(existing));
}

export function normalizeBarangayId(name: string): string {
  return name
    .replace(/^📍\s*/i, "")
    .replace(/^Brgy\.\s*/i, "")
    .replace(/^Barangay\s*/i, "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface BarangayBoundarySystemProps {
  map: L.Map | null;
  polygons: BarangayPolygonsMap;
  highlightId: string | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function BarangayBoundarySystem({
  map,
  polygons,
  highlightId,
}: BarangayBoundarySystemProps) {
  const polygonLayersRef = useRef<Record<string, L.Polygon>>({});

  // Render highlighted polygon only — hidden otherwise
  useEffect(() => {
    if (!map) return;

    // Remove all existing polygon layers
    Object.values(polygonLayersRef.current).forEach(p => { try { p.remove(); } catch (_) {} });
    polygonLayersRef.current = {};

    // Only draw the currently highlighted (searched) barangay
    if (!highlightId) return;

    const poly = polygons[highlightId];
    if (!poly || poly.vertices.length < 3) return;

    const color = BARANGAY_COLORS[highlightId] ?? poly.color ?? "#94a3b8";

    const layer = L.polygon(poly.vertices, {
      pane: "drawingPane",
      color,
      weight: 4,
      opacity: 1,
      fillColor: color,
      fillOpacity: 0.18,
      interactive: false,
    } as any).addTo(map);

    layer.bindTooltip(poly.name, {
      permanent: true,
      direction: "center",
      className: "barangay-boundary-label",
    });

    polygonLayersRef.current[highlightId] = layer;

    return () => {
      Object.values(polygonLayersRef.current).forEach(p => { try { p.remove(); } catch (_) {} });
      polygonLayersRef.current = {};
    };
  }, [polygons, map, highlightId]);

  // No UI rendered — map layers only
  return null;
}
