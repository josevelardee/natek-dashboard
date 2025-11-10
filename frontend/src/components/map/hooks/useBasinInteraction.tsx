import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import * as turf from "@turf/turf";

export interface UseCuencasInteractionsProps {
  map: React.MutableRefObject<maplibregl.Map | null>;
  allCuencas: GeoJSON.FeatureCollection<GeoJSON.Polygon | GeoJSON.MultiPolygon, any>;
  stationsNatek: GeoJSON.FeatureCollection<GeoJSON.Point, any>;
  stationsSenamhi: GeoJSON.FeatureCollection<GeoJSON.Point, any>;
}

const OPACITY = {
  cuencaNormal: 0.1,
  cuencaHover: 0.3,
  cuencaSelected: 0.5,
  rioNormal: 1,
  rioAtenuado: 0.2,
  lagoNormal: 1,
  lagoAtenuado: 0.1,
};

export function useBasinInteractions({
  map,
  allCuencas,
  stationsNatek,
  stationsSenamhi,
}: UseCuencasInteractionsProps) {
  const selectedCuencaIdRef = useRef<string | null>(null);
  const hoveredCuencaIdRef = useRef<string | null>(null);

  useEffect(() => {
    const m = map.current;
    if (!m || !allCuencas || !stationsNatek || !stationsSenamhi) return;

    const estacionesLayers = ["stations-natek-layer", "stations-senamhi-layer"];

    const handleClick = (e: maplibregl.MapMouseEvent) => {
      const clickedPoint = turf.point([e.lngLat.lng, e.lngLat.lat]);
      const cuenca = allCuencas.features.find((f) =>
        turf.booleanPointInPolygon(clickedPoint, f as any)
      );

      // Reset si no se clickeó ninguna cuenca
      if (!cuenca) {
        selectedCuencaIdRef.current = null;
        hoveredCuencaIdRef.current = null;
        m.setPaintProperty("cuencas-fill", "fill-opacity", OPACITY.cuencaNormal);
        estacionesLayers.forEach(layer => m.setPaintProperty(layer, "circle-opacity", 1));
        m.setPaintProperty("rios-line", "line-opacity", OPACITY.rioAtenuado);
        m.setPaintProperty("lagos-fill", "fill-opacity", OPACITY.lagoAtenuado);
        m.setPaintProperty("lagos-line", "line-opacity", OPACITY.lagoAtenuado);
        return;
      }

      // Selecciona cuenca
      selectedCuencaIdRef.current = cuenca.properties?.CODIGO;
      hoveredCuencaIdRef.current = null; // Reinicia hover
      //const geom = cuenca.geometry as GeoJSON.Polygon | GeoJSON.MultiPolygon;

      const idsNatek = stationsNatek.features
        .filter(f => f.properties.basinCode === selectedCuencaIdRef.current)
        .map(f => f.properties.id);

      const idsSenamhi = stationsSenamhi.features
        .filter(f => f.properties.basinCode === selectedCuencaIdRef.current)
        .map(f => f.properties.id);


      console.log("Cuenca seleccionada:", selectedCuencaIdRef.current, { idsNatek, idsSenamhi });

      // Aplicar opacidad de cuenca seleccionada inmediatamente
      m.setPaintProperty("cuencas-fill", "fill-opacity", [
        "case",
        ["==", ["get", "CODIGO"], selectedCuencaIdRef.current], OPACITY.cuencaSelected,
        OPACITY.cuencaNormal,
      ]);

      // Ajustar opacidad de estaciones
      estacionesLayers.forEach(layer => {
        const ids = layer === "stations-natek-layer" ? idsNatek : idsSenamhi;
        m.setPaintProperty(layer, "circle-opacity", [
          "case",
          ["in", ["get", "id"], ["literal", ids.length ? ids : ["__none__"]]],
          1,
          0.1,
        ]);
      });

      // Ajustar ríos y lagos
      m.setPaintProperty("rios-line", "line-opacity", [
        "case",
        ["==", ["get", "CODIGO_UH"], selectedCuencaIdRef.current],
        OPACITY.rioNormal,
        OPACITY.rioAtenuado,
      ]);
      m.setPaintProperty("lagos-fill", "fill-opacity", [
        "case",
        ["==", ["get", "CODIGOUH"], selectedCuencaIdRef.current],
        OPACITY.lagoNormal,
        OPACITY.lagoAtenuado,
      ]);
      m.setPaintProperty("lagos-line", "line-opacity", [
        "case",
        ["==", ["get", "CODIGOUH"], selectedCuencaIdRef.current],
        OPACITY.lagoNormal,
        OPACITY.lagoAtenuado,
      ]);

      // Ajustar vista al bounding box de la cuenca
      const bbox = turf.bbox(cuenca);
      m.fitBounds(
        [
          [bbox[0], bbox[1]],
          [bbox[2], bbox[3]],
        ],
        { padding: 50, duration: 1000 }
      );
    };

    // Hover de cuencas
    const handleMouseMove = (e: maplibregl.MapMouseEvent) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ["cuencas-fill"] });
      if (!features.length) return;

      const id = features[0].properties?.CODIGO;
      if (id === selectedCuencaIdRef.current) return; // ignorar hover en la seleccionada
      if (hoveredCuencaIdRef.current === id) return;

      hoveredCuencaIdRef.current = id;
      m.setPaintProperty("cuencas-fill", "fill-opacity", [
        "case",
        ["==", ["get", "CODIGO"], selectedCuencaIdRef.current], OPACITY.cuencaSelected,
        ["==", ["get", "CODIGO"], id], OPACITY.cuencaHover,
        OPACITY.cuencaNormal,
      ]);
    };

    const handleMouseLeave = () => {
      hoveredCuencaIdRef.current = null;
      m.setPaintProperty("cuencas-fill", "fill-opacity", [
        "case",
        ["==", ["get", "CODIGO"], selectedCuencaIdRef.current], OPACITY.cuencaSelected,
        OPACITY.cuencaNormal,
      ]);
    };

    m.on("click", handleClick);
    m.on("mousemove", "cuencas-fill", handleMouseMove);
    m.on("mouseleave", "cuencas-fill", handleMouseLeave);

    return () => {
      m.off("click", handleClick);
      m.off("mousemove", "cuencas-fill", handleMouseMove);
      m.off("mouseleave", "cuencas-fill", handleMouseLeave);
    };
  }, [map, allCuencas, stationsNatek, stationsSenamhi]);
}