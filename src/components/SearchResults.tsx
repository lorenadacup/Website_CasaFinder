import React from "react";
import { Property } from "../data/properties";
import { MapPin, School, Building, Home, Navigation } from "lucide-react";

interface SearchResultItem {
  name: string;
  lat: number;
  lng: number;
  detail: string;
  propertyObj?: Property;
}

interface SearchResultsProps {
  searchResults: SearchResultItem[];
  showSearchResults: boolean;
  setShowSearchResults: (show: boolean) => void;
  setSearchQuery: (query: string) => void;
  triggerArrowHighlight: (lat: number, lng: number, title: string, desc?: string, zoom?: number) => void;
  panToArea: (lat: number, lng: number, zoom?: number) => void;
  setClickedStreet: (info: any) => void;
}

export default function SearchResults({
  searchResults,
  showSearchResults,
  setShowSearchResults,
  setSearchQuery,
  triggerArrowHighlight,
  panToArea,
  setClickedStreet,
}: SearchResultsProps) {
  const getIconForResult = (item: SearchResultItem) => {
    if (item.name.includes("SLSU") || item.name.includes("🎓") || item.detail.includes("Campus")) {
      return <School className="w-4 h-4 text-indigo-600" />;
    } else if (item.name.includes("📍") || item.name.includes("Barangay")) {
      return <MapPin className="w-4 h-4 text-emerald-600" />;
    } else if (item.propertyObj) {
      return <Home className="w-4 h-4 text-amber-600" />;
    } else if (item.name.includes("🏛️") || item.name.includes("Church")) {
      return <Building className="w-4 h-4 text-rose-600" />;
    }
    return <MapPin className="w-4 h-4 text-stone-600" />;
  };

  const handleResultClick = (item: SearchResultItem) => {
    triggerArrowHighlight(item.lat, item.lng, item.name, item.detail, 20);
    setSearchQuery(item.name);
    setShowSearchResults(false);
    setClickedStreet(null);

    // If it's a property, also pan to it
    if (item.propertyObj) {
      panToArea(item.lat, item.lng, 17);
    }
  };

  if (!showSearchResults || searchResults.length === 0) {
    return null;
  }

  return (
    <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-2xl">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-stone-100">
        <div className="p-3 border-b border-stone-200 bg-stone-50">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-stone-700">
              {searchResults.length} result{searchResults.length !== 1 ? "s" : ""} found
            </div>
            <button
              onClick={() => setShowSearchResults(false)}
              className="text-xs text-stone-500 hover:text-stone-700 font-medium"
            >
              Close
            </button>
          </div>
        </div>

        {searchResults.map((item, idx) => (
          <div
            key={idx}
            className="p-3 hover:bg-stone-50 cursor-pointer transition-colors"
            onClick={() => handleResultClick(item)}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5 shrink-0">
                {getIconForResult(item)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-stone-900 text-sm truncate">
                    {item.name}
                  </h4>
                  <Navigation className="w-3 h-3 text-stone-400" />
                </div>
                <p className="text-xs text-stone-600 mt-0.5 truncate">
                  {item.detail}
                </p>
                {item.propertyObj && (
                  <div className="mt-1 flex items-center gap-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-1.5 py-0.5 rounded">
                      ₱{item.propertyObj.price.toLocaleString()}/mo
                    </span>
                    <span className="bg-stone-100 text-stone-700 text-[10px] font-medium px-1.5 py-0.5 rounded">
                      {item.propertyObj.beds} beds • {item.propertyObj.baths} baths
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}