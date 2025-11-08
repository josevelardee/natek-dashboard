import { useState, useMemo, useEffect } from "react";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "./LeftSidebar";
import Topbar from "./Topbar";
import RightSidebar from "./RightSidebar";
import { useUser } from "../../context/UserContext";
import type { Station } from "@/types";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  // 🔹 Estado local para la estación (opcional, en caso de mostrar datos)
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  // 🔹 Determinar título de la página según ruta
  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/stations")) return "Estaciones";
    if (location.pathname.startsWith("/predictions")) return "Predicciones";
    if (location.pathname.startsWith("/reports")) return "Reportes";
    if (location.pathname.startsWith("/alerts")) return "Alertas";
    return "Home";
  }, [location.pathname]);

  // 🔹 Si hay un ID en la URL, configurar estación temporal (placeholder)
  useEffect(() => {
    if (id) {
      const placeholder: Station = {
        id,
        name: `Estación ${id}`,
        lat: 0,
        lon: 0,
        owner: "Desconocido",
        //stationType: "Temporal",
      };
      setSelectedStation(placeholder);
    } else {
      setSelectedStation(null);
    }
  }, [id]);

  // 🔹 Redirección por defecto si no hay usuario
  useEffect(() => {
    if (user === undefined) {
      if (!location.pathname.startsWith("/stations")) {
        navigate("/stations", { replace: true });
      }
    } else if (location.pathname === "/") {
      navigate("/", { replace: true });
    }
  }, [user, location.pathname, navigate]);

  return (
    <div className="bg-gray-100 h-screen flex flex-col transition-colors pb-4">
      {/* 🔹 Barra superior */}
      <Topbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        pageTitle={pageTitle}
      />

      {/* 🔹 Contenedor principal */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar izquierdo */}
        <Sidebar
          isCollapsed={!isSidebarOpen}
          onChangePage={() => {}}
          user={user ? { name: user.fullName, email: user.email } : null}
        />

        {/* Contenido principal */}
        <div className="flex flex-1 overflow-hidden transition-all duration-300 h-full">
          <main
            className={`flex-1 overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? "ml-64" : "ml-[68px]"
            }`}
          >
            {/* El contexto ahora solo pasa setSelectedStation si se necesita localmente */}
            <Outlet context={{ setSelectedStation, selectedStation }} />
          </main>

          {/* Sidebar derecho */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}