import { useState, useMemo, useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import Topbar from "./Topbar";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";
import { useUser } from "../../context/UserContext";

export default function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  // 🔹 Determine page title based on path
  const pageTitle = useMemo(() => {
    if (location.pathname.startsWith("/stations")) return "Estaciones";
    if (location.pathname.startsWith("/predictions")) return "Predicciones";
    if (location.pathname.startsWith("/reports")) return "Reportes";
    if (location.pathname.startsWith("/alerts")) return "Alertas";
    return "Home";
  }, [location.pathname]);

  // 🔹 Default redirection if there is no user
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
      {/* 🔹 Top bar */}
      <Topbar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        pageTitle={pageTitle}
      />

      {/* 🔹 Main Container */}
      <div className="flex flex-1 pt-16 overflow-hidden">
        {/* Left Sidebar */}
        <LeftSidebar
          isCollapsed={!isSidebarOpen}
          onChangePage={() => {}}
          user={user ? { name: user.fullName, email: user.email } : null}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden transition-all duration-300 h-full">
          <main
            className={`flex-1 overflow-hidden transition-all duration-300 ${
              isSidebarOpen ? "ml-64" : "ml-[68px]"
            }`}
          >
            <Outlet />
          </main>

          {/* Right Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}