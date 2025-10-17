import { useEffect, useRef } from "react";
import type { Station } from "../types";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";
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

  /** === Constantes de estilo === */
  const OPACITY = {
    cuencaNormal: 0.1,
    cuencaHover: 0.3,
    cuencaSelected: 0.5,
    rioNormal: 1,
    rioAtenuado: 0.2,
    lagoNormal: 1,
    lagoAtenuado: 0.1,
  };

  /** === Inicializa mapa === */
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current!,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [-76.5, -11.85],
      zoom: 10,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-left");

    /** === Tooltip === */
    tooltipRef.current = Object.assign(document.createElement("div"), {
      style: `
        position: absolute;
        background: white;
        padding: 2px 6px;
        font-size: 12px;
        border-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.2s;
      `,
    } as any);
    mapContainer.current!.appendChild(tooltipRef.current!);

    /** === Carga de capas === */
    map.current.on("load", () => {
      const addGeoLayer = (id: string, data: string, layers: maplibregl.LayerSpecification[]) => {
        map.current!.addSource(id, { type: "geojson", data });
        layers.forEach((layer) => map.current!.addLayer(layer));
      };

      // --- Límites departamentales ---
      addGeoLayer("lim-departamental", `${import.meta.env.BASE_URL}lim-departamental.geojson`, [
        {
          id: "lim-departamental-line",
          type: "line",
          source: "lim-departamental",
          paint: { "line-color": "#a6a6a6", "line-width": 1.2 },
        },
      ]);

      // --- Cuencas ---
      addGeoLayer("cuencas", `${import.meta.env.BASE_URL}cuencas.geojson`, [
        {
          id: "cuencas-fill",
          type: "fill",
          source: "cuencas",
          paint: { "fill-color": "#00b7ff", "fill-opacity": OPACITY.cuencaNormal },
        },
        {
          id: "cuencas-line",
          type: "line",
          source: "cuencas",
          paint: { "line-color": "#00b7ff", "line-width": 1.2 },
        },
      ]);

      // --- Lagos y lagunas ---
      addGeoLayer("lagos-lagunas", `${import.meta.env.BASE_URL}lagos-lagunas.geojson`, [
        {
          id: "lagos-lagunas-fill",
          type: "fill",
          source: "lagos-lagunas",
          paint: { "fill-color": "#0080ff", "fill-opacity": OPACITY.lagoNormal },
        },
        {
          id: "lagos-lagunas-line",
          type: "line",
          source: "lagos-lagunas",
          paint: { "line-color": "#0288D1", "line-width": 1.2, "line-opacity": OPACITY.lagoNormal },
        },
      ]);

      // --- Ríos y quebradas ---
      addGeoLayer("rios-quebradas", `${import.meta.env.BASE_URL}rios-quebradas.geojson`, [
        {
          id: "rios-quebradas-line",
          type: "line",
          source: "rios-quebradas",
          paint: { "line-color": "#0080ff", "line-width": 2.2, "line-opacity": OPACITY.rioNormal },
        },
      ]);

      /** === Interacción === */
      let hoveredCuencaId: string | null = null;
      let selectedCuencaId: string | null = null;

      // --- Tooltip ---
      const showTooltip = (text: string, x: number, y: number) => {
        tooltipRef.current!.innerText = text;
        Object.assign(tooltipRef.current!.style, {
          opacity: "1",
          left: `${x + 10}px`,
          top: `${y + 10}px`,
        });
      };
      const hideTooltip = () => (tooltipRef.current!.style.opacity = "0");

      const addTooltipEvent = (layer: string, prop: string) => {
        map.current!.on("mousemove", layer, (e) => {
          if (!e.features?.length) return;
          const name = e.features[0].properties?.[prop] || "Sin nombre";
          showTooltip(name, e.point.x, e.point.y);
          map.current!.getCanvas().style.cursor = "pointer";
        });
        map.current!.on("mouseleave", layer, () => {
          hideTooltip();
          map.current!.getCanvas().style.cursor = "";
        });
      };

      addTooltipEvent("rios-quebradas-line", "TEXTO_MAP");
      addTooltipEvent("lagos-lagunas-fill", "NOMBRECUER");

      /** === Hover cuencas === */
      map.current!.on("mousemove", "cuencas-fill", (e) => {
        if (!e.features?.length) return;
        const id = e.features[0].properties?.CODIGO;
        if (hoveredCuencaId === id) return;
        hoveredCuencaId = id;

        map.current!.setPaintProperty("cuencas-fill", "fill-opacity", [
          "case",
          ["==", ["get", "CODIGO"], selectedCuencaId],
          OPACITY.cuencaSelected,
          ["==", ["get", "CODIGO"], id],
          OPACITY.cuencaHover,
          OPACITY.cuencaNormal,
        ]);
      });

      map.current!.on("mouseleave", "cuencas-fill", () => {
        hoveredCuencaId = null;
        map.current!.setPaintProperty("cuencas-fill", "fill-opacity", [
          "case",
          ["==", ["get", "CODIGO"], selectedCuencaId],
          OPACITY.cuencaSelected,
          OPACITY.cuencaNormal,
        ]);
      });

      /** === Click cuencas === */
      map.current!.on("click", "cuencas-fill", (e) => {
        if (!e.features?.length) return;
        const feature = e.features[0];
        selectedCuencaId = feature.properties?.CODIGO;

        // Atenuar otras capas según selección
        map.current!.setPaintProperty("rios-quebradas-line", "line-opacity", [
          "case",
          ["==", ["get", "CODIGO_UH"], selectedCuencaId],
          OPACITY.rioNormal,
          OPACITY.rioAtenuado,
        ]);
        map.current!.setPaintProperty("lagos-lagunas-fill", "fill-opacity", [
          "case",
          ["==", ["get", "CODIGOUH"], selectedCuencaId],
          OPACITY.lagoNormal,
          OPACITY.lagoAtenuado,
        ]);
        map.current!.setPaintProperty("lagos-lagunas-line", "line-opacity", [
          "case",
          ["==", ["get", "CODIGOUH"], selectedCuencaId],
          OPACITY.lagoNormal,
          OPACITY.lagoAtenuado,
        ]);

        // Actualiza opacidad cuencas
        map.current!.setPaintProperty("cuencas-fill", "fill-opacity", [
          "case",
          ["==", ["get", "CODIGO"], selectedCuencaId],
          OPACITY.cuencaSelected,
          OPACITY.cuencaNormal,
        ]);

        // Centra en cuenca seleccionada
        const bbox = turf.bbox(feature);
        map.current!.fitBounds(
          [bbox[0], bbox[1], bbox[2], bbox[3]],
          { padding: 50, duration: 1000 }
        );
      });

      /** === Click fuera: limpia selección === */
      map.current!.on("click", (e) => {
        const features = map.current!.queryRenderedFeatures(e.point, { layers: ["cuencas-fill"] });
        if (features.length) return;

        selectedCuencaId = null;
        map.current!.setPaintProperty("rios-quebradas-line", "line-opacity", OPACITY.rioNormal);
        map.current!.setPaintProperty("lagos-lagunas-fill", "fill-opacity", OPACITY.lagoNormal);
        map.current!.setPaintProperty("lagos-lagunas-line", "line-opacity", OPACITY.lagoNormal);
        map.current!.setPaintProperty("cuencas-fill", "fill-opacity", OPACITY.cuencaNormal);
      });
    });
  }, []);

  /** === Marcadores de estaciones === */
  useEffect(() => {
    if (!map.current) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stations.forEach((st) => {
      const el = document.createElement("div");
      el.className = "group relative flex flex-col items-center cursor-pointer";

      const color = st.owner === "Natek" ? "blue" : "gray";
      const pulse = `<div class="absolute w-5 h-5 bg-${color}-400 opacity-40 rounded-full animate-ping"></div>`;
      const pin = `<div class="w-5 h-5 bg-${color}-600 border-2 border-white rounded-full shadow-lg"></div>`;
      const label = `<div class="absolute -top-7 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">${st.name}</div>`;
      el.innerHTML = pulse + pin + label;

      const marker = new maplibregl.Marker({ element: el, anchor: "bottom" })
        .setLngLat([st.lon, st.lat])
        .addTo(map.current!);

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelect?.(st);
      });

      markersRef.current.push(marker);
    });
  }, [stations, onSelect]);

  /** === Ajuste al redimensionar === */
  useEffect(() => {
    if (!map.current) return;
    const timeout = setTimeout(() => map.current?.resize(), 300);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  useEffect(() => {
    const handleResize = () => map.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}