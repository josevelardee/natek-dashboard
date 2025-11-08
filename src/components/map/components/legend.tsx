import { useState, useEffect } from "react";
import maplibregl from "maplibre-gl";

interface LegendProps {
  onVisibilityChange?: (visibleLayers: Record<string, boolean>) => void;
  mapRef?: React.MutableRefObject<maplibregl.Map | null>;
  className?: string;
}

export function Legend({ onVisibilityChange, mapRef, className }: LegendProps) {
  // Estados internos de visibilidad
  const [showNatek, setShowNatek] = useState(true);
  const [showHidrometricas, setShowHidrometricas] = useState(true);
  const [showClimaticas, setShowClimaticas] = useState(true);

  // Items de la leyenda
  const legendItems = [
    { color: "#0066ff", label: "Estaciones Natek", state: showNatek, toggle: setShowNatek, key: "natek" },
    { color: "#2196F3", label: "Estaciones Hidrométricas (SENAMHI)", state: showHidrometricas, toggle: setShowHidrometricas, key: "Hidrometricas" },
    { color: "#FF9800", label: "Estaciones Climáticas (SENAMHI)", state: showClimaticas, toggle: setShowClimaticas, key: "Climaticas" },
  ];

  // Efecto para aplicar filtros en el mapa
  useEffect(() => {
    if (onVisibilityChange) {
      onVisibilityChange({
        natek: showNatek,
        hidrometricas: showHidrometricas,
        climaticas: showClimaticas,
      });
    }

    if (!mapRef?.current) return;

    const map = mapRef.current;

    // 🔹 Filtrar Estaciones Natek
    if (map.getLayer("stations-natek-layer")) {
      map.setLayoutProperty("stations-natek-layer", "visibility", showNatek ? "visible" : "none");
    }

    // 🔹 Filtrar Estaciones SENAMHI (Hidrométricas + Climáticas)
    if (map.getLayer("stations-senamhi-layer")) {
      const types: string[] = [];
      if (showHidrometricas) types.push("Hidrometrica");
      if (showClimaticas) types.push("Climatica");

      let filter: maplibregl.FilterSpecification;

      if (types.length > 0) {
        // Mostrar solo los tipos seleccionados
        filter = ["match", ["get", "type"], types, true, false];
      } else {
        // Ningún tipo seleccionado → mostrar nada
        filter = ["==", ["get", "type"], "___none___"];
      }

      map.setFilter("stations-senamhi-layer", filter);
    }
  }, [showNatek, showHidrometricas, showClimaticas, onVisibilityChange, mapRef]);

  return (
    <div className={className}>
      <div className="font-semibold text-gray-700 mb-1">Capas visibles</div>
      {legendItems.map((item) => (
        <label key={item.label} className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={item.state}
            onChange={(e) => item.toggle(e.target.checked)}
            className="w-4 h-4 accent-blue-500"
          />
          <span
            className="inline-block w-4 h-4 rounded-full border border-gray-300"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-gray-700">{item.label}</span>
        </label>
      ))}
    </div>
  );
}