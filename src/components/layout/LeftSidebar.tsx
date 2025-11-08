import { Home, Map, BarChart3, FileText, Bell, User, LifeBuoy, Cloud } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
  onChangePage: (title: string) => void;
  isCollapsed: boolean;
  onClearSelected?: () => void;
  user?: { name: string; email: string } | null;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
  disabled?: boolean;
}

// 🔹 Botón genérico del sidebar
const SidebarButton = ({
  item,
  isActive,
  isCollapsed,
  onClick,
  disabled,
  highlight,
  fullWidth,
  userLogged,
}: {
  item: MenuItem;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
  fullWidth?: boolean;
  userLogged: boolean;
}) => {
  const baseTextColor = userLogged ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-400";

  const containerClasses = `flex items-center px-3 py-2 rounded-md transition font-medium gap-3 ${
    fullWidth ? "w-full justify-start" : "justify-between"
  } ${
    highlight
      ? "bg-blue-500 text-white hover:bg-blue-700"
      : disabled
      ? "text-gray-400 hover:bg-none cursor-not-allowed"
      : isActive
      ? "bg-blue-500 text-white dark:bg-blue-900/30 dark:text-blue-300"
      : `hover:bg-blue-100 dark:hover:bg-gray-800 ${baseTextColor}`
  }`;

  const iconClasses = highlight
    ? "text-white"
    : disabled
    ? "text-gray-400"
    : isActive
    ? "text-white dark:text-blue-400"
    : baseTextColor;

  return (
    <button
      key={item.title}
      onClick={onClick}
      disabled={disabled}
      title={isCollapsed ? item.title : undefined}
      className={containerClasses}
    >
      <div className="flex items-center gap-3">
        <span className={iconClasses}>{item.icon}</span>
        {!isCollapsed && <span className={`text-sm font-medium truncate`}>{item.title}</span>}
      </div>

      {!isCollapsed && item.badge && !disabled && (
        <span
          className={`text-xs font-semibold rounded-full ${
            isCollapsed ? "w-2 h-2" : "px-2 py-0.5"
          } ${isActive ? "bg-white text-blue-600" : "bg-blue-500 text-white"}`}
        >
          {!isCollapsed && item.badge}
        </span>
      )}
    </button>
  );
};

export default function Sidebar({ onChangePage, isCollapsed, onClearSelected, user = null }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState("Home");

  // 🔹 Si no hay usuario, todos los items estarán deshabilitados excepto “Estaciones”
  const isLogged = !!user;

  const menuItems: MenuItem[] = useMemo(
    () => [
      { title: "Home", icon: <Home size={22} />, path: "/", disabled: !isLogged },
      { title: "Estaciones", icon: <Map size={22} />, path: "/stations", disabled: false },
      { title: "Predicciones", icon: <BarChart3 size={22} />, path: "/predictions", disabled: true },
      { title: "Reportes", icon: <FileText size={22} />, path: "/reports", disabled: true },
      { title: "Alertas", icon: <Bell size={22} />, path: "/alerts", disabled: true},
    ],
    [isLogged]
  );

  const extraItems: MenuItem[] = useMemo(
    () => [
      { title: "Usuario", icon: <User size={20} />, path: "/user", disabled: true },
      { title: "Soporte", icon: <LifeBuoy size={20} />, path: "/support", disabled: true },
      { title: "API", icon: <Cloud size={20} />, path: "/api", disabled: true },
    ],
    [isLogged]
  );

  const loginItem: MenuItem = { title: "Login / Registro", icon: <User size={20} />, path: "/login" };

  useEffect(() => {
  const current = [...menuItems, ...extraItems, loginItem].find((item) =>
    item.path === "/"
      ? location.pathname === "/"
      : location.pathname === item.path || location.pathname.startsWith(item.path + "/")
  );

  if (current) setActive(current.title);
}, [location.pathname, menuItems, extraItems]);

  const handleClick = (item: MenuItem) => {
    if (item.disabled) return;
    setActive(item.title);
    onChangePage(item.title);
    navigate(item.path);
    if (item.title === "Estaciones") onClearSelected?.();
  };

  return (
    <aside
      className={`${
        isCollapsed ? "w-[68px]" : "w-64"
      } p-3 h-[calc(100vh-4rem)] mt-11 fixed left-0 top-0 flex flex-col justify-between overflow-y-auto overflow-x-hidden transition-all duration-200 ease-in-out`}
    >
      <div className="flex flex-col justify-between flex-1">
        {/* Menú principal */}
        <nav className="flex flex-col gap-2 mt-2">
          {menuItems.map((item) => (
            <SidebarButton
              key={item.title}
              item={item}
              isActive={active === item.title}
              isCollapsed={isCollapsed}
              onClick={() => handleClick(item)}
              userLogged={isLogged}
              disabled={item.disabled}
            />
          ))}
        </nav>

        {/* Menú secundario */}
        <nav className="flex flex-col gap-2 mt-6 border-t border-gray-300 pt-4 pb-4">
          {extraItems.map((item) => (
            <SidebarButton
              key={item.title}
              item={item}
              isActive={active === item.title}
              isCollapsed={isCollapsed}
              onClick={() => handleClick(item)}
              userLogged={isLogged}
              disabled={item.disabled}
            />
          ))}
        </nav>
      </div>

      {/* 🔹 Botón Login / Registro solo si NO hay usuario */}
      {!isLogged && (
        <div className="mt-4">
          <SidebarButton
            item={loginItem}
            isActive={active === loginItem.title}
            isCollapsed={isCollapsed}
            onClick={() => handleClick(loginItem)}
            highlight
            fullWidth
            userLogged={false}
          />
        </div>
      )}

      {/* 🔹 Bloque inferior con datos del usuario */}
      {isLogged && (
        <div
          className={`pl-1 border-t border-gray-300 pt-4 flex items-center gap-3 transition-all min-w-0 ${
            isCollapsed ? "justify-between" : "justify-start"
          }`}
        >
          <div className="flex items-center justify-center w-9 h-9 bg-blue-200 rounded-full flex-shrink-0">
            <User size={20} className="text-blue-700" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col text-sm min-w-0 leading-tight">
              <span className="font-semibold text-gray-900 text-[0.95rem] truncate">{user.name}</span>
              <span className="text-gray-500 text-xs truncate mt-0.5">{user.email}</span>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}