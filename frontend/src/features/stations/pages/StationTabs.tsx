import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import ResumenTab from "../components/tabs/ResumenTab";
import AnalisisTab from "../components/tabs/AnalisisTab";
import type { Station } from "@/types";
// import AlertasTab from "./station/AlertasTab";
// import ReportesTab from "./station/ReportesTab";


const tabs = [
  { id: "resumen", label: "Resumen" },
  { id: "analisis", label: "Análisis" },
  { id: "alertas", label: "Alertas", disabled: true },
  { id: "reportes", label: "Reportes", disabled: true },
];

export default function StationTabs() {
  const { id } = useParams<{ id: string }>();
  const [station, setStation] = useState<Station | null>(null);
  const [activeTab, setActiveTab] = useState<string>("resumen");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchStation = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/stations/${id}`);
        if (!res.ok) throw new Error("Estación no encontrada");
        const st = await res.json();
        setStation({
          id: st.id,
          sourceId: st.source_id,
          name: st.name,
          code: st.source_id ?? `st-${st.id}`,
          lat: st.lat,
          lon: st.lon,
          type: st.type ?? "No especificado",
          subtype: st.subtype ?? null,
          owner: st.owner ?? "Desconocido",
          river: st.river ?? null,
          basinCode: st.basin_code ?? null,
          yearStart: st.year_start ?? null,
          yearEnd: st.year_end ?? null,
          status: st.status ?? null,
          license: st.license ?? null,
          dataUrl: st.data_url ?? null,
          accessType: st.access_type ?? "private",
          createdAt: st.created_at,
          purchasable: st.license?.toLowerCase() === "natek", // solo Natek vendibles
          source: st.license?.toLowerCase() || "desconocido",
        });
      } catch (error) {
        console.error("Error fetching station:", error);
        setStation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStation();
  }, [id]);

  if (loading) return <div className="p-6">Cargando información de la estación...</div>;
  if (!station) return <div className="p-6 text-red-500">No se encontró la estación.</div>;

  return (
    <div className="flex flex-col w-full h-full rounded-lg overflow-hidden">
      {/* Encabezado */}
      <div className="px-6 py-3 border-b bg-white">
        <h3 className="text-lg font-semibold text-gray-800">{station.name}</h3>
      </div>

      {/* Tabs */}
      <div className="flex bg-white sticky top-0 z-10 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                : "text-gray-500 hover:bg-gray-100"
            } ${tab.disabled ? "opacity-40 cursor-not-allowed" : ""}`}
            disabled={tab.disabled}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div className="flex-1 bg-gray-50 p-6 overflow-auto">
        {activeTab === "resumen" && <ResumenTab station={station} />}
        {activeTab === "analisis" && <AnalisisTab station={station} />}
        {activeTab === "alertas" && (
          <div className="text-gray-400 italic">Alertas temporalmente bloqueadas.</div>
        )}
        {activeTab === "reportes" && (
          <div className="text-gray-400 italic">Reportes temporalmente bloqueados.</div>
        )}
      </div>
    </div>
  );
}