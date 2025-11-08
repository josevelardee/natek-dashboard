import { useState, useEffect } from "react";
import MapView from "../../../components/map/MapView";
import StationPreview from "../components/StationPreview";
import type { Station } from "@/types";

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [selected, setSelected] = useState<Station | null>(null);

  useEffect(() => {
    // Ejemplo: obtén las estaciones desde tu backend o API
    fetch("/api/stations")
      .then((res) => res.json())
      .then((data) => setStations(data))
      .catch((err) => console.error("Error cargando estaciones:", err));
  }, []);

  return (
    <div className="relative rounded-lg flex-1 h-full overflow-hidden">
      <MapView stations={stations} onSelect={(st) => setSelected(st)} />

      {selected && (
        <StationPreview
          station={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}