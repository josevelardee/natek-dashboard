import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Station } from "@/types";
import { useMapSetup } from "./hooks/useMapSetup";
import { useBaseLayers } from "./hooks/useBaseLayers";
import { useStationsLayer } from "./hooks/useStationsLayer";
import { useStationsData } from "./hooks/useStationsData"; 
import { useBasinInteractions } from "./hooks/useBasinInteraction";
import { useStationInteractions } from "./hooks/useStationInteractions";
import StationPreview from "../../features/stations/components/StationPreview";
import "maplibre-gl/dist/maplibre-gl.css";
import { Legend } from "./components/Legend";

interface MapViewProps {
  stations: Station[];
  onSelect?: (st: Station) => void;
  sidebarOpen?: boolean;
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ sidebarOpen }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  // --- Initialize map and layers ---
  
  useMapSetup({ mapRef, mapContainer });
  useBaseLayers(mapRef);

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
 
  // --- Interactions ---
  useStationInteractions({
    map: mapRef,
    onSelect: (station) => {
      setSelectedStation(station);  
      setSidebarVisible(true);       
    },
  });
   useStationsLayer(mapRef);

  const { cuencas} = useBaseLayers(mapRef);
  const { stationsGeoJson } = useStationsData();

  const stationsNatek = {
    type: "FeatureCollection" as const,
    features: stationsGeoJson.features.filter(f => f.properties.owner === "Natek"),
  };

  const stationsSenamhi = {
    type: "FeatureCollection" as const,
    features: stationsGeoJson.features.filter(f => f.properties.owner === "SENAMHI"),
  };

  useStationsLayer(mapRef); // create layers with your own styles

  useBasinInteractions({
    map: mapRef,
    allCuencas: cuencas!,
    stationsNatek,
    stationsSenamhi,
  });

  // --- Map resize when opening/closing sidebar ---
  useEffect(() => {
    if (!mapRef.current) return;
    const timeout = setTimeout(() => mapRef.current?.resize(), 300);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full" />

      <Legend
        mapRef={mapRef}
        className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md rounded-lg p-3 text-sm font-medium space-y-2"
      />

      {/* Sidebar with station preview */}
     {selectedStation && sidebarVisible && (
        <StationPreview
          station={selectedStation}
          cuencasGeoJson={cuencas}
          onClose={() => setSidebarVisible(false)}
        />
      )}
    </div>
  );
}