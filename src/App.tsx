import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import RightSidebar from "./components/RightSidebar"; // ← este es el panel con IA y más herramientas
import Topbar from "./components/Topbar";
import StationsPage from "./pages/StationsPage";
import StationTabs from "./components/StationTabs";
import Predicciones from "./pages/Predictions";
import Reportes from "./pages/Reports";
import Alertas from "./pages/Alerts";
import Home from "./pages/Home";
import type { Station } from "./types";
import { stations } from "./data/stations";

export default function App() {
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState("Home");

  const navigate = useNavigate();
  const location = useLocation();

  // Limpia la estación seleccionada al volver a /stations
  useEffect(() => {
    if (location.pathname === "/stations") {
      setSelectedStation(null);
    }
  }, [location]);

  return (
    <div className="bg-gray-100 h-screen flex flex-col transition-colors pb-4">
      {/* 🔹 Topbar */}
      <Topbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        pageTitle={pageTitle}
        selectedStationName={selectedStation?.name || ""}
      />

      {/* 🔹 Contenedor principal */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Sidebar izquierdo */}
        <Sidebar
          isCollapsed={!isSidebarOpen}
          onChangePage={(title) => {
            setPageTitle(title);
            switch (title) {
              case "Home":
                navigate("/");
                break;
              case "Estaciones":
                navigate("/stations");
                break;
              case "Predicciones":
                navigate("/predictions");
                break;
              case "Reportes":
                navigate("/reports");
                break;
              case "Alertas":
                navigate("/alerts");
                break;
            }
          }}
        />

        {/* 🔹 Contenedor central (main + panel derecho) */}
        <div className="flex flex-1 overflow-hidden transition-all duration-300 h-full">
          {/* Main */}
          <main
            className={`flex-1 overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? "ml-64" : "ml-[68px]"
            }`}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/stations"
                element={
                  <StationsPage
                    stations={stations}
                    onSelect={(station) => {
                      setSelectedStation(station);
                      navigate(`/stations/${station.id}`);
                    }}
                  />
                }
              />
              <Route
                path="/stations/:id"
                element={<StationTabs station={selectedStation ?? stations[0]} />}
              />
              <Route path="/predictions" element={<Predicciones />} />
              <Route path="/reports" element={<Reportes />} />
              <Route path="/alerts" element={<Alertas />} />
            </Routes>
          </main>

          {/* 🔹 Sidebar derecho (IA + más herramientas) */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}