// components/MapViewML.tsx
import { useEffect, useRef } from "react";
import type { Station } from "../types"; // ya tiene owner
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";


interface MapViewProps {
  stations: Station[];
  onSelect?: (st: Station) => void;
  sidebarOpen?: boolean;
}

export default function MapView({ stations, onSelect, sidebarOpen }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (map.current) return;

    // Inicializa el mapa
    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-76.5, -11.85], // Lima
      zoom: 8,
    });

    // Controles de zoom y rotación
    map.current.addControl(
      new maplibregl.NavigationControl({ visualizePitch: true }),
      "top-left"
    );

    // Tooltip para ríos/quebradas
    tooltipRef.current = document.createElement("div");
    tooltipRef.current.style.position = "absolute";
    tooltipRef.current.style.background = "white";
    tooltipRef.current.style.padding = "2px 6px";
    tooltipRef.current.style.fontSize = "12px";
    tooltipRef.current.style.borderRadius = "4px";
    tooltipRef.current.style.boxShadow = "0 1px 4px rgba(0,0,0,0.3)";
    tooltipRef.current.style.pointerEvents = "none";
    tooltipRef.current.style.opacity = "0";
    tooltipRef.current.style.transition = "opacity 0.2s";
    mapContainer.current!.appendChild(tooltipRef.current);

    // Cargar capa de ríos y quebradas desde GeoJSON
    map.current.on("load", () => {
      map.current!.addSource("rios-quebradas", {
        type: "geojson",
        data: "${import.meta.env.BASE_URL}rios-quebradas.geojson", // Archivo en public/
      });

      map.current!.addLayer({
        id: "rios-quebradas-line",
        type: "line",
        source: "rios-quebradas",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#1E90FF", "line-width": 3 },
      });

      // Hover: mostrar tooltip y cambiar cursor
      map.current!.on("mousemove", "rios-quebradas-line", (e) => {
        if (!e.features || !e.features.length) return;
        const feature = e.features[0];
        const name = feature.properties?.TEXTO_MAP || "Sin nombre";

        tooltipRef.current!.innerText = name;
        tooltipRef.current!.style.opacity = "1";
        tooltipRef.current!.style.left = e.point.x + 10 + "px";
        tooltipRef.current!.style.top = e.point.y + 10 + "px";

        map.current!.getCanvas().style.cursor = "pointer";
      });

      map.current!.on("mouseleave", "rios-quebradas-line", () => {
        tooltipRef.current!.style.opacity = "0";
        map.current!.getCanvas().style.cursor = "";
      });


// Cargar capa de lagos y lagunas desde GeoJSON
map.current!.addSource("lagos-lagunas", {
  type: "geojson",
  data: "${import.meta.env.BASE_URL}lagos-lagunas.geojson", // Archivo ubicado en /public
});

map.current!.addLayer({
  id: "lagos-lagunas-fill",
  type: "fill",
  source: "lagos-lagunas",
  layout: {},
  paint: {
    "fill-color": "#4FC3F7", // celeste suave
    "fill-opacity": 0.5,
  },
});

map.current!.addLayer({
  id: "lagos-lagunas-outline",
  type: "line",
  source: "lagos-lagunas",
  layout: {},
  paint: {
    "line-color": "#0288D1", // azul más intenso para borde
    "line-width": 1.5,
  },
});

// Cargar capa de limites departamentales desde GeoJSON

map.current!.addSource("lim-departamental", {
  type: "geojson",
  data: "/lim-departamental.geojson", // Archivo ubicado en public/
});

map.current!.addLayer({
  id: "lim-departamental-line",
  type: "line",
  source: "lim-departamental",
  layout: { "line-join": "round", "line-cap": "round" },
  paint: {
    "line-color": "#a6a6a6ff", // color naranja para diferenciar
    "line-width": 1.5,
  },
});

// Tooltip para lagos/lagunas
map.current!.on("mousemove", "lagos-lagunas-fill", (e) => {
  if (!e.features || !e.features.length) return;
  const feature = e.features[0];
  const name = feature.properties?.NOMBRECUER || "Lago/Laguna sin nombre";

  tooltipRef.current!.innerText = name;
  tooltipRef.current!.style.opacity = "1";
  tooltipRef.current!.style.left = e.point.x + 10 + "px";
  tooltipRef.current!.style.top = e.point.y + 10 + "px";
  map.current!.getCanvas().style.cursor = "pointer";
});

map.current!.on("mouseleave", "lagos-lagunas-fill", () => {
  tooltipRef.current!.style.opacity = "0";
  map.current!.getCanvas().style.cursor = "";
});


    });
  }, []);

  // Agregar marcadores
  useEffect(() => {
    if (!map.current) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((st) => {
      const markerEl = document.createElement("div");
      markerEl.className = "group relative flex flex-col items-center cursor-pointer";

      const pulse = document.createElement("div");
      const pin = document.createElement("div");

      // Color según owner
      if (st.owner === "Natek") {
        pulse.className = "absolute w-5 h-5 bg-blue-400 opacity-40 rounded-full animate-ping ";
        pin.className = "w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg";
      } else {
        pulse.className = "absolute w-5 h-5 bg-gray-400 opacity-40 rounded-full animate-ping";
        pin.className = "w-5 h-5 bg-gray-600 border-2 border-white rounded-full shadow-lg";
      }

      const label = document.createElement("div");
      label.textContent = st.name;
      label.className =
        "absolute -top-7 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap";

      markerEl.appendChild(pulse);
      markerEl.appendChild(pin);
      markerEl.appendChild(label);

      const marker = new maplibregl.Marker({ element: markerEl, anchor: "bottom", offset: [0, -5] })
        .setLngLat([st.lon, st.lat])
        .addTo(map.current!);

      markerEl.addEventListener("click", (e) => {
        e.stopPropagation();
        if (onSelect) onSelect(st);
      });

      markersRef.current.push(marker);
    });
  }, [stations, onSelect]);

  // Resize por sidebar
  useEffect(() => {
    if (!map.current) return;
    const timeout = setTimeout(() => map.current?.resize(), 300);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  // Resize ventana
  useEffect(() => {
    const handleResize = () => map.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}