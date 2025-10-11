import {
  Home,
  Map,
  BarChart3,
  FileText,
  Bell,
  User,
  LifeBuoy,
  Cloud,
} from "lucide-react";

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  onChangePage: (title: string) => void;
  isCollapsed: boolean;
  onClearSelected?: () => void; // 🔹 limpia la estación seleccionada
  user?: {
    name: string;
    email: string;
  };
}

export default function Sidebar({
  onChangePage,
  isCollapsed,
  onClearSelected,
  user = { name: "José Velarde", email: "jose@natek.pe" },
}: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("Home");

  const menuItems = [
    { title: "Home", icon: <Home size={22} />, path: "/", badge: 0 },
    { title: "Estaciones", icon: <Map size={22} />, path: "/stations", badge: 3 },
    { title: "Predicciones", icon: <BarChart3 size={22} />, path: "/predictions", badge: 0 },
    { title: "Reportes", icon: <FileText size={22} />, path: "/reports", badge: 1 },
    { title: "Alertas", icon: <Bell size={22} />, path: "/alerts", badge: 5 },
  ];

  const extraItems = [
    { title: "Usuario", icon: <User size={20} />, path: "/user" },
    { title: "Soporte", icon: <LifeBuoy size={20} />, path: "/support" },
    { title: "API", icon: <Cloud size={20} />, path: "/api" },
  ];

  useEffect(() => {
    const current =
      menuItems.find((item) => item.path === location.pathname) ||
      extraItems.find((item) => item.path === location.pathname);
    if (current) setActive(current.title);
  }, [location.pathname]);

  const handleClick = (item: { title: string; path: string }) => {
    setActive(item.title);
    onChangePage(item.title);
    navigate(item.path);
    if (item.title === "Estaciones") onClearSelected?.();
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-[68px]" : "w-64"
      } p-3 h-[calc(100vh-4rem)] mt-11 fixed left-0 top-0
        flex flex-col justify-between overflow-y-auto overflow-x-hidden
        transition-all duration-200 ease-in-out`}
    >
      {/* Contenedor principal */}
      <div className="flex flex-col justify-between flex-1">
        {/* Bloque principal */}
        <nav className="flex flex-col gap-2 mt-2">
          {menuItems.map((item) => {
            const isActive = active === item.title;
            return (
              <button
                key={item.title}
                onClick={() => handleClick(item)}
                className={`flex items-center ${
                  isCollapsed ? "justify-between" : "justify-between"
                } px-3 py-2 rounded-md transition text-gray-700 dark:text-gray-200 group
                ${
                  isActive
                    ? "bg-blue-500 text-white dark:bg-blue-900/30 dark:text-blue-300"
                    : "hover:bg-blue-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive
                        ? "text-white dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  )}
                </div>

                {item.badge > 0 && (
                  <span
                    className={`text-xs font-semibold rounded-full ${
                      isCollapsed ? "w-2 h-2" : "px-2 py-0.5"
                    } ${
                      isActive ? "bg-white text-blue-600" : "bg-blue-500 text-white"
                    }`}
                  >
                    {!isCollapsed && item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bloque extra */}
        <nav className="flex flex-col gap-2 mt-6 border-t border-gray-300 pt-4 pb-4">
          {extraItems.map((item) => {
            const isActive = active === item.title;
            return (
              <button
                key={item.title}
                onClick={() => handleClick(item)}
                className={`flex items-center ${
                  isCollapsed ? "justify-between" : "justify-between"
                } px-3 py-2 rounded-md transition text-gray-700 dark:text-gray-200 group
                ${
                  isActive
                    ? "bg-blue-500 text-white dark:bg-blue-900/30 dark:text-blue-300"
                    : "hover:bg-blue-100 dark:hover:bg-gray-800"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`${
                      isActive
                        ? "text-white dark:text-blue-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {item.icon}
                  </span>
                  {!isCollapsed && (
                    <span className="text-sm font-medium truncate">
                      {item.title}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bloque inferior con usuario */}
      <div
        className={`pl-1 border-t border-gray-300 pt-4 flex  items-center gap-3 transition-all min-w-0 ${
          isCollapsed ? "justify-between" : "justify-start"
        }`}
      >
        <div className="flex items-center justify-center w-9 h-9 bg-blue-200 rounded-full flex-shrink-0">
          <User size={20} className="text-blue-700" />
        </div>
        {!isCollapsed && (
          <div className="flex flex-col text-sm min-w-0">
            <span className="font-semibold text-gray-800 truncate">
              {user.name}
            </span>
            <span className="text-gray-500 text-xs truncate">{user.email}</span>
          </div>
        )}
      </div>
    </aside>
  );
}