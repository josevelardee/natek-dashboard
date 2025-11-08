import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import type { Station } from "@/types";

import { useMapSetup } from "./hooks/useMapSetup";

import { useBaseLayers } from "./hooks/useBaseLayers";

import { useStationsLayer } from "./hooks/useStationsLayer";
import { useStationsData } from "./hooks/useStationsData"; // si tienes un hook para obtener geojson
import { useCuencasInteractions } from "./hooks/useBasinInteraction";


import { useStationInteractions } from "./hooks/useStationInteractions";

import StationPreview from "../../features/stations/components/StationPreview";
import "maplibre-gl/dist/maplibre-gl.css";
import { Legend } from "./components/legend";

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

  // --- Inicializar mapa y capas ---
  
  useMapSetup({ mapRef, mapContainer });
  useBaseLayers(mapRef);

  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(false);
 

  // --- Interacciones ---
  useStationInteractions({
    map: mapRef,
    onSelect: (station) => {
      setSelectedStation(station);    // guardar estación seleccionada
      setSidebarVisible(true);        // abrir sidebar
    },
  });
   useStationsLayer(mapRef);
  {/**/}

  const { cuencas} = useBaseLayers(mapRef);
// MapView.tsx
  const { stationsGeoJson } = useStationsData();

  const stationsNatek = {
    type: "FeatureCollection" as const,
    features: stationsGeoJson.features.filter(f => f.properties.owner === "Natek"),
  };

  const stationsSenamhi = {
    type: "FeatureCollection" as const,
    features: stationsGeoJson.features.filter(f => f.properties.owner === "SENAMHI"),
  };

  useStationsLayer(mapRef); // crea las capas con estilos propios

  useCuencasInteractions({
    map: mapRef,
    allCuencas: cuencas!,
    stationsNatek,
    stationsSenamhi,
  });

  // --- Resize del mapa al abrir/cerrar sidebar ---
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

      {/* Sidebar con preview de estación */}
     {selectedStation && sidebarVisible && (
        <StationPreview
          station={selectedStation}
          //open={sidebarVisible}
          cuencasGeoJson={cuencas}
          onClose={() => setSidebarVisible(false)}
        />
      )}{/* */}
    </div>
  );
}