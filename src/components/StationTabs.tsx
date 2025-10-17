import { useState } from "react";
import type { Station } from "../types";
import ResumenTab from "./station/ResumenTab";
import AnalisisTab from "./station/AnalisisTab";
import AlertasTab from "./station/AlertasTab";
import ReportesTab from "./station/ReportesTab";
// import SatelliteTab from "./station/SatelliteTab";
// import VideosTab from "./station/VideosTab";

interface StationTabsProps {
  station: Station;
}

interface Tab {
  id: string;
  label: string;
}

const tabs: Tab[] = [
  { id: "resumen", label: "Resumen" },
  { id: "analisis", label: "Análisis" },
  { id: "alertas", label: "Alertas" },
  { id: "reportes", label: "Reportes" },
  // { id: "satellite", label: "Datos Satelitales" },
  // { id: "videos", label: "Videos" },
];

export default function StationTabs({ station }: StationTabsProps) {
  const [activeTab, setActiveTab] = useState<string>("resumen");

  return (
    <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
      {/* Header con nombre de la estación */}
      <div className="px-6 py-3 border-b bg-white">
        <h3 className="text-lg font-semibold text-gray-800">{station?.name}</h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-white sticky top-0 z-10 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {activeTab === "resumen" && <ResumenTab />}
        {activeTab === "analisis" && <AnalisisTab />}
        {activeTab === "alertas" && <AlertasTab />}
        {activeTab === "reportes" && <ReportesTab />}
        {/*{activeTab === "satellite" && <SatelliteTab station={station} />}
        {activeTab === "videos" && <VideosTab station={station} />}*/}
      </div>
    </div>
  );
}