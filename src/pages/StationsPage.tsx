import { useState } from "react";
import MapView from "../components/MapViewML";
import StationPreview from "../components/StationPreview";
import type { Station } from "../types";

type Props = {
  stations: Station[];
  onSelect: (station: Station) => void;
};

export default function StationsPage({ stations, onSelect }: Props) {
  const [selected, setSelected] = useState<Station | null>(null);

  return (
    <div className="relative rounded-lg flex-1 h-full overflow-hidden">
      {/* Mapa siempre visible */}
      <MapView stations={stations} onSelect={(st) => setSelected(st)} />

      {/* Panel de información cuando hay estación seleccionada */}
      {selected && (
        <StationPreview
          station={selected}
          onClose={() => setSelected(null)}
          onView={() => onSelect(selected)} // 👈 aquí pasa el control al App
        />
      )}
    </div>
  );
}