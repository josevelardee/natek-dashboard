import { useRef } from "react";
import type maplibregl from "maplibre-gl";

export function useTooltip(map: React.RefObject<maplibregl.Map| null>) {
  const tooltipRef = useRef<HTMLDivElement | null>(null);

  const addTooltipEvent = (layer: string, prop: string) => {
    if (!map.current) return;

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
      map.current.getContainer().appendChild(tooltipRef.current!);
    }

    const showTooltip = (text: string, x: number, y: number) => {
      if (!tooltipRef.current) return;
      tooltipRef.current.innerText = text;
      Object.assign(tooltipRef.current.style, {
        opacity: "1",
        left: `${x + 10}px`,
        top: `${y + 10}px`,
      });
    };

    const hideTooltip = () => {
      if (!tooltipRef.current) return;
      tooltipRef.current.style.opacity = "0";
    };

    map.current.on("mousemove", layer, (e) => {
      if (!e.features?.length) return;
      showTooltip(e.features[0].properties?.[prop] || "Sin nombre", e.point.x, e.point.y);
      map.current!.getCanvas().style.cursor = "pointer";
    });

    map.current.on("mouseleave", layer, () => {
      hideTooltip();
      map.current!.getCanvas().style.cursor = "";
    });
  };

  return { tooltipRef, addTooltipEvent };
}