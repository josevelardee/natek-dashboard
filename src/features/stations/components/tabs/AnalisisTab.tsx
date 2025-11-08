import { useState, useEffect, useRef } from "react";
import type { Station } from "@/types";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Brush,
  Legend,
} from "recharts";

interface AnalisisTabProps {
  station: Station | null;
}

interface VariableData {
  timestamp: number; // 🔹 Milisegundos
  [key: string]: number | null;
}

const COLORS = ["#2563eb", "#ef4444", "#f59e0b", "#10b981", "#8b5cf6"];

// 🔹 Helpers de fecha
const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

export default function AnalisisTab({ station }: AnalisisTabProps) {
  const today = endOfDay(new Date());
  const thirtyDaysAgo = startOfDay(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

  // 🔹 Estados
  const [startDate, setStartDate] = useState<Date>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<Date>(today);
  const [variables, setVariables] = useState<string[]>([]);
  const [selectedVars, setSelectedVars] = useState<string[]>([]);
  const [data, setData] = useState<VariableData[]>([]);
  const [loadingVars, setLoadingVars] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initialRangeSet = useRef(false);

  // 🔹 Inicializa rango según datos solo una vez
  useEffect(() => {
    if (!data.length || initialRangeSet.current) return;

    const firstDate = new Date(data[0].timestamp);
    const lastDate = new Date(data[data.length - 1].timestamp);

    setStartDate(firstDate);
    setEndDate(lastDate);
    initialRangeSet.current = true;
  }, [data]);

  // 🔹 Cargar variables de la estación
  useEffect(() => {
    if (!station?.id) return;

    const fetchVariables = async () => {
      try {
        setLoadingVars(true);
        const res = await fetch(`/api/stations/${station.id}/variables`);
        const json = await res.json();
        const vars: string[] = json.variables || [];
        setVariables(vars);
        if (vars.length) setSelectedVars([vars[0]]);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar las variables");
      } finally {
        setLoadingVars(false);
      }
    };

    fetchVariables();
  }, [station?.id]);

  // 🔹 Cargar datos de las variables seleccionadas
  useEffect(() => {
    if (!station?.id || !selectedVars.length || !startDate || !endDate) return;

    const fetchData = async () => {
      try {
        setLoadingData(true);
        const results = await Promise.all(
          selectedVars.map((v) =>
            fetch(
              `/api/stations/${station.id}/history?key=${encodeURIComponent(
                v
              )}&start=${startOfDay(startDate).toISOString()}&end=${endOfDay(endDate).toISOString()}`
            ).then((res) => res.json())
          )
        );

        // 🔹 Merge timestamps y llenar con null
        const merged: Record<string, VariableData> = {};
        const allTimestamps = new Set<number>();
        results.forEach((r) =>
          r.data.forEach((d: any) =>
            allTimestamps.add(new Date(d.timestamp).getTime())
          )
        );

        allTimestamps.forEach((ts) => {
          merged[ts] = { timestamp: ts };
          selectedVars.forEach((v) => (merged[ts][v] = null));
        });

        results.forEach((r, i) => {
          const varName = selectedVars[i];
          r.data.forEach((d: any) => {
            const ts = new Date(d.timestamp).getTime();
            merged[ts][varName] =
              typeof d.data[varName] === "number" ? d.data[varName] : null;
          });
        });

        const finalData = Object.values(merged).sort((a, b) => a.timestamp - b.timestamp);
        setData(finalData);
      } catch (err) {
        console.error(err);
        setError("No se pudieron cargar los datos");
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [station?.id, selectedVars, startDate, endDate]);

  if (!station) return <p>Selecciona una estación</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // 🔹 Función genérica para calendarios
  const renderCalendar = (selectedDate: Date, onSelect: (date: Date) => void) => (
    <Calendar
      mode="single"
      selected={selectedDate}
      defaultMonth={selectedDate}
      onSelect={(date) => date && onSelect(date)}
      locale={es}
      disabled={(date) => date > new Date()}
    />
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de fechas */}
      <div className="flex gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {startDate ? format(startDate, "PPP", { locale: es }) : "Fecha inicio"}
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto">{renderCalendar(startDate, setStartDate)}</PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              {endDate ? format(endDate, "PPP", { locale: es }) : "Fecha fin"}
              <CalendarIcon className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0 w-auto">{renderCalendar(endDate, setEndDate)}</PopoverContent>
        </Popover>
      </div>

      {/* Selector de variables */}
      <div className="flex flex-wrap gap-2">
        {loadingVars ? (
          <p>Cargando variables...</p>
        ) : (
          variables.map((v, i) => (
            <Button
              key={v}
              variant={selectedVars.includes(v) ? "default" : "outline"}
              style={{
                borderColor: COLORS[i % COLORS.length],
                color: COLORS[i % COLORS.length],
              }}
              onClick={() =>
                setSelectedVars((prev) =>
                  prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]
                )
              }
            >
              {v}
            </Button>
          ))
        )}
      </div>

      {/* Gráfico */}
      <div className="bg-white p-4 rounded-lg shadow h-120">
        {loadingData ? (
          <p>Cargando datos...</p>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={["dataMin", "dataMax"]}
                tickFormatter={(ts) => {
                  const d = new Date(ts);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
              />

              {selectedVars.map((v, i) => {
                const yAxisId = i === 0 ? "left" : i === 1 ? "right" : `right${i}`;
                const orientation = i === 0 ? "left" : "right";
                return (
                  <YAxis
                    key={v}
                    yAxisId={yAxisId}
                    orientation={orientation as "left" | "right"}
                    stroke={COLORS[i % COLORS.length]}
                    allowDecimals
                  />
                );
              })}

              <Tooltip labelFormatter={(ts) => new Date(ts).toLocaleString()} />
              <Legend />

              {selectedVars.map((v, i) => {
                const yAxisId = i === 0 ? "left" : i === 1 ? "right" : `right${i}`;
                return (
                  <Line
                    key={v}
                    type="monotone"
                    dataKey={v}
                    stroke={COLORS[i % COLORS.length]}
                    dot={false}
                    yAxisId={yAxisId}
                    isAnimationActive={false}
                    connectNulls
                  />
                );
              })}

              <Brush
                dataKey="timestamp"
                height={40}
                stroke="#8884d8"
                tickFormatter={(ts) => {
                  const d = new Date(ts);
                  return `${d.getDate()}/${d.getMonth() + 1}`;
                }}
                travellerWidth={10}
                fill="#e0e0e0"
                startIndex={0}
                endIndex={data.length - 1}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-gray-500 text-sm italic">No hay datos disponibles</p>
        )}
      </div>
    </div>
  );
}