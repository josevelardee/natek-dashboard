import { X, Waves } from "lucide-react";
import type { Station } from "../types";

type Props = {
  station: Station;
  onClose: () => void;
  onView: () => void;
};

export default function StationPreview({ station, onClose, onView }: Props) {
  // 📆 Calcula el rango de fechas automáticamente
  const rangeStart = station.data?.[0]?.date;
  const rangeEnd = station.data?.[station.data.length - 1]?.date;

  return (
    <div className="absolute top-4 right-4 bottom-4 bg-white rounded-lg w-96 z-50 flex flex-col  overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <div className="flex justify-between items-center px-6 pt-6 pb-3">
          <div className="flex items-center gap-2">
            <Waves className="text-blue-600" size={22} />
            <h3 className="text-lg font-semibold">{station.name}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="border-t border-gray-200" />
      </div>

      {/* Contenido scrollable */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 py-4 text-sm text-gray-700 space-y-4">
        {/* Ubicación */}
        <div>
          <h4 className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">
            Ubicación
          </h4>
          <p>Latitud: {station.lat.toFixed(3)}</p>
          <p>Longitud: {station.lon.toFixed(3)}</p>
        </div>
        <div className="border-t border-gray-200 mx-2" />

        {/* Cuerpo de agua */}
        <div>
          <h4 className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">
            Cuerpo de agua que mide
          </h4>
          <p>{station.river || "No especificado"}</p>
        </div>
        <div className="border-t border-gray-200 mx-2" />

        {/* Rango de datos */}
        <div>
          <h4 className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">
            Rango de datos
          </h4>
          <p>
            {rangeStart && rangeEnd
              ? `${rangeStart} — ${rangeEnd}`
              : "Sin registros disponibles"}
          </p>
        </div>
        <div className="border-t border-gray-200 mx-2" />

        {/* Variables medidas */}
        <div>
          <h4 className="text-gray-500 font-semibold uppercase tracking-wide text-xs mb-1">
            Variables medidas
          </h4>
          <ul className="list-disc ml-5">
            {station.variables?.length ? (
              station.variables.map((v) => <li key={v}>{v}</li>)
            ) : (
              <li>No registradas</li>
            )}
          </ul>
        </div>
      </div>

      {/* Footer fijo */}
      <div className="flex-shrink-0 border-t border-gray-200 p-4 bg-white">
        <button
          onClick={onView}
          className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Ver estación
        </button>
      </div>
    </div>
  );
}