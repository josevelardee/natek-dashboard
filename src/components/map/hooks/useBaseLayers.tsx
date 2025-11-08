import { useEffect, useRef, useState } from "react";
import maplibregl from "maplibre-gl";

interface BaseLayersData {
  cuencas?: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, any>;
  rios?: GeoJSON.FeatureCollection<GeoJSON.LineString, any>;
  lagos?: GeoJSON.FeatureCollection<GeoJSON.Polygon, any>;
}

export function useBaseLayers(mapRef: React.MutableRefObject<maplibregl.Map | null>) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const [data, setData] = useState<BaseLayersData>({});

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Crear tooltip si no existe
    if (!tooltipRef.current) {
      tooltipRef.current = Object.assign(document.createElement("div"), {
        style: `
          position:absolute;
          background:white;
          padding:2px 6px;
          font-size:12px;
          border-radius:4px;
          box-shadow:0 1px 4px rgba(0,0,0,0.3);
          pointer-events:none;
          opacity:0;
          transition:opacity 0.2s;
        `,
      } as any);
      map.getContainer().appendChild(tooltipRef.current!);
    }

    const addGeoLayer = (id: string, dataUrl: string, layers: maplibregl.LayerSpecification[]) => {
      if (map.getSource(id)) return;

      map.addSource(id, { type: "geojson", data: dataUrl });

      layers.forEach((layer) => {
        if (layer.id && !map.getLayer(layer.id)) map.addLayer(layer);
      });
    };

    const handleLoad = async () => {
      const base = import.meta.env.BASE_URL;

      // Límites
      addGeoLayer("lim-departamental", `${base}lim-departamental.geojson`, [
        { id: "lim-departamental-line", type: "line", source: "lim-departamental", paint: { "line-color": "#a6a6a6", "line-width": 1 } },
      ]);

      // Cuencas
      const cuencasUrl = `${base}cuencas.geojson`;
      addGeoLayer("cuencas", cuencasUrl, [
        { id: "cuencas-fill", type: "fill", source: "cuencas", paint: { "fill-color": "#00b7ff", "fill-opacity": 0.1 } },
        { id: "cuencas-line", type: "line", source: "cuencas", paint: { "line-color": "#00b7ff", "line-width": 1.2 } },
      ]);

      // Lagos
      const lagosUrl = `${base}lagos-lagunas.geojson`;
      addGeoLayer("lagos-lagunas", lagosUrl, [
        { id: "lagos-fill", type: "fill", source: "lagos-lagunas", paint: { "fill-color": "#0080ff", "fill-opacity": 0.1 } },
        { id: "lagos-line", type: "line", source: "lagos-lagunas", paint: { "line-color": "#0288D1", "line-width": 1, "line-opacity": 0.3 } },
      ]);

      // Ríos
      const riosUrl = `${base}rios-quebradas.geojson`;
      addGeoLayer("rios-quebradas", riosUrl, [
        { id: "rios-line", type: "line", source: "rios-quebradas", paint: { "line-color": "#0080ff", "line-width": 1.6, "line-opacity": 0.3 } },
      ]);

      // Fetch GeoJSON para reutilización
      try {
        const [cuencasData, lagosData, riosData] = await Promise.all([
          fetch(cuencasUrl).then(r => r.json()),
          fetch(lagosUrl).then(r => r.json()),
          fetch(riosUrl).then(r => r.json()),
        ]);

        setData({ cuencas: cuencasData, lagos: lagosData, rios: riosData });
      } catch (err) {
        console.error("Error cargando GeoJSON base:", err);
      }

      // Tooltips seguros
      ["rios-line", "lagos-line", "lagos-fill"].forEach((layerId) => {
        if (!map.getLayer(layerId)) return; // ✅ solo si existe la capa
        map.on("mousemove", layerId, (e) => {
          if (!e.features?.length) return;
          const f = e.features[0];
          const name = f.properties?.NOMBRE_CA || f.properties?.NOMBREOFIC || "Sin nombre";
          tooltipRef.current!.innerText = name;
          tooltipRef.current!.style.opacity = "1";
          tooltipRef.current!.style.left = `${e.point.x + 10}px`;
          tooltipRef.current!.style.top = `${e.point.y + 10}px`;
          map.getCanvas().style.cursor = "pointer";
        });
        map.on("mouseleave", layerId, () => {
          tooltipRef.current!.style.opacity = "0";
          map.getCanvas().style.cursor = "";
        });
      });
    };

    if (map.isStyleLoaded()) handleLoad();
    else map.on("load", handleLoad);

    return () => {
      map.off("load", handleLoad);
    };
  }, [mapRef]);

  return data;
}