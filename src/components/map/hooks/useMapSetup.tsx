// hooks/useMapSetup.ts
import { useEffect } from "react";
import maplibregl from "maplibre-gl";

interface UseMapSetupProps {
  mapRef: React.MutableRefObject<maplibregl.Map | null>;
  mapContainer: React.RefObject<HTMLDivElement | null>; // 👈 aquí el cambio
  center?: [number, number];
  zoom?: number;
  styleUrl?: string;
}

export function useMapSetup({
  mapRef,
  mapContainer,
  center = [-76.5, -11.85],
  zoom = 8,
  styleUrl = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
}: UseMapSetupProps) {
  useEffect(() => {
    // Evita re-inicializar si el mapa ya existe o si el contenedor aún no está listo
    if (mapRef.current || !mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), "top-left");
    map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-right");

    mapRef.current = map;

    // Limpieza al desmontar
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [mapContainer, center[0], center[1], zoom, styleUrl]);
}