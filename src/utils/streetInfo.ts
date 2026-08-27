// Helper to estimate street name / barangay based on exact Google Maps coordinates in Gumaca
export const getStreetInfoForCoordinates = (lat: number, lng: number) => {
  let street = "AH26 / Pan-Philippine (Maharlika) Highway";
  let barangay = "Poblacion, Gumaca";

  if (lat > 13.9240 && lng < 122.1000) {
    street = "Quayside Blvd / Coastal Road (Near Kutang San Diego)";
    barangay = "Barangay Tabing Dagat (Coastal Quayside Area)";
  } else if (lat > 13.9220 && lng > 122.1000 && lat < 13.9250) {
    street = "Nava Blvd / P. Burgos Street";
    barangay = "Barangay San Diego (Coastal View)";
  } else if (lat < 13.9200 && lng < 122.0960) {
    street = "M.H. Del Pilar Street (Near BIR District Office)";
    barangay = "Barangay Pipisik / West Area";
  } else if (lat < 13.9200 && lng > 122.1020) {
    street = "AH26 Maharlika Hwy East / Villa Nava Road";
    barangay = "Barangay Villa Nava / San Diego";
  } else if (lng < 122.0975) {
    street = "M.H. Del Pilar Street / Terminal Alley";
    barangay = "Barangay Pipisik";
  } else if (lat < 13.9210 && lng > 122.0980 && lng < 122.1010) {
    street = "Capisonda Street / T. Tañada Street";
    barangay = "Barangay Mabini (Town Proper)";
  } else if (lng >= 122.0975 && lng <= 122.1000) {
    street = "J.P. Rizal Street / D. Arcaya Street";
    barangay = "Barangay Mabini (Town Center)";
  }

  // Calculate distance to SLSU Tabing Dagat (13.9231, 122.1011) — canonical coordinate, matches mapConstants & schoolDistances
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