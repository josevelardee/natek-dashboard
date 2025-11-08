import { useEffect, useState } from "react";
import type { Station } from "../../../types";

export function useStationsData() {
  const [stations, setStations] = useState<Station[]>([]);
  const [stationsGeoJson, setStationsGeoJson] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Point, any>>({
      type: "FeatureCollection",
      features: [],
    });

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const data = await fetch("/api/stations").then((res) => res.json());

        // 🔹 Mapear y filtrar estaciones cerradas
        const formattedStations: Station[] = data
          .map((st: any) => ({
            id: st.id,
            sourceId: st.source_id,
            name: st.name,
            code: st.source_id ?? `st-${st.id}`,
            lat: st.lat,
            lon: st.lon,
            type: st.type ?? "No especificado",
            subtype: st.subtype ?? null,
            owner: st.owner ?? "Desconocido",
            river: st.river ?? null,
            basinCode: st.basin_code ?? null,
            yearStart: st.year_start ?? null,
            yearEnd: st.year_end ?? null,
            status: st.status ?? null,
            license: st.license ?? null,
            dataUrl: st.data_url ?? null,
            accessType: st.access_type ?? "private",
            createdAt: st.created_at,
            purchasable: st.license?.toLowerCase() === "natek",
            source: st.license?.toLowerCase() || "desconocido",
          }))
          .filter((st: any) => {
            const status = st.status?.toLowerCase();
            return status !== "cerrado" && status !== "paralizado";
          });

        setStations(formattedStations);

        // 🔹 Crear GeoJSON solo con estaciones abiertas
        setStationsGeoJson({
          type: "FeatureCollection",
          features: formattedStations.map((st) => ({
            type: "Feature",
            geometry: { type: "Point", coordinates: [st.lon, st.lat] },
            properties: st,
          })),
        });
      } catch (err) {
        console.error("❌ Error fetching stations:", err);
      }
    };

    fetchStations();
  }, []);

  return { stations, stationsGeoJson };
}