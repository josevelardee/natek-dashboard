import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import type { Station } from "../../../types";

interface UseStationInteractionsProps {
  map: React.MutableRefObject<maplibregl.Map | null>;
  onSelect?: (station: Station) => void;
}

export function useStationInteractions({ map, onSelect }: UseStationInteractionsProps) {
  useEffect(() => {
    const mapInstance = map.current;
    if (!mapInstance) return; // ✅ No hacer nada si no hay mapa

    const layers = ["stations-natek-layer", "stations-senamhi-layer"];

    const handleClick = (e: maplibregl.MapLayerMouseEvent) => {
      if (!e.features?.length) return;
      const feature = e.features[0];
      const props = feature.properties as unknown as Station;
      if (!props) return;

      mapInstance.flyTo({ center: e.lngLat, zoom: 10 });
      onSelect?.({ ...props });
      console.log("Estación seleccionada:", props);
    };
    

    // Registrar clicks solo si la capa existe
    const cleanupFns: (() => void)[] = [];
    layers.forEach((layerId) => {
      const tryRegister = () => {
        if (mapInstance.getLayer(layerId)) {
          mapInstance.on("click", layerId, handleClick);
          cleanupFns.push(() => mapInstance.off("click", layerId, handleClick));
          return true;
        }
        return false;
      };

      if (!tryRegister()) {
        const onSourceData = () => {
          if (tryRegister()) {
            mapInstance.off("sourcedata", onSourceData);
          }
        };
        mapInstance.on("sourcedata", onSourceData);
        cleanupFns.push(() => mapInstance.off("sourcedata", onSourceData));
      }
    });

    return () => {
      cleanupFns.forEach((fn) => fn());
    };
  }, [map, onSelect]);
}