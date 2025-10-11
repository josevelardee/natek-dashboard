import { MapPin, AlertTriangle, Thermometer, Droplets, Video } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";

interface Variable {
  name: string;
  value: number;
  previousValue?: number;
  unit: string;
}

interface StationData {
  name: string;
  river: string;
  basin: string;
  id: string;
  location: { lat: number; lon: number; altitude?: number };
  owner: string;
  type: string;
  meteorological: Variable[];
  hydrological: Variable[];
  alerts: { id: number; message: string; date: string; severity: "low" | "medium" | "high" }[];
  lastVideoUrl?: string;
  lastUpdateMeteorological?: string;
  lastUpdateHydrological?: string;
}

const mockStation: StationData = {
  name: "Estación Carhuamayoc - 01",
  river: "Río Carhuamayoc",
  basin: "Cuenca Santa Eulalia",
  id: "ST-001",
  location: { lat: -11.742, lon: -76.512, altitude: 3950 },
  owner: "Natek",
  type: "Hidrológica + Meteorológica",
  meteorological: [
    { name: "Temperatura", value: 14.2, previousValue: 13.8, unit: "°C" },
    { name: "Humedad", value: 78, previousValue: 75, unit: "%" },
    { name: "Velocidad del viento", value: 5.3, previousValue: 5.0, unit: "m/s" },
  ],
  hydrological: [
    { name: "Nivel de agua", value: 0.84, previousValue: 0.80, unit: "m" },
    { name: "Caudal", value: 3.6, previousValue: 3.2, unit: "m³/s" },
    { name: "Velocidad", value: 1.2, previousValue: 1.1, unit: "m/s" },
  ],
  alerts: [
    { id: 1, message: "Aumento inusual del caudal", date: "2025-10-08", severity: "high" },
    { id: 2, message: "Nivel de agua cercano al umbral", date: "2025-10-05", severity: "medium" },
  ],
  lastVideoUrl: "/video.mp4",
  lastUpdateMeteorological: "2025-10-10T14:32:00",
  lastUpdateHydrological: "2025-10-10T14:35:00",
};

export default function ResumenTab() {
  const mapContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [mockStation.location.lon, mockStation.location.lat],
      zoom: 8,
    });

    new maplibregl.Marker({ color: "#2563eb" })
      .setLngLat([mockStation.location.lon, mockStation.location.lat])
      .addTo(map);

    return () => map.remove();
  }, []);

  const severityColor = {
    low: "text-yellow-500",
    medium: "text-orange-500",
    high: "text-red-600",
  };

  const variableIcon = (name: string) => {
    if (name.toLowerCase().includes("nivel") || name.toLowerCase().includes("caudal"))
      return <Droplets size={18} className="text-blue-600" />;
    if (name.toLowerCase().includes("temperatura") || name.toLowerCase().includes("viento") || name.toLowerCase().includes("humedad"))
      return <Thermometer size={18} className="text-blue-600" />;
    return <Thermometer size={18} className="text-blue-600" />;
  };

  const renderVariable = (v: Variable) => {
    const change = v.previousValue !== undefined ? ((v.value - v.previousValue) / v.previousValue) * 100 : undefined;
    const badgeColor = change !== undefined ? (change >= 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800") : "";
    return (
      <div key={v.name} className="flex justify-between items-center">
        <span className="flex items-center gap-2 text-gray-700">
          {variableIcon(v.name)} {v.name}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-blue-700 font-semibold">
            {v.value} <span className="text-gray-500 text-sm">{v.unit}</span>
          </span>
          {change !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>
              {change.toFixed(1)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (

  <div className="container mx-auto" style={{ containerType: "inline-size" }}>
  <div className="grid grid-cols-1 gap-6 [@container(min-width:600px)]:grid-cols-2 [@container(min-width:900px)]:grid-cols-3">
    
    {/* Info general */}
    <Card className="bg-white flex flex-col h-80">
      <CardHeader className="border-b border-gray-200 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <MapPin size={20} className="text-blue-600" />
          Información de la estación
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 flex-1 overflow-auto space-y-1">
        <p><strong>Nombre:</strong> {mockStation.name}</p>
        <p><strong>Río:</strong> {mockStation.river}</p>
        <p><strong>Cuenca:</strong> {mockStation.basin}</p>
        <p><strong>ID:</strong> {mockStation.id}</p>
        <p><strong>Owner:</strong> {mockStation.owner}</p>
        <p><strong>Tipo:</strong> {mockStation.type}</p>
        <p><strong>Lat/Lon:</strong> {mockStation.location.lat}, {mockStation.location.lon}</p>
        {mockStation.location.altitude && <p><strong>Altitud:</strong> {mockStation.location.altitude} m</p>}
      </CardContent>
    </Card>



        {/* Mapa */}
    <Card className="bg-white flex flex-col h-80 overflow-hidden">
      <CardHeader className="border-b border-gray-200 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <MapPin size={18} className="text-blue-600" />
          Ubicación de la estación
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <div ref={mapContainer} className="w-full h-full" />
      </CardContent>
    </Card>

    {/* Último video */}
    <Card className="bg-white flex flex-col h-80">
      <CardHeader className="border-b border-gray-200 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <Video size={18} className="text-blue-600" />
          Último video registrado
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 overflow-hidden rounded-b-xl">
        {mockStation.lastVideoUrl ? (
          <video src={mockStation.lastVideoUrl} controls className="w-full h-full object-cover" />
        ) : (
          <p className="text-sm text-gray-500 p-4">No hay videos disponibles.</p>
        )}
      </CardContent>
    </Card>



{/* Valores Meteorológicos */}
      <Card className="bg-white flex flex-col h-80">
        <CardHeader className="border-b border-gray-200 pb-3 flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Thermometer size={20} className="text-blue-600" />
            Valores Meteorológicos
          </CardTitle>
          <span className="text-gray-500 text-sm">
            {mockStation.lastUpdateMeteorological ? new Date(mockStation.lastUpdateMeteorological).toLocaleString() : "Sin registro"}
          </span>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto grid grid-cols-1 gap-3">
          {mockStation.meteorological.map(renderVariable)}
        </CardContent>
      </Card>

      {/* Valores Hidrológicos */}
      <Card className="bg-white flex flex-col h-80">
        <CardHeader className="border-b border-gray-200 pb-3 flex justify-between items-center">
          <CardTitle className="flex items-center gap-2 text-gray-700">
            <Droplets size={20} className="text-blue-600" />
            Valores Hidrológicos
          </CardTitle>
          <span className="text-gray-500 text-sm">
            {mockStation.lastUpdateHydrological ? new Date(mockStation.lastUpdateHydrological).toLocaleString() : "Sin registro"}
          </span>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto grid grid-cols-1 gap-3">
          {mockStation.hydrological.map(renderVariable)}
        </CardContent>
      </Card>

    {/* Alertas */}
    <Card className="bg-white flex flex-col h-80">
      <CardHeader className="border-b border-gray-200 pb-3">
        <CardTitle className="flex items-center gap-2 text-gray-700">
          <AlertTriangle size={18} className="text-blue-600" />
          Resumen de alertas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        {mockStation.alerts.length > 0 ? (
          <ul className="text-sm">
            {mockStation.alerts.map((a) => (
              <li key={a.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                <span className={`flex items-center gap-2 ${severityColor[a.severity]}`}>
                  <AlertTriangle size={16} />
                  {a.message}
                </span>
                <span className="text-gray-500 text-xs">{a.date}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No hay alertas recientes.</p>
        )}
      </CardContent>
    </Card>
  </div>
</div>

  );
}