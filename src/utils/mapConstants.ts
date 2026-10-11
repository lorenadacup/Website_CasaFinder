// Gumaca, Quezon map constants and configurations
export const GUMACA_CENTER: [number, number] = [13.9220, 122.0995];
export const DEFAULT_ZOOM = 15;

// Key Landmarks in Gumaca, Quezon - Major Institutions, Barangays & Campus Hubs
export const GUMACA_LANDMARKS = [
  // 13 Gumaca Barangays
  { name: "📍 Brgy. Tabing Dagat", lat: 13.923258, lng: 122.101460, type: "Barangay", desc: "Barangay Tabing Dagat, Gumaca" },
  { name: "📍 Brgy. Villa Nava", lat: 13.912125, lng: 122.104057, type: "Barangay", desc: "Barangay Villa Nava, Gumaca" },
  { name: "📍 Brgy. Peñafrancia", lat: 13.924800, lng: 122.095500, type: "Barangay", desc: "Barangay Peñafrancia, Gumaca" },
  { name: "📍 Brgy. Pipisik", lat: 13.925200, lng: 122.097500, type: "Barangay", desc: "Barangay Pipisik, Gumaca" },
  { name: "📍 Brgy. San Diego", lat: 13.920200, lng: 122.103800, type: "Barangay", desc: "Barangay San Diego, Gumaca" },
  { name: "📍 Brgy. Bagong Buhay", lat: 13.919000, lng: 122.098000, type: "Barangay", desc: "Barangay Bagong Buhay, Gumaca" },
  { name: "📍 Brgy. Mabini", lat: 13.922000, lng: 122.098500, type: "Barangay", desc: "Barangay Mabini, Gumaca" },
  { name: "📍 Brgy. Maunlad", lat: 13.921000, lng: 122.096500, type: "Barangay", desc: "Barangay Maunlad, Gumaca" },
  { name: "📍 Brgy. Buensuceso", lat: 13.928000, lng: 122.095000, type: "Barangay", desc: "Barangay Buensuceso, Gumaca" },
  { name: "📍 Brgy. Progreso Purok 1", lat: 13.918000, lng: 122.101000, type: "Barangay", desc: "Barangay Progreso Purok 1, Gumaca" },
  { name: "📍 Brgy. Rosario", lat: 13.924000, lng: 122.099000, type: "Barangay", desc: "Barangay Rosario, Gumaca" },

  // Key Landmarks
  { name: "SLSU Villa Nava 🎓", lat: 13.912125, lng: 122.104057, type: "University", desc: "Campus - Brgy. Villa Nava" },
  { name: "SLSU Tabing Dagat 🎓🌊", lat: 13.9231, lng: 122.1011, type: "University", desc: "Campus - Brgy. Tabing Dagat" },
  { name: "Eastern Quezon College (EQC) 🏛️", lat: 13.923315, lng: 122.097557, type: "College", desc: "College, Gumaca" },
  { name: "Gumaca National High School (GNHS) 🏫", lat: 13.9182, lng: 122.0956, type: "High School", desc: "Gumaca NHS, Mabini/Poblacion" },
  { name: "Gumaca West & East Central Schools 🏫", lat: 13.918000, lng: 122.099000, type: "School", desc: "M.H. Del Pilar St. / Capisonda St." },
  { name: "Plaza Rizal Elementary School 🏫", lat: 13.9183, lng: 122.0986, type: "School", desc: "Plaza Rizal Elementary School, Poblacion, Gumaca" },
  { name: "Gumaca West Central School 🏫", lat: 13.9181, lng: 122.0996, type: "School", desc: "Gumaca West Central School, Poblacion, Gumaca" },
  { name: "Gumaca East Central School 🏫", lat: 13.9175, lng: 122.1002, type: "School", desc: "Gumaca East Central School, Poblacion, Gumaca" },
  { name: "Holy Child Academy / Sacred Heart 🏫", lat: 13.921500, lng: 122.099500, type: "High School", desc: "Holy Child Academy, Town Proper" },
  { name: "San Diego de Alcala Cathedral ⛪", lat: 13.921587, lng: 122.099428, type: "Church", desc: "Historic Parish Church, Town Proper" },
  { name: "Kutang San Diego 🏰", lat: 13.9238, lng: 122.0975, type: "Heritage", desc: "Historical Fort, Brgy. Tabing Dagat" },
  { name: "BIR District Office Gumaca 🏢", lat: 13.9188, lng: 122.0945, type: "Government", desc: "M.H. Del Pilar St." },
  { name: "Gumaca Grand Terminal 🚌", lat: 13.9200, lng: 122.0965, type: "Transit", desc: "Bus & Tricycle Terminal Hub" },
  { name: "7-Eleven Gumaca 🏪", lat: 13.9206, lng: 122.0992, type: "Convenience", desc: "7-Eleven Convenience Store, A. Bonifacio St., Gumaca" },
  { name: "Carlos Superdrug 💊", lat: 13.9208, lng: 122.0997, type: "Pharmacy", desc: "Carlos Superdrug Pharmacy, Poblacion, Gumaca" },
  { name: "Gumaca Municipal Library 📚", lat: 13.9212, lng: 122.0983, type: "Government", desc: "Gumaca Municipal Library, Poblacion, Gumaca" },
  { name: "EastWest Rural Bank 🏦", lat: 13.9205, lng: 122.0982, type: "Bank", desc: "EastWest Rural Bank, Poblacion, Gumaca" },
  { name: "J&T Express 📦", lat: 13.9200, lng: 122.0975, type: "Courier", desc: "J&T Express Courier & Delivery, Poblacion, Gumaca" },
  { name: "Mercury Drug 💊", lat: 13.9211, lng: 122.1013, type: "Pharmacy", desc: "Mercury Drug Pharmacy, A. Bonifacio St., Gumaca" },
  { name: "Mr. DIY 🔧", lat: 13.9210, lng: 122.1022, type: "Shopping", desc: "Mr. DIY Hardware & Home Store, Gumaca" },
  { name: "BFP Gumaca 🚒", lat: 13.9210, lng: 122.0981, type: "Government", desc: "Bureau of Fire Protection - Gumaca Fire Station, Gumaca" },
  { name: "Police Outpost 👮", lat: 13.9208, lng: 122.1014, type: "Government", desc: "Police Outpost, A. Bonifacio St., Gumaca" },
  { name: "Gumaca City Coast 🌊", lat: 13.9210, lng: 122.1031, type: "Landmark", desc: "Gumaca City Coast, A. Bonifacio St., Gumaca" },
  { name: "Land Bank of the Philippines 🏦", lat: 13.9210, lng: 122.1027, type: "Bank", desc: "Land Bank of the Philippines - Gumaca Branch, Gumaca" },
  { name: "SSS Gumaca 🏛️", lat: 13.9209, lng: 122.0984, type: "Government", desc: "Social Security System - Gumaca Branch, Gumaca" },
  { name: "PhilHealth Local Health 🏥", lat: 13.9204, lng: 122.0976, type: "Government", desc: "PhilHealth Local Health Office, Gumaca" },
  { name: "54Mb Cellphone 📱", lat: 13.9208, lng: 122.1000, type: "Shopping", desc: "54Mb Cellphone Shop, Poblacion, Gumaca" },
  { name: "DrugCheck Philippines Inc. 💊", lat: 13.9182, lng: 122.0995, type: "Pharmacy", desc: "DrugCheck Philippines Inc., Gumaca" },
  { name: "Public Attorney's Office (PAO) 🏛️", lat: 13.9161, lng: 122.1013, type: "Government", desc: "Public Attorney's Office - Gumaca, Quezon" },
  { name: "Gumaca Hall of Justice (RTC) ⚖️", lat: 13.9161, lng: 122.1007, type: "Government", desc: "Gumaca Hall of Justice - Regional Trial Court, Gumaca" },
  { name: "McDonald's Gumaca 🍟🍔", lat: 13.920751, lng: 122.100299, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "Chowking Gumaca 🥢🥟", lat: 13.920489, lng: 122.098769, type: "Restaurant", desc: "Fast Food Restaurant, Maharlika Highway / Poblacion" },
  { name: "Novo Department Store 🛍️🏢", lat: 13.920196, lng: 122.097666, type: "Shopping", desc: "Department Store & Shopping, Maharlika Highway / Town Center" },
  { name: "Heritage Site 🏛️", lat: 13.9235, lng: 122.1008, type: "Heritage", desc: "Gumaca Heritage / Historical Landmark, Tabing Dagat" },
  { name: "Gumaca Public Market 🛒🐟", lat: 13.9209, lng: 122.1013, type: "Market", desc: "Public Market & Commercial Hub, Poblacion" },
  { name: "Puregold Gumaca 🟡🛒", lat: 13.921103, lng: 122.105650, type: "Shopping", desc: "Puregold Supermarket, Maharlika Highway / San Diego" },
  { name: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", lat: 13.919680, lng: 122.100656, type: "Transit", desc: "Jeepney Terminal for Macalelon, Unisan & Lopez" },
  { name: "Jeep Terminal (Lopez) 🚐", lat: 13.9222, lng: 122.1009, type: "Transit", desc: "Jeepney Terminal bound for Lopez" },
  { name: "Piat Gumaca 📍", lat: 13.918025, lng: 122.100401, type: "Landmark", desc: "Piat Area, Mabini / Poblacion, Gumaca" },
  { name: "Holy Child Jesus Christ ⛪", lat: 13.921889, lng: 122.099639, type: "Heritage", desc: "Holy Child Jesus Christ Church / Chapel, Town Proper, Gumaca" },
  { name: "578 Emporium 📍", lat: 13.921341, lng: 122.103364, type: "Shopping", desc: "Emporium & Shopping Center, Maharlika Highway, Gumaca" },
];

// Arrow markers configuration
export const ARROW_STORAGE_KEY = "casafinder_arrow_markers_v1";

export const DEFAULT_ARROW_MARKERS = {
  "slsu-villa-nava":   { _v: 1, lat: 13.912125, lng: 122.104057, title: "SLSU Villa Nava 🎓", desc: "Southern Luzon State University - Villa Nava Campus" },
  "slsu-tabing-dagat": { _v: 2, lat: 13.9231,   lng: 122.1011,   title: "SLSU Tabing Dagat Campus 🎓", desc: "Southern Luzon State University - Tabing Dagat Campus" },
  "eqc":               { _v: 1, lat: 13.923315, lng: 122.097557, title: "Eastern Quezon College (EQC) 🏛️", desc: "College & Educational Institution, Gumaca" },
  "gnhs":              { _v: 2, lat: 13.9182, lng: 122.0956, title: "Gumaca National High School (GNHS) 🏫", desc: "Gumaca NHS, Mabini/Poblacion, Gumaca" },
  "holy-child":        { _v: 1, lat: 13.921889, lng: 122.099639, title: "Holy Child Jesus College 🏫", desc: "Holy Child Jesus College / Academy, Town Proper, Gumaca" },
  "piat":              { _v: 1, lat: 13.9180, lng: 122.1003, title: "PIAT College 🎨🎓", desc: "Philippine Institute of Arts and Technology, Gumaca" },
  "jollibee":          { _v: 1, lat: 13.920523, lng: 122.099064, title: "Jollibee Gumaca 🍔🐝", desc: "Fast Food Restaurant, Maharlika Highway, Gumaca" },
  "mcdonalds":         { _v: 1, lat: 13.920751, lng: 122.100299, title: "McDonald's Gumaca 🍟🍔", desc: "Fast Food Restaurant, Maharlika Highway, Gumaca" },
  "chowking":          { _v: 1, lat: 13.920489, lng: 122.098769, title: "Chowking Gumaca 🥢🥟", desc: "Fast Food Restaurant, Maharlika Highway, Gumaca" },
  "novo":              { _v: 1, lat: 13.920196, lng: 122.097666, title: "Novo Department Store 🛍️🏢", desc: "Department Store & Shopping, Maharlika Highway, Gumaca" },
  "heritage":          { _v: 1, lat: 13.9235, lng: 122.1008, title: "Heritage Site 🏛️", desc: "Gumaca Heritage / Historical Landmark, Tabing Dagat" },
  "market":            { _v: 1, lat: 13.9209, lng: 122.1013, title: "Gumaca Public Market 🛒🐟", desc: "Public Market & Commercial Hub, Poblacion" },
  "puregold":          { _v: 1, lat: 13.921103, lng: 122.105650, title: "Puregold Gumaca 🟡🛒", desc: "Puregold Supermarket, Maharlika Highway / San Diego" },
  "jeep-terminal":     { _v: 1, lat: 13.919680, lng: 122.100656, title: "Jeep Terminal (Macalelon, Unisan, Lopez) 🚐", desc: "Jeepney Terminal for Macalelon, Unisan & Lopez" },
  "jeep-terminal-lopez": { _v: 1, lat: 13.9222, lng: 122.1009, title: "Jeep Terminal (Lopez) 🚐", desc: "Jeepney Terminal bound for Lopez, Gumaca" },
  "rakk-prophet":      { _v: 1, lat: 13.932183, lng: 122.091994, title: "RAKKK Prophet Medical Center 🏥", desc: "Hospital / Medical Center, Km. 194 Maharlika Highway, Brgy. Rosario, Gumaca" },
  "district-hospital": { _v: 1, lat: 13.9335, lng: 122.0895, title: "Gumaca District Hospital 🏥", desc: "Gumaca District Hospital, Maharlika Highway, Brgy. Rosario, Gumaca" },
  "convention-center": { _v: 2, lat: 13.9235, lng: 122.1017, title: "Southern Luzon Convention Center 🏛️", desc: "Convention & Events Center, Tabing Dagat Area, Gumaca" },
  "plaza-rizal-elem":  { _v: 1, lat: 13.9183, lng: 122.0986, title: "Plaza Rizal Elementary School 🏫", desc: "Plaza Rizal Elementary School, Poblacion, Gumaca" },
  "west-central":      { _v: 1, lat: 13.9181, lng: 122.0996, title: "Gumaca West Central School 🏫", desc: "Gumaca West Central School, Poblacion, Gumaca" },
  "east-central":      { _v: 1, lat: 13.9175, lng: 122.1002, title: "Gumaca East Central School 🏫", desc: "Gumaca East Central School, Poblacion, Gumaca" },
};

// Map tile configurations
export const GOOGLE_STREET_URL = "https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}";
export const GOOGLE_SATELLITE_URL = "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}";
export const MAX_ZOOM = 20;

// Grid configuration
export const GRID_CONFIG = {
  latStart: 13.880,
  latEnd: 13.960,
  lngStart: 122.050,
  lngEnd: 122.200,
  step: 0.005, // ~550m grid lines
};

// Map mode types
export type MapMode = "streets" | "satellite" | "google_embed" | "osm";