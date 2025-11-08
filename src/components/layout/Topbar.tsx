// src/components/Topbar.tsx
import { Menu, Search, LogOut, LogIn } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import { useState, useRef, useEffect } from "react";

interface TopbarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  pageTitle: string;
  selectedStationName?: string | undefined; // 👈 se recibe desde MainLayout
}

export default function Topbar({
  toggleSidebar,
  pageTitle,
  selectedStationName,
}: TopbarProps) {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();

  // 🔹 Cierra el menú si haces clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 🔹 Construir breadcrumb dinámico
  const breadcrumb = ["Dashboard"];
  if (pageTitle) breadcrumb.push(pageTitle);
  if (pageTitle === "Estaciones") {
    if (selectedStationName) {
      breadcrumb.push(selectedStationName);
    } else if (id) {
      breadcrumb.push(`${id}`);
    }
  }

  const handleClick = (index: number) => {
    const label = breadcrumb[index];
    if (label === "Estaciones") {
      navigate("/stations");
    }
  };

  // 🔹 Inicial del usuario
  const userInitial = user?.fullName?.charAt(0)?.toUpperCase() || "?";

  // 🔹 Logout / Login
  const handleAuthAction = () => {
    if (user) {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/stations");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="h-16 w-full flex items-center justify-between px-4 fixed top-0 left-0 z-50">
      {/* Lado izquierdo */}
      <div className="flex items-center gap-8">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-blue-100 transition"
          aria-label="Toggle Sidebar"
        >
          <Menu size={20} />
        </button>

        <div
          onClick={() => navigate("/")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Natek Logo"
            className="h-6 w-auto"
          />
        </div>

        {/* Breadcrumb */}
        <div className="flex items-center gap-1 font-medium truncate">
          {breadcrumb.map((item, idx) => {
            const isLast = idx === breadcrumb.length - 1;
            const isDashboard = item === "Dashboard";
            return (
              <span key={idx} className="flex items-center gap-1 truncate">
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
      <div className="flex items-center gap-4 relative" ref={menuRef}>
        <div className="relative hidden md:block w-80 bg-gray-100 rounded-md">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Buscar estación o ubicación..."
            className="pl-10 pr-3 py-2 w-full border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
          />
        </div>

        <button
          onClick={() => setMenuOpen((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-blue-200 flex items-center justify-center font-semibold text-blue-800 focus:outline-none"
        >
          {userInitial}
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-12 bg-white border rounded-lg shadow-lg py-2 w-44 z-50">
            <div className="px-4 py-2 text-sm text-gray-600 border-b">
              {user?.fullName || "Invitado"}
            </div>
            <button
              onClick={handleAuthAction}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {user ? (
                <>
                  <LogOut size={16} /> Cerrar sesión
                </>
              ) : (
                <>
                  <LogIn size={16} /> Iniciar sesión
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}