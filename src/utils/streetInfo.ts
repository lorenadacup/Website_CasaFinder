import { loadBarangayPolygons } from "../components/BarangayBoundarySystem";

// ─── Point-in-Polygon (Ray Casting) ──────────────────────────────────────────

function pointInPolygon(lat: number, lng: number, vertices: [number, number][]): boolean {
  let inside = false;
  const n = vertices.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [yi, xi] = vertices[i];
    const [yj, xj] = vertices[j];
    const intersect =
      yi > lat !== yj > lat &&
      lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// ─── Detect barangay from saved polygon boundaries ────────────────────────────

function detectBarangayFromPolygons(lat: number, lng: number): string | null {
  try {
    const polygons = loadBarangayPolygons();
    for (const poly of Object.values(polygons)) {
      if (poly.vertices.length >= 3 && pointInPolygon(lat, lng, poly.vertices)) {
        return poly.name;
      }
    }
  } catch (_) {}
  return null;
}

// ─── Main function ────────────────────────────────────────────────────────────

export const getStreetInfoForCoordinates = (lat: number, lng: number) => {
  let street = "AH26 / Pan-Philippine (Maharlika) Highway";

  // Check saved barangay polygon boundaries first
  const detectedBarangay = detectBarangayFromPolygons(lat, lng);
  let barangay = detectedBarangay ?? "Area not registered";

  // If no polygon matched, fall back to coordinate-based estimates for street name only
  if (!detectedBarangay) {
    if (lat > 13.9240 && lng < 122.1000) {
      street = "Quayside Blvd / Coastal Road (Near Kutang San Diego)";
    } else if (lat > 13.9220 && lng > 122.1000 && lat < 13.9250) {
      street = "Nava Blvd / P. Burgos Street";
    } else if (lat < 13.9200 && lng < 122.0960) {
      street = "M.H. Del Pilar Street (Near BIR District Office)";
    } else if (lat < 13.9200 && lng > 122.1020) {
      street = "AH26 Maharlika Hwy East / Villa Nava Road";
    } else if (lng < 122.0975) {
      street = "M.H. Del Pilar Street / Terminal Alley";
    } else if (lat < 13.9210 && lng > 122.0980 && lng < 122.1010) {
      street = "Capisonda Street / T. Tañada Street";
    } else if (lng >= 122.0975 && lng <= 122.1000) {
      street = "J.P. Rizal Street / D. Arcaya Street";
    }
  } else {
    // Polygon matched — still estimate street from coordinates
    if (lat > 13.9240 && lng < 122.1000) {
      street = "Quayside Blvd / Coastal Road (Near Kutang San Diego)";
    } else if (lat > 13.9220 && lng > 122.1000 && lat < 13.9250) {
      street = "Nava Blvd / P. Burgos Street";
    } else if (lat < 13.9200 && lng < 122.0960) {
      street = "M.H. Del Pilar Street (Near BIR District Office)";
    } else if (lat < 13.9200 && lng > 122.1020) {
      street = "AH26 Maharlika Hwy East / Villa Nava Road";
    } else if (lng < 122.0975) {
      street = "M.H. Del Pilar Street / Terminal Alley";
    } else if (lat < 13.9210 && lng > 122.0980 && lng < 122.1010) {
      street = "Capisonda Street / T. Tañada Street";
    } else if (lng >= 122.0975 && lng <= 122.1000) {
      street = "J.P. Rizal Street / D. Arcaya Street";
    }
  }

  // Calculate distance to SLSU Tabing Dagat (13.9231, 122.1011)
  const dLatTD = (lat - 13.9231) * 111000;
  const dLngTD = (lng - 122.1011) * 111000 * Math.cos(13.9231 * Math.PI / 180);
  const distTabingDagat = Math.round(Math.sqrt(dLatTD * dLatTD + dLngTD * dLngTD));
  const walkTabingDagat = Math.max(1, Math.round(distTabingDagat / 75));

  // Calculate distance to SLSU Villa Nava (13.912125, 122.104057)
  const dLatVN = (lat - 13.912125) * 111000;
  const dLngVN = (lng - 122.104057) * 111000 * Math.cos(13.912125 * Math.PI / 180);
  const distVillaNava = Math.round(Math.sqrt(dLatVN * dLatVN + dLngVN * dLngVN));
  const walkVillaNava = Math.max(1, Math.round(distVillaNava / 75));

  return {
    street,
    barangay,
    distTabingDagat,
    walkTabingDagat,
    distVillaNava,
    walkVillaNava,
    lat: lat.toFixed(4),
    lng: lng.toFixed(4)
  };
};

export type StreetInfo = ReturnType<typeof getStreetInfoForCoordinates>;
