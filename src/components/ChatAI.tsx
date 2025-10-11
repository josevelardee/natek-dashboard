import { useState } from "react";
import { Send, Sparkles, ChevronRight } from "lucide-react";

interface ChatAIProps {
  onClose?: () => void; // permite cerrar el panel
}

export default function ChatAI({ onClose }: ChatAIProps) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ role: string; text: string }[]>([]);

  const handleSend = () => {
    if (!message.trim()) return;
    setChat((c) => [...c, { role: "user", text: message }]);
    setMessage("");

    // Simular respuesta del asistente
    setTimeout(() => {
      setChat((c) => [
        ...c,
        { role: "ai", text: "Esta es una respuesta de NATEK AI 🤖" },
      ]);
    }, 500);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg ml-4 ">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 h-12">
        <div className="flex-1 flex justify-center items-center gap-2">
          <Sparkles className="text-blue-500" size={20} />
          <h2 className="text-sm font-semibold text-gray-800">Natek AI</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-gray-100 text-gray-500"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 flex flex-col bg-gray-50">
        {chat.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-4">
            💬 Pregunta lo que necesites al asistente NATEK AI.
          </p>
        ) : (
          chat.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] text-sm px-3 py-2 rounded-md break-words ${
                  msg.role === "user"
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input */}
      <div className="px-4 pt-3 pb-4 border-t border-gray-200 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu mensaje..."
            className="flex-1 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSend}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Nota */}
        <p className="text-xs text-gray-400 text-center leading-tight">
          NATEK AI puede cometer errores. Verifica la información antes de tomar decisiones.
        </p>
      </div>
    </div>
  );
}