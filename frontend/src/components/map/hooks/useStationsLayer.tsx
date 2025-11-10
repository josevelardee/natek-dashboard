import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import type { FeatureCollection, Point } from "geojson";
import { useStationsData } from "./useStationsData";

function filterGeoJSONByOwner(
  geoJson: FeatureCollection<Point, any>,
  owner: string
): FeatureCollection<Point, any> {
  return {
    type: "FeatureCollection",
    features: geoJson.features.filter(
      (f) => f.properties?.owner?.toLowerCase() === owner.toLowerCase()
    ),
  };
}

export function useStationsLayer(
  mapRef: React.MutableRefObject<maplibregl.Map | null>
) {
  const { stationsGeoJson } = useStationsData();
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !stationsGeoJson?.features?.length) return;

    const natek = filterGeoJSONByOwner(stationsGeoJson, "Natek");
    const senamhi = filterGeoJSONByOwner(stationsGeoJson, "SENAMHI");

    // Crear tooltip si no existe
    if (!tooltipRef.current) {
      tooltipRef.current = Object.assign(document.createElement("div"), {
        style: `
          position:absolute;
          background:white;
          padding:2px 6px;
          font-size:12px;
          border-radius:4px;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
          pointer-events:none;
          opacity:0;
          transition:opacity 0.2s;
        `,
      } as any);
      map.getContainer().appendChild(tooltipRef.current!);
    }

    const addLayers = () => {
      // 🟢 SENAMHI
      if (!map.getSource("stations-senamhi")) {
        map.addSource("stations-senamhi", { type: "geojson", data: senamhi });
        map.addLayer({
          id: "stations-senamhi-layer",
          type: "circle",
          source: "stations-senamhi",
          paint: {
            "circle-radius": 6,
            "circle-color": [
              "match",
              ["get", "type"],
              "Hidrometrica", "#2196F3",
              "Climatica", "#FF9800",
              "#9E9E9E",
            ],
            "circle-stroke-width": 1,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 1,
          },
        });
      }

      // 🔵 NATEK
      if (!map.getSource("stations-natek")) {
        map.addSource("stations-natek", { type: "geojson", data: natek });
        map.addLayer({
          id: "stations-natek-layer",
          type: "circle",
          source: "stations-natek",
          paint: {
            "circle-radius": 10,
            "circle-color": [
              "match",
              ["get", "type"],
              "Nivel", "#0066FF",
              "Caudal", "#00BFA6",
              "Cámara", "#3F51B5",
              "#0066FF",
            ],
            "circle-stroke-width": 2,
            "circle-stroke-color": "#ffffff",
            "circle-opacity": 1,
          },
        });
      }

      // 🌊 Animación de pulso
      let natekRadius = 10;
      let natekGrowing = true;
      let senamhiRadius = 5;
      let senamhiGrowing = true;

      animationRef.current = window.setInterval(() => {
        if (!map) return;

        if (map.getLayer("stations-natek-layer")) {
          natekRadius += natekGrowing ? 0.1 : -0.1;
          if (natekRadius >= 11) natekGrowing = false;
          if (natekRadius <= 10) natekGrowing = true;
          map.setPaintProperty("stations-natek-layer", "circle-radius", natekRadius);
        }

        if (map.getLayer("stations-senamhi-layer")) {
          senamhiRadius += senamhiGrowing ? 0.1 : -0.1;
          if (senamhiRadius >= 6) senamhiGrowing = false;
          if (senamhiRadius <= 5) senamhiGrowing = true;
          map.setPaintProperty("stations-senamhi-layer", "circle-radius", senamhiRadius);
        }
      }, 70);

      // 💬 Tooltip en hover
      ["stations-natek-layer", "stations-senamhi-layer"].forEach((layer) => {
        map.on("mousemove", layer, (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const props = f.properties || {};
          tooltipRef.current!.innerText = `${props.name ?? "Sin nombre"} (${props.type ?? "Sin tipo"})`;
          tooltipRef.current!.style.opacity = "1";
          tooltipRef.current!.style.left = `${e.point.x + 10}px`;
          tooltipRef.current!.style.top = `${e.point.y + 10}px`;
          map.getCanvas().style.cursor = "pointer";
        });

        map.on("mouseleave", layer, () => {
          tooltipRef.current!.style.opacity = "0";
          map.getCanvas().style.cursor = "";
        });
      });
    };

    // Cargar cuando el estilo esté listo
    if (map.isStyleLoaded()) addLayers();
    else map.on("load", addLayers);

    // Limpiar
    return () => {
      if (animationRef.current !== null) clearInterval(animationRef.current);
      ["stations-natek-layer", "stations-senamhi-layer"].forEach((layer) => {
        map.off("mousemove", layer, () => {});
        map.off("mouseleave", layer, () => {});
      });
    };
  }, [mapRef, stationsGeoJson]);
}