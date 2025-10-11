import { FileText, Download, Eye } from "lucide-react";

interface Report {
  id: string;
  title: string;
  date: string;
  type: string;
  status: "completado" | "pendiente";
}

const reports: Report[] = [
  {
    id: "1",
    title: "Reporte mensual de caudal - Setiembre 2025",
    date: "2025-10-01",
    type: "Caudal",
    status: "completado",
  },
  {
    id: "2",
    title: "Evaluación de niveles por estación",
    date: "2025-09-25",
    type: "Nivel de agua",
    status: "completado",
  },
  {
    id: "3",
    title: "Informe de alertas registradas",
    date: "2025-10-10",
    type: "Alertas",
    status: "pendiente",
  },
];

export default function ReportsTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Encabezado */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Reportes Generados</h2>
        <p className="text-sm text-gray-500">
          Accede a los reportes generados automáticamente o descárgalos en formato PDF.
        </p>
      </div>

      {/* Tabla de reportes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Reporte</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <td className="px-4 py-3 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  {report.title}
                </td>
                <td className="px-4 py-3 text-gray-600">{report.type}</td>
                <td className="px-4 py-3 text-gray-600">{report.date}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      report.status === "completado"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {report.status === "completado" ? "Completado" : "Pendiente"}
                  </span>
                </td>
                <td className="px-4 py-3 flex justify-center gap-2">
                  <button className="p-1.5 rounded-md bg-blue-100 hover:bg-blue-200 text-blue-600">
                    <Eye size={16} />
                  </button>
                  <button className="p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}