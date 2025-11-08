import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { MapPin, Info, Activity } from "lucide-react";
import type { Station } from "@/types";
import axios from "axios";

type Props = {
  station: Station;
};

type HistoryItem = {
  valor: number | null | string;
  fechaHora: string;
};

type VariableData = {
  variable: string;
  last: number | null;
  lastFecha: string | null;
  history: HistoryItem[];
};

export default function ResumenTab({ station }: Props) {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const [variablesData, setVariablesData] = useState<VariableData[]>([]);
  const [loading, setLoading] = useState(true);
  // 🗓️ Rango de fechas: hoy y 30 días atrás
  const endDate = new Date().toISOString().split("T")[0];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  // 🗺️ Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    if (!mapRef.current) {
      mapRef.current = new maplibregl.Map({
        container: mapContainer.current,
        style: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
        center: [station.lon, station.lat],
        zoom: 10,
      });

      new maplibregl.Marker({ color: "#2563eb" })
        .setLngLat([station.lon, station.lat])
        .setPopup(new maplibregl.Popup().setText(station.name))
        .addTo(mapRef.current);
    } else {
      mapRef.current.setCenter([station.lon, station.lat]);
    }
    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
   
  }, [station]);
  

  // 📊 Cargar datos de la estación
  useEffect(() => {
    const fetchVariablesData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/stations/${station.id}/history?limit=100&start=${startDate}&end=${endDate}`);
        const data = res.data?.data || [];

        // Agrupar por variable
        const grouped: Record<string, HistoryItem[]> = {};
        data.forEach((item: any) => {
          for (const key in item.data) {
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push({
              valor: item.data[key],
              fechaHora: item.timestamp,
            });
          }
        });

        const variablesArr: VariableData[] = Object.entries(grouped).map(([variable, history]) => {
          const lastItem = history[history.length - 1];
          const lastValue = lastItem ? (Number(lastItem.valor) || 0) : null;
          return {
            variable,
            last: lastValue,
            lastFecha: lastItem?.fechaHora ?? null,
            history: history.map(h => ({
              valor: h.valor !== null ? Number(h.valor) : null,
              fechaHora: h.fechaHora,
            })),
          };
        });

        console.log(variablesArr)

        setVariablesData(variablesArr);
      } catch (error) {
        console.error("Error cargando datos de la estación:", error);
        setVariablesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVariablesData();
  }, [station.id]);

  // Última fecha de actualización
  const lastDataDate =
    variablesData.length > 0 ? variablesData[0].lastFecha : null;

  // Colores de badges
  const badgeColors: Record<string, string> = {
    Nivel: "bg-blue-200 text-blue-800",
    Caudal: "bg-teal-200 text-teal-800",
    Precipitacion: "bg-purple-200 text-purple-800",
    Temperatura: "bg-orange-200 text-orange-800",
    default: "bg-gray-200 text-gray-800",
  };
  const getBadgeColor = (name: string) => {
    for (const key of Object.keys(badgeColors)) {
      if (name.includes(key)) return badgeColors[key];
    }
    return badgeColors.default;
  };

  return (
    <div className="overflow-y-auto h-full bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 📋 Información básica */}
        <section className="bg-white shadow rounded-xl">
          <div className="flex items-center gap-2 p-3 border-b">
            <Info className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">
              Información de la estación
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto py-4 px-6 text-sm text-gray-700">
            {[
              { label: "Nombre", value: station.name },
              { label: "Tipo", value: station.type },
              { label: "Propietario", value: station.owner },
              { label: "Lat, Lon", value: `${station.lat.toFixed(4)}, ${station.lon.toFixed(4)}` },
            ].map((prop) => (
              <div
                key={prop.label}
                className="flex justify-between items-center py-2 border-b border-gray-200"
              >
                <span className="font-medium text-gray-600">{prop.label}</span>
                <span>{prop.value ?? "-"}</span>
              </div>
            ))}
          </div>
        </section>

        {/* 🗺️ Mapa */}
        <section className="bg-white shadow rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 p-3 border-b">
            <MapPin className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-800">Ubicación</h2>
          </div>
          <div ref={mapContainer} className="h-64 w-full" />
        </section>

        {/* 📊 Últimos valores */}
        <section className="bg-white shadow rounded-xl lg:col-span-2">
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Últimos valores registrados
              </h2>
            </div>
            {loading && <span className="text-gray-500 text-sm">Cargando...</span>}
          </div>
          <div className="p-6">
            {variablesData.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {variablesData.map(({ variable, last, lastFecha, history }) => (
                  <div
                    key={variable}
                    className="bg-gray-50 rounded-lg p-4 border hover:shadow transition"
                  >
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getBadgeColor(variable)}`}>
                      {variable}
                    </span>

                    <p className="text-lg font-semibold text-blue-600 mt-1 mb-1">
                      {last !== null && !isNaN(last) ? last.toFixed(2) : "—"}
                    </p>
                    <p className="text-xs text-gray-400 mb-2">
                      {lastFecha ? new Date(lastFecha).toLocaleString() : "—"}
                    </p>

                    {history.length > 2 && (
                      <ResponsiveContainer width="100%" height={40}>
                        <LineChart data={history.map(h => ({ ...h, valor: Number(h.valor) || 0 }))}>
                          <Line
                            type="monotone"
                            dataKey="valor"
                            stroke="#2563eb"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">
                No hay datos disponibles para esta estación.
              </p>
            )}
          </div>
        </section>
      </div>

      {/* 🕓 Última actualización */}
      <section className="text-xs text-gray-500 text-center mt-6 pb-4">
        Última actualización: {lastDataDate ? new Date(lastDataDate).toLocaleString() : "—"} — Fuente: {station.source === "senamhi" ? "SENAMHI" : "Natek"}
      </section>
    </div>
  );
}