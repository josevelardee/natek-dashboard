import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string;

type Station = {
  id: string | number;
  name: string;
  lat: number;
  lon: number;
};

interface MapViewProps {
  stations: Station[];
  onSelect?: (st: Station) => void;
  sidebarOpen?: boolean;
}

export default function MapView({ stations, onSelect, sidebarOpen }: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    if (map.current) return;

    // Inicializa el mapa
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: import.meta.env.VITE_MAPBOX_STYLE as string,
      center: [-74.9, -12.0],
      zoom: 7,
    });

    // 🔹 Agregar marcadores personalizados
    stations.forEach((st) => {
      // Crea el contenedor HTML del marcador
      const markerEl = document.createElement("div");
      markerEl.className =
        "group relative flex flex-col items-center cursor-pointer";

      // Pin circular
      const pin = document.createElement("div");
      pin.className =
        "w-5 h-5 bg-blue-600 border-2 border-white rounded-full shadow-lg group-hover:scale-110 transition-transform duration-200";

      // Efecto de pulso
      const pulse = document.createElement("div");
      pulse.className =
        "absolute w-5 h-5 bg-blue-400 opacity-40 rounded-full animate-ping";

      // Etiqueta (tooltip)
      const label = document.createElement("div");
      label.textContent = st.name;
      label.className =
        "absolute -top-7 bg-white text-gray-800 text-xs font-medium px-2 py-1 rounded-md shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap";

      markerEl.appendChild(pulse);
      markerEl.appendChild(pin);
      markerEl.appendChild(label);

      // Evento click
      markerEl.addEventListener("click", () => onSelect?.(st));

      // Agrega el marcador al mapa
      new mapboxgl.Marker(markerEl).setLngLat([st.lon, st.lat]).addTo(map.current!);
    });
  }, [stations]);

  // 🔹 Redimensiona cuando el sidebar cambia
  useEffect(() => {
    if (!map.current) return;
    const timeout = setTimeout(() => map.current?.resize(), 300);
    return () => clearTimeout(timeout);
  }, [sidebarOpen]);

  // 🔹 Redimensiona al cambiar tamaño de ventana
  useEffect(() => {
    const handleResize = () => map.current?.resize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <div ref={mapContainer} className="w-full h-full" />;
}