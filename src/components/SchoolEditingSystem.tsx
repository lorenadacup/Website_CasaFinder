import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { getGumacaSchools, saveCustomSchoolCoord, addCustomSchoolItem, deleteCustomSchoolItem } from "../utils/schoolDistances";
import { Map, X, Plus, Trash2, Save } from "lucide-react";

interface SchoolEditingSystemProps {
  map: L.Map | null;
  isEntranceEditingMode: boolean;
  selectedEditingSchoolId: string;
  setSelectedEditingSchoolId: (id: string) => void;
  editingCampusLat: number;
  setEditingCampusLat: (lat: number) => void;
  editingCampusLng: number;
  setEditingCampusLng: (lng: number) => void;
  entranceSaveToast: string | null;
  setEntranceSaveToast: (toast: string | null) => void;
  schoolRevision: number;
  setSchoolRevision: (revision: number) => void;
  setIsEntranceEditingMode: (mode: boolean) => void;
  systemTab: "edit" | "add";
  setSystemTab: (tab: "edit" | "add") => void;
  newSchoolName: string;
  setNewSchoolName: (name: string) => void;
  newSchoolShortName: string;
  setNewSchoolShortName: (shortName: string) => void;
  newSchoolType: 'University' | 'College' | 'High School' | 'Elementary';
  setNewSchoolType: (type: 'University' | 'College' | 'High School' | 'Elementary') => void;
  newSchoolDesc: string;
  setNewSchoolDesc: (desc: string) => void;
  newSchoolCampusLat: number;
  setNewSchoolCampusLat: (lat: number) => void;
  newSchoolCampusLng: number;
  setNewSchoolCampusLng: (lng: number) => void;
  systemBoxScrollRef: React.RefObject<HTMLDivElement | null>;
  addFormSectionRef: React.RefObject<HTMLDivElement | null>;
  scrollToTopSystemBox: () => void;
  scrollToBottomSystemBox: () => void;
  scrollToAddSectionSystemBox: () => void;
}

export default function SchoolEditingSystem({
  map,
  isEntranceEditingMode,
  selectedEditingSchoolId,
  setSelectedEditingSchoolId,
  editingCampusLat,
  setEditingCampusLat,
  editingCampusLng,
  setEditingCampusLng,
  entranceSaveToast,
  setEntranceSaveToast,
  schoolRevision,
  setSchoolRevision,
  setIsEntranceEditingMode,
  systemTab,
  setSystemTab,
  newSchoolName,
  setNewSchoolName,
  newSchoolShortName,
  setNewSchoolShortName,
  newSchoolType,
  setNewSchoolType,
  newSchoolDesc,
  setNewSchoolDesc,
  newSchoolCampusLat,
  setNewSchoolCampusLat,
  newSchoolCampusLng,
  setNewSchoolCampusLng,
  systemBoxScrollRef,
  addFormSectionRef,
  scrollToTopSystemBox,
  scrollToBottomSystemBox,
  scrollToAddSectionSystemBox,
}: SchoolEditingSystemProps) {
  const entranceLayerRef = useRef<L.LayerGroup | null>(null);
  const campusMarkerRef = useRef<L.Marker | null>(null);
  const isDraggingMarkerRef = useRef(false);

  // Render Interactive Draggable School Pins on Map when editing mode is active
  useEffect(() => {
    if (!map) return;

    if (!entranceLayerRef.current) {
      entranceLayerRef.current = L.layerGroup().addTo(map);
    } else {
      entranceLayerRef.current.clearLayers();
    }

    if (isEntranceEditingMode) {
      const activeSchools = getGumacaSchools();
      activeSchools.forEach((sch) => {
        const isSelected = (sch.id === selectedEditingSchoolId);
        const currentLat = sch.lat;
        const currentLng = sch.lng;

        const schoolIcon = L.divIcon({
          className: `custom-school-editor-pin !bg-transparent !border-none ${isSelected ? 'z-50' : 'z-30'}`,
          html: `
            <div class="cursor-grab active:cursor-grabbing group flex flex-col items-center select-none pointer-events-auto">
              <div class="relative flex items-center justify-center">
                ${isSelected ? '<div class="absolute -inset-2 bg-amber-400/50 rounded-full animate-ping pointer-events-none"></div>' : ''}
                <div class="w-10 h-10 ${isSelected ? 'bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 text-stone-950 border-3 border-stone-950 scale-110 shadow-2xl' : 'bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-amber-300 border-2 border-amber-400 shadow-xl'} rounded-full flex items-center justify-center font-black text-lg">
                  🎓
                </div>
              </div>
              <div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-amber-500' : 'border-t-amber-400'} -mt-0.5 drop-shadow-md"></div>
              <div class="${isSelected ? 'bg-amber-400 text-stone-950 font-black ring-2 ring-stone-950 scale-105' : 'bg-stone-950/90 text-amber-300 font-bold'} text-[10px] px-2.5 py-0.5 rounded-full border border-amber-400 shadow-xl mt-1 whitespace-nowrap flex items-center gap-1">
                <span>🎓 ${sch.shortName || sch.name}</span>
                ${isSelected ? '<span class="text-[8px] bg-stone-950 text-amber-300 px-1 rounded font-mono font-black">I-DRAG</span>' : ''}
              </div>
            </div>
          `,
          iconSize: [160, 56],
          iconAnchor: [80, 42]
        });

        const marker = L.marker([currentLat, currentLng], {
          icon: schoolIcon,
          draggable: true,
          autoPan: true,
          title: `I-drag upang palitan ang lokasyon ng ${sch.name}`,
          zIndexOffset: isSelected ? 10000 : 5000
        });

        marker.on("add", () => {
          const markerIcon = (marker as any)._icon;
          if (markerIcon) {
            L.DomEvent.disableClickPropagation(markerIcon);
            L.DomEvent.disableScrollPropagation(markerIcon);
          }
        });

        marker.on("dragstart", () => {
          isDraggingMarkerRef.current = true;
          map.dragging.disable();
          setSelectedEditingSchoolId(sch.id);
        });

        marker.on("drag", (e: any) => {
          const latlng = e.target.getLatLng();
          const newLat = Number(latlng.lat.toFixed(6));
          const newLng = Number(latlng.lng.toFixed(6));
          setEditingCampusLat(newLat);
          setEditingCampusLng(newLng);
        });

        marker.on("dragend", (e: any) => {
          isDraggingMarkerRef.current = false;
          map.dragging.enable();
          const latlng = e.target.getLatLng();
          const newLat = Number(latlng.lat.toFixed(6));
          const newLng = Number(latlng.lng.toFixed(6));
          saveCustomSchoolCoord(sch.id, newLat, newLng);
          setEditingCampusLat(newLat);
          setEditingCampusLng(newLng);
          setSchoolRevision(r => r + 1);
          setEntranceSaveToast(`Na-drag at na-update ang lokasyon ng ${sch.shortName || sch.name}! ✨`);
          setTimeout(() => setEntranceSaveToast(null), 3000);
        });

        marker.on("click", () => {
          setSelectedEditingSchoolId(sch.id);
          setEditingCampusLat(sch.lat);
          setEditingCampusLng(sch.lng);
        });

        if (isSelected) {
          campusMarkerRef.current = marker;
        }

        entranceLayerRef.current?.addLayer(marker);
      });
    } else {
      campusMarkerRef.current = null;
    }

    return () => {
      if (entranceLayerRef.current) {
        entranceLayerRef.current.clearLayers();
      }
    };
  }, [isEntranceEditingMode, selectedEditingSchoolId, schoolRevision, map, setSelectedEditingSchoolId, setEditingCampusLat, setEditingCampusLng, setSchoolRevision, setEntranceSaveToast]);

  // Keep selected marker position synchronized when state coordinates update from inputs or map click (but not while dragging)
  useEffect(() => {
    if (isEntranceEditingMode && campusMarkerRef.current && !isDraggingMarkerRef.current) {
      campusMarkerRef.current.setLatLng([editingCampusLat, editingCampusLng]);
    }
  }, [editingCampusLat, editingCampusLng, isEntranceEditingMode]);

  const handleSaveEditing = () => {
    if (selectedEditingSchoolId) {
      saveCustomSchoolCoord(selectedEditingSchoolId, editingCampusLat, editingCampusLng);
      setSchoolRevision(r => r + 1);
      setEntranceSaveToast("Na-save ang lokasyon ng paaralan! ✅");
      setTimeout(() => setEntranceSaveToast(null), 3000);
    }
  };

  const handleResetEditing = () => {
    const activeSchools = getGumacaSchools();
    const sch = activeSchools.find(s => s.id === selectedEditingSchoolId);
    if (sch) {
      setEditingCampusLat(sch.lat);
      setEditingCampusLng(sch.lng);
      saveCustomSchoolCoord(sch.id, sch.lat, sch.lng);
      setSchoolRevision(r => r + 1);
      setEntranceSaveToast("Na-reset sa orihinal na lokasyon! ↩️");
      setTimeout(() => setEntranceSaveToast(null), 3000);
    }
  };

  const handleDeleteSchool = (schoolId: string) => {
    if (window.confirm(`Sigurado ka bang gusto mong tanggalin ang ${schoolId} mula sa listahan?`)) {
      deleteCustomSchoolItem(schoolId);
      setSchoolRevision(r => r + 1);
      const activeSchools = getGumacaSchools();
      if (activeSchools.length > 0) {
        setSelectedEditingSchoolId(activeSchools[0].id);
      }
      setEntranceSaveToast("Natanggal na ang paaralan! 🗑️");
      setTimeout(() => setEntranceSaveToast(null), 3000);
    }
  };

  const handleAddNewSchool = () => {
    if (!newSchoolName.trim() || !newSchoolShortName.trim()) {
      setEntranceSaveToast("Punan ang lahat ng kinakailangang fields!");
      setTimeout(() => setEntranceSaveToast(null), 3000);
      return;
    }

    const newId = newSchoolName.toLowerCase().replace(/\s+/g, '-');
    addCustomSchoolItem({
      id: newId,
      name: newSchoolName,
      shortName: newSchoolShortName,
      type: newSchoolType,
      desc: newSchoolDesc || `${newSchoolType} sa Gumaca, Quezon`,
      lat: newSchoolCampusLat,
      lng: newSchoolCampusLng,
      isCustom: true
    });

    setSchoolRevision(r => r + 1);
    setSelectedEditingSchoolId(newId);
    setSystemTab("edit");
    
    // Reset form
    setNewSchoolName("");
    setNewSchoolShortName("");
    setNewSchoolType("College");
    setNewSchoolDesc("");
    setNewSchoolCampusLat(13.922000);
    setNewSchoolCampusLng(122.099500);

    setEntranceSaveToast(`Naidagdag ang ${newSchoolName}! 🎉`);
    setTimeout(() => setEntranceSaveToast(null), 3000);
  };

  const activeSchools = getGumacaSchools();

  return (
    <>
      {/* School Entrance Editing System Box */}
      {isEntranceEditingMode && (
        <div className="absolute top-20 right-4 z-40 w-80 max-w-[calc(100vw-2rem)] bg-stone-900/95 backdrop-blur-md border border-stone-700/60 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/80 to-indigo-950/80 p-4 flex items-center justify-between border-b border-stone-700/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Map className="w-5 h-5 text-stone-900" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">School Pinpoint Editor 🎓</h3>
                <p className="text-[10px] text-indigo-300">Drag to move school entrance coordinates</p>
              </div>
            </div>
            <button
              onClick={() => setIsEntranceEditingMode(false)}
              className="p-1.5 bg-stone-800/60 hover:bg-stone-700/80 rounded-lg text-stone-400 hover:text-stone-200 transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-stone-700/60">
            <button
              onClick={() => setSystemTab("edit")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${systemTab === "edit"
                ? "bg-gradient-to-r from-amber-900/40 to-orange-900/40 text-amber-300 border-b-2 border-amber-400"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                }`}
            >
              Edit Schools
            </button>
            <button
              onClick={() => setSystemTab("add")}
              className={`flex-1 py-2.5 text-sm font-medium transition-all ${systemTab === "add"
                ? "bg-gradient-to-r from-emerald-900/40 to-teal-900/40 text-emerald-300 border-b-2 border-emerald-400"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
                }`}
            >
              Add School
            </button>
          </div>

          {/* Scrollable Content */}
          <div
            ref={systemBoxScrollRef as React.RefObject<HTMLDivElement>}
            className="h-96 overflow-y-auto p-4"
          >
            {systemTab === "edit" ? (
              <div className="space-y-4">
                {/* School Selection */}
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-2">
                    Select School to Edit
                  </label>
                  <select
                    value={selectedEditingSchoolId}
                    onChange={(e) => setSelectedEditingSchoolId(e.target.value)}
                    className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30"
                  >
                    {activeSchools.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.shortName || sch.name} {sch.isCustom ? " (Custom)" : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Coordinates Display & Edit */}
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">
                        Latitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={editingCampusLat}
                        onChange={(e) => setEditingCampusLat(Number(e.target.value))}
                        className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-stone-400 mb-1">
                        Longitude
                      </label>
                      <input
                        type="number"
                        step="0.000001"
                        value={editingCampusLng}
                        onChange={(e) => setEditingCampusLng(Number(e.target.value))}
                        className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/30"
                      />
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-500 bg-stone-800/50 p-2 rounded-lg">
                    <div className="font-mono">📍 {editingCampusLat.toFixed(6)}, {editingCampusLng.toFixed(6)}</div>
                    <div className="mt-1">Click on map to set new location, or drag the school pin directly on map.</div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEditing}
                    className="flex-1 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    Save Location
                  </button>
                  <button
                    onClick={handleResetEditing}
                    className="px-3 py-2 bg-stone-800/70 hover:bg-stone-700/90 text-stone-400 hover:text-stone-200 rounded-lg text-sm font-medium transition-all"
                  >
                    Reset
                  </button>
                </div>

                {/* Delete Custom School */}
                {activeSchools.find(s => s.id === selectedEditingSchoolId)?.isCustom && (
                  <div className="border-t border-stone-700/60 pt-3">
                    <button
                      onClick={() => handleDeleteSchool(selectedEditingSchoolId)}
                      className="w-full bg-gradient-to-r from-red-900/70 to-rose-900/70 hover:from-red-800 hover:to-rose-800 text-red-300 hover:text-red-100 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete This School
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div ref={addFormSectionRef as React.RefObject<HTMLDivElement>} className="space-y-4">
                {/* Add New School Form */}
                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-2">
                    School Name
                  </label>
                  <input
                    type="text"
                    value={newSchoolName}
                    onChange={(e) => setNewSchoolName(e.target.value)}
                    placeholder="e.g., Southern Luzon State University"
                    className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-2">
                    Short Name
                  </label>
                  <input
                    type="text"
                    value={newSchoolShortName}
                    onChange={(e) => setNewSchoolShortName(e.target.value)}
                    placeholder="e.g., SLSU"
                    className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-2">
                    School Type
                  </label>
                  <select
                    value={newSchoolType}
                    onChange={(e) => setNewSchoolType(e.target.value as any)}
                    className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30"
                  >
                    <option value="University">University</option>
                    <option value="College">College</option>
                    <option value="High School">High School</option>
                    <option value="Elementary">Elementary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-stone-400 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={newSchoolDesc}
                    onChange={(e) => setNewSchoolDesc(e.target.value)}
                    placeholder="Brief description of the school"
                    rows={2}
                    className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newSchoolCampusLat}
                      onChange={(e) => setNewSchoolCampusLat(Number(e.target.value))}
                      className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-stone-400 mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={newSchoolCampusLng}
                      onChange={(e) => setNewSchoolCampusLng(Number(e.target.value))}
                      className="w-full bg-stone-800/70 border border-stone-700/50 rounded-lg px-3 py-2 text-sm text-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/30"
                    />
                  </div>
                </div>

                <div className="text-[11px] text-stone-500 bg-stone-800/50 p-2 rounded-lg">
                  <div>📍 Default location set to Gumaca Center</div>
                  <div className="mt-1">You can adjust coordinates after adding, or click on map to set location.</div>
                </div>

                <button
                  onClick={handleAddNewSchool}
                  className="w-full bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-600 hover:to-teal-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add New School
                </button>
              </div>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-3 border-t border-stone-700/60 bg-stone-900/80">
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-stone-500">
                {activeSchools.length} schools in database
              </span>
              <button
                onClick={scrollToTopSystemBox}
                className="text-[10px] text-stone-400 hover:text-stone-200 transition-colors"
              >
                Scroll to Top
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Toast */}
      {entranceSaveToast && (
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gradient-to-r from-amber-900/90 to-orange-900/90 text-amber-200 px-4 py-2.5 rounded-lg border border-amber-700/50 shadow-2xl animate-pulse">
            <div className="text-sm font-medium flex items-center gap-2">
              <span>✨</span>
              {entranceSaveToast}
            </div>
          </div>
        </div>
      )}
    </>
  );
}