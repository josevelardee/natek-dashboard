import { useState } from "react";
import { Sparkles, Bell, Settings } from "lucide-react";
import ChatAI from "./ChatAI";

export default function RightSidebar() {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const toggleTool = (tool: string) => {
    setActiveTool((prev) => (prev === tool ? null : tool));
  };

  const closeTool = () => setActiveTool(null);

  const isOpen = Boolean(activeTool);

  return (
    <div className="flex h-full transition-all duration-300">
      {/* 🧠 Panel expandible */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          isOpen ? "w-[400px]" : "w-0"
        } bg-gray-100`}
      >
        {activeTool === "ai" && <ChatAI onClose={closeTool} />}
        {activeTool === "notifications" && (
          <div className="p-4 text-sm text-gray-600">🔔 No hay notificaciones.</div>
        )}
        {activeTool === "settings" && (
          <div className="p-4 text-sm text-gray-600">⚙️ Configuraciones del sistema.</div>
        )}
      </div>

      {/* 🧭 Columna de iconos fijos */}
      <div className="w-[64px] flex flex-col items-center gap-4 py-4">
        <button
          onClick={() => toggleTool("ai")}
          className={`p-2 rounded-lg transition ${
            activeTool === "ai"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Sparkles size={20} />
        </button>

        <button
          onClick={() => toggleTool("notifications")}
          className={`p-2 rounded-lg transition ${
            activeTool === "notifications"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Bell size={20} />
        </button>

        <button
          onClick={() => toggleTool("settings")}
          className={`p-2 rounded-lg transition ${
            activeTool === "settings"
              ? "bg-blue-500 text-white"
              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
          }`}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}