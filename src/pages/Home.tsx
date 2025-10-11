"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  MapPin,
  Waves,
  AlertTriangle,
  FileText,
  Map,
  Bell,
  Activity,
  Bot,
} from "lucide-react";
import MapViewML from "@/components/MapViewML";
import type { Station } from "@/types";

// Subcomponente para KPIs
function KpiCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-sm transition">
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-bold text-gray-800">{value}</p>
      </div>
      <div className="p-2 bg-white rounded-full shadow-sm">{icon}</div>
    </div>
  );
}

// Datos de prueba
const mockStations: Station[] = [
  { id: 1, name: "Estación Santa Eulalia", lat: -11.927, lon: -76.639, owner: "Natek" },
  { id: 2, name: "Estación Yuracmayo", lat: -11.845, lon: -76.481, owner: "Natek" },
  { id: 3, name: "Estación Carhuamayoc", lat: -11.812, lon: -76.491, owner: "Natek" },
];

function AlertsListGlobal() {
  return (
    <ul className="space-y-2 text-sm text-gray-700">
      <li className="p-2 bg-red-50 border border-red-100 rounded-lg">🌊 Alerta de crecida en Río Santa</li>
      <li className="p-2 bg-yellow-50 border border-yellow-100 rounded-lg">⚠️ Nivel alto en Estación Carhuamayoc</li>
      <li className="p-2 bg-green-50 border border-green-100 rounded-lg">✅ Condiciones normales en Río Rímac</li>
    </ul>
  );
}

function ReportsListGlobal() {
  return (
    <ul className="divide-y divide-gray-100 text-sm text-gray-700">
      <li className="py-2 flex justify-between">
        <span>📄 Reporte semanal - Cuenca Santa</span> <span className="text-gray-500">10 Oct 2025</span>
      </li>
      <li className="py-2 flex justify-between">
        <span>📄 Informe técnico - Río Rímac</span> <span className="text-gray-500">08 Oct 2025</span>
      </li>
      <li className="py-2 flex justify-between">
        <span>📄 Resumen mensual - Andahuaylas</span> <span className="text-gray-500">02 Oct 2025</span>
      </li>
    </ul>
  );
}

function LastMeasurementsList() {
  return (
    <ul className="space-y-2 text-sm text-gray-700">
      <li className="flex justify-between p-2 bg-gray-50 rounded-lg border">
        <span>Estación Santa Eulalia</span>
        <span className="font-semibold text-blue-600">1.42 m</span>
      </li>
      <li className="flex justify-between p-2 bg-gray-50 rounded-lg border">
        <span>Estación Yuracmayo</span>
        <span className="font-semibold text-blue-600">0.87 m</span>
      </li>
      <li className="flex justify-between p-2 bg-gray-50 rounded-lg border">
        <span>Estación Carhuamayoc</span>
        <span className="font-semibold text-blue-600">1.03 m</span>
      </li>
    </ul>
  );
}

function AiSummaryCard() {
  return (
    <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 border border-gray-200 rounded-xl p-4">
      🤖 <span className="font-semibold">Análisis Inteligente:</span> Durante la última semana se registró un incremento
      sostenido del nivel de agua en la cuenca del Santa (+12%) y una ligera disminución en Yuracmayo (-5%). Se
      recomienda verificar posibles acumulaciones por lluvias recientes.
    </div>
  );
}

export default function Home() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Contenedor scrolleable */}
      <div className="flex-1 overflow-y-auto p-0 pb-20 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* === 1. KPIs generales === */}
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-700">Resumen General</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <KpiCard title="Estaciones" value="42" icon={<MapPin className="text-blue-600" />} />
                <KpiCard title="Cuencas Monitoreadas" value="7" icon={<Waves className="text-teal-600" />} />
                <KpiCard title="Alertas Emitidas" value="5" icon={<AlertTriangle className="text-red-500" />} />
                <KpiCard title="Reportes Generales" value="18" icon={<FileText className="text-gray-600" />} />
              </div>
            </CardContent>
          </Card>

          {/* === 2. Mapa de Estaciones === */}
          <Card className="col-span-3 xl:col-span-2 flex flex-col min-h-[420px]">
            <CardHeader className="flex justify-between items-center border-b">
              <CardTitle className="text-gray-700 font-semibold flex items-center gap-2">
                <Map className="text-blue-600" /> Mapa de Estaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 rounded-t-none overflow-hidden">
              <MapViewML stations={mockStations} onSelect={(st) => setSelectedStation(st)} />
            </CardContent>
          </Card>

          {/* === 3. Alertas Globales === */}
          <Card className="col-span-3 xl:col-span-1 flex flex-col min-h-[420px] overflow-hidden">
            <CardHeader className="flex justify-between items-center border-b">
              <CardTitle className="text-gray-700 font-semibold flex items-center gap-2">
                <Bell className="text-red-500" /> Últimas Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <AlertsListGlobal />
            </CardContent>
          </Card>

          {/* === 4. Últimos Reportes === */}
          <Card className="col-span-3 xl:col-span-1 flex flex-col min-h-[420px] overflow-hidden">
            <CardHeader className="flex justify-between items-center border-b">
              <CardTitle className="text-gray-700 font-semibold flex items-center gap-2">
                <FileText className="text-gray-700" /> Últimos Reportes
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <ReportsListGlobal />
            </CardContent>
          </Card>

          {/* === 5. Últimas Mediciones === */}
          <Card className="col-span-3 xl:col-span-1 flex flex-col min-h-[420px] overflow-hidden">
            <CardHeader className="flex justify-between items-center border-b">
              <CardTitle className="text-gray-700 font-semibold flex items-center gap-2">
                <Activity className="text-green-600" /> Últimas Mediciones
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <LastMeasurementsList />
            </CardContent>
          </Card>

          {/* === 6. Resumen IA === */}
          <Card className="col-span-3 xl:col-span-1 flex flex-col min-h-[420px] overflow-hidden">
            <CardHeader className="flex justify-between items-center border-b">
              <CardTitle className="text-gray-700 font-semibold flex items-center gap-2">
                <Bot className="text-purple-600" /> Resumen Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <AiSummaryCard />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}