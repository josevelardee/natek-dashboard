import { Globe2, Download, Image } from "lucide-react";

interface SatelliteData {
  id: string;
  title: string;
  date: string;
  description: string;
  imageUrl: string;
}

const satelliteData: SatelliteData[] = [
  {
    id: "1",
    title: "NDVI - Cobertura Vegetal",
    date: "2025-10-08",
    description: "Índice de vegetación para la cuenca Yuracmayo.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/NDVI.png/640px-NDVI.png",
  },
  {
    id: "2",
    title: "Reflectancia superficial (RGB)",
    date: "2025-10-05",
    description: "Imagen Sentinel-2 procesada con corrección atmosférica.",
    imageUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Sentinel-2_RGB_example.png/640px-Sentinel-2_RGB_example.png",
  },
];

export default function SatelliteTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-2">
          <Globe2 className="text-blue-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-800">Datos Satelitales</h2>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Visualiza imágenes recientes obtenidas de plataformas satelitales como Sentinel-2 o Landsat.
        </p>
      </div>

      {/* Contenido */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {satelliteData.map((data) => (
          <div
            key={data.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition"
          >
            <img src={data.imageUrl} alt={data.title} className="w-full h-48 object-cover" />
            <div className="p-4 flex flex-col gap-2">
              <h3 className="font-medium text-gray-800 flex items-center gap-2">
                <Image size={16} className="text-blue-500" /> {data.title}
              </h3>
              <p className="text-xs text-gray-500">{data.date}</p>
              <p className="text-sm text-gray-600">{data.description}</p>
              <button className="mt-2 self-start flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition">
                <Download size={14} /> Descargar capa
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}