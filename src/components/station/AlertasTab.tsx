import { AlertTriangle, CheckCircle, Info } from "lucide-react";

interface Alert {
  id: string;
  type: "alta" | "media" | "baja";
  title: string;
  description: string;
  date: string;
}

const alerts: Alert[] = [
  {
    id: "1",
    type: "alta",
    title: "Desborde en el canal principal",
    description: "El nivel de agua ha superado el umbral crítico de 1.2 m.",
    date: "2025-10-10 14:35",
  },
  {
    id: "2",
    type: "media",
    title: "Incremento sostenido del caudal",
    description: "Se ha detectado un incremento del 15% en las últimas 6 horas.",
    date: "2025-10-10 08:20",
  },
  {
    id: "3",
    type: "baja",
    title: "Sensor de temperatura sin datos",
    description: "No se han recibido datos en las últimas 12 horas.",
    date: "2025-10-09 22:10",
  },
];

export default function AlertsTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Resumen */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Resumen de Alertas</h2>
        <p className="text-sm text-gray-500">
          Total de alertas activas: {alerts.length}
        </p>
      </div>

      {/* Lista de alertas */}
      {alerts.map((alert) => {
        const color =
          alert.type === "alta"
            ? "bg-red-50 border-red-400 text-red-700"
            : alert.type === "media"
            ? "bg-yellow-50 border-yellow-400 text-yellow-700"
            : "bg-blue-50 border-blue-400 text-blue-700";

        const Icon =
          alert.type === "alta"
            ? AlertTriangle
            : alert.type === "media"
            ? Info
            : CheckCircle;

        return (
          <div
            key={alert.id}
            className={`flex items-start gap-3 p-4 rounded-lg border ${color}`}
          >
            <Icon size={22} className="mt-0.5 shrink-0" />
            <div className="flex flex-col">
              <h3 className="font-semibold text-sm">{alert.title}</h3>
              <p className="text-sm">{alert.description}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.date}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}