import { useState } from "react";
import ResumenTab from "./station/ResumenTab";
import AnalisisTab from "./station/AnalisisTab";
import AlertasTab from "./station/AlertasTab";
import ReportesTab from "./station/ReportesTab";
import SatelliteTab from "./station/SatelliteTab";
import VideosTab from "./station/VideosTab";

const tabs = [
  { id: "resumen", label: "Resumen" },
  { id: "analisis", label: "Análisis" },
  { id: "alertas", label: "Alertas" },
  { id: "reportes", label: "Reportes" },
  {/*{ id: "satellite", label: "Datos Satelitales" },
  { id: "videos", label: "Videos" },*/}
];

export default function StationTabs() {
  const [activeTab, setActiveTab] = useState("resumen");

  return (
    <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
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
        {/*{activeTab === "satellite" && <SatelliteTab />}
        {activeTab === "videos" && <VideosTab />}*/}
      </div>
    </div>
  );
}