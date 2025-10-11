import { Menu, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface TopbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  pageTitle: string;
  selectedStationName?: string;
}

export default function Topbar({
  isSidebarOpen,
  toggleSidebar,
  pageTitle,
  selectedStationName,
}: TopbarProps) {
  const navigate = useNavigate();

  // 🔹 Construcción del breadcrumb
  const breadcrumb = ["Dashboard"];
  if (pageTitle) breadcrumb.push(pageTitle);
  if (pageTitle === "Estaciones" && selectedStationName) {
    breadcrumb.push(selectedStationName);
  }

  // 🔹 Navegación por breadcrumb
  const handleClick = (index: number) => {
    const label = breadcrumb[index];
    if (label === "Estaciones") navigate("/stations");
  };

  return (
    <header className="h-16 w-full flex items-center justify-between  px-4 fixed top-0 left-0 z-50">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-8">
        {/* Toggle sidebar */}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-blue-200 transition"
          aria-label="Toggle Sidebar"
        >
          {isSidebarOpen ? <Menu size={20} /> : <Menu size={20} />}
        </button>

        {/* Logo */}
        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src="logo.png" alt="Natek Logo" className="h-6 w-auto" />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 font-medium truncate">
          {breadcrumb.map((item, idx) => {
            const isLast = idx === breadcrumb.length - 1;
            const isDashboard = item === "Dashboard";

            return (
              <span key={idx} className="flex items-center gap-1 truncate">
                {/* Si es Dashboard → solo texto, no botón */}
                {isDashboard ? (
                  <span className="text-gray-400 truncate">{item}</span>
                ) : !isLast ? (
                  <button
                    onClick={() => handleClick(idx)}
                    className="text-gray-400 hover:text-blue-500 truncate"
                  >
                    {item}
                  </button>
                ) : (
                  <span className="text-gray-800 font-bold truncate">{item}</span>
                )}
                {!isLast && <span className="mx-1 text-gray-400">/</span>}
              </span>
            );
          })}
        </div>
      </div>
          
      {/* Lado derecho */}
      <div className="flex items-center gap-4">
        {/* 🔍 Input de búsqueda con icono */}
        <div className="relative hidden md:block w-128 bg-gray-200 rounded-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar estación o ubicación..."
            className="pl-10 pr-3 py-2 w-full border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-semibold text-blue-800">
          JV  
        </div>
      </div>
    </header>
  );
}