import { useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import type { Station } from "@/types";
import type { FeatureCollection } from "geojson";
import { X, Waves, Droplet, Cloud } from "lucide-react";
import axios from "axios";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface Props {
  station: Station | null;
  cuencasGeoJson?: FeatureCollection;
  onClose: () => void;
}

interface HistoryPoint {
  ts: number;
  value: number | null;
}

export default function StationPreview({ station, cuencasGeoJson, onClose }: Props) {
  const navigate = useNavigate();

  // Estados
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedVar, setSelectedVar] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<HistoryPoint[]>([]);
  const [lastDataDate, setLastDataDate] = useState<string | null>(null);
  const [loadingVars, setLoadingVars] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [errorVars, setErrorVars] = useState<string | null>(null);
  const [errorHistory, setErrorHistory] = useState<string | null>(null);

  // Fechas
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }, []);

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    d.setHours(0, 0, 0, 0);
    return d.toISOString();
  }, []);

  // Función para cargar variables
  const fetchVariables = useCallback(async () => {
    if (!station?.id) return;

    setLoadingVars(true);
    setErrorVars(null);
    try {
      const res = await axios.get(`/api/stations/${station.id}/variables`);
      const vars: string[] = res.data.variables || [];
      setVariables(vars);
      if (vars.length > 0) setSelectedVar(vars[0]);
    } catch (err: any) {
      console.error("Error al cargar variables:", err.message);
      setErrorVars("No se pudieron cargar las variables");
    } finally {
      setLoadingVars(false);
    }
  }, [station?.id]);

  // Función para cargar historial
  const fetchHistory = useCallback(async () => {
    if (!station?.id || !selectedVar) return;

    setLoadingHistory(true);
    setErrorHistory(null);
    try {
      const res = await axios.get(
        `/api/stations/${station.id}/history?key=${selectedVar}&start=${thirtyDaysAgo}&end=${today}&limit=30`
      );

      const formatted: HistoryPoint[] =
        res.data.data?.map((d: any) => ({
          ts: new Date(d.timestamp).getTime(),
          value: typeof d.data[selectedVar] === "number" ? d.data[selectedVar] : null,
        })) || [];

      setHistoryData(formatted);

      // Última fecha
      if (formatted.length > 0) {
        const lastPoint = formatted.reduce((a, b) => (a.ts > b.ts ? a : b));
        setLastDataDate(new Date(lastPoint.ts).toLocaleString());
      } else {
        setLastDataDate(null);
      }
    } catch (err: any) {
      console.error("Error al cargar historial:", err.message);
      setErrorHistory("No se pudieron cargar los datos de la variable");
    } finally {
      setLoadingHistory(false);
    }
  }, [station?.id, selectedVar, today, thirtyDaysAgo]);

  // Efectos
  useEffect(() => {
    fetchVariables();
  }, [fetchVariables]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (!station) return null;

  // Nombre de cuenca
  const cuencaName = useMemo(() => {
    if (!station.basinCode || !cuencasGeoJson) return "No disponible";
    const match = cuencasGeoJson.features.find(
      (f: any) =>
        f.properties &&
        ["CODIGO", "codigo", "COD_CUENCA"].some((key) => f.properties[key] === station.basinCode)
    );
    return match?.properties?.NOMBRE || match?.properties?.nombre || "No disponible";
  }, [station.basinCode, cuencasGeoJson]);

  // Propiedades a mostrar
  const properties = useMemo(
    () => [
      { label: "Estación", value: station.type },
      { label: "Propietario", value: station.owner },
      { label: "Rio", value: station.river },
      { label: "Cuenca", value: cuencaName },
      { label: "Lat, Lon", value: `${station.lat.toFixed(4)}, ${station.lon.toFixed(4)}` },
      { label: "Último dato", value: lastDataDate ?? "No disponible" },
    ],
    [station, cuencaName, lastDataDate]
  );

  // Icono y color según tipo
  const { IconComponent: TypeIcon, color: typeColor } = useMemo(() => {
    switch (station.type) {
      case "Hidrometrica":
        return { IconComponent: Droplet, color: "#2196F3" };
      case "Climatica":
        return { IconComponent: Cloud, color: "#FF9800" };
      case "Natek":
        return { IconComponent: Waves, color: "#0066FF" };
      default:
        return { IconComponent: Waves, color: "#3b82f6" };
    }
  }, [station.type]);

  const badgeColors = useMemo(
    () => [
      "bg-blue-100 text-blue-700",
      "bg-teal-100 text-teal-700",
      "bg-indigo-100 text-indigo-700",
      "bg-green-100 text-green-700",
      "bg-cyan-100 text-cyan-700",
      "bg-violet-100 text-violet-700",
    ],
    []
  );

  return (
    <div className="absolute top-0 right-0 bottom-0 mt-4 mx-4 mb-12 bg-white rounded-lg shadow-lg w-90 flex flex-col z-50">
      {/* Header */}
      <div className="flex justify-between items-center p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <TypeIcon size={20} style={{ color: typeColor }} />
          <h3 className="text-lg font-semibold">{station.name}</h3>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
          <X size={20} />
        </button>
      </div>

      {/* Contenido */}
      <div className="flex-1 overflow-y-auto py-4 px-6 text-sm text-gray-700">
        {properties.map((prop) => (
          <div key={prop.label} className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="font-medium text-gray-600">{prop.label}</span>
            <span>{prop.value ?? "-"}</span>
          </div>
        ))}

        {/* Variables */}
        <div className="mt-4">
          {loadingVars && <p className="text-gray-400 text-sm">Cargando...</p>}
          {errorVars && <p className="text-red-500 text-sm">{errorVars}</p>}
          {!loadingVars && !errorVars && variables.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {variables.map((v, i) => {
                const color = badgeColors[i % badgeColors.length];
                const isActive = v === selectedVar;
                return (
                  <button
                    key={v}
                    onClick={() => setSelectedVar(v)}
                    className={`${color} text-xs font-medium px-3 py-1 rounded-full shadow-sm transition ${
                      isActive ? "ring-2 ring-offset-2 ring-blue-400 scale-105" : ""
                    }`}
                  >
                    {v}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Gráfico */}
        <div className="mt-6 h-56">
          {loadingHistory && <p className="text-gray-400 text-sm">Cargando datos...</p>}
          {errorHistory && <p className="text-red-500 text-sm">{errorHistory}</p>}
          {!loadingHistory && !errorHistory && historyData.length > 0 && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historyData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                  scale="time"
                  tickFormatter={(t) => {
                    const d = new Date(t);
                    return `${d.getDate()}/${d.getMonth() + 1}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(t) => {
                    const d = new Date(t);
                    return d.toLocaleString();
                  }}
                />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={false} connectNulls />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => navigate(`/stations/${station.id}`, { state: { station } })}
          className="w-full py-3 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          Ver estación
        </button>
      </div>
    </div>
  );
}