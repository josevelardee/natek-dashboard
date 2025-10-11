import { Play, Video, Calendar } from "lucide-react";

interface VideoData {
  id: string;
  title: string;
  date: string;
  url: string;
  thumbnail: string;
}

const videos: VideoData[] = [
  {
    id: "1",
    title: "Registro de caudal - Estación Yuracmayo",
    date: "2025-10-09",
    url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    thumbnail: "https://img.freepik.com/free-photo/river-stream_23-2148720071.jpg",
  },
  {
    id: "2",
    title: "Crecida del río Carhuamayoc",
    date: "2025-09-29",
    url: "https://samplelib.com/lib/preview/mp4/sample-5s.mp4",
    thumbnail: "https://img.freepik.com/free-photo/flowing-river-forest_181624-43693.jpg",
  },
];

export default function VideosTab() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center gap-2">
        <Video className="text-blue-500" size={20} />
        <h2 className="text-lg font-semibold text-gray-800">Videos Registrados</h2>
      </div>

      {/* Lista de videos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {videos.map((vid) => (
          <div
            key={vid.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition"
          >
            <div className="relative">
              <img
                src={vid.thumbnail}
                alt={vid.title}
                className="w-full h-48 object-cover"
              />
              <a
                href={vid.url}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 hover:bg-opacity-60 transition"
              >
                <Play size={36} className="text-white" />
              </a>
            </div>
            <div className="p-3 flex flex-col gap-1">
              <h3 className="text-sm font-medium text-gray-800">{vid.title}</h3>
              <div className="flex items-center text-xs text-gray-500 gap-1">
                <Calendar size={12} /> {vid.date}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}